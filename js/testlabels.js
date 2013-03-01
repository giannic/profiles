var svg_w = 800;
var svg_h = 400;
var svg = d3.select("body").append("svg")
            .attr("width", svg_w)
            .attr("weight", svg_h);

var dataset = [];
for (var i = 0; i < 6; i++) {
    var datum = 10 + Math.round(Math.random() * 20);
    dataset.push(datum);
}

var nodes = svg.append("g")
               .attr("class", "nodes")
               .selectAll("circle")
               .data(dataset)
               .enter()
               .append("circle")
               .attr("class", "node")
               .attr("cx", function(d, i) {
                   return (i * 70) + 50;
               })
               .attr("cy", svg_h / 2)
               .attr("r", 20);

var labels = svg.append("g")
                .attr("class", "labels")
                .selectAll("text")
                .data(dataset)
                .enter()
                .append("text")
                .attr("dx", function(d, i) {
                    return (i * 70) + 42
                })
                .attr("dy", svg_h / 2 + 5)
                .text(function(d) {
                    return d;
                });
/*
var svg_w = 800;
var svg_h = 400;
var svg = d3.select("body").append("svg")
            .attr("width", svg_w)
            .attr("weight", svg_h);

var dataset = [];
for (var i = 0; i < 6; i++) {
    var datum = 10 + Math.round(Math.random() * 20);
    dataset.push(datum);
}

var nodes = svg.append("g")
           .attr("class", "nodes")
           .selectAll("circle")
           .data(dataset)
           .enter()
           // Add one g element for each data node here.
           .append("g")
           // Position the g element like the circle element used to be.
           .attr("transform", function(d, i) {
             // Set d.x and d.y here so that other elements can use it. d is 
             // expected to be an object here.
             d.x = i * 70 + 50,
             d.y = svg_h / 2;
             return "translate(" + d.x + "," + d.y + ")"; 
           });

var nodes = svg.append("g")
           .attr("class", "nodes")
           .selectAll("circle")
           .data(dataset)
           .enter()
           // Add one g element for each data node here.
           .append("g")
           // Position the g element like the circle element used to be.
           .attr("transform", function(d, i) {
             // Set d.x and d.y here so that other elements can use it. d is 
             // expected to be an object here.
             d.x = i * 70 + 50,
             d.y = svg_h / 2;
             return "translate(" + d.x + "," + d.y + ")"; 
           });
*/

/*
var text = svg.append("svg:g").selectAll("g")
         .data(force.nodes())
         .enter().append("svg:g");

text.append("svg:text")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.name; });

text.attr("transform",  function(d) {
      return "translate(" + d.x + "," + d.y + ")"; 
    });
*/