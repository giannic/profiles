// THIS SHOULD NOT BE A GLOBAL, CHANGE AFTER CODE CLEANUP

var APP_DATA = [];
var CAT_DATA = {};
var WINDOW_WIDTH = $(window).width();
var WINDOW_HEIGHT = $(window).height();

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

// get data
$(function() {
    //get the JSON file
    $.ajax({
      url: 'apps/user',
      dataType: 'json',
      error: function(err) {
        console.log(err);
      },
      success: function(data) {
        console.log("HERE");
        console.log('HIHIHIHIHIHIHWHHHHQYQUYERYQUROUIF');
        APP_DATA = data;
        // format the data for categories
        var cats = _.uniq(_.pluck(data, 'category'));
        console.log(cats);
        _.each(cats, function(cat) {
         CAT_DATA[cat] = _.where(data, {category: cat});
        });

        init();

      }
    });
});


var init = function(){
  clusters_init();
  lines_init();
};
