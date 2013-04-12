(function(){
    $('document').ready(function() {
        var VIS_COUNT = 3; // $('.vis').length;
        var base_url = "http://localhost:3000";

        $('.vis').width(WINDOW_WIDTH);
        $('#visualizations').width(VIS_COUNT*WINDOW_WIDTH + 5 + 'px');

        /*****************************
         * NAV ELEMENTS CLICK EVENTS *
         *****************************/

        // default is grid
        $('#grid-toggle').addClass("menu-button-active");

        // ALL menu buttons
        $('.menu-button').click(function() {
            if ($(this).hasClass("menu-button-active") !== true) {
                $(this).addClass("menu-button-active");
            } else {
                $(this).removeClass("menu-button-active");
            }
        });

        // remove active classes from all menu buttons
        $('.type-nav .menu-button').click(function() {
            var id = $(this).attr('id');
            $('.type-nav .menu-button').each(function() {
                var that = $(this);
                if (that.attr('id') != id) {
                    that.removeClass("menu-button-active");
                }
            });
        });

        /********************
         * SLIDING OF VIZ-s *
         ********************/

        $('#grid-toggle').click(function() {
            $('#grid-toggle').addClass("menu-button-active");
            $('#visualizations').stop().animate({
                left: 0
            }, 300);
        });

        $('#clusters-toggle').click(function() {
            $('#clusters-toggle').addClass("menu-button-active");
            $('#visualizations').stop().animate({
                left: -1 * WINDOW_WIDTH + 'px'
            }, 300);
        });

        $('#timelines-toggle').click(function() {
            $('#timelines-toggle').addClass("menu-button-active");
            $('#visualizations').stop().animate({
                left: -2 * WINDOW_WIDTH + 'px'
            }, 300);
        });


        // ADD App Box
        $("#add-app-box").css("top", $('#header').height() - $('#add-app-box').height() - 18); // this needs to be fixed to take into account padding

        $('#add-account-toggle').click(function() {
            //$("#add-app-box").toggle();
            if ($(this).hasClass("menu-button-active")) {
                $("#add-app-box").css("top", $('#header').height() - $('#add-app-box').height());
                $("#add-app-box").stop().animate({
                    top: "+=" + $("#add-app-box").height() // this also
                }, 300);
            } else {
                $("#add-app-box").stop().animate({
                    top: "-=" +  $("#add-app-box").height()
                }, 300);
            }
        });

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
          grid_vent.trigger('grid-add', {data: data.success});
          $("#add-app-box").toggle();
          // $('#add-app-box').

            });
        });

        $('.close-more-apps').click(function() {
            $("#more-apps-box").toggle();
        });

        $("#logout-button").click(function() {
            window.location.replace("/logout");
        });

        /**************
         * D3 SUPPORT *
         **************/

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
