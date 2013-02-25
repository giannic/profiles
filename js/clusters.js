

$(function(){
  $.getJSON("scripts/usage_data.json", function(json) {
    console.log(json); // this will show the info it in firebug console
    // grab the categories
    var new_json = {};
    var data_objects = [];
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
      data_objects.push(new window.Cluster(key, obj));
    });

  });
  


  var svg = d3.select("#circles")
    .append("svg")
    .attr("width", 400)
    .attr("height", 400);
      
  var circle = svg.selectAll("circle")
    .data(dataset)
    .enter().append("circle")
    .style("stroke", "gray")
    .style("fill", "white")
    .attr("r", function(x){return x.r;})
    .attr("cx", function(x){return x.x;})
    .attr("cy", function(x){return x.y;})
    .on("mouseover", function(x){
        d3.select(this).transition().attr('r', 0); 
        svg.selectAll()
            .data(x.apps)
            .enter().append("circle")
            .style("stroke", "gray")
            .style("fill", "white")
            .attr("class", function(d, i){return x.name;})
            .attr("r", function(d, i){return 0;})
            .attr("cx", function(d, i){return d.x;})
            .attr("cy", function(d, i){return d.y;})
            .style("fill", "aliceblue")
            .transition()
            .attr('r', x.r);
            
      })
    .on("mouseout", function(x){
        var c = svg.selectAll("." + x.name);
        c.transition().attr('r', 0).remove();
        d3.select(this).transition().attr('r', x.r); 

        })
    .on("mousedown", animateRadius);

  function animateRadius(rad){
    rad = typeof rad !== 'undefined' ? 0 : rad;
    d3.select(this)
      .transition()
        .delay(0)
        .duration(1000)
        .attr("r", rad)
        .each("end", animateSecondStep);
  }

  function animateSecondStep(){
    d3.select(this)
      .transition()
        .duration(1000)
        .attr("r", 40);
  }
});

