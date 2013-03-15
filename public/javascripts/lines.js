var numberOfLines,
    stats = null,
    openArray, renderArray, closeArray,
    startTime, endTime, difference,
    lineGraphWidth, lineGraphHeight, lineGraph,
    allTheLines, hsl, colorArray, appArray,
    minRange = 0, maxRange = 100, interval,
    playTimeline = false;

$(document).ready(function() {

    //makes the file not asynchronous so that JSON will load (Kevin)
    $.ajaxSetup({
        "async" : false
    });

    //get the JSON file
    $.getJSON('usage_data.json', function(data) {
        stats = data;
        console.log('loaded');
    });

    $.ajaxSetup({
        "async" : true
    });

    console.log(stats["Youtube"]["category"]);


    //instantiates the slider timeline
    $("#timeline").rangeSlider({
        arrows : false,
        defaultValues : {
            min : maxRange * .45,
            max : maxRange * .55
        },
        valueLabels : "hide",
        bounds : {
            min : minRange,
            max : maxRange
        }
    });

    //sets click events for timeline animation controls
    $("#timeline_play_pause").click(function() {
        play(this);
    });

    $("#timeline_step_back").click(function() {
        stepBackward(10);
    });

    $("#timeline_step_forward").click(function() {
        stepForward(10);
    });

    //app array stores the apps displayed
    appArray = [];

    //temp array stores all apps
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
    // appArray[2] = tempArray[2];

    //instantiate values
    numberOfLines = 0;
    startTime = 0;
    endTime = 0;

    //store colors for each app
    colorArray = [];

    //initiate the variables
    for (var i = 0; i < appArray.length; i++) {
        var index = appArray[i];
        var lengthA = stats[index]['open'].length;
        var startTimeA = stats[index]['open'][0];
        var endTimeA = stats[index]['close'][stats[index]['close'].length - 1];

        if (lengthA > numberOfLines) {
            numberOfLines = lengthA;
        }
        if (startTimeA > startTime) {
            startTime = startTimeA;
        }
        if (endTimeA > endTime) {
            endTime = endTimeA;
        }
        colorArray[i] = i * (360 / appArray.length);
    }

    // put the stage dimensions here
    lineGraphWidth = 1000;
    lineGraphHeight = 600;

    // difference in times
    difference = endTime - startTime;

    $("#timeline").on("valuesChanged", function(e, data) {
        calculateRender(Math.round(data.values.min), Math.round(data.values.max));
    });

    // array to store the lines
    allTheLines = [];

    // Select the DIV container "D3line" and add an SVG element to it
    lineGraph = d3.select("#D3line").append("svg:svg").attr("width", lineGraphWidth).attr("height", lineGraphHeight);

    //initial loading of lines
    calculateRender($("#timeline").rangeSlider("min"), $("#timeline").rangeSlider("max"));
});


//generates all the lines on each loop : OPTIMIZE
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

//changes the opacity
function changeColor(line, opacityOfLine) {
    line.style("stroke-opacity", opacityOfLine);
}

//calculates the render array
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

//animation controls: step back
function stepBackward(stepInterval) {
    var tMin = $("#timeline").rangeSlider("min");
    if (tMin > minRange) {
        $("#timeline").rangeSlider('scrollLeft', stepInterval);
    } else {
        var tMax = $("#timeline").rangeSlider("max");
        $("#timeline").rangeSlider("max", tMax - stepInterval);
    }
}

//animation controls: step forward
function stepForward(stepInterval) {
    var tMax = $("#timeline").rangeSlider("max");
    var tMin = $("#timeline").rangeSlider("min");
    if (tMax < maxRange) {
        $("#timeline").rangeSlider('scrollRight', stepInterval);
    } else if (tMax === tMin) {
        $("#timeline").rangeSlider("min", minRange);
    } else {
        $("#timeline").rangeSlider("min", tMin + stepInterval*.1);
    }
}

//animation controls: play
function play(obj) {
    playTimeline = !playTimeline;
    if (playTimeline) {
        interval = setInterval(function(){stepForward(1)},10);
        obj.src = "img/controls_pause.gif";
    }
    else {
        clearInterval(interval);
        obj.src = "img/controls_play.gif";
    }
}

//animation controls: pause
function pause(obj) {
    clearInterval(interval);
    obj.src = "img/controls_play.gif";
}
