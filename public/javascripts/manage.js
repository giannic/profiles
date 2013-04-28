var allowEndpoint = "/apps/create";
var disallowEndpoint = "/users/whitelist_remove";

$(document).ready(function() {

$("#allow-button").click(function() {
    var domain = $("#input-domain").val();
    if(domain == "") {
        return;
    }
    $("#input-domain").val("");
    console.log(domain);
    $.post(allowEndpoint,
    {
        "app_url": domain,
        "name": domain.substring(0, domain.lastIndexOf("."))
    }, 
    function(data) {
        console.log("callback");
        if ("error" in data) {
            console.log("error in allow: " + data["error"]);
        } 
        else {
            // append the list element and fade it in
            var li = getListElement(domain);
            li.css('display', 'none');
            $("#app-list").prepend(li);
            li.fadeIn(300);

            setTypeImage();
            bindXButtonListener();
            bindSelectionListener();
            $("#app-saved").toggle();
        }
    });
});


$("#disallow-button").click(function() {
    var domain = $(this).closest("li").attr("name");
    console.log(domain);
    //$.post(allowEndpoint, {"domain": domain}, renderResponse);
});

$("#back-button").click(function() {
    document.location.replace("/");
});

getWhitelist();

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
    $.get("/users/whitelist", renderResponse);
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
        list.append(getListElement(name));
    }

    setTypeImage();
    bindXButtonListener();
    bindSelectionListener();
};

// assign type: image to all .management-delete elems
function setTypeImage() {
    var elems = document.getElementsByTagName('*'), i;
    for (i in elems) {
        if((' ' + elems[i].className + ' ').indexOf(' ' + 'management-delete' + ' ')
                > -1) {
            elems[i].setAttribute('type', 'image');
        }
    }
};

function bindXButtonListener() {
    $(".management-delete").click(function() {
        var row = $(this).closest("li");
        var domain = row.attr("name");
        console.log(domain);
        $.post("/users/whitelist_remove", {"domain": domain}, function(data) {
            if ("error" in data) {
                console.log("error in removing: " + data["error"]);
            }
            else {
                console.log(data);
                row.fadeOut(200);
                setTimeout(function(){row.remove()}, 200);
            }
        })
    });
};

function bindSelectionListener() {
    $("select").change(function () {
        console.log("changed");
        var category = "";
        $(this).find("option:selected").each(function () {
                category += $(this).text() + " ";
        });
        var domain = $(this).closest("li").attr("name");
        $.post("/apps/category", {
            "url": domain, 
            "category": category
        },
        function(data) {
            if ("error" in data) {
                console.log("error in change category: " + data["error"]);
            }
            else {
                console.log(data); 
                $("#app-saved").toggle();
            }
        });
    });
}

// Returns a DOM element for one list element to insert to page
function getListElement(name) {
    var li = $("<li>")
        .attr("name", name);
    li.append($("<div>")
        .addClass("app-name")
        .html(name));
    var categoryMarkup = getCategoryMarkup();
    li.append(categoryMarkup);
    var div = $("<div>").append()
    var input = $("<input>")
                            .addClass("management-delete")
                            .attr({
                                "src": "img/ui_icons/delete.png",
                                "name": "image"
                            })
                            .css({
                               width: "20px",
                               height: "20px"
                            });
    div.append(input);
    li.append(div);
    return li;
};

});
