/*
 * PLEASE LOOK IN CONFIG FILE FOR CONSTANTS FOR OFFSETS
 */

(function() {
var apps_durations;
// mapping of apps to their total
var canvas,
    canvas_ctx,
    canvas_height,
    start_time,
    end_time,
    total_time,
    duration_width = WINDOW_WIDTH, // not used
    duration_height = WINDOW_HEIGHT,
    duration_line_width,
    duration_y_spacing;
var ordered_apps;

/*
 * Action events
 */
$(document).ready(function() {
    $("#durations-compress").click(function() {
        if ($(this).hasClass("durations-compressed")) {
            duration_line_width = ICON_HEIGHT;
            duration_y_spacing = DURATIONS_Y_SPACING;
            $(this).removeClass("durations-compressed")
                   .addClass("durations-expanded")
                   .attr("src", "img/ui_icons/up.png");

            $("#durations-sidebar")
            .css('visibility', 'visible')
            .animate({
                opacity: 1.0
            }, ANIMATE_TIME);

        } else {
            duration_line_width = ICON_HEIGHT/4;
            duration_y_spacing = DURATIONS_Y_SPACING/4;
            $(this).removeClass("durations-expanded")
                   .addClass("durations-compressed")
                   .attr("src", "img/ui_icons/down.png");
            $("#durations-sidebar").animate({
                opacity: 0.0
            }, ANIMATE_TIME, function() {
                $(this).css('visibility', 'hidden');
            });
        }
        canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
        render_all_apps_from_json(APP_DATA);
    });
});

/*
 * main setup function for durations
 * called inside config.js
 */
app.util.vis.durations_init = function() {
    initialize();
    //render_all_apps_from_json(sample_data);
    render_all_apps_from_json(APP_DATA);
};

/*
 * internal setup function. Sets up canvas
 */
function initialize() {
    $("#durations").width(duration_width);
    canvas = document.getElementById('durations-canvas');
    //canvas.height = WINDOW_HEIGHT - $('#header').height(); // subtract size of menubar
    canvas.height = duration_height; // subtract size of menubar
    canvas.width = 930; // 10 margin
    //console.log(duration_height);
    //console.log(WINDOW_HEIGHT);

    duration_line_width = ICON_HEIGHT;
    duration_y_spacing = DURATIONS_Y_SPACING;
    start_time = startTime; // change to startTime, endTime
    end_time = endTime;
    total_time = end_time - start_time;
    canvas_ctx = canvas.getContext('2d');
}

/*
 * order apps by duration
 * Input: All JSON Data
 * Output: Array sorted in order of most used to least used
 */
function order_apps(json) {
  var d_json = _.map(json, sum_duration_per_app);
  var n = _.sortBy(d_json, function(app) {
      //return -app.durations;
      //console.log(app.durations);
      return -app.durations || 0;
  });
  return n;
}

/*
 * Sums the total duration of an app
 * Input: JSON Data for one app
 * Output: Duration of the app, array of duration times
 */
function sum_duration_per_app(app) {
    //app.durations = _.reduce(_.zip(app.open, app.close), function(memo, pair) {
    // console.log('sum_dureatio_perapp')
    // console.log(app)
    //app.durations = _.reduce(_.zip(app.open, app.close), function(memo, pair) {
    if (app.focus === undefined || app.unfocus === undefined) {
        console.log("Failed to get focus data for:");
        console.log(app);
        return 0;
    }
    app.durations = _.reduce(_.zip(app.focus, app.unfocus), function(memo, pair) {
        // console.log(memo)
        return memo + pair[1] - pair[0];
    }, 0);
    // console.log('returns')
    // console.log(app)
    return app;
}

/*
 * Renders the icon for one app
 * Input: App Id
 * Output: Draws to canvas in correct location
 *         x: 0
 *         y: app_ranking * height_per_row
 */
function render_icon(item) {
    var img_copy = item.url;
    var parts = img_copy.split(".");
    img_copy = parts[0];

    // need to consider apps with no images

    //console.log(img_copy);
    $("#durations-sidebar").append('<a href="http://' + item.url + '"><img class="durations-icon" src="img/app_icons/' + img_copy + '-square.png" onError="this.src = \'img/app_icons/social-networks-square.png\'"/></a>');
}

/*
 * Renders the icon for one app
 * Input: y_position, focus_time, unfocus_time
 * Output: Draws only one line segment of an app
 */
function render_app_segment(y, focus_time, unfocus_time) {
    var start_x = (focus_time - start_time) / total_time * canvas.width,
        end_x = (unfocus_time - start_time) / total_time * canvas.width;

    canvas_ctx.beginPath();
    canvas_ctx.moveTo(start_x, y);
    canvas_ctx.lineTo(end_x, y);
    canvas_ctx.lineWidth = duration_line_width;
    canvas_ctx.strokeStyle = "black";
    canvas_ctx.stroke();
    canvas_ctx.closePath();
}

/* Renders all the line segments for app
 * Input: the json data
 * Output: Draws all the line segments of an app, as well as its icon
 */
function render_app(item, index) {
    var y_by_rank = index * (duration_line_width + duration_y_spacing) + STROKE_WIDTH/2;
    //var focus_pairs = _.zip(item.open, item.close);
    if (item.focus === undefined || item.unfocus === undefined) {
        console.log("focus or unfocus time missing");
    }

    var focus_pairs = _.zip(item.focus, item.unfocus);
    _.each(focus_pairs, function(pair) {
        if (pair[0] !== undefined && pair[1] !== undefined) {
            render_app_segment(y_by_rank, pair[0], pair[1]);
        }
    });

    render_icon(item);
}

/* Render all lines for all apps
 * Input: All JSON Data
 * Output: Draws paints entire canvas
 */
function render_all_apps_from_json(data) {
    $("#durations-sidebar").html('');
    ordered_apps = order_apps(data.apps);
    // is underscore async?
    for (var index in ordered_apps) {
        render_app(ordered_apps[index], index);
    }
}
})();
