import { blobToURL, fromURL } from "image-resize-compress";
import * as R from "remeda";
import { LIST_URL, RESTORE_URL } from "../calculated_constants";
import { Require } from "../types";
import { extension_folder_id } from "./common";

export async function compressImage(url: string) {
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
	}).then(async (windows) => (windows.length < 2 && chrome.windows.create({
		"type": "normal",
		"focused": true,
		"url": LIST_URL,
	})));
	void chrome.windows.update(window.id, {
		state: "minimized",
	});

	const filteredTabs = tabs.filter(tab =>
		![
			RESTORE_URL, // deliberately checking for exact match only, want to keep those with anchor (as they contain unrestored tabs)
			LIST_URL,
		].includes((tab as Require<"url", chrome.tabs.Tab>).url) // since we have the tabs permission, the url property is guaranteed to be defined
	);

	if (filteredTabs.length) {
		const windowFolder = await chrome.bookmarks.create({
			parentId: await extension_folder_id,
			title: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
		});
		const iconFolder = chrome.bookmarks.create({
			parentId: windowFolder.id,
			title: "favicons",
		});
		const createdBookmarks = await Promise.all(R.pipe(
			filteredTabs,
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
		const icons = filteredTabs.map(R.prop("favIconUrl"));
		for (const [index, id] of createdBookmarks.entries()) {
			const iconURL = icons[index];
			if (iconURL !== undefined) {
				void (import.meta.env.FIREFOX ? compressImage(iconURL) : Promise.resolve(iconURL)).then(async (iconURL) =>
					chrome.bookmarks.create({
						parentId: (await iconFolder).id,
						title: id,
						url: iconURL,
					})
				);
			}
		}
		for (const [index, id] of createdBookmarks.entries()) {
			await chrome.bookmarks.move(id, { index });
		}
	} else {
		void chrome.windows.remove(window.id);
	}
}
