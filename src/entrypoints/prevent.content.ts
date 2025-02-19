import { PAGE_LOADED, RESTORE_ANCHOR } from "@/utils/constants";
import { decodeAnchor, originalLocation } from "@/utils/content";
import { panic } from "@/utils/generic";
import { defineContentScript } from "wxt/sandbox";

function setTitleAndIcon(title: string, favicon: string) {
	const newHead = document.createElement("head");
	newHead.appendChild(document.createElement("title")).textContent = title;
	const newBody = document.createElement("body");
	if (favicon !== "") {
		const faviconLink = newHead.appendChild(document.createElement("link"));
		faviconLink.rel = "icon";
		faviconLink.href = favicon;
	}
	const newHtml = document.createElement("html");
	newHtml.appendChild(newHead);
	newHtml.appendChild(newBody);
	document.replaceChildren(newHtml);
}

function refresh() {
	location.replace(originalLocation(location));
}

function cleanAndDiscard() {
	history.replaceState(
		null,
		"",
		originalLocation(location),
	);

	chrome.runtime.sendMessage(PAGE_LOADED).catch((error: unknown) => {
		panic("failed to send page loaded message:", error);
	});
}

export default defineContentScript({
	matches: ["<all_urls>"],
	"runAt": "document_start",
	"world": "MAIN", // isolated world scripts are delayed in their injection
	main() {
		if (location.hash.startsWith(RESTORE_ANCHOR)) {
			document.replaceChildren(); // hopefully keeps the browser from wasting time with the original page; also needed for subsequent replaceChildren not to error in Firefox
			const { title, favicon } = decodeAnchor(location.hash);
			setTitleAndIcon(title, favicon);
			window.stop(); // this also prevents some favicons from being adopted on Chrome but there's not much we can do about it without making window restoration a lot slower (because it prevents a large number of subresource requests)
			window.onfocus = refresh;
			if (document.hasFocus()) refresh();
			cleanAndDiscard();
		}
	},
});
