var allowEndpoint = "/users/whitelist_add";
var disallowEndpoint = "/users/whitelist_remove";

$(document).ready(function() {
    $("#allow-button").click(function() {
        makePost(allowEndpoint);
    });

    $("#disallow-button").click(function() {
        makePost(disallowEndpoint);
    });
});

function makePost(endpoint) {
    var domain = $("#input-appname").val();
    console.log(domain);
    $.post(endpoint, {"domain": domain}, renderResponse);
}

function renderResponse(data, status, xhr) {
    if ("success" in data) {
        //$("#response").html("Success! " + data["success"]);
        console.log(data["success"]);
        var newList = data["success"]["new_whitelist"];
        var outputHtml = "";
        for (var i = 0; i < newList.length; i ++) {
            outputHtml += "<li>" + newList[i] + "</li>";
        }
        $("#whitelist").html(outputHtml);
    }
    else if ("error" in data) {
        //$("#response").html("Could not add " + domain + " to apps list");
        alert(data["error"]);
    }
};
