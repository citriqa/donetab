import * as R from "remeda";
import { panic, retryPromise, returnvoid } from "../generic";
import { extension_folder_id, getTabsAndIcons } from "./common";

export function getProps(bookmark: chrome.bookmarks.BookmarkTreeNode) {
	return R.pick(bookmark, ["title", "id", "dateAdded", "url"]);
}

export async function isInTree(id: string | undefined, tree?: string) {
	while (id !== undefined) {
		if (id === (tree || await extension_folder_id)) {
			return true;
		} else {
			id = R.only(await chrome.bookmarks.get(id))?.parentId;
		}
	}
	return false;
}

export function subscribeToFolder(folderId: string, callback: () => void) {
	const existEvents = [chrome.bookmarks.onCreated, chrome.bookmarks.onChanged] as const;

	const existsListener = returnvoid(async (bookmarkId: string) => {
		if (await isInTree(bookmarkId, folderId)) {
			callback();
		}
	});
	existEvents.forEach((event_type) => {
		event_type.addListener(existsListener);
	});

	const deletedListener = (bookmarkId: string, removeInfo: chrome.bookmarks.BookmarkRemoveInfo) => {
		if (removeInfo.parentId === folderId) {
			callback();
		}
	};
	chrome.bookmarks.onRemoved.addListener(deletedListener);

	return () => {
		existEvents.forEach((event_type) => {
			event_type.removeListener(existsListener);
		});
		chrome.bookmarks.onRemoved.removeListener(deletedListener);
	};
}

export async function getWindows() {
	const windowBookmarks = await retryPromise(async () => chrome.bookmarks.getChildren(await extension_folder_id));
	const windowProps = await Promise.all(windowBookmarks.map(getProps));
	return R.sortBy(windowProps, w => w.dateAdded || 0).reverse();
}

export async function getTabs(windowId: string) {
	const { tabs, icons } = await getTabsAndIcons(windowId);
	return tabs.map(tab =>
		Object.assign(getProps(tab), { icon: icons.get(tab.id) } satisfies { icon: string | undefined })
	);
}
export async function filterTabs(query: string) {
	const preparedQuery = query.normalize().toLowerCase().split(/\s+/);
	const windows = R.only(await chrome.bookmarks.getSubTree(await extension_folder_id))?.children;
	if (windows === undefined) {
		panic("no children of extension bookmarks folder returned");
	}
	const matchingTabs = windows.map(window => [
		window.id,
		window.children
			?.filter(tab => {
				if (tab.url) {
					const preparedTitle = tab.title.normalize().toLowerCase();
					return preparedQuery.every(word => preparedTitle.includes(word));
				} else {
					return false;
				}
			})
			.map(tab => tab.id),
	]) satisfies [string, string[] | undefined][];
	const filteredWindows = matchingTabs.filter((entry): entry is [string, string[]] => Boolean(entry[1]?.length));
	return new Map(filteredWindows);
}
