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
var engineFlag = "";
var maxResults = 5;
var settings = {};
settings["usr"] = "";
settings["pwd"] = "";
settings["space"] = "";
settings["url"] = "";
var authStr = "";

// REST url prefix
var _prefix = "";

// get searching string
function getSearchString(input) {
	// something more........
	var tempString = getSearchStringBaidu(input);
	if (tempString === "") {
		tempString = getSearchStringGoogle(input);
		if (tempString === "") {
			return "";
		} else {
			engineFlag = "Google";
		}
	} else {
		engineFlag = "Baidu";
	}
	return tempString;
}
// baidu search string
function getSearchStringBaidu(input) {
	if (input.indexOf("www.baidu.com") === -1) {
		return "";
	} else {
		var startIndex = input.indexOf("wd=");
		if (startIndex == -1) {
			return "";
		} else {
			startIndex += 3;
		}
		var endIndex = input.indexOf("&", startIndex);
		return input.substring(startIndex, endIndex);
	}
}
// google search string
function getSearchStringGoogle(input) {
	if (input.indexOf("www.google") === -1) {
		return "";
	} else {
		var startIndex = input.indexOf("q=");
		if (startIndex == -1) {
			return "";
		} else {
			startIndex += 2;
		}
		var endIndex = input.indexOf("&", startIndex);
		if (endIndex == -1)
			return input.substring(startIndex);
		else
			return input.substring(startIndex, endIndex);
	}
}

// read local storage for searching
function readLocalStorage(searchString, tabId) {
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
					initInfo:
					{
						totalSize: data.totalSize,
						engineFlag: engineFlag
					}
				});
			// for each item to query information
			$.each(data.result, function (id, item) {
				createContentDetails(tabId, item);
			});
		},
		error: function (xhr, errorText) {
			alert("failed");
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
						html: data.body.value
					}
				});
		},
		error: function (xhr, errorText) {
			alert("failed");
		}
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