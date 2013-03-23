var baseUrl = "http://davidxu.me:3000";
//var baseUrl = "localhost:3000";
var url = baseUrl + "/login";

// Bind click listener
$("#submit-button").click(function () {
	var form = $("#loginform");
	$.post(url, form.serialize())
		.done(function(data) {
			if (!data) {
				alert("Login failed")
				return;
			}
			var userid = data["userid"];
			chrome.extension.sendMessage({"userid": userid});
		});
    form.find("input[type=text], textarea").val("");
});
