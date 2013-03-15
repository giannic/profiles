var numberOfLines,
    stats = null,
    openArray, renderArray, closeArray,
    startTime, endTime, difference,
    lineGraphWidth, lineGraphHeight, lineGraph,
    allTheLines, hsl, colorArray, appArray,
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
    defaultValues: {min: 50, max: 55},
    valueLabels: "hide"
});

});

//new code
appArray = [];
var tempArray = [];
var i = 0;
for (var key in stats) {
  if (stats.hasOwnProperty(key)) {
    tempArray[i] = key;
    i++;
  }
}

appArray[0] = tempArray[0];
appArray[1] = tempArray[1];

numberOfLines = 0;
startTime = 0;
endTime = 0;

colorArray = [];

for(var i = 0; i < appArray.length; i++){
  var index = appArray[i];
  var lengthA = stats[index]['open'].length;
  var startTimeA = stats[index]['open'][0];
  var endTimeA = stats[index]['close'][stats[index]['close'].length - 1];

  if(lengthA > numberOfLines){
    numberOfLines = lengthA;
  }
  if(startTimeA >startTime){
    startTime = startTimeA;
  }
  if(endTimeA > endTime){
    endTime = endTimeA;
  }
  colorArray[i] = i*(360/appArray.length);  
}

// put the stage dimensions here
lineGraphWidth = 1000;
lineGraphHeight = 600;

//make this section dynamic.

//openArray = stats['Spotify']['open'];
//renderArray = stats['Spotify']['open'];
//closeArray = stats['Spotify']['close'];


// start and end times and difference
//startTime = openArray[0];
//endTime = closeArray[closeArray.length-1];
difference = endTime - startTime;

//here's where to put Gabys input
$("#timeline").on("valuesChanging", function(e, data) {
    //console.log("min: " + data.values.min + " max: " + data.values.max);
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

function generateLines(currArray, index, diff) {
    var currentLine, i;
    for (i = 0; i < currArray.length; i++) {
        currentLine = lineGraph.append("svg:line")
                               .attr("x1", currArray[i])
                               .attr("y1", 0)
                               .attr("x2", currArray[i])
                               .attr("y2", lineGraphHeight)
                               .attr("name", "line"+i)
                               .style("stroke-width", 2)
                               .style("stroke", "hsl("+ colorArray[index] +",50%, 50%)");
        var x = (closeArray[i] - openArray[i])/diff + .5;
        changeColor(currentLine, x);
        allTheLines[i] = currentLine;
    }
}

function changeColor(line, opacityOfLine) {
    line.style("stroke-opacity", opacityOfLine);
}

function calculateRender(startValIndex, endValIndex) {
    d3.selectAll("line").remove();
    allTheLines =  [];

    var leftBarTime = startTime + (difference*startValIndex)/(100);
    var rightBarTime = startTime + (difference*endValIndex)/(100);
    var diff = rightBarTime - leftBarTime; 

    for(var k = 0; k < appArray.length; k++){
    var index = appArray[k];
    openArray = stats[index]['open']; 
    closeArray = stats[index]['close'];

    renderArray = [];
    for (var i = 0; i < openArray.length; i++) {
      if((openArray[i] > leftBarTime) && (closeArray[i] < rightBarTime)){
        renderArray[i] = ((openArray[i]-leftBarTime)/(diff/lineGraphWidth));
      }
    }
    generateLines(renderArray, k, diff);
  }
}

