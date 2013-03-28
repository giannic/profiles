$('document').ready(function() {
    $('#visualizations').width(2*$(window).width() + 5 + 'px');
    $('#circles').width($(window).width() + 'px');
    $('#lines').width($(window).width() + 'px');

    $('#timelines-toggle').click(function() {
        $('#visualizations').animate({
            // we should probably have -1 * vis_number * width (to scale)
            left: -$(window).width()
        }, 300, function() {
        });
    });

    $('#clusters-toggle').click(function() {
      console.log('animate')
        $('#visualizations').animate({
            left: 0
        }, 300, function() {

        });
    });

    $('#add-account-toggle').click(function() {
        console.log("adding account");
        $("#add-app-box").toggle();
    });
});
