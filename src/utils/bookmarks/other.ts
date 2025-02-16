import * as R from "remeda";
import { splitTabsAndIcons } from "./common";

export async function renameWindow(id: string, title: string) {
	return chrome.bookmarks.update(id, { title });
}

export async function deleteTabsFrom(tabIds: string[], windowId: string): Promise<Array<void>> {
	const { tabs, iconFolder } = await splitTabsAndIcons(windowId);
	if ((new Set(tabIds)).intersection(new Set(tabs.map(tab => tab.id))).size === tabs.length) {
		return deleteWindowExcept(windowId);
	} else {
		if (iconFolder !== undefined) {
			const icons = chrome.bookmarks.getChildren(iconFolder.id);
			return Promise.all(tabIds.map(async tabId => {
				await chrome.bookmarks.remove(tabId);
				void icons.then(async icons => {
					const icon = R.only(icons.filter(bookmark => bookmark.title === tabId));
					if (icon !== undefined) {
						await chrome.bookmarks.remove(icon.id);
					}
				});
			}));
		} else {
			return Promise.all(tabIds.map(async tabId => {
				await chrome.bookmarks.remove(tabId);
			}));
		}
	}
}

export async function deleteWindowExcept(windowId: string, tabIds?: string[]) {
	if (!tabIds?.length) {
		return Promise.all([chrome.bookmarks.removeTree(windowId)]);
	} else {
		const { tabs } = await splitTabsAndIcons(windowId);
		const tabsToDelete = (new Set(tabs.map(tab => tab.id))).difference(new Set(tabIds)).values().toArray();
		return deleteTabsFrom(tabsToDelete, windowId);
	}
}
