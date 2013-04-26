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
      start_time = 0, // change to startTime, endTime
      end_time = 100,
      total_time,
      timeline_width = WINDOW_WIDTH,
      timeline_height = WINDOW_HEIGHT;
  var ordered_apps;



  function initialize() {
    canvas = $('#durations-canvas');
    canvas = document.getElementById('durations-canvas');
    canvas_height = WINDOW_HEIGHT - $('#header').height(); // subtract size of menubar
    //canvas.height = canvas_height;
    // this is how clusters is doing it atm
    canvas.height = WINDOW_HEIGHT - 50;
    canvas.width = WINDOW_WIDTH - 30;

    total_time = end_time - start_time;
    canvas_ctx = canvas.getContext('2d');
  }

  /*
   * main setup function for durations
   * called inside config.js
   */
  app.util.vis.durations_init = function() {
    initialize();
    //render_app_segment(300, 40, 60);
    render_all_apps_from_json(sample_data);

  };
  
  /*
   * order apps by duration 
   * Input: All JSON Data
   * Output: Array sorted in order of most used to least used
   */
  function order_apps(json) {
      var d_json = _.map(json, sum_duration_per_app, function(memo, dur){ return memo + dur; }); 
      return _.sortBy(d_json, function(app) {
        return -app.durations;
      });
  }

  /*
   * Sums the total duration of an app
   * Input: JSON Data for one app
   * Output: Duration of the app, array of duration times
   */
  function sum_duration_per_app(app) {
    app.durations = _.reduce(_.zip(app.focus, app.unfocus), function(memo, pair) {
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
  function render_icon(app_id) {

  }

  /*
   * Renders the icon for one app
   * Input: y_position, focus_time, unfocus_time
   * Output: Draws only one line segment of an app
   */
  function render_app_segment(y, focus_time, unfocus_time) {

    var start_x = focus_time / total_time * timeline_width;
    var end_x = unfocus_time / total_time * timeline_width;

    canvas_ctx.beginPath();
    canvas_ctx.moveTo(start_x, y);
    canvas_ctx.lineTo(end_x, y);
    canvas_ctx.lineWidth = 1;
    canvas_ctx.strokeStyle = "black";
    canvas_ctx.stroke();
    canvas_ctx.closePath();
  }

  /* Render all lines for all apps
   * Input: All JSON Data
   * Output: Draws paints entire canvas
   */
  function render_all_apps_from_json(data) {
    ordered_apps = order_apps(data);
    _.each(ordered_apps, function(item, index){
      render_app(item, index);  
    });
  }

  /* Renders all the line segments for app
   * Input: the json data 
   * Output: Draws all the line segments of an app, as well as its icon
   */
  function render_app(data, index) {
    var focus_pairs = _.zip(data.focus, data.unfocus);
    _.each(focus_pairs, function(pair){
      render_app_segment(10 * (index + 1), pair[0], pair[1]);
    });
  }


})();
