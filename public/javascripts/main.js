(function(){
  $('document').ready(function() {
      var VIS_COUNT = 3; // $('.vis').length;
      var base_url = "http://localhost:3000";

      //console.log(WINDOW_WIDTH);

      $('.vis').width(WINDOW_WIDTH);
      //console.log(WINDOW_WIDTH);
      //console.log($('.vis').width());
      $('#visualizations').width(VIS_COUNT*WINDOW_WIDTH + 5 + 'px');
      //console.log($('#visualizations').width());
      //console.log($('#grid').width());
      // $('#lines').width(WINDOW_WIDTH + 'px');

      $('#grid-toggle').click(function() {
          $('#visualizations').stop().animate({
              // we should probably have -1 * vis_number * width (to scale)
              left: 0
          }, 300);
      });

      $('#clusters-toggle').click(function() {
          $('#visualizations').stop().animate({
              left: -1 * WINDOW_WIDTH + 'px'
          }, 300);
      });

      $('#timelines-toggle').click(function() {
          $('#visualizations').stop().animate({
              left: -2 * WINDOW_WIDTH + 'px'
          }, 300);
      });

      $('#add-account-toggle').click(function() {
          $("#add-app-box").toggle();
      });

      $('.close-more-apps').click(function() {
          $("#more-apps-box").toggle();
      });

      $("#logout-button").click(function() {
          window.location.replace("/logout");
      });

      // click listener for submit button on "new app" pop up
      $("#newapp-button").click(function(event) {
        console.log(window);
        // cache form input fields
        var name = $("#input-appname");
        var app_url = $("#input-appurl");
        var params = {
          "app_name": name.val(),
          "app_url": app_url.val()
        };
        $.post(base_url + "/apps/create", params, function(data, status, xhr) {
          name.val("");
          app_url.val("");
          // console.log('§');
          // console.log(data.success);

          // console.log(xhr);
          // app.views.GridView
          grid_vent.trigger('grid-add', {data: data.success})
          $("#add-app-box").toggle();
          // $('#add-app-box').
        });
      });

    // MOUSE ENTER MOUSE LEAVE SUPPORT FROM https://gist.github.com/shawnbot/4166283
    // get a reference to the d3.selection prototype,
    // and keep a reference to the old d3.selection.on
    var d3_selectionPrototype = d3.selection.prototype,
        d3_on = d3_selectionPrototype.on;

      // our shims are organized by event:
      // "desired-event": ["shimmed-event", wrapperFunction]
      var shims = {
      "mouseenter": ["mouseover", relatedTarget],
      "mouseleave": ["mouseout", relatedTarget]
      };

      // rewrite the d3.selection.on function to shim the events with wrapped
      // callbacks
      d3_selectionPrototype.on = function(evt, callback, useCapture) {
      var bits = evt.split("."),
          type = bits.shift(),
          shim = shims[type];
      if (shim) {
          evt = [shim[0], bits].join(".");
          callback = shim[1].call(null, callback);
          return d3_on.call(this, evt, callback, useCapture);
      } else {
          return d3_on.apply(this, arguments);
      }
      };

      function relatedTarget(callback) {
          return function() {
              var related = d3.event.relatedTarget;
              if (this === related || childOf(this, related)) {
                  return undefined;
              }
              return callback.apply(this, arguments);
          };
      }

      function childOf(p, c) {
          if (p === c) return false;
          while (c && c !== p) c = c.parentNode;
          return c === p;
      }
  });
})()
