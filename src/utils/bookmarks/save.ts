import { blobToURL, fromURL } from "image-resize-compress";
import * as R from "remeda";
import { LIST_URL, RESTORE_URL } from "../calculated_constants";
import { RESTORE_ANCHOR } from "../constants";
import { panic } from "../generic";
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
	const window = await chrome.windows.getCurrent();
	if (window.id === undefined) {
		panic("window to be saved has no ID");
	}
	const tabs = await chrome.tabs.query({
		windowId: window.id,
	});

	if (
		// must match exactly, an anchor would mean restoration is complete
		tabs.some(tab => tab.url === RESTORE_URL)
	) {
		panic("window to be saved is currently being restored");
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

	function hasPendingNavigation(tab: chrome.tabs.Tab) {
		// we need to detect tabs with a pending navigation, as they don't have the right URL yet. on Chrome, pending tabs have a pendingUrl, but on Firefox that is not supported. on Firefox, pending tabs will have a status of "loading", which tabs without a pending navigation can have on Chrome, so neither indicator works in both environments
		return import.meta.env.FIREFOX ? tab.status === "loading" : tab.pendingUrl;
	}

	const incompleteTabs = tabs.filter(tab =>
		tab.id !== undefined // should never be the case but just to be correct
		&& hasPendingNavigation(tab)
	);
	if (incompleteTabs.length) {
		const tabIds = new Set<number>(
			incompleteTabs.map(tab => tab.id as number /* we've filtered out tabs without an id above */),
		);
		const allTabsComplete = new Promise<void>((resolve) => {
			const interval = setInterval(() => {
				tabIds.forEach(tabId => {
					void chrome.tabs.get(tabId).then(tab => {
						if (!hasPendingNavigation(tab)) {
							removeTab(tabId);
						}
					});
				});
			}, 1000);
			function removeTab(tabId: number) {
				tabIds.delete(tabId);
				if (tabIds.size === 0) {
					chrome.tabs.onUpdated.removeListener(changeListener);
					clearInterval(interval);
					resolve();
				}
			}
			function changeListener(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) {
				if (tabIds.has(tabId) && changeInfo.url !== undefined) {
					removeTab(tabId);
				}
			}
			chrome.tabs.onUpdated.addListener(changeListener);
		});
		await allTabsComplete;
	}

	const completedTabs = await chrome.tabs.query({
		windowId: window.id,
	});

	if (completedTabs.some(tab => tab.url === undefined)) {
		panic("window to be saved has tabs with no URL");
	}

	const mappedTabs = (
		completedTabs as Require<"url", chrome.tabs.Tab>[] // we've checked that no url is undefined above
	).map(
		tab => {
			function decodeHref(href: string) {
				const [withoutHash, hash] = href.split(RESTORE_ANCHOR);
				const [title, icon, ...rest] = hash.slice(1).split("#");
				const url = withoutHash + (rest.length ? "#" + rest.join("#") : "");
				return {
					id: tab.id,
					url: url,
					title: decodeURIComponent(title),
					favIconUrl: decodeURIComponent(icon),
					index: tab.index,
				};
			}
			if (tab.url.includes(RESTORE_ANCHOR)) {
				return decodeHref(tab.url);
			} else {
				const { id, url, title, favIconUrl, index } = tab;
				return { id, url, title, favIconUrl, index };
			}
		},
	);

	const filteredTabs = mappedTabs.filter(tab =>
		![
			RESTORE_URL + "##", // keep any with tabs in the anchor, as they record those that could not be restored previously
			LIST_URL,
		].includes(tab.url)
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
