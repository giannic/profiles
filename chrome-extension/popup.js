//var baseUrl = "http://davidxu.me:3000";
var baseUrl = "http://localhost:3000";
var url = baseUrl + "/login";
var _recording = true;

console.log("popup.js");

$(document).ready(function() {
	bindToggleEventListener();
});

// Bind click listener for add site button
$("#add-button").click(function () {
	var url = null;
	chrome.tabs.getSelected(null, function(tab) {
		console.log(tab);
		url = tab.url;
		var msg = {"tabid": tab.id, "allowed_url": url};
		console.log("msg data " + msg);
		chrome.extension.sendMessage(msg);
	});
});

// Bind click listener for submit button
$("#submit-button").click(function () {
	var form = $("#loginform");
	console.log("posting");
	$.post(url, form.serialize())
		.done(function(data) {
			console.log("data callback");
			if (!data || data["userid"] == undefined) {
				console.log("Login failed")
				$("body").append("<p>Login failed</p>");
				return;
			}
			var userid = data["userid"];
			console.log("userid " + userid);
			chrome.extension.sendMessage({"userid": userid});
			$("body").append("<p>Login succeeded</p>");
		});
    form.find("input[type=text], textarea").val("");
});

// Funky workaround to make click listener persistent for toggle recording button
function bindToggleEventListener() {
	console.log("Bound toggle recording");
	$("#toggle-recording").click(function () {
		console.log("Clicked button");
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
	console.log("recording: " + _recording);
};
