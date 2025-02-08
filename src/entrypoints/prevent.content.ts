import { RESTORE_ANCHOR } from "@/utils/constants";
import { defineContentScript } from "wxt/sandbox";

function checkVisibility() {
	if (document.visibilityState === "visible") {
		location.replace(
			location.hash.length > RESTORE_ANCHOR.length
				? location.href.replace(location.hash, "#" + location.hash.slice(RESTORE_ANCHOR.length))
				: location.href.replace(location.hash, ""),
		);
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	"runAt": "document_start",
	"world": "MAIN", // isolated world scripts are delayed in their injection
	main() {
		if (location.hash.startsWith(RESTORE_ANCHOR)) {
			try {
				const cspMeta = document.createElement("meta");
				cspMeta.httpEquiv = "Content-Security-Policy";
				cspMeta.content = "script-src 'none'";

				const observer = new MutationObserver((mutations) => {
					for (const mutation of mutations) {
						for (const node of mutation.addedNodes) {
							if (node instanceof HTMLElement) {
								const nodeName = node.nodeName.toLowerCase();
								switch (nodeName) {
									case "head":
										node.appendChild(cspMeta);
										break;
									case "link": {
										const rel = node.getAttribute("rel");
										if (rel !== "icon" && rel !== "shortcut icon") {
											node.remove();
										}
										break;
									}
									case "title":
										break;
									case "html":
										break;
									default:
										node.remove();
								}
							}
						}
					}
				});

				observer.observe(document, {
					childList: true,
					subtree: true,
				});
				// Check visibility after observer is ready
				checkVisibility();
				document.addEventListener("visibilitychange", checkVisibility);
			} catch (error) {
				console.error("[DoneTab] Setup failed:", error);
			}
		}
	},
});
