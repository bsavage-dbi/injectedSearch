// global variable URL
var currentURL = "";

// receive message from background.js when current page needs to be injected.
chrome.runtime.onMessage.addListener(function (msg, _, sendResponse) {
	// get current url
	currentURL = msg.content;
	// get search string
	var searchString = getSearchString(currentURL);
	// send REST call to Confluence to get searching result (XML or json data)
	sendRESTCall(searchString);
	// create dom element
	if (searchString !== "") {
		createDOMElements(searchString);
	}
});

/*
	param 
*/
function getSearchString(input) {
	var startIndex = input.indexOf("wd=");
	if (startIndex == -1) {
		return "";
	} else {
		startIndex+=3;
	}
	var endIndex = input.indexOf("&", startIndex);
	return input.substring(startIndex, endIndex);
}

function sendRESTCall(input) {
	var xhr = new XMLHttpRequest();
	var url = "http://172.20.200.191:8003/rest/prototype/1/search?query=test&type=page";//&os_authType=basic";
	$.ajax({
		type: "GET",
		url: url,
		dataType: "xml",
		beforeSend: function(xhr) {
			xhr.setRequestHeader ("Authorization", "Basic Y2hhaXlpOmNoYWl5aTEyMw==");	
		},
		success: function (data) {
			alert(data.getElementsByTagName("result")[0].getAttribute("type"));
		},
		error: function (xhr, errorText) {
			alert("failed");
		}
	});
}

function createDOMElements(input) {
	alert("Your input:" + input);
	$("#content_right").prepend("<b>" + input + " </b>");
}