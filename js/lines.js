$(document).ready(function() {
var numberOfLines,
    stats = null,
    openArray, renderArray, closeArray,
    startTime, endTime, difference,
    lineGraphWidth, lineGraphHeight, lineGraph,
    allTheLines, hsl,
    myVar; // think this is for timing later?

numberOfLines = 1300;

$.ajaxSetup({
    "async": false
});

$.getJSON('usage_data.json', function(data) {
    stats = data;
    console.log('loaded');
});

openArray = stats['Spotify']['open'];
renderArray = stats['Spotify']['open'];
closeArray = stats['Spotify']['close'];

// start and end times and difference
startTime = openArray[0];
endTime = closeArray[closeArray.length-1];
difference = endTime - startTime;

// put the stage dimensions here
lineGraphWidth = 1300;
lineGraphHeight = 600;

function calculateRender(startVal) {
    var i;
    startTime = startVal;
    difference = endTime - startTime;
    for (i = 0; i < openArray.length; i++) {
        renderArray[i] = ((openArray[i]-startTime)/(difference/lineGraphWidth));
    }
}

calculateRender(openArray[numberOfLines]);

// array to store the lines
allTheLines = [];

// rgb_hsl order to show dynamic color shift
hsl = 0;

function generateLines(currArray) {
    var currentLine, i;
    for (i = 0; i < currArray.length; i++) {
        currentLine = lineGraph.append("svg:line")
                               .attr("x1", currArray[i])
                               .attr("y1", 0)
                               .attr("x2", currArray[i])
                               .attr("y2", lineGraphHeight)
                               .attr("name", "line"+i)
                               .style("stroke", "rgb(255,255,255)")
                               .style("stroke-width", 2);

        allTheLines[i] = currentLine;
    }
}

// Select the DIV container "D3line" and add an SVG element to it
lineGraph = d3.select("#D3line")
              .append("svg:svg")
              .attr("width", lineGraphWidth)
              .attr("height", lineGraphHeight);

function changeColor(lineArray, opacityOfLine) {
    var i;
    for (i = 0; i<lineArray.length; i++) {
        lineArray[i].style("stroke-opacity", opacityOfLine);
        lineArray[i].style("stroke", "hsl("+hsl+",50%, 50%)");
        if (hsl > 360) {
            hsl = 0;
        } else {
            hsl += 1.0;
        }
    }
}

// sparklines mouseclick event

//myVar = setInterval(function(){myTimer()},1000);

generateLines(renderArray);
changeColor(allTheLines, 1.0);

});
