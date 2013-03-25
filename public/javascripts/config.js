// THIS SHOULD NOT BE A GLOBAL, CHANGE AFTER CODE CLEANUP
show_stats = function(id) {
    $("#stats").show();
    //$("#stats").append(id);
}

hide_stats = function() {
    $("#stats").hide();
}

$(document).mousemove(function(e) {
    $("#stats").css({
        position: "absolute",
        top: e.pageY+1,
        left: e.pageX+1
    });
});
