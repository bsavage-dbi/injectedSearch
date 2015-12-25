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
	if (changeInfo.status == "complete") {
		var searchString = getSearchString(tab.url);
		if (searchString !== "") {
			// first read local storage then send REST GET request
			readLocalStorage(searchString, tabId);
		}
	}
});

// // chrome webnavigation
// chrome.webNavigation.onCompleted.addListener(function (tab) {
// //	if (tab.tabId === activeTabId) \
// 	{
// //	alert(tab.url);
// 		var searchString = getSearchString(tab.url);
// 		if (searchString !== "") {
// 			alert("inn");
// 			// first read local storage then send REST GET request
// 			readLocalStorage(searchString, tab.tabId);
// 		}
// 	}
// });

// define search engine flag: Google or Baidu
var engineFlag;
var maxResults = 5;
var settings = {};
settings["usr"] = "";
settings["pwd"] = "";
settings["space"] = "";
settings["url"] = "";
var authStr = "";

// REST url prefix
var _prefix = "";

// search engine details
var searchEngines = [
	{
		name: "Baidu",
		info: {
			searchTag: "wd=",
			url: "www.baidu",
			div: "content_right"
		}
	},
	{
		name: "Google",
		info: {
			searchTag: "q=",
			url: "www.google",
			div: "rhs"
		}
	}
];

// read local setting when start
chrome.runtime.onInstalled.addListener(function() {
//	alert("Installed");
});
chrome.runtime.onStartup.addListener(function() {
	alert("start");
	chrome.storage.local.get(settings, function (result) {
		settings = result;
		if (settings["usr"] === "" || settings["pwd"] === "" || settings["url"] === "") {
			alert("wat");
			////////////////////////////////////////////////////////////////////////////////!!!!!
			settings["usr"] = "chaiyi";
			settings["pwd"] = "chaiyi123";
			settings["space"] = "all";
			settings["url"] = "http://172.20.200.191:8003/";
			////////////////////////////////////////////////////////////////////////////////!!!!!
		}
	});
});

function getSearchString(input) {
	var tempString = "";
	$.each(searchEngines, function(id, item) {
		if (input.indexOf(item.info.url) !== -1) {
			var startIndex = input.indexOf(item.info.searchTag);
			if (startIndex !== -1) {
				startIndex += item.info.searchTag.length;
				var endIndex = input.indexOf("&", startIndex);
				tempString = input.substring(startIndex, endIndex);
				engineFlag = item;
				return false;
			}
		} 
	});
	return tempString;
}

// read local storage for searching
function readLocalStorage(searchString, tabId) {
	chrome.storage.local.get(settings, function (result) {
		settings = result;
		if (settings["usr"] === "" || settings["pwd"] === "" || settings["url"] === "") {
			////////////////////////////////////////////////////////////////////////////////!!!!!
			settings["usr"] = "chaiyi";
			settings["pwd"] = "chaiyi123";
			settings["space"] = "all";
			settings["url"] = "http://172.20.200.191:8003/";
			////////////////////////////////////////////////////////////////////////////////!!!!!
		}
			
		// send rest call
		sendRESTCall(searchString, tabId);
	});
}


// send REST GET request query for search result
function sendRESTCall(searchString, tabId) {
	// set url
	_prefix = settings["url"] + "rest/prototype/1/";
	var url = _prefix + "search?query=" + searchString
		+ "&type=page";
	//		+ "&pageSize=" + maxResults; 	//&os_authType=basic";
	
	// set name and password, (!!! if browser has already logged in Confluence, this field is invalid.)
	authStr = "Basic " + btoa(settings["usr"] + ":" + settings["pwd"]);
	// set search space name
	if (settings["space"] !== "all" && settings["space"] !== "") {
		url += ("&spaceKey=" + settings["space"]);
	}
	
	// send rest call
	$.ajax({
		type: "GET",
		url: url,
		dataType: "json",
		beforeSend: function (xhr) {
			// authorization name and password encoded by btoa
			xhr.setRequestHeader("Authorization", authStr);//"Basic Y2hhaXlpOmNoYWl5aTEyMw==");
		},
		success: function (data) {
			// if succeed send message to content.js
			// send init message to content.js
			chrome.tabs.sendMessage(tabId,
				{
					tag: "SET_ENGINE",
					searchString: searchString,
					initInfo:
					{
						totalSize: data.totalSize,
						engineFlag: engineFlag
					}
				});
					
			// for each item, send REST call to query information
			getContentDetails(tabId, data.result, 0);
			
			// $.each(data.result, function (index, item) {
			// 	createContentDetails(tabId, item);
			// });
		},
		error: function (xhr, errorText) {
			createModalDialog("ERROR", "Connection failed: Cannot fetch confluence results.");
		}
	});
}


// GET content detail from Confluence for every search result
function getContentDetails(tabId, items, index, length) {
	if (index >= items.length) {
		return;
	}
	var curItem = items[index];
	var url = _prefix + "content/" + curItem.id;
	
	// send rest call
	$.ajax({
		type: "GET",
		url: url,
		dataType: "json",
		beforeSend: function (xhr) {
			// authorization name and password encoded by btoa
			xhr.setRequestHeader("Authorization", authStr);//"Basic Y2hhaXlpOmNoYWl5aTEyMw==");
		},
		success: function (data) {
			// if succeed send message to content.js
			// tabId and searching result by JSON
			chrome.tabs.sendMessage(tabId,
				{
					tag: "INSERT_ITEM",
					itemInfo:
					{
						id: curItem.id,							// id 
						title: curItem.title,					// title
						url: curItem.link[0].href,				// url
						html: data.body.value,					// content 
						date: data.lastModifiedDate.friendly	// last modified
					}
				});
				
				// recursively GET next item
				getContentDetails(tabId, items, index+1);
		},
		error: function (xhr, errorText) {
			alert("failed");
			getContentDetails(tabId, items, index+1);
		}
	});
}


// GET content detail from Confluence for every search result
function createContentDetails(tabId, item) {
	var url = _prefix + "content/" + item.id;
	
	// send rest call
	$.ajax({
		type: "GET",
		url: url,
		dataType: "json",
		beforeSend: function (xhr) {
			// authorization name and password encoded by btoa
			xhr.setRequestHeader("Authorization", authStr);//"Basic Y2hhaXlpOmNoYWl5aTEyMw==");
		},
		success: function (data) {
			// if succeed send message to content.js
			// tabId and searching result by JSON
			chrome.tabs.sendMessage(tabId,
				{
					tag: "INSERT_ITEM",
					itemInfo:
					{
						id: item.id,
						title: item.title,
						url: item.link[0].href,
						html: data.body.value,
						date: data.lastModifiedDate.friendly
					}
				});
		},
		error: function (xhr, errorText) {
			alert("failed");
		}
	});
}

// create a dialog in current tab by using injected script
function createModalDialog(caption, msg) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.executeScript(tabs[0].id, { file: "jquery-2.1.4.min.js" }, function () {
			chrome.tabs.executeScript(tabs[0].id, 
			{ 
				code: "var msg = '" + msg + "';" 
			   +"var caption= '" + caption + "';"
			}, function () {
				chrome.tabs.executeScript(tabs[0].id, { file: "modalDialog.js" }, function () {
					// !important: window.close() should be called in here which is in this callback
					// otherwise, the window will not function well
					window.close();
				});
			});
		});

	});
}


// for testing
chrome.browserAction.onClicked.addListener(function (tab) {
	// No tabs or host permissions needed!
	console.log('Turning ' + tab.url + ' red!');
	chrome.tabs.executeScript({
		code: 'document.body.style.backgroundColor="red"'
	});
});