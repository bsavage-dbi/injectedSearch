var initInfo;
var parentDiv, blockTotalDiv, loadMore;
var curIndex = 1;
var keywords = [];
var blockItems = [];


// receive message from background.js when current page needs to be injected.
chrome.runtime.onMessage.addListener(function (msg, _, sendResponse) {
	switch(msg.tag) {
		case "SET_ENGINE":
			curIndex = 1;
			initInfo = msg.initInfo;
			keywords = unifyKeywords(decodeURIComponent(msg.searchString).split(" "));
			setTimeout(init, 1000);
			break;
		case "INSERT_ITEM":
			setTimeout(function() {addItemContentBlock(msg.itemInfo)}, 1000);
			break;
		case "MODAL_DIALOG":
			alert("in");
			addModalDialog(msg.greeting);
			break;
	}
});

// add parent div 
function init() {
	// remove previous injected dom
	$(parentDiv).remove();
	
	// create DOM elements according to search result which is passed by background.js
	// The tag in Baidu is #content-right, Google is #rhss
	createParentDiv(initInfo.engineFlag.info.div);
}

// add item title and its content
function addItemContentBlock(item) {
	// add block div
	var blockDiv = $("<div>")
		.css({
			border: "1px solid #E9E9E9",
			"background-color": "white",
			padding: "6px 10px 0px 10px",
    		"border-radius": "2px",
    		cursor: "pointer",
    		"font-family": "Helvetica",
    		position: "relative",
			margin: "8px"
    		// width: "136px"
		}).appendTo(blockTotalDiv);

//	loadMore.prepend(blockDiv);
	blockItems.push(blockDiv);
	if (curIndex > 5) {
		blockDiv.hide();
	}
	
	// add title
	var title = $("<a/>")
		.attr({
			href: item.url
		})
		.css({
			"text-decoration": "none",
			padding: "5px"
		})
		.text(curIndex + ". " + item.title).appendTo(blockDiv);
			
	// add date
	var date = $("<div>")
		.css({
			float: "right",
			color: "#707070",
    		"font-size": "12px",
			"margin-top": "5px"
		})
		.text(item.date).appendTo(blockDiv);
	
	// get highlighted string
	var tempHtml = item.html.replace(/(<([^>]+)>)/ig,"").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"')
			.substring(0, 300);
	var result = highlightString(tempHtml);
	
	var subContent = $("<div>")
		.css({
			margin: "5px",
			display: "block",
			"font-family": "Arial,sans-serif",
    		"font-size": "12px",
    		"line-height": "1.3",
			"word-wrap": "break-word"
		})
		.html(result).appendTo(blockDiv);	
	
	// increase current index
	curIndex++;
}

// create parent string
function createParentDiv(insertTagName) {
	// parent 
	parentDiv = $("<div>")
		.css({
			width: "95%",
			"max-width": "456px",
			minHeight: "100px",
			border: "1px solid #ccc",
			"margin-bottom": "5%",
			"background-color": "#f5f5f5"
		});	
	$("#" + insertTagName).prepend(parentDiv);
	
	// header image
	var headerDiv = $("<div>")
		.attr({
			title: "Confluence"
		})
		.css({
			"background-color": "#205081"
		})
		.appendTo(parentDiv);
	var imageHeader = $("<img>")
		.attr({
			width: "100px",
			"min-height": "24px",
			href: "http://172.20.200.191:8003/",
			src: "http://172.20.200.191:8003/s/en_GB-1988229788/4732/f543bd9a3bbc12daed85f6f5e5cba84282599932.1/_/images/logo/confluence-logo.png"
		})
		.css({
			padding: "8px 0 3px 12px"
		})
		.appendTo(headerDiv);
	
	// close all content if clicked
	var closeBtn = $("<span>")
		.css({
			"text-decoration": "underline",
			color: "white",
			padding: "10px",
			cursor: "pointer",
			float: "right"
		})
		.text("Close")
		.click(function(e){
			$(parentDiv).remove();
		})
		.appendTo(headerDiv);	
	
	// caption
	var caption = $("<div>")
		.attr({
			title: "Showing " + initInfo.totalSize + " searching result in Confluence"
		})
		.text("Showing " + initInfo.totalSize + " searching results in Confluence")
		.css({
			color: "#707070",
			padding: "0 0 0 6px",
			margin: "8px"
		})
		.appendTo(parentDiv);
	
	// block items parent div
	blockTotalDiv = $("<div>").appendTo(parentDiv);
	
	// load more button
	createLoadMoreBtn();
}

// load more button
function createLoadMoreBtn() {
	// add "Load More" button if necessary
	
	if (initInfo.totalSize > 5) {
		// container
		var loadMoreContainer = $("<div>")
			.appendTo(parentDiv);
		
		// actual content
		loadMore = $("<div>")
			.text("Show All...")
			.css({
				color: "color: #3b73af",
				padding: "0px 0px 5px 40%",
				"font-size": "14px",
				cursor: "pointer"
			})
			.click(function(e) {
				for (var i = 0; i<blockItems.length; i++) {
					blockItems[i].show("slow");
				}
				$(this).hide();
			})
			.appendTo(loadMoreContainer);
	}
	
}

// delete repeated keys
function unifyKeywords(arr) {
	var result  = [];
	$.each(arr, function(id, key) {
		if (result.indexOf(arr[id]) === -1)
			result.push(arr[id]);
	});
	return result;
} 

// get highlighted string, find search string and add <b>
function highlightString(str) {
	var result = str;
	// get all keywords
	$.each(keywords, function(id, key) {
		var reg = new RegExp(key, "gi");
		result = result.replace(reg, "<span style = 'background-color : yellow'>" + key + "</span>");
	});
	return result;
}

// create ModalDialog to show message
function addModalDialog(msg) {
	alert(msg);
}