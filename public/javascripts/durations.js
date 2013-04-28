(function() {
    /*
     * PLEASE LOOK IN CONFIG FILE FOR CONSTANTS FOR OFFSETS
     */
    var sample_data = [
        {
            focus: [10, 30, 50, 70],
            unfocus: [20, 40, 60, 80]
        },
        {
            focus: [20, 40, 60],
            unfocus: [30, 50, 70]
        },
        {
            focus: [0],
            unfocus: [10]
        },
        {
            focus: [80],
            unfocus: [100]
        }
    ];

var apps_durations;
// mapping of apps to their total
var canvas,
    canvas_ctx,
    canvas_height,
    start_time,
    end_time,
    total_time,
    duration_width = WINDOW_WIDTH, // not used
    duration_height = WINDOW_HEIGHT;
var ordered_apps;

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
    canvas.width = 940;
    console.log(duration_height);
    console.log(WINDOW_HEIGHT);

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
    return _.sortBy(d_json, function(app) {
        //return -app.durations;
        console.log(app_durations);
        return app_durations;
    });
}

/*
 * Sums the total duration of an app
 * Input: JSON Data for one app
 * Output: Duration of the app, array of duration times
 */
function sum_duration_per_app(app) {
    //app.durations = _.reduce(_.zip(app.open, app.close), function(memo, pair) {
    app_durations = _.reduce(_.zip(app.open, app.close), function(memo, pair) {
        return memo + pair[1] - pair[0];
    }, 0);
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

    console.log(img_copy);
    $("#durations-sidebar").prepend('<img class="durations-icon" src="img/app_icons/' + img_copy + '-square.png"/>');
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
    canvas_ctx.lineWidth = ICON_HEIGHT;
    canvas_ctx.strokeStyle = "black";
    canvas_ctx.stroke();
    canvas_ctx.closePath();
}

/* Renders all the line segments for app
 * Input: the json data
 * Output: Draws all the line segments of an app, as well as its icon
 */
function render_app(item, index) {
    var y_by_rank = index * (ICON_HEIGHT + DURATIONS_Y_SPACING) + STROKE_WIDTH/2;
    var focus_pairs = _.zip(item.open, item.close);
    _.each(focus_pairs, function(pair){
        render_app_segment(y_by_rank, pair[0], pair[1]);
    });

    console.log(item);
    render_icon(item);
}

/* Render all lines for all apps
 * Input: All JSON Data
 * Output: Draws paints entire canvas
 */
function render_all_apps_from_json(data) {
    ordered_apps = order_apps(data.apps);
    _.each(ordered_apps, function(item, index) {
        render_app(item, index);
    });
}

})();
