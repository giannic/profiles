

$(function(){
  $.getJSON("scripts/usage_data.json", function(json) {
    console.log(json); // this will show the info it in firebug console
  });
  var dataset = 
  [{
    name: "test",
    x: 200,
    y: 300,
    r: 25,
    apps: [{
            x: 100,
            y: 30,
            r: 10
           },
           {
            x: 200,
            y: 40,
            r: 20
           }
          ]
    }];
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
        svg.selectAll("#circles")
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

        })
    .on("mousedown", animateRadius);

  function remove() {
  
  }
  
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

