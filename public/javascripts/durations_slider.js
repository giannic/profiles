//Given an index which is slider_min < index < slider_max
//Calculates number of active apps at that index
function init_durations_freq() {
    //$("#timeline_panel").css("width", lineGraphWidth);

    var w = lineGraphWidth + 22,
        h = 25,

        freqMax = Math.max.apply(null, frequencies),

        x = d3.scale.linear()
                .domain([0, 100])
                .range([0, w]),

        y = d3.scale.linear()
                .domain([-freqMax / 10, freqMax])
                .range([h, 0]),

        line = d3.svg.line()
                .x(function(d, i) {
                  return x(i);
                })
                .y(function(d) {
                  return y(d);
                }),

        graph = d3.select(".frequency-container")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    graph.append("svg:path")
        .attr("d", line(frequencies))
        .attr("class", "frequency-line");
}

function init_durations_slider() {
    lines_minRange = 0,
    lines_maxRange = 100;

    $("#durations-slider").rangeSlider({
        arrows : false,
        defaultValues : {
            min : lines_maxRange * .00,
            max : lines_maxRange * 1.00
        },
        valueLabels : "hide",
        bounds : {
            min : lines_minRange,
            max : lines_maxRange
        }
    });

    //Set slider label dates to the min and max
    updateSliderDates(
        getDate($("#durations-slider").rangeSlider("min")),
        getDate($("#durations-slider").rangeSlider("max"))
    );

    //slight edit to the jQRange html
    //$(".ui-rangeSlider-container")
        //.prepend("<div class='frequency-container'></div>");
}

function updateSliderDates(dateLeft, dateRight) {
    var dl = dateLeft, dr = dateRight;
    $("#timeline_dateLeft")
        .text($.datepicker.formatDate('MM dd, yy', dl));
    $("#timeline_dateRight")
        .text($.datepicker.formatDate('MM dd, yy', dr));
}

//Gets the date of a certain index on the slider
function getDate(index) {
    var date = startTime + ((endTime - startTime) * index) / (100);
    return new Date(date * 1000);
}
