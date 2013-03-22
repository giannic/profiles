$(function(){

  var root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  // backbone stuff
  root.app = {
    models: {},
    collections: {},
    views: {},
    templates: {}
  };    

  // sample socket 
  var socket = io.connect(window.location.hostname);
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

});
