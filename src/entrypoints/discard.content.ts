import { FAVICON_LOAD_TIMEOUT_MS, PAGE_LOADED, RESTORE_ANCHOR } from "@/utils/constants";
import { returnvoid } from "@/utils/generic";
import { defineContentScript } from "wxt/sandbox";

export default defineContentScript({
	matches: ["<all_urls>"],
	"runAt": "document_idle",
	"world": "ISOLATED",
	main() {
		if (location.hash.startsWith(RESTORE_ANCHOR)) {
			const originalAnchor = location.hash.slice(RESTORE_ANCHOR.length);
			history.replaceState(
				null,
				"",
				originalAnchor
					? location.href.replace(location.hash, "#" + originalAnchor)
					: location.href.replace(location.hash, ""),
			);

			// Wait for favicons to load
			const favicons = document.querySelectorAll("link[rel~=\"icon\"]");

			const loadImagePromise = (url: string) =>
				new Promise(resolve => {
					const img = new Image();
					img.onload = () => {
						resolve(true);
					};
					img.onerror = () => {
						resolve(true);
					};
					img.src = url;
				});

			const promises = [];

			// Always try favicon.ico at root
			const rootFaviconUrl = new URL("/favicon.ico", location.origin).href;
			promises.push(loadImagePromise(rootFaviconUrl));

			// Add any rel="icon" promises
			favicons.forEach(icon => {
				if (icon instanceof HTMLLinkElement && icon.href) {
					promises.push(loadImagePromise(icon.href));
				}
			});

			void Promise.all(promises).then(() => {
				setTimeout(returnvoid(() => chrome.runtime.sendMessage(PAGE_LOADED)), FAVICON_LOAD_TIMEOUT_MS);
			});
		}
	},
});
