$(document).ready(function() {
var CENTER = 250;
var theta, x, y, duration;

var jsonStats = loadJSON();
var usageStats = getDurationAndLastVisitStats(jsonStats);
console.log(usageStats);

var circle = d3.selectAll("circle");
circle.style("fill", "steelblue");

var svgcontext = d3.select("body").append("svg")
                                  .attr("width", 800)
                                  .attr("height", 800);

for (var entry in usageStats) {
    theta = Math.random()*2*Math.PI;
    x = Math.cos(theta);
    y = Math.sin(theta);

    duration = usageStats[entry].duration
    svgcontext.append("circle")
              .attr("cx", CENTER + duration*0.00003*x)
              .attr("cy", CENTER + duration*0.00003*y)
              .attr("r", duration*0.000005)
              .attr("stroke", "black")
              .attr("fill", "steelblue")
              .attr("opacity", duration*0.0000001);
}

function getDurationAndLastVisitStats(jsonStats) {
    var output = {};
    for (var site in jsonStats) {
        var duration = 0;
        var openList = jsonStats[site]["open"];
        var closeList = jsonStats[site]["close"];
        for (var i = 0; i < openList.length; i++) {
            duration += closeList[i] - openList[i];
        }
        output[site] = {"duration": duration,
                        "last_visit": closeList[closeList.length - 1]};
    }
    return output;
}

function loadJSON() {
    // Set async to false so we load all data before proceeding
    $.ajaxSetup( {"async": false} );

    var stats = null;
    // load json
    $.getJSON('./data/usage_data.json', function(data) {
        stats = data;
    });

    $.ajaxSetup( {"async": true} );

    return stats;
}

});

