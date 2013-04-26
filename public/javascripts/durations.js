(function() {
  /*
   * PLEASE LOOK IN CONFIG FILE FOR CONSTANTS FOR OFFSETS
   */
  var canvas,
      canvas_ctx,
      canvas_height,
      start_time = 0,
      end_time = 100,
      total_time,
      timeline_width = WINDOW_WIDTH,
      timeline_height = WINDOW_HEIGHT;

  /*
   * Sums the total duration of an app
   * Input: All JSON Data
   * Output: Array sorted in order of most used to least used
   */
  function sum_all_durations(app) {
      var sum = 0;
      for (var i in app.open) {
          sum += app.open[i];
      }
      console.log("SUM: ============" + sum);
  }

  /*
   * Sums the total duration of an app
   * Input: JSON Data for one app
   * Output: Duration of the app
   */
  function sum_duration_per_app() {

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


    /*
    canvas_ctx.beginPath();
    canvas_ctx.moveTo(10,10);
    canvas_ctx.lineTo(10,200);
    canvas_ctx.lineWidth = 1;
    canvas_ctx.strokeStyle = "black";
    canvas_ctx.stroke();
    canvas_ctx.closePath();
    */

    canvas_ctx.beginPath();
    canvas_ctx.moveTo(start_x, y);
    canvas_ctx.lineTo(end_x, y);
    canvas_ctx.lineWidth = 1;
    canvas_ctx.strokeStyle = "black";
    canvas_ctx.stroke();
    canvas_ctx.closePath();
  }

  /* Renders all the line segments for app
   * Input: app_index, all_focus_data
   * Output: Draws all the line segments of an app, as well as its icon
   */
  function render_app(app_index, focus) {

  }

  /* Render all lines for all apps
   * Input: All JSON Data
   * Output: Draws paints entire canvas
   */
  function render_all_apps() {
      $.each(APP_DATA.apps, function(idx, app) {
          sum_duration_per_app(app);
          // just testing
          //console.log(app.open[0]);
          //console.log(app.close[0]);
      });
  }


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
    render_all_apps();

  };
})();
