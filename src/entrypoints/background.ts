import { saveWindow } from "@/utils/bookmarks/save";
import { LIST_URL, RESTORE_URL } from "@/utils/calculated_constants";
import { DOUBLECLICK_INTERVAL_MS, PAGE_LOADED, RESTOREPAGE_LOSTFOCUS } from "@/utils/constants";
import { panic, returnvoid } from "@/utils/generic";
import { defineBackground } from "wxt/sandbox";

function removeTab(tabId: number) {
	// getting error "Tabs cannot be edited right now (user may be dragging a tab)" in Chrome when trying to remove the tab immediately in the onActivated listener
	function removeCallback() {
		chrome.tabs.remove(tabId)
			.catch((error: unknown) => {
				panic("failed to remove tab", error);
			});
	}
	if (import.meta.env.FIREFOX) {
		removeCallback();
	} else {
		setTimeout(removeCallback, 1000);
	}
}

export default defineBackground(() => {
	// it's okay (and even desirable) to use global state here because the events relying on this will fire in rapid succession, but the data should be cleared after a short timeout
	const lostFocusTabs: [number, number][] = [];
	const changedFocusWindows: number[] = [];

	chrome.action.onClicked.addListener(
		doubleClickListener(
			returnvoid(saveWindow),
			returnvoid(showSavedWindows),
		),
	);

	chrome.runtime.onMessage.addListener((message: unknown, sender) => {
		switch (message) {
			case PAGE_LOADED:
				if (sender.tab?.id) {
					chrome.tabs.discard(sender.tab.id)
						.catch((error: unknown) => {
							panic("failed to discard tab", error);
						});
				}
				break;
			case RESTOREPAGE_LOSTFOCUS: {
				// typescript is bad at narrowing and needs these bindings :/
				const tab = sender.tab;
				const tabId = sender.tab?.id;
				if (tab && tabId) {
					if (changedFocusWindows.includes(tab.windowId)) {
						changedFocusWindows.splice(changedFocusWindows.indexOf(tab.windowId), 1);
						removeTab(tabId);
					} else {
						lostFocusTabs.push([tabId, tab.windowId]);
					}
				}
				break;
			}
		}
	});

	chrome.tabs.onActivated.addListener(returnvoid(async ({ tabId, windowId }) => {
		// this might fire when the restored window is initially opened, in which case the window id would be incorrectly added to the list
		// because of this we check the URL of the newly focused tab and make sure its not one of ours or about:blank
		const tab = await chrome.tabs.get(tabId);
		if (tab.url) {
			const tabUrlWithoutHash = tab.url.split("#", 1)[0];
			if (![RESTORE_URL, "about:blank"].includes(tabUrlWithoutHash)) {
				const matchingTab = lostFocusTabs.find(([_tab, window]) => window === windowId);
				if (matchingTab) {
					const [tab, _window] = matchingTab;
					lostFocusTabs.splice(lostFocusTabs.indexOf(matchingTab), 1);
					removeTab(tab);
				} else {
					if (!changedFocusWindows.includes(windowId)) {
						changedFocusWindows.push(windowId);
					}
				}
			}
		}
	}));

	chrome.commands.onCommand.addListener(command => {
		switch (command) {
			case "list-windows":
				void showSavedWindows();
				break;
			case "save-window":
				void saveWindow();
				break;
		}
	});
});

function showSavedWindows() {
	return chrome.tabs.create({
		url: LIST_URL,
	});
}

function doubleClickListener(doubleClickHandler: () => void, singleClickHandler?: () => void) {
	let clickTimeout: number | null = null;
	return () => {
		if (clickTimeout) {
			self.clearTimeout(clickTimeout);
			clickTimeout = null;
			doubleClickHandler();
		} else {
			clickTimeout = self.setTimeout(() => {
				clickTimeout = null;
				singleClickHandler?.();
			}, DOUBLECLICK_INTERVAL_MS);
		}
	};
}
