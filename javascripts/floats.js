var jsonStats = loadJSON();
var usageStats = getDurationAndLastVisitStats(jsonStats); 
console.log(usageStats);

function getDurationAndLastVisitStats(jsonStats) {
    var output = {};
    for (var site in jsonStats) {
        var duration = 0;
        var openList = jsonStats[site]["open"];
        var closeList = jsonStats[site]["close"];
        for (var i = 0; i < openList.length; i++) {
            duration += closeList[i] - openList[i];
        }
        output[site] = {"duration": duration, "last_visit": closeList[closeList.length - 1]};
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
