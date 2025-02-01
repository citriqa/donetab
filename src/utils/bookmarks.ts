import { blobToURL, fromURL } from "image-resize-compress";
import * as R from "remeda";
import { EXTENSION_FOLDER_NAME, LIST_URL } from "./constants";

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

function openableURL(url: string) {
	// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create#url
	const schemes = [
		"chrome",
		"javascript",
		"data",
		"file",
		"about",
	].map(scheme => scheme + ":");
	return !schemes.some(scheme => url.startsWith(scheme));
}

export async function saveWindow() {
	function closeWindow() {
		void chrome.windows.getAll({
			windowTypes: ["normal"],
		}).then(async windows => (windows.length < 2 && chrome.windows.create({
			"type": "normal",
			"focused": true,
			"url": LIST_URL,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- since we get the Window object from the chrome.windows API, it must be open and have an ID
		}))).then(() => chrome.windows.remove(window.id!));
	}
	const [tabs, window] = await Promise.all([
		chrome.tabs.query({
			"currentWindow": true,
		}),
		chrome.windows.getCurrent(),
	]);

	const extension_folder_id = await extensionFolderId();

	const saveableTabs = tabs.filter(tab => tab.url !== LIST_URL && tab.url !== undefined && openableURL(tab.url));

	if (saveableTabs.length) {
		const windowFolder = await chrome.bookmarks.create({
			parentId: extension_folder_id,
			title: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
		});
		const iconFolder = chrome.bookmarks.create({
			parentId: windowFolder.id,
			title: "favicons",
		});
		const createdBookmarks = await Promise.all(R.pipe(
			saveableTabs,
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
		const icons = saveableTabs.map(R.prop("favIconUrl"));
		closeWindow();
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
		closeWindow();
	}
}
