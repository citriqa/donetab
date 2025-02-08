import { RESTORE_ANCHOR } from "@/utils/constants";
import { decodeAnchor, originalLocation } from "@/utils/content";
import { defineContentScript } from "wxt/sandbox";

function setTitleAndIcon(title: string, favicon: string) {
	const newHead = document.createElement("head");
	newHead.appendChild(document.createElement("title")).textContent = title;
	const faviconLink = newHead.appendChild(document.createElement("link"));
	faviconLink.rel = "icon";
	faviconLink.href = favicon;
	const newBody = document.createElement("body");
	newBody.appendChild(document.createElement("img")).src = favicon; // using this we can await the favicon being loaded before discarding the tab
	const newHtml = document.createElement("html");
	newHtml.appendChild(newHead);
	newHtml.appendChild(newBody);
	document.replaceChildren(newHtml);
}

export default defineContentScript({
	matches: ["<all_urls>"],
	"runAt": "document_start",
	"world": "MAIN", // isolated world scripts are delayed in their injection
	main() {
		if (location.hash.startsWith(RESTORE_ANCHOR)) {
			document.replaceChildren(); // prevents loading the original page
			window.onfocus = () => { // visibilityState starts out as "visible" in Chrome even when the tab is opened in the background
				location.replace(originalLocation(location));
			};
			const { title, favicon } = decodeAnchor(location.hash);
			setTitleAndIcon(title, favicon);
		}
	},
});
