var VIS_COUNT = 4;

var APP_DATA = [],
    CAT_DATA = {},
    WINDOW_WIDTH = $(window).width(),
    WINDOW_HEIGHT = $(window).height(),
    app = {
        models: {},
        collections: {},
        views: {},
        templates: {},
        util: {
          vis: {}
        }
    };

/*
 * durations constants
 */
var X_LINE_OFFSET = 0,
    ROW_HEIGHT = 0,
    CANVAS_WIDTH = 0; // add more as necessary

show_stats = function(id) {
    $("#stats").show();
};

hide_stats = function() {
    $("#stats").hide();
};

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
      url: 'apps/userallowed',
      dataType: 'json',
      error: function(err) {
        console.log(err);
      },
      success: function(data) {
        APP_DATA = data;
        // format the data for categories
        var cats = _.uniq(_.pluck(data.apps, 'category'));

        _.each(cats, function(cat) {
         CAT_DATA[cat] = _.where(data.apps, {category: cat});
        });

        init();

      }
    });
});


var init = function() {
    clusters_init();
    lines_init();
    grid_init();
    app.util.vis.durations_init(); // uncomment when function is implemented

};
