/*
 * PLEASE LOOK IN CONFIG FILE FOR CONSTANTS FOR OFFSETS
 */

(function() {
var apps_durations;
// mapping of apps to their total
var canvas,
    canvas_ctx,
    canvas_height,
    line_colors,
    start_time,
    end_time,
    total_time,
    duration_width = WINDOW_WIDTH, // not used
    duration_height = WINDOW_HEIGHT,
    duration_line_width,
    duration_y_spacing;
var ordered_apps;

// html5 animation
window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

function my_animate(num_frames, num_frames_remain, increment) {
    var line_width_change = ICON_HEIGHT * (3/4),
        y_space_change = DURATIONS_Y_SPACING * (3/4);

    duration_line_width += increment * line_width_change/num_frames;
    duration_y_spacing += increment * y_space_change/num_frames;

    canvas_ctx.clearRect(0, 0, canvas.width, canvas.height);
    render_all_apps_from_json(APP_DATA);

    requestAnimFrame(function() {
        if (num_frames_remain > 0) {
            my_animate(num_frames, num_frames_remain - 1, increment);
        }
    });
}

/*
 * Action events
 */
$(document).ready(function() {
    $("#durations-compress").click(function() {
        if ($(this).hasClass("durations-compressed")) {
            my_animate(10, 10, 1);

            $(this).removeClass("durations-compressed")
                   .addClass("durations-expanded")
                   .attr("src", "img/ui_icons/up.png");

            $("#durations-sidebar")
            .css('visibility', 'visible')
            .animate({
                opacity: 1.0
            }, ANIMATE_TIME);

        } else {
            my_animate(10, 10, -1);

            $(this).removeClass("durations-expanded")
                   .addClass("durations-compressed")
                   .attr("src", "img/ui_icons/down.png");
            $("#durations-sidebar").animate({
                opacity: 0.0
            }, ANIMATE_TIME, function() {
                $(this).css('visibility', 'hidden');
            });
        }
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
    canvas.height = duration_height; // subtract size of menubar
    canvas.width = 930; // 10 margin

    duration_line_width = ICON_HEIGHT;
    duration_y_spacing = DURATIONS_Y_SPACING;
    start_time = startTime; // change to startTime, endTime
    end_time = endTime;
    total_time = end_time - start_time;

    // generate colors
    line_colors = generate_colors(APP_DATA.apps.length);
    console.log(line_colors);
    console.log(APP_DATA.apps.length);

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
    //canvas_ctx.lineWidth = duration_line_width;
    //canvas_ctx.strokeStyle = line_colors[index];
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

    //canvas_ctx.beginPath();
    canvas_ctx.lineWidth = duration_line_width;
    canvas_ctx.strokeStyle = line_colors[index];

    var focus_pairs = _.zip(item.focus, item.unfocus);
    _.each(focus_pairs, function(pair) {
        if (pair[0] !== undefined && pair[1] !== undefined) {
            render_app_segment(y_by_rank, pair[0], pair[1]);
        }
    });
    //canvas_ctx.closePath();

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

/*
 * Generates random colors in hex for each value in the colored matrix
 */
function generate_colors(num_apps)
{
    var i, j, max_index,    // iteration vars and bound on byte choices
        hex, colors;        // color byte choices, map from value to hex

    hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
           'A', 'B', 'C', 'D', 'E', 'F'];
    max_index = hex.length - 1;

    colors = [];
    colors[0] = '#FFFFFF'; // set blank color
    for (i = 1; i <= num_apps; ++i) {
        colors[i] = "#";
        for (j = 0; j < 6; ++j) {
            colors[i] += hex[Math.round(Math.random()*max_index)];
        }
    }
    return colors;
}


})();
