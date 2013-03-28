//var baseUrl = "http://davidxu.me:3000";
var baseUrl = "http://localhost:3000";
var url = baseUrl + "/login";

console.log("popup.js");
// Bind click listener
$("#submit-button").click(function () {
	var form = $("#loginform");
	console.log("posting");
	$.post(url, form.serialize())
		.done(function(data) {
			console.log("data callback");
			if (!data || data["userid"] == undefined) {
				console.log("Login failed")
				return;
			}
			var userid = data["userid"];
			console.log("userid " + userid);
			chrome.extension.sendMessage({"userid": userid});
		});
    form.find("input[type=text], textarea").val("");
});
