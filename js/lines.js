var numberOfLines = 1300;

$.ajaxSetup({
    "async": false
});
var stats = null;
$.getJSON('usage_data.json', function(data) {
    stats = data;
    console.log('loaded');
});

var openArray = stats['Spotify']['open'];
var renderArray = stats['Spotify']['open'];
var closeArray = stats['Spotify']['close'];

//start and end times and difference
var startTime = openArray[0];
var endTime = closeArray[closeArray.length-1];
var difference = endTime - startTime;

//put the stage dimensions here
var lineGraphWidth = 1300;
var lineGraphHeight = 600;

    function calculateRender(startVal){
        startTime = startVal;
        difference = endTime - startTime;
        for(var i = 0; i < openArray.length; i++){
            renderArray[i] = ((openArray[i]-startTime)/(difference/lineGraphWidth)); 
        }
    }

calculateRender(openArray[numberOfLines]);

//array to store the lines
var allTheLines = [];

//  rgb_hsl order to show dynamic color shift
var hsl = 0;

    function generateLines(currArray){
        for(var i = 0; i < currArray.length; i++){
            var currentLine = lineGraph.append("svg:line")
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

/*Select the DIV container "D3line" and add an SVG element to it*/
var lineGraph = d3.select("#D3line")
    .append("svg:svg")
    .attr("width", lineGraphWidth)  
    .attr("height", lineGraphHeight);

    function changeColor(lineArray, opacityOfLine){
        for(var i = 0; i<lineArray.length; i++){
        lineArray[i].style("stroke-opacity", opacityOfLine);
        lineArray[i].style("stroke", "hsl("+hsl+",50%, 50%)");
            if(hsl > 360){
                hsl = 0;
            }
            else{
                hsl += 1.0;
            }
        }
    }

var myVar=setInterval(function(){myTimer()},1000);

generateLines(renderArray);
changeColor(allTheLines, 1.0);
    function myTimer(){
//        changeColor(allTheLines, 1.0);
    }

