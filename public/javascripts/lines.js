var lines_init = function() {
  var numberOfLines,
      stats = null,
      openArray, renderArray, closeArray,
      startTime, endTime, difference, leftBarTime, rightBarTime,
      lineGraphWidth, lineGraphHeight, lineGraph,
      allTheLines, hsl, colorArray, diff, appArray,
      minRange, maxRange, interval, boxes, activeArray,
      playTimeline = false,
      frequencies = [];

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
      numberOfLines = 0;
      startTime = 0;
      endTime = 0;

      console.log(data)

      //app container
      appArray = [];
      var i = 0;
      for (var key in stats) {
          if (stats.hasOwnProperty(key)) {
              appArray[i] = key;
              i++;
          }
      }

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
      difference = endTime - startTime;

      //line graph dimensions
      lineGraphWidth = 1000;
      lineGraphHeight = 600;

      //slight edit to the jQRange html
      $(".ui-rangeSlider-container").prepend("<div class='frequency-container'></div>");

      lineGraph = d3.select("#D3line").append("svg:svg")
        .attr("width", lineGraphWidth)
        .attr("height", lineGraphHeight);
      
      setUpAppSelection();

      initSlider();
      
      initFreqLine();
      }});     
  });

  function initFreqLine() {
    
    var w = lineGraphWidth, h = 50;

    for (var i=minRange; i < maxRange-1; i++) {
        frequencies[i] = 0;
        calcFreq(i);
    }

    var graph = d3.select(".frequency-container")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    var x = d3.scale.linear()
      .domain([0, 100])
      .range([0, w]);

    var y = d3.scale.linear()
      .domain([0, 300])
      .range([-h/2, h/2]);

    var line = d3.svg.line()
        .x(function(d,i) {
          return x(i);
        })
        .y(function(d) {
          return y(d);
        })

    var data = frequencies;
    graph.append("svg:path")
        .attr("d", line(data))
        .attr("class", "frequency-line");
  }

  function updateFreqLine(data) {
    // TODO
  }

  function initSlider() {
      minRange = 0, maxRange = 100;
      $("#timeline").rangeSlider({
          arrows : false,
          defaultValues : {
              min : maxRange * .49,
              max : maxRange * .51
          },
          valueLabels : "hide",
          bounds : {
              min : minRange,
              max : maxRange
          }
      });

      $("#timeline").on("valuesChanged", function(e, data) {
          calculateRender(
            Math.round(data.values.min), 
            Math.round(data.values.max), 0);
      });

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

      //initial loading of lines
      calculateRender($("#timeline").rangeSlider("min"), $("#timeline").rangeSlider("max"), 1);
  }

  function removeApp(index, k){
      index = index.replace(' ', '-');
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

  //generates the lines for an app : OPTIMIZE
  function generateLines(index) {
      var currentLine, i;
      for (i = 0; i < renderArray.length; i++) {
          var string = appArray[index];
          string = string.replace(' ', '-');
          currentLine = lineGraph.append("svg:line")
                                 .attr("x1", renderArray[i])
                                 .attr("y1", 0)
                                 .attr("x2", renderArray[i])
                                 .attr("y2", lineGraphHeight)
                                 .attr("id", string)
                                 .style("stroke-width", 2)
                                 .style("stroke", "hsl("+ colorArray[index] +",50%, 50%)");
          var x = (closeArray[i] - openArray[i])/diff + .5;
          currentLine.style("stroke-opacity", x);
      }
  }

  //given the starting and ending slider indices (0<=i<=100)
  //renders the lines for each selected app
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

  //Given an index which is slider_min < index < slider_max
  //Calculates number of active apps at that index
  function calcFreq(index) {
    var start = index;
    var end = index + 1;
    left = startTime + (difference*start)/(100);
    right = startTime + (difference*end)/(100);
    diff = right - left;
    
    for (var i=0; i < appArray.length; i++) {
      if (activeArray[i]) {
        var app = appArray[i];
        openings = stats[app]['open'];
        closings = stats[app]['close'];
        
        for (var j=0; j < openings.length; j++) {
          if((openings[j] > left) && (closings[j] < right)){
              frequencies[index] = frequencies[index] + 1;
          }
        }
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

      for (var k = 0; k< appArray.length; k++) {
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
                  fill: colorset
              });

              boxes[k] = box;

              box.on('mousedown', function() {
                  if (this.getOpacity() == 1.0) {
                      this.setOpacity(0.3);
                      removeApp(this.getName(), this.getId());
                  } else {
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
};
