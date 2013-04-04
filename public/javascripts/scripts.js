root = typeof exports !== "undefined" && exports !== null ? exports : this;

// GENERATES GRID 
(function(){

  // backbone globals setup

  root.app = {
    models: {},
    collections: {},
    views: {},
    templates: {}
  };

  $(function(){

    //get the JSON file
    $.ajax({
      url: 'http://www.davidxu.me:3000/apps.json',
      dataType: 'json',
      error: function(err) {
        console.log(err);
      },
      success: function(data) {
        console.log(data);
        TEST_DATA = data;
        root.app.applications = new app.collections.Applications(data);

        // root.

        // append the grid to body
        $('#visualizations').prepend(new app.views.GridView({collection: app.applications}).render().el);
        $('#more-apps-box').prepend(new app.views.GridView({collection: app.applications}).render().el);
      }
    });


    // sample socket 
    // var socket = io.connect(window.location.hostname);
    // socket.on('news', function (data) {
    //   console.log(data);
    //   socket.emit('my other event', { my: 'data' });
    // });
  });



})();
