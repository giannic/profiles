var numberOfLines,
    stats = null,
    openArray, renderArray, closeArray,
    startTime, endTime, difference,
    lineGraphWidth, lineGraphHeight, lineGraph,
    allTheLines, hsl, colorArray,
    myVar; // think this is for timing later?

$(document).ready(function() {

$.ajaxSetup({
    "async": false
});

$.getJSON('usage_data.json', function(data) {
    stats = data;
    console.log('loaded');

$("#timeline").rangeSlider({
    arrows : false,
    defaultValues: {min: 50, max: 100},
    valueLabels: "hide"
});

});

// put the stage dimensions here
lineGraphWidth = 1000;
lineGraphHeight = 600;

//make this section dynamic.
openArray = stats['Spotify']['open'];
renderArray = stats['Spotify']['open'];
closeArray = stats['Spotify']['close'];


numberOfLines = openArray.length;

// start and end times and difference
startTime = openArray[0];
endTime = closeArray[closeArray.length-1];
difference = endTime - startTime;

//here's where to put Gabys input
$("#timeline").on("valuesChanging", function(e, data) {
    console.log("min: " + data.values.min + " max: " + data.values.max);
    calculateRender(Math.round(data.values.min), Math.round(data.values.max));
}); 

// array to store the lines
allTheLines = [];

// Select the DIV container "D3line" and add an SVG element to it
lineGraph = d3.select("#D3line")
              .append("svg:svg")
              .attr("width", lineGraphWidth)
              .attr("height", lineGraphHeight);

//myVar = setInterval(function(){myTimer()},1000);

 });

function generateLines(currArray) {
    var currentLine, i;
    d3.selectAll("line").remove();
    allTheLines =  [];
    for (i = 0; i < currArray.length; i++) {
        currentLine = lineGraph.append("svg:line")
                               .attr("x1", currArray[i])
                               .attr("y1", 0)
                               .attr("x2", currArray[i])
                               .attr("y2", lineGraphHeight)
                               .attr("name", "line"+i)
                               .style("stroke", "rgb(255,255,255)")
                               .style("stroke-width", 2)
                               .style("stroke", "hsl(200,50%, 50%)");

        allTheLines[i] = currentLine;
    }
}

function changeColor(lineArray, opacityOfLine) {
    var i;
    for (i = 0; i<lineArray.length; i++) {
        lineArray[i].style("stroke-opacity", opacityOfLine);
    }
}

function calculateRender(startValIndex, endValIndex) {
    startTime = openArray[startValIndex];
    endTime = closeArray[endValIndex];
    var i;
    difference = endTime - startTime;
    renderArray = [];
    for (i = 0; i < openArray.length; i++) {
        renderArray[i] = ((openArray[i]-startTime)/(difference/lineGraphWidth));
    }
    generateLines(renderArray);
    console.log(startValIndex);
    console.log(endValIndex);
    changeColor(allTheLines, 1.0);
}

function getInfo(){
    var range1 = prompt("enter a number between 1 and 1368");
    var range2 = prompt("enter a number between " + range1 + " and 1369");
    calculateRender(range1, range2);
 }

