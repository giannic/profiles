$(document).ready(function() {
    $(document).mousemove(function(e){
        $("#stats").css({
            position: 'absolute',
            top: e.pageY+1,
            left: e.pageX+1
        });
    });

var CENTER = 250;
var theta, x, y, duration, current;
var svg_h = 800;
var svg_w = 800;

var jsonStats = loadJSON();
var usageStats = getDurationAndLastVisitStats(jsonStats);

var circle = d3.selectAll("circle");
circle.style("fill", "steelblue");

var svgcontext = d3.select("body").append("svg")
                                  .attr("width", svg_w)
                                  .attr("height", svg_h)

//https://gist.github.com/sfrdmn/1437516
var myfun = function() {
    var that = d3.select(this);
    that.attr("fill", "red");
    $("#stats").show();
}

var mynotfun = function() {
    var that = d3.select(this);
    that.attr("fill", "steelblue");
    $("#stats").hide();
}

for (var entry in usageStats) {
    duration = usageStats[entry].duration;
    r = duration * 0.000005;
    /*
    var node = svgcontext.append("a")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
                .attr("version", "1.1");
    */

    var node = svgcontext.append("a")
        //.attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xlink", "http://www.w3.org/1999/xlink")
        .attr("version", "1.1")
        .attr("xlink:href", jsonStats[entry]["url"])
    /*
        .attr("class", "nodes")
        .selectAll("circle")
        .data([0])
        .enter()
        */
        //.append("g")
        //.attr("transform", "translate(200,200)");
        .attr("transform", function() {
            theta = Math.random()*2*Math.PI;
            var x = CENTER + duration*0.00003 * Math.cos(theta);
            var y = CENTER + duration*0.00003 * Math.sin(theta);
            /*
            d.x = 200,
            d.y = svg_h / 2;
            */
            //return "translate(" + d.x + "," + d.y + ")";
            return "translate(" + x + "," + y + ")";
        })

    // Add a circle element to the previously added g element
    node.append("circle")
        .attr("r", duration*0.000005)
        .attr("stroke", "black")
        .attr("fill", "steelblue")
        .attr("opacity", duration*0.0000001)
        .attr("class", "bubble")
        .on("mouseover", myfun)
        .on("mouseout", mynotfun);

    // Add text element to previously added g element
    node.append("text")
        .attr( {
            "text-anchor": "middle",
            "color": "#ffffff",
            "class": "label"
        })
        .text(function(d) {
            return entry;
        });
    if (usageStats[entry].active === 0) {
        transitionToEdge(node, r);
        changeCircleSize(node, 0.5, r);
    }
    else if (usageStats[entry].active === 1) {
        transitionToCenter(node, r);
        changeCircleSize(node, 2, r);
    }
}

// This will break if elements are added to the g element parent before
// the text element
$("circle").click(function(e) {
    var siteName = $(this).parent().children()[1];
    console.log(jQuery.type(siteName));
    console.log(siteName);
});

function transitionToCenter(context, r) {
    transition(context, 0.5, r);
};

function transitionToEdge(context, r) {
    transition(context, 2, r);
};

function changeCircleSize(context, multiplier, r) {
    context.selectAll("circle").transition()
           .ease(Math.sqrt) // absolutely terrible formulas here also
                               .duration(2000)
                               .attr("r", r*multiplier);
}

function transition(context, multiplier, r) {
    theta = Math.random()*2*Math.PI;
    var x = Math.cos(theta);
    var y = Math.sin(theta);

    context.transition()
           .duration(10000)
           .ease(Math.sqrt) // absolutely terrible formulas here also
           .attr("r", duration*0.00001)
           .attr("transform", function(d, i) {
                x = CENTER + duration*0.00003*x*multiplier;
                y = CENTER + duration*0.00003*y*multiplier;

                // clip values to within the svg element
                x = Math.max(x, (0 + r));
                y = Math.max(y, 0 + r);
                x = Math.min(x, svg_w - r);
                y = Math.min(y, svg_h - r);

                return "translate(" + x + "," + y + ")";
           });

};

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
                        "last_visit": closeList[closeList.length - 1],
                        "active": Math.floor(Math.random()*2)};
                        // just randomly generating on frontend for now
                        // need to come from extension
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
