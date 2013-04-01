// THIS SHOULD NOT BE A GLOBAL, CHANGE AFTER CODE CLEANUP
show_stats = function(id) {
    $("#stats").show();
}

hide_stats = function() {
    $("#stats").hide();
}

$(document).mousemove(function(e) {
    $("#stats").css({
        position: "absolute",
        top: e.pageY+10,
        left: e.pageX+10
    });
});
