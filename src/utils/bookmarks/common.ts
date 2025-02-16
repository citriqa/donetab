import * as R from "remeda";
import { EXTENSION_FOLDER_NAME } from "../constants";
import { retryPromise } from "../generic";
import { Require } from "../types";

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
