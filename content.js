var initInfo;
var parentDiv;
var curIndex = 1;
// receive message from background.js when current page needs to be injected.
chrome.runtime.onMessage.addListener(function (msg, _, sendResponse) {
	switch(msg.tag) {
		case "SET_ENGINE":
			curIndex = 1;
			initInfo = msg.initInfo;
			setTimeout(init, 1000);
			break;
		case "INSERT_ITEM":
			setTimeout(function() {addItemContent(msg.itemInfo)}, 1000);
			break;
	}
});

// add parent div 
function init() {
	// create DOM elements according to search result which is passed by background.js
	// The tag in Baidu is #content-right, Google is #rhs
	switch (initInfo.engineFlag) {
		case "Baidu":
			createParentDiv("content_right");
			break;
		case "Google":
			createParentDiv("rhs");
			break;
	}
}

// add item title and its content
function addItemContent(item) {
//	alert("insert");
	// add title
	var li = $("<li/>").appendTo(parentDiv);
	var title = $("<a/>")
		.attr({
			href: item.url
		})
		.css({
			padding: "5px"
		})
		.text(curIndex + ". " + item.title).appendTo(li);
	curIndex++;
	
	var subContent = $("<div>")
		.css({
			margin: "5px",
			display: "block",
			fontSize: "small"
		})
		.text(item.html
			.replace(/(<([^>]+)>)/ig,"").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"')
			.substring(0, 300)).appendTo(li);
}

function createParentDiv(insertTagName) {
	// parent 
	parentDiv = $("<div>")
		.attr({
			title: initInfo.totalSize + " searching result in Confluence"
		})
		.text(initInfo.totalSize + " searching results in Confluence")
		.css({
			width: "95%",
			minHeight: "100px",
			padding: "10px",
			borderRadius: "25px",
			border: "2px solid black",
			margin: "20px"
		});
	$("#" + insertTagName).prepend(parentDiv);
}
