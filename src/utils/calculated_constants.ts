import chromeFallbackFaviconUrl from "~/assets/chrome_fallback_favicon.svg";
import firefoxFallbackFaviconUrl from "~/assets/firefox_fallback_favicon.svg";

export const LIST_URL = chrome.runtime.getURL("/saved_windows.html");

export const RESTORE_URL = chrome.runtime.getURL("/restore_status.html");

export const INITIAL_URL = chrome.runtime.getURL("/initial_tab.html");

export const FALLBACK_FAVICON = (() => {
	switch (import.meta.env.BROWSER) {
		default:
		case "firefox":
			return firefoxFallbackFaviconUrl;
		case "chrome":
			return chromeFallbackFaviconUrl;
	}
})();
