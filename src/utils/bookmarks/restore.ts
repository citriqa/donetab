import { INITIAL_URL, RESTORE_URL } from "../calculated_constants";
import { RESTORE_ANCHOR } from "../constants";
import { getTabsAndIcons } from "./common";
import { deleteWindowExcept } from "./other";

export function addRestoreAnchor(url: string, title: string, favicon?: string): string {
	const parsedURL = new URL(url);
	if (["http:", "https:"].includes(parsedURL.protocol)) {
		const oldAnchor = parsedURL.hash;
		const newAnchor = [
			RESTORE_ANCHOR,
			encodeURIComponent(title),
			encodeURIComponent(favicon || ""),
		].join("#");
		parsedURL.hash = newAnchor + oldAnchor;
		return parsedURL.toString();
	} else {
		return url;
	}
}

export async function restoreWindow(windowFolder: string) {
	const { tabs, icons } = await getTabsAndIcons(windowFolder);

	const newWindow = await chrome.windows.create({
		focused: true,
	});

	const initialTab = newWindow.tabs?.[0];

	if (initialTab?.id === undefined) {
		throw new Error("could not acquire reference to initial tab");
	}

	// we do not want to open to restore page yet since we need the hash to be the final one on initial load so it knows whether to trigger close-on-deselect.
	// this URL cannot be specified upon window creation because it is set at some later point and may overwrite the restore page URL if the tabs are restored quickly
	const initalTabNavigationPromise = chrome.tabs.update(initialTab.id, {
		url: INITIAL_URL,
	});

	const failedTabs: typeof tabs = [];

	for (const tab of tabs) {
		const url = addRestoreAnchor(tab.url, tab.title, icons.get(tab.id));
		await chrome.tabs.create({
			url,
			windowId: newWindow.id,
			active: false,
			index: 2147483647, // max int32. Number.MAX_SAFE_INTEGER is too large to be recognized as an integer by chrome
		}).catch(() => {
			failedTabs.push(tab);
		});
	}

	const failedTabsAnchor = "#"
		+ failedTabs.map(tab =>
			[tab.url, tab.title, icons.get(tab.id) || ""].map(encodeURIComponent)
				.join(",")
		).join(";");

	// if there's only few tabs to restore, the initial url may not even be pending yet at this point, which means it would overwrite the restore page without waiting for it here...
	if ((await chrome.tabs.get(initialTab.id)).status === "loading") {
		await new Promise<void>((resolve) => {
			const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
				if (tabId === initialTab.id && changeInfo.status === "complete") {
					chrome.tabs.onUpdated.removeListener(listener);
					resolve();
				}
			};
			chrome.tabs.onUpdated.addListener(listener);
		});
	}

	await initalTabNavigationPromise;
	await chrome.tabs.update(initialTab.id, {
		url: RESTORE_URL + (failedTabs.length ? failedTabsAnchor : ""),
	});

	void deleteWindowExcept(windowFolder);
}
