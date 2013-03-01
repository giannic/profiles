$(document).ready(function() {

var json_stats, usage_stats,
    svg_context, center, // center assumes W and H the same atm
    circles, theta, x, y, r, duration, current,
    show_stats, hide_stats, // functions for hover boxes
    entry, node, // iteration over usage stats
    site_name;

jsonStats = loadJSON();
usageStats = getDurationAndLastVisitStats(jsonStats);

svg_context = d3.select("body").append("svg")
                               .attr("width", SVG_WIDTH)
                               .attr("height", SVG_HEIGHT);
center = SVG_WIDTH/2;

circles = d3.selectAll("circle");
circles.style("fill", "steelblue");

//https://gist.github.com/sfrdmn/1437516
show_stats = function() {
    $("#stats").show();
}

hide_stats = function() {
    $("#stats").hide();
}

// bind mouse move to update position of hover box
// should probably only set it when hover is activated, instead of per move
$(document).mousemove(function(e){
    $("#stats").css({
        position: "absolute",
        top: e.pageY+1,
        left: e.pageX+1
    });
});

// This will break if elements are added to the g element parent before
// the text element
$("circle").click(function(e) {
    site_name = $(this).parent().children()[1];
});

function transitionToCenter(context, r) {
    transition(context, 0.5, r);
};

function transitionToEdge(context, r) {
    transition(context, 2, r);
};

function changeCircleSize(context, multiplier, r) {
    context.selectAll("circle")
           .transition()
           .ease(Math.sqrt)
           .duration(2000)
           .attr("r", r*multiplier);
}

function transition(context, multiplier, r) {
    var x, y, theta;
    theta = Math.random()*2*Math.PI;
    x = Math.cos(theta);
    y = Math.sin(theta);

    context.transition()
           .duration(10000)
           .ease(Math.sqrt) // absolutely terrible formulas here also
           .attr("r", duration*0.00001)
           .attr("transform", function(d, i) {
                x = center + duration*0.00003*x*multiplier;
                y = center + duration*0.00003*y*multiplier;

                // clip values to within the svg element
                x = Math.max(x, (0 + r));
                y = Math.max(y, 0 + r);
                x = Math.min(x, SVG_WIDTH - r);
                y = Math.min(y, SVG_HEIGHT - r);

                return "translate(" + x + "," + y + ")";
           });

};

function getDurationAndLastVisitStats(jsonStats) {
    var output, duration, site,
        open_list, close_list, i;

    output = {};
    for (site in jsonStats) {
        duration = 0;
        open_list = jsonStats[site]["open"];
        close_list = jsonStats[site]["close"];
        for (i = 0; i < open_list.length; i++) {
            duration += close_list[i] - open_list[i];
        }
        output[site] = {"duration": duration,
                        "last_visit": close_list[close_list.length - 1],
                        "active": Math.floor(Math.random()*2)};
                        // just randomly generating on frontend for now
                        // need to come from extension
    }
    return output;
}

function loadJSON() {
    var stats;

    stats = null;

    // Set async to false so we load all data before proceeding
    $.ajaxSetup( {"async": false} );

    // load json
    $.getJSON('./data/usage_data.json', function(data) {
        stats = data;
    });

    $.ajaxSetup( {"async": true} );
    return stats;
}

for (entry in usageStats) {
    duration = usageStats[entry].duration;
    r = duration * 0.000005;

    node = svg_context
           .append("a")
           .attr("xlink", "http://www.w3.org/1999/xlink")
           .attr("version", "1.1")
           .attr("xlink:href", jsonStats[entry]["url"])
           .attr("transform", function() {
               theta = Math.random()*2*Math.PI;
               x = center + duration*0.00003 * Math.cos(theta);
               y = center + duration*0.00003 * Math.sin(theta);
               return "translate(" + x + "," + y + ")";
           })

    // Add a circle element to the previously added g element
    node.append("circle")
        .attr("r", duration*0.000005)
        .attr("stroke", "black")
        .attr("fill", "steelblue")
        .attr("opacity", duration*0.0000001)
        .attr("class", "bubble")
        .on("mouseover", show_stats)
        .on("mouseout", hide_stats);

    // Add text element to previously added g element
    node.append("text")
        .attr( {
            "text-anchor": "middle",
            "color": "#000000",
            "class": "label"
        })
        .text(function(d) {
            return entry;
        });

    // animation
    if (usageStats[entry].active === 0) {
        transitionToEdge(node, r);
        changeCircleSize(node, 0.5, r);
    } else if (usageStats[entry].active === 1) {
        transitionToCenter(node, r);
        changeCircleSize(node, 2, r);
    }
}

});
