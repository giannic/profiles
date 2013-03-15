$('document').ready(function() {
    $('#circles > svg').css({
        "position": "absolute",
        "left": 0,
        "top": 60
    })
        .attr("width", "800px")
        .attr("height", "900px");


    $('#D3line > svg').css({
        "position": "absolute",
        "left": $(window).width(),
        "top": 60
    });

    $('#timeline_panel').css({
        "left": $(window).width(),
        "top": $(window).width()
    });

    $('#timelines-toggle').click(function() {
        $('#timeline_panel').css({"background-color":"black"});
        $('svg').animate({
            left: '-=' + $(window).width()
        }, 300, function() {
        });

        $('#timeline_panel').animate({
            left: '-=' + $(window).width()
        }, 300, function() {

        });

    });

    $('#clusters-toggle').click(function() {
        $('svg').animate({
            left: '+=' + $(window).width()
        }, 300, function() {

        });

        $('#timeline_panel').animate({
            left: '+=' + $(window).width()
        }, 300, function() {

        });
    });
});
