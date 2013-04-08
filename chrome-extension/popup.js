var baseUrl = "http://davidxu.me:3000";
//var baseUrl = "http://localhost:3000";
var url = baseUrl + "/login";
var _recording = true;

console.log("popup.js");

$(document).ready(function() {
	bindToggleEventListener();
});

// Bind click listener for allow site button
$("#add-button").click(function () {
	var url = null;
	// Send message with the current tab url to background.js
	chrome.tabs.getSelected(null, function(tab) {
		url = tab.url;
		var msg = {"tabid": tab.id, "allowed_url": url};
		chrome.extension.sendMessage(msg);
	});
});

// Bind click listener for disallow site button
$("#del-button").click(function () {
	var url = null;
	// Send message with the current tab url to background.js
	chrome.tabs.getSelected(null, function(tab) {
		url = tab.url;
		var msg = {"tabid": tab.id, "disallowed_url": url};
		chrome.extension.sendMessage(msg);
	});
});

// Bind click listener for submit button
$("#submit-button").click(login);

$(document).keypress(function(e) {
	// If enter pressed, submit the form
	if (e.which == 13) {
		login();
	}
});

// Send request to login and display success/failure message
function login() {
	var form = $("#loginform");
	// Get form data
	$.post(url, form.serialize())
		.done(function(data) {
			// failure
			if (!data || data["userid"] == undefined) {
				console.log("Login failed")
				$("body").append("<p>Login failed</p>");
			}
			// success
			else {
				var userid = data["userid"];
				console.log("userid " + userid);
				chrome.extension.sendMessage({"userid": userid});
				$("body").append("<p>Login succeeded</p>");
			}
		});
	// Clear forms
    form.find("input[type=text], textarea").val("");
    form.find("input[type=password], textarea").val("");
}

// Funky workaround to make click listener persistent for toggle recording button
function bindToggleEventListener() {
	$("#toggle-recording").click(function () {
		if (_recording) {
			$(this).html("Start logging");
		}
		else {
			$(this).html("Stop logging");
		}
		toggleRecording();
	});
};

function bindUnbindEventListener() {
	bindToggleEventListener();
	// When the click listener is unbound, immediately rebind the click
	// listener, as well as this one
	// super meta
	$("toggle-recording").unbind("click", function() {
		bindUnbindEventListener();
	});
};

function toggleRecording() {
	_recording = !_recording;
	chrome.extension.sendMessage({"recording": _recording});
};
