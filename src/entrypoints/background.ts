export default defineBackground(() => {
	chrome.tabs.create({ url: chrome.runtime.getURL("/page.html") });
});
