$(function(){
  // sample socket 
  var socket = io.connect(window.location.hostname);
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
});
