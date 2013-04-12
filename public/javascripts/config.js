// THIS SHOULD NOT BE A GLOBAL, CHANGE AFTER CODE CLEANUP

var APP_DATA = [],
    CAT_DATA = {}, 
    WINDOW_WIDTH = $(window).width(), 
    WINDOW_HEIGHT = $(window).height(),
    app = {
        models: {},
        collections: {},
        views: {},
        templates: {}
    };

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
        // console.log("HERE");
        // console.log('HIHIHIHIHIHIHWHHHHQYQUYERYQUROUIF');
        APP_DATA = data;
        // format the data for categories
        console.log('thisss')
        console.log(data)
        var cats = _.uniq(_.pluck(data.apps, 'category'));
        // console.log(_.pluck(data.apps, 'category'))

        console.log(cats);
        _.each(cats, function(cat) {
         CAT_DATA[cat] = _.where(data.apps, {category: cat});
        });

        init();

      }
    });
});


var init = function(){
  clusters_init();
  lines_init();
  grid_init();
};
