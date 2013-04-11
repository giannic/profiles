
grid_init = function(){
  // GENERATES GRID

  $(function(){
    // set focus on wrapper
    // global event bus
    grid_vent = _.extend({}, Backbone.Events);

    app.applications = new app.collections.Applications(APP_DATA);
    // append the grid to body
    $('#visualizations').prepend(new app.views.GridView({collection: app.applications}).render().el);
    $('#more-apps-box').prepend(new app.views.GridView({collection: app.applications}).render().el);

    $('body').on('keyup', function(e){
      // check if it's not focused on an input
      if(!$(e.target).is('input')) {
          
  //        e.preventDefault(();
        if(!e.ctrlKey && !e.altKey) {
          $('#grid-search').focus();
          // if it's the first letter
          var chr = String.fromCharCode(e.which);
          if(!$('#grid-search').val()) {
            if(e.shiftKey)
              $('#grid-search').val(chr);
            else
              $('#grid-search').val(chr.toLowerCase());
          }
        }
      }
    });
    $('#grid-search').on('keyup', function(e){
        // if first character, append
        grid_vent.trigger('grid-search');
    });

    // sample socket
    // var socket = io.connect(window.location.hostname);
    // socket.on('news', function (data) {
    //   socket.emit('my other event', { my: 'data' });
    // });
  });
};
