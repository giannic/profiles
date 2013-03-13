// Bind click listener
$("#submit-button").click(function () {
	var url = "http://127.0.0.1:3000/login";
	$.post(url, $("#loginform").serialize())
		.done(function(data) {
			if (!data) {
				message("Login failed")
				return;
			}
			var userid = data["userid"];
			chrome.extension.sendMessage({"userid": userid});
		});
});

