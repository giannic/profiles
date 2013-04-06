
      app = {
          models: {},
          collections: {},
          views: {},
          templates: {}
      };
grid_init = function(){
  

  // GENERATES GRID
    // backbone globals setup


    $(function(){

      //get the JSON file
      $.ajax({
        url: 'apps/user',
        dataType: 'json',
        error: function(err) {
          console.log(err);
        },
        success: function(data) {
          console.log("HERE");
          console.log(data);
          TEST_DATA = data;
          app.applications = new app.collections.Applications(data);


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



};
