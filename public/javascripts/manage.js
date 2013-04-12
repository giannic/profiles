var allowEndpoint = "/users/whitelist_add";
var disallowEndpoint = "/users/whitelist_remove";

$(document).ready(function() {

$("#allow-button").click(function() {
    makePost(allowEndpoint);
});

$("#disallow-button").click(function() {
    makePost(disallowEndpoint);
});

getWhitelist();

function makePost(endpoint) {
    var domain = $("#input-domain").val();
    // console.log(domain);
    $.post(endpoint, {"domain": domain}, renderResponse);
};

function getCategoryMarkup() {
    var s = $("<select>");
    var categories = ["Social", "Professional", "Music", "Image Sharing", "Entertainment"];
    for (var i = 0; i < categories.length; i ++) {
        s.append($("<option>").html(categories[i]));
    }
    return $("<div>").append(s);
    /*
    return """
    <div> 
    <select> 
        <option>Social</option>
        <option>Professional</option>
        <option selected>Music</option>
        <option>Image Sharing</option>
        <option>Entertainment</option>
    </select>
    </div>
    """;
    */
};

function getWhitelist() {
    $.get("/users/whitelist", renderResponse)
};

function renderResponse(data, status, xhr) {
    console.log(data);
    if (("error" in data)) {
        console.log("Error getting whitelist: " + data["error"]);
        return;
    }

    var list = $("#app-list");
    var whitelist = data['whitelist'];

    for (var i = 0; i < whitelist.length; i ++) {
        var name = whitelist[i];
        var li = $("<li>");
        li.append($("<div>").addClass("app-name").html(name));
        var categoryMarkup = getCategoryMarkup();
        li.append(categoryMarkup);
        var div = $("<div>").append($("<input>")
                                .addClass("management-delete")
                                .attr({
                                    "src": "img/ui_icons/delete.png",
                                    "name": "image"
                                })
                                .css({
                                   width: "20px",
                                   height: "20px"
                                })
                            )
        li.append(div);
        list.append(li);
    }
    var elems = document.getElementsByTagName('*'), i;
    for (i in elems) {
        if((' ' + elems[i].className + ' ').indexOf(' ' + 'management-delete' + ' ')
                > -1) {
            elems[i].setAttribute('type', 'image');
        }
    }

    /*
    if ("success" in data) {
        //$("#response").html("Success! " + data["success"]);
        // console.log(data["success"]);
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
    */
};

});
