	
$(document).ready(function () {
		 
	// settings
	var settings = {};
	settings["usr"] = "";
	settings["pwd"] = "";
	settings["space"] = "";
	settings["url"] = "";
	// get current settings if exists
	getDefaultSettings();
	
	// get space names
	getSpacesNames();

	// save current setting
	$("#saveBtn").click(function () {
		// get current setting
		settings["usr"] = $("#username").val();
		settings["pwd"] = $("#password").val();
		settings["url"] = $("#url").val();
		settings["space"] = $("#spaces").val();
		
		chrome.storage.local.set(settings, function () {
			$.ajax({
			type: "GET",
			url: settings["url"]  + "rest/prototype/1/space",
			dataType: "json",
			beforeSend: function (xhr) {
				// authorization name and password encoded by btoa
				// set name and password, (!!! if browser has already logged in Confluence, this field is invalid.)
				var authStr = "Basic " + btoa(settings["usr"] + ":" + settings["pwd"]);
				xhr.setRequestHeader("Authorization", authStr);
			},
			success: function (data) {
				createModalDialog("SUCCESS", "Saving successfully!");
			},
			error: function(xhr, errorText) {
				createModalDialog("ERROR", "Saving error: URL INVALID!");
			}});
        });
	});
	
	// cancel window
	$("#cancelBtn").click(function () {
		window.close();
	});
	
	///////////////////////////////////////////////////////////////////////////
	
	// get settings: name, password and default space name
	function getDefaultSettings() {
		chrome.storage.local.get(settings, function (result) {
			if (result["usr"] !== "" && result["pwd"] !== "") {
				settings = result;
				$("#username").val(result["usr"]);
				$("#password").val(result["pwd"]);
				$("#url").val(result["url"]);
				$("#spaces").val(result["space"]);
			} else {
				$("#username").val("chaiyi");
				$("#password").val("chayi123");
				$("#url").val("http://172.20.200.191:8003/");
				$("#spaces").val("all");
			}
		});
	}
	
	// read current local settings
	function readLocalSettings() {
		chrome.storage.local.get(settings, function(result) {
			settings = result;
			if (settings["usr"] === "" || settings["pwd"] === "") {
				////////////////////////////////////////////////////////////////////////////////!!!!!
				settings["usr"] = "chaiyi";
				settings["pwd"] = "chaiyi123";
				settings["space"] = "all";
				////////////////////////////////////////////////////////////////////////////////!!!!!
			}
		}); 
	}
	
	// get space names to create selection list
	function getSpacesNames() {
		var url = "http://172.20.200.191:8003/rest/prototype/1/space?type=all";
		$.ajax({
			type: "GET",
			url: url,
			dataType: "json",
			beforeSend: function (xhr) {
				// authorization name and password encoded by btoa
				// set name and password, (!!! if browser has already logged in Confluence, this field is invalid.)
				var authStr = "Basic " + btoa(settings["usr"] + ":" + settings["pwd"]);
				xhr.setRequestHeader("Authorization", authStr);
			},
			success: function (data) {
				// add 'all content' option
				$("#spaces").append($('<option/>', {
					value: "all",
					text: "all"
				}));
				
				// add each space name option in server
				$.each(data.space, function (i, item) {
					createSelectionListItem(i, data.space[i].key, data.space[i].title);
				});
				
				// set default space name
				$("#spaces").val(settings["space"]);
			},
			error: function (xhr, errorText) {
				createModalDialog("ERROR", "Fetch space name failed!");
			}
		});
	}
	
	// create selection list item
	function createSelectionListItem(index, key, title) {
		$("#spaces").append($('<option/>', {
			value: key,
			text: title
		}));
	}
	
	// create a dialog in current tab by using injected script
	function createModalDialog(caption, msg) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(tabs[0].id, {file: "jquery-2.1.4.min.js"}, function() {
				chrome.tabs.executeScript(tabs[0].id, 
				{
					code: "var msg = '" + msg + "';"
				  + "var caption='" + caption + "';"
				}, function() {
					chrome.tabs.executeScript(tabs[0].id, {file: "modalDialog.js"}, function() {
						// !important: window.close() should be called in here which is in this callback
						// otherwise, the window will not function well
						window.close();
					});
				});
			});
			
    	});
	}
});