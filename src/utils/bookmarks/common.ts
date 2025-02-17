import * as R from "remeda";
import { EXTENSION_FOLDER_NAME } from "../constants";
import { retryPromise, returnvoid } from "../generic";
import { Require } from "../types";

async function getStorageFolder() {
	function newFolder() {
		return chrome.bookmarks.create({
			title: EXTENSION_FOLDER_NAME,
		});
	}
	const searchResult = await chrome.bookmarks.search({
		title: EXTENSION_FOLDER_NAME,
	});
	if (searchResult.length > 1) {
		throw new Error("multiple storage folders found");
	} else {
		return ((searchResult.length === 1) ? searchResult[0] : await newFolder()).id;
	}
}

export let extension_folder_id = getStorageFolder();

chrome.bookmarks.onRemoved.addListener(returnvoid(async (id) => {
	if (id === await extension_folder_id) {
		extension_folder_id = getStorageFolder();
	}
}));

export async function getTabsAndIcons(
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

export async function splitTabsAndIcons(folder: string) {
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
