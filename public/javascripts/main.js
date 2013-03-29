(function(){
  $('document').ready(function() {
      var VIS_COUNT = 3; // $('.vis').length;
      var move_count = 0;
      console.log(VIS_COUNT);
      $('#visualizations').width(VIS_COUNT*$(window).width() + 5 + 'px');
      $('#circles').width($(window).width() + 'px');
      $('#lines').width($(window).width() + 'px');

      $('#timelines-toggle').click(function() {
          // console.log("timelines");
          // console.log($('#visualizations').position().left);
          // console.log(-(VIS_COUNT - 1) * $(window).width());
          if(move_count < VIS_COUNT - 1) {
            move_count++;
            $('#visualizations').stop().animate({
                // we should probably have -1 * vis_number * width (to scale)
                
                left: -move_count * $(window).width() + 'px'
            }, 300, function() {
            });
          }
      });

      $('#clusters-toggle').click(function() {
        console.log('animate');
          if(move_count > 0) {
            move_count--;
            console.log(move_count * $(window).width() + 'px');
            console.log(move_count);
            $('#visualizations').stop().animate({
                left: -move_count * $(window).width() + 'px'
            }, 300, function() {
            });
          }
      });

      $('#add-account-toggle').click(function() {
          console.log("adding account");
          $("#add-app-box").toggle();
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
