
grid_init = function(){
  // GENERATES GRID

  $(function(){
    // global event bus
    grid_vent = _.extend({}, Backbone.Events);

    app.applications = new app.collections.Applications(APP_DATA);
    // append the grid to body
    $('#visualizations').prepend(new app.views.GridView({collection: app.applications}).render().el);
    $('#more-apps-box').prepend(new app.views.GridView({collection: app.applications}).render().el);

    // sample socket
    // var socket = io.connect(window.location.hostname);
    // socket.on('news', function (data) {
    //   console.log(data);
    //   socket.emit('my other event', { my: 'data' });
    // });
  });
};
