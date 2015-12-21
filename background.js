// When the extension is installed or upgraded ...
var activeTabId = -1;
// update tab id when change activated tab
chrome.tabs.onActivated.addListener(function (tab) {
	activeTabId = tab.tabId;
});
// query tab id and update
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	activeTabId = tabs[0].id;
});

// chrome event when current tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

	if (changeInfo.status == "complete" && tabId == activeTabId) {
		// send message to content.js
		chrome.tabs.sendMessage(tabId, { content: tab.url }, function (response) {
			console.log(response.farewell);
		});
	}
});