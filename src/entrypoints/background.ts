import { saveWindow } from "@/utils/bookmarks";
import { DOUBLECLICK_INTERVAL_MS, LIST_URL } from "@/utils/constants";
import { returnvoid } from "@/utils/generic";
import { defineBackground } from "wxt/sandbox";

export default defineBackground(() => {
	chrome.action.onClicked.addListener(
		doubleClickListener(
			returnvoid(saveWindow),
			returnvoid(showSavedWindows),
		),
	);
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
