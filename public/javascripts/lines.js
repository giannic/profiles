var numberOfLines,
    stats = null,
    openArray, renderArray, closeArray,
    startTime, endTime, difference, leftBarTime, rightBarTime,
    lineGraphWidth, lineGraphHeight, lineGraph,
    allTheLines, hsl, colorArray, diff, appArray,
    minRange, maxRange, interval, boxes, activeArray,
    playTimeline = false;

$(document).ready(function() {
    //get the JSON file
    $.ajax({
        url: 'usage_data.json',
        dataType: 'json',
    error: function(err) {
        console.log(err)
        console.log('ERROR')
    },
    success: function(data) {
        stats = data;
    //app array stores the apps displayed
    appArray = [];
    var i = 0;
    for (var key in stats) {
        if (stats.hasOwnProperty(key)) {
            appArray[i] = key;
            i++;
        }
    }

    //instantiate values
    numberOfLines = 0;
    startTime = 0;
    endTime = 0;

    //store colors for each app
    colorArray = [];
    activeArray = [];
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
        activeArray[i] = true;
    }

    // put the stage dimensions here
    lineGraphWidth = 1000;
    lineGraphHeight = 600;

    // difference in times
    difference = endTime - startTime;

    $("#timeline").on("valuesChanged", function(e, data) {
        calculateRender(Math.round(data.values.min), Math.round(data.values.max), 0);
    });

    // Select the DIV container "D3line" and add an SVG element to it
    lineGraph = d3.select("#D3line").append("svg:svg").attr("width", lineGraphWidth).attr("height", lineGraphHeight);

    //initial loading of lines
    calculateRender($("#timeline").rangeSlider("min"), $("#timeline").rangeSlider("max"), 1);

    setUpAppSelection();
    }
    });

    //instantiates the slider timeline
    minRange = 0, maxRange = 100;
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

    $("#timeline").on("valuesChanged", function(e, data) {
        calculateRender(Math.round(data.values.min), Math.round(data.values.max));
    });

    var w = lineGraphWidth;
    var h = 50;
    var graph = d3.select("#timeline_test")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

    var data = [3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 3, 6, 2, 7, 5, 1, 3, 8, 9, 2, 5, 9];

    var x = d3.scale.linear().domain([0,10]).range([0, 200]);
    var y = d3.scale.linear().domain([0,10]).range([0, 10]);
    var line = d3.svg.line()
      .x(function(d,i) { 
        return x(i); 
      })
      .y(function(d) { 
        return y(d); 
      })
      graph.append("svg:path").attr("d", line(data));
});

function removeApp(index, k){
    console.log(index);
    d3.selectAll("#"+index).remove();
    activeArray[k] = false;
}

function addAppBack(k){
    var index = appArray[k];
    openArray = stats[index]['open']; 
    closeArray = stats[index]['close'];
    var track = 0;

    renderArray = [];
    for (var i = 0; i < openArray.length; i++) {
      if((openArray[i] > leftBarTime) && (closeArray[i] < rightBarTime)){
        renderArray[track] = ((openArray[i]-leftBarTime)/(diff/lineGraphWidth));
        track++;
      }
    }
        generateLines(k);
        activeArray[k] = true;
}

//generates all the lines on each loop : OPTIMIZE
function generateLines(index) {
    var currentLine, i;
    for (i = 0; i < renderArray.length; i++) {
        currentLine = lineGraph.append("svg:line")
                               .attr("x1", renderArray[i])
                               .attr("y1", 0)
                               .attr("x2", renderArray[i])
                               .attr("y2", lineGraphHeight)
                               .attr("id", appArray[index])
                               .style("stroke-width", 2)
                               .style("stroke", "hsl("+ colorArray[index] +",50%, 50%)");
            var x = (closeArray[i] - openArray[i])/diff + .5;
            currentLine.style("stroke-opacity", x);
    }
}

//calculates the render array
function calculateRender(startValIndex, endValIndex, first) {
        d3.selectAll("line").remove();

    leftBarTime = startTime + (difference*startValIndex)/(100);
    rightBarTime = startTime + (difference*endValIndex)/(100);
    diff = rightBarTime - leftBarTime; 

    for(var k = 0; k < appArray.length; k++){
        if(activeArray[k] == true){
    var index = appArray[k];
    openArray = stats[index]['open']; 
    closeArray = stats[index]['close'];
    var track = 0;

    renderArray = [];
    for (var i = 0; i < openArray.length; i++) {
      if((openArray[i] > leftBarTime) && (closeArray[i] < rightBarTime)){
        renderArray[track] = ((openArray[i]-leftBarTime)/(diff/lineGraphWidth));
        track++;
      }
    }
        generateLines(k);
  }
}
}

function setUpAppSelection(){

      var stage = new Kinetic.Stage({
        container: 'container',
        width: 25*appArray.length,
        height: 25
      });

      var layer = new Kinetic.Layer();
      var canvas = layer.getCanvas();
      canvas.element.style.position = "relative";
    //canvas.setAttribute('style', 'position: relative;');

    boxes = [];

    for(var k = 0; k< appArray.length; k++){
        // anonymous function to induce scope
        (function() {
        colortrack = colorArray[k];
        var colorset = "hsl(" + colortrack + ",50%,50%)";
        var box = new Kinetic.Rect({
        x: k * 25,
        y: 0,
        width: 20,
        height: 20,
        id: k,
        name: appArray[k],
        fill: colorset,
        });

        boxes[k] = box;

      box.on('mousedown', function() {
        if(this.getOpacity() == 1.0){
            this.setOpacity(0.3);
            removeApp(this.getName(), this.getId());
        }
        else{
            this.setOpacity(1.0);
            addAppBack(this.getId());
        }
        printApp(this.getName());
        layer.draw();
      });

      box.on('mouseover', function() {
        printApp(this.getName());
        layer.draw();
      });

      box.on('mouseout', function() {
        clearApp();
        layer.draw();
      });

        layer.add(box);
        })();
    }
      // add the layer to the stage
      stage.add(layer);    
}

function clearApp(){
  var fieldNameElement = document.getElementById("appname");
  while(fieldNameElement.childNodes.length >= 1) {
    fieldNameElement.removeChild(fieldNameElement.firstChild);
  }
}

function printApp(d){
  var fieldNameElement = document.getElementById("appname");
  while(fieldNameElement.childNodes.length >= 1) {
    fieldNameElement.removeChild(fieldNameElement.firstChild);
  }
  fieldNameElement.appendChild(fieldNameElement.ownerDocument.createTextNode(d));
  }


/*
 * ANIMATION CONTROLS
 */
function stepBackward(stepInterval) {
    var tMin = $("#timeline").rangeSlider("min");
    if (tMin > minRange) {
        $("#timeline").rangeSlider('scrollLeft', stepInterval);
    } else {
        var tMax = $("#timeline").rangeSlider("max");
        $("#timeline").rangeSlider("max", tMax - stepInterval);
    }
}

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

function play(obj) {
    playTimeline = !playTimeline;
    if (playTimeline) {
        interval = setInterval(function(){stepForward(1)},10);
        obj.src = "img/controls_pause.gif";
    } else {
        pause(obj);
    }
}

function pause(obj) {
    clearInterval(interval);
    obj.src = "img/controls_play.gif";
}
