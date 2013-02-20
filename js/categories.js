$(function(){
  $.getJSON("scripts/usage_data.json", function(json) {
    console.log(json); // this will show the info it in firebug console
  });
});
