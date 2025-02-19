import { RESTORE_ANCHOR } from "@/utils/constants";
import { decodeAnchor, originalLocation } from "@/utils/content";
import { defineContentScript } from "wxt/sandbox";

function setTitleAndIcon(title: string, favicon: string) {
	const newHead = document.createElement("head");
	newHead.appendChild(document.createElement("title")).textContent = title;
	const newBody = document.createElement("body");
	if (favicon !== "") {
		const faviconLink = newHead.appendChild(document.createElement("link"));
		faviconLink.rel = "icon";
		faviconLink.href = favicon;
		// using this we can await the favicon being loaded before discarding the tab
		const faviconImage = newBody.appendChild(document.createElement("img"));
		faviconImage.src = favicon;
		// avoiding display and visibility styles so the browser doesn't optimize the image away
		faviconImage.style.opacity = "0";
	}
	const newHtml = document.createElement("html");
	newHtml.appendChild(newHead);
	newHtml.appendChild(newBody);
	document.replaceChildren(); // needed for the subsequent one not to error in Firefox
	document.replaceChildren(newHtml);
}

function refresh() {
	location.replace(originalLocation(location));
}

export default defineContentScript({
	matches: ["<all_urls>"],
	"runAt": "document_start",
	"world": "MAIN", // isolated world scripts are delayed in their injection
	main() {
		if (location.hash.startsWith(RESTORE_ANCHOR)) {
			document.replaceChildren(); // hopefully keeps the browser from wasting time with the original page
			const { title, favicon } = decodeAnchor(location.hash);
			setTitleAndIcon(title, favicon);
			window.stop(); // prevents loading the original page, must happen after setting the favicon because otherwise Chrome often refuses to respect it
			window.onfocus = refresh; // visibilityState starts out as "visible" in Chrome even when the tab is opened in the background
			if (document.hasFocus()) refresh(); // the tab may already be focused if the user is very fast at switching to it
		}
	},
});
