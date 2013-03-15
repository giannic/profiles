$('document').ready(function() {
    $('#visualizations').width(2*$(window).width() + 5 + 'px');
    $('#circles').width($(window).width() + 'px');
    $('#lines').width($(window).width() + 'px');

    $('#timelines-toggle').click(function() {
        $('#visualizations').animate({
            left: '-=' + $(window).width()
        }, 300, function() {
        });
    });

    $('#clusters-toggle').click(function() {
      console.log('animate')
        $('#visualizations').animate({
            left: '+=' + $(window).width()
        }, 300, function() {

        });
    });
});
