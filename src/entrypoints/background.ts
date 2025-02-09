import { saveWindow } from "@/utils/bookmarks";
import { LIST_URL } from "@/utils/calculated_constants";
import { DOUBLECLICK_INTERVAL_MS, PAGE_LOADED } from "@/utils/constants";
import { returnvoid } from "@/utils/generic";
import { defineBackground } from "wxt/sandbox";

export default defineBackground(() => {
	chrome.action.onClicked.addListener(
		doubleClickListener(
			returnvoid(saveWindow),
			returnvoid(showSavedWindows),
		),
	);

	chrome.runtime.onMessage.addListener((message: unknown, sender) => {
		if (message === PAGE_LOADED && sender.tab?.id) {
			chrome.tabs.discard(sender.tab.id)
				.catch((error: unknown) => {
					console.error("[DoneTab] Failed to discard tab:", error);
				});
		}
	});

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
