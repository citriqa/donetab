export default defineBackground(() => {
	void chrome.tabs.create({ url: chrome.runtime.getURL("/page.html") });
});
