$(function(){
  $.getJSON("scripts/usage_data.json", function(json) {
    console.log(json); // this will show the info it in firebug console
    // grab the categories
    var new_json = {};
    var dataset = [];
    var categories = _.unique(_.pluck(_.values(json), 'category'));
    _.each(categories, function(cat){
      new_json[cat] = [];
    });
    // create new json to pass in to constructors
    _.each(json, function(obj){
      new_json[obj.category].push(obj);
    });

    console.log(new_json);

    _.each(new_json, function(obj, key){
      dataset.push(new window.Cluster(key, obj));
    });
    console.log(dataset)

    
  var selected = "";
  
  var svg = d3.select("#circles")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 1000);
      
  var circle = svg.selectAll("circle")
    .data(dataset)
    .enter().append("circle")
    .style("stroke", "gray")
    .style("fill", "white")
    .attr("id", function(x){return x.name;})
    .attr("r", function(x){return x.r;})
    .attr("cx", function(x){return x.x;})
    .attr("cy", function(x){return x.y;})
    .on("mousedown", function(x, i){
    console.log(x.apps)
        d3.select(this).transition().attr('r', 0);
        var angle = 360/x.apps.length;
        var pad = 5;
        svg.selectAll()
            .data(x.apps)
            .append("circle")
            .style("stroke", "gray")
            .style("fill", "white")
            .attr("href", "google.com")
            .attr("class", function(d, i){return x.name;})
            .attr("r", function(d, i){return 0;})
            .attr("cx", function(d, i){
                console.log(d)
                console.log('hi')
                var dist = d.r + x.r + pad;
                return x.x + Math.cos(angle*i)*dist;
            })
            .attr("cy", function(d, i){
                var dist = d.r + x.r + pad;
                return x.y + Math.sin(angle*i)*dist;
            })
            .style("fill", "aliceblue")
            .transition()
            .attr('r', function(d, i){return d.r;});
        if (selected != "") {
            var c = svg.selectAll("." + selected);
            c.transition().attr('r', 0).remove();
            d3.select("#" + selected).transition().attr('r', x.r); 
            selected = x.name;
        }
        else
            selected = x.name;
      });
  });
  
});

