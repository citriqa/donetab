import { blobToURL, fromURL } from "image-resize-compress";
import * as R from "remeda";
import { INITIAL_URL, LIST_URL, RESTORE_URL } from "./calculated_constants";
import { EXTENSION_FOLDER_NAME, RESTORE_ANCHOR } from "./constants";
import { retryPromise, returnvoid } from "./generic";
import { Require } from "./types";

export async function extensionFolderId() {
	function newFolder() {
		return chrome.bookmarks.create({
			title: EXTENSION_FOLDER_NAME,
		});
	}
	const existingFolder = R.only(
		await chrome.bookmarks.search({
			title: EXTENSION_FOLDER_NAME,
		}),
	);
	return (existingFolder || await newFolder()).id;
}

async function compressImage(url: string) {
	const blob = await fromURL(
		url,
		100,
		32,
		32,
		"webp",
	);
	const newURL = await blobToURL(blob);
	return ((newURL.length * 2) < url.length) ? newURL : url;
}

export async function saveWindow() {
	const [tabs, window] = await Promise.all([
		chrome.tabs.query({
			"currentWindow": true,
		}),
		chrome.windows.getCurrent(),
	]);

	if (window.id === undefined) {
		throw new Error("window to be saved has no ID");
	}

	void chrome.windows.getAll({
		windowTypes: ["normal"],
	}).then(async windows => (windows.length < 2 && chrome.windows.create({
		"type": "normal",
		"focused": true,
		"url": LIST_URL,
	})));
	void chrome.windows.update(window.id, {
		state: "minimized",
	});

	const extension_folder_id = await extensionFolderId();

	if (tabs.length) {
		const windowFolder = await chrome.bookmarks.create({
			parentId: extension_folder_id,
			title: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
		});
		const iconFolder = chrome.bookmarks.create({
			parentId: windowFolder.id,
			title: "favicons",
		});
		const createdBookmarks = await Promise.all(R.pipe(
			tabs,
			R.sortBy(R.prop("index")),
			R.reverse(),
			R.map(async (tab) => {
				const bookmark = await (chrome.bookmarks.create({
					parentId: windowFolder.id,
					title: tab.title,
					url: tab.url,
				}));
				return bookmark.id;
			}),
			R.reverse(),
		));
		void chrome.windows.remove(window.id);
		const icons = tabs.map(R.prop("favIconUrl"));
		for (const [index, id] of createdBookmarks.entries()) {
			const iconURL = icons[index];
			if (iconURL !== undefined) {
				void (import.meta.env.FIREFOX ? compressImage(iconURL) : Promise.resolve(iconURL)).then(async iconURL =>
					chrome.bookmarks.create({
						parentId: (await iconFolder).id,
						title: id,
						url: iconURL,
					})
				);
			}
			await chrome.bookmarks.move(id, { index });
		}
	} else {
		void chrome.windows.remove(window.id);
	}
}

function getProps(bookmark: chrome.bookmarks.BookmarkTreeNode) {
	return R.pick(bookmark, ["title", "id", "dateAdded", "url"]);
}

export async function getWindows() {
	const storage = await extensionFolderId();
	const windowBookmarks = await retryPromise(async () => chrome.bookmarks.getChildren(storage));
	const windowProps = await Promise.all(windowBookmarks.map(getProps));
	return R.sortBy(windowProps, w => w.dateAdded || 0).reverse();
}

export async function isInTree(id: string | undefined, tree?: string) {
	const extension_folder_id = extensionFolderId();
	while (id !== undefined) {
		if (id === (tree || await extension_folder_id)) {
			return true;
		} else {
			id = R.only(await chrome.bookmarks.get(id))?.parentId;
		}
	}
	return false;
}

export async function renameWindow(id: string, title: string) {
	return chrome.bookmarks.update(id, { title });
}

async function splitTabsAndIcons(folder: string) {
	function isIconFolder(bookmark: chrome.bookmarks.BookmarkTreeNode) {
		return bookmark.url === undefined && bookmark.title === "favicons";
	}
	const children = await retryPromise(async () => chrome.bookmarks.getChildren(folder));
	const [iconFolderCandidates, tabs] = R.partition(children, isIconFolder);
	return {
		tabs: tabs.filter((tab): tab is Require<"url", chrome.bookmarks.BookmarkTreeNode> => tab.url !== undefined),
		iconFolder: R.only(iconFolderCandidates),
	};
}

async function getTabsAndIcons(
	folder: string,
): Promise<{ tabs: Require<"url", chrome.bookmarks.BookmarkTreeNode>[]; icons: Map<string, string | undefined> }> {
	const { tabs, iconFolder } = await splitTabsAndIcons(folder);
	if (iconFolder) {
		const icons = new Map(
			(await retryPromise(async () => chrome.bookmarks.getChildren(iconFolder.id))).map(
				bookmark => [bookmark.title, bookmark.url],
			),
		);
		return { tabs, icons };
	} else {
		return { tabs, icons: new Map() };
	}
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

function addRestoreAnchor(url: string, title: string, favicon?: string): string {
	const parsedURL = new URL(url);
	if (["http:", "https:"].includes(parsedURL.protocol)) {
		const oldAnchor = parsedURL.hash;
		const newAnchor = [
			RESTORE_ANCHOR,
			encodeURIComponent(title),
			encodeURIComponent(favicon || parsedURL.origin + "/favicon.ico"),
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
		url: INITIAL_URL,
		// we do not want to open to restore page yet since we need the hash to be the final one on initial load so it knows whether to trigger close-on-deselect.
	});

	const initialTab = newWindow.tabs?.[0];

	if (initialTab?.id === undefined) {
		throw new Error("could not acquire reference to initial tab");
	}

	const failedTabs: typeof tabs = [];

	for (const tab of tabs) {
		const url = addRestoreAnchor(tab.url, tab.title, icons.get(tab.id));
		await chrome.tabs.create({
			url,
			windowId: newWindow.id,
			active: false,
		}).catch(() => {
			failedTabs.push(tab);
		});
	}

	await chrome.tabs.update(initialTab.id, {
		url: RESTORE_URL + "#"
			+ failedTabs.map(tab =>
				[tab.url, tab.title, icons.get(tab.id) || (new URL(tab.url)).origin + "/favicon.ico"].map(encodeURIComponent)
					.join(",")
			).join(";"),
	});

	void deleteWindowExcept(windowFolder);
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

export async function getTabs(windowId: string) {
	const { tabs, icons } = await getTabsAndIcons(windowId);
	return tabs.map(tab =>
		Object.assign(getProps(tab), { icon: icons.get(tab.id) } satisfies { icon: string | undefined })
	);
}

export async function filterTabs(query: string) {
	const preparedQuery = query.normalize().toLowerCase().split(/\s+/);
	const windows = R.only(await chrome.bookmarks.getSubTree(await extensionFolderId()))?.children;
	if (windows === undefined) {
		throw new Error("No children of extension bookmarks folder returned");
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
