import { PAGE_LOADED, RESTORE_ANCHOR } from "@/utils/constants";
import { originalLocation } from "@/utils/content";
import { panic } from "@/utils/generic";
import { defineContentScript } from "wxt/sandbox";

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
	"runAt": "document_idle",
	"world": "ISOLATED",
	main() {
		if (location.hash.startsWith(RESTORE_ANCHOR)) {
			if (document.readyState === "complete") {
				cleanAndDiscard();
			} else {
				window.addEventListener("load", cleanAndDiscard);
			}
		}
	},
});
