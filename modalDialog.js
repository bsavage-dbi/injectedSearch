
var WIN_WIDTH = $(window).width();
var WIN_HEIGHT = $(window).height();
var PAGE_HEIGHT = $(document).height();
var DIALOG_WIDTH = WIN_WIDTH * 0.2;
var DIALOG_HEIGHT = WIN_HEIGHT * 0.25;

$("#modalDialogMyHexin").remove();

// parent div
var parentDiv = $("<div>")
	.attr({
		"id": "modalDialogMyHexin"
	})
	.appendTo($("body"));
// disable background
var background = createBackground();
background.appendTo(parentDiv);
// add foreground
var foreground = createForeground();
foreground.appendTo(parentDiv);

// header
var header = createHeader().appendTo(foreground);
var content = createContent(caption, msg).appendTo(foreground);

// content string
function createContent(cap, msg) {
	var cp = $("<div>")
		.attr({
			"id": "modalDialogMyHexinContent"
		})
		.css({
			"font-family": "Arial,sans-serif",
			"margin-top": "10%"
		});
	var captionColor = "#205081";
	if (cap === "ERROR") {
		captionColor = "black";
	}
	var caption = $("<p>")
		.css({
			"color": captionColor,
			"text-align": "center"
		})
		.text(cap)
		.appendTo(cp);
	var message = $("<p>")
		.css({
			"text-align": "center"
		})
		.text(msg)
		.appendTo(cp);
	return cp;
}

function createHeader() {
	// header image
	var headerDiv = $("<div>")
		.attr({
			title: "Confluence"
		})
		.css({
			"background-color": "#205081"
		});
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
		.click(function (e) {
			$(parentDiv).remove();
		})
		.appendTo(headerDiv);
	return headerDiv;
}

function createForeground() {
	var fg = $("<div>").css({
		width: DIALOG_WIDTH + "px",
		height: DIALOG_HEIGHT + "px",
		opacity: 1,
		left: (WIN_WIDTH - DIALOG_WIDTH) / 2 + "px",
		top: (WIN_HEIGHT * 0.8 - DIALOG_HEIGHT) / 2 +  + $(window).scrollTop() + "px",
		"z-index": 999,
		position: "absolute",
		"background-color": "rgb(233, 233, 233)"
	});
	return fg;
}

function createBackground() {
	var bg = $("<div>").css({
		width: WIN_WIDTH + "px",
		height: PAGE_HEIGHT + "px",
		position: "absolute",
		"background-color": "black",
		top: 0,
		left: 0,
		"z-index": 998,
		opacity: 0.5
	});
	return bg;
}
