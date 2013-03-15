$('document').ready(function() {
    $('#visualizations').width(2*$(window).width() + 5 + 'px');
    $('#circles').width($(window).width() + 'px');
    $('#lines').width($(window).width() + 'px');
  
  
  // css({
  //       // "position": "absolute",
  //       // "left": 0,
  //       // "top": 60
  //   })
  //       .attr("width", $(window).width())
  //       .attr("height", $(window).width());


    $('#D3line > svg').css({
        // "position": "absolute",
        // "left": $(window).width(),
        // "top": 60
    });

    $('#timeline_panel').css({
        // "left": $(window).width(),
        // "top": $(window).width()
    });

    $('#timelines-toggle').click(function() {
      console.log('MOVEEEEEE')
        // $('#timeline_panel').css({"background-color":"black"});
        $('#visualizations').animate({
            left: '-=' + $(window).width()
        }, 300, function() {
        });

        // $('#timeline_panel').animate({
        //     left: '-=' + $(window).width()
        // }, 300, function() {

        // });

    });

    $('#clusters-toggle').click(function() {
      console.log('animate')
        $('#visualizations').animate({
            left: '+=' + $(window).width()
        }, 300, function() {

        });

        // $('#timeline_panel').animate({
        //     left: '+=' + $(window).width()
        // }, 300, function() {

        // });
    });
});
