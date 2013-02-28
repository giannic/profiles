$(function(){

    var fsize = 20;
    var selected_category;
    var cluster_objects = {};

  $.getJSON("scripts/usage_data.json", function(json) {
    var dataset = parse_data(json);
    
    var selected;
  
    var svg = d3.select("#circles")
      .append("svg")
      .attr("width", 1000)
      .attr("height", 1000);
      
    var groups = svg.selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("id", function(x){
            return x.id;
        })
        .attr("transform", function(x) {
            return "translate(" + [x.x,x.y] + ")";
        })   
        .on("mousedown", function(x, i){
            deselect_old_cluster(svg);
            selected_category = $(this).attr('id');
            select_new_cluster(svg, selected_category, x);
        });       
        
    var circles = groups.append("circle")
      .style("stroke", "gray")
      .style("fill", "white")
      .attr("r", function(x){
          return x.r;
      })
      .attr("id", function(x){
          return "circle_" + x.id;
      })
    var label = groups.append("text")
        .text(function(x){
            console.log(x.name);
            return x.name;
        })
        .attr("id", function(x){
            return "text_" + x.id;
        })
        .attr({
            "alignment-baseline": "middle",
            "text-anchor": "middle",
            "font-size": fsize
        })
  });

    function select_new_cluster(svg, id, x){
        var angle = 360/x.apps.length;
        var pad = 5;
        // assign the created objects into the corresponding cluster_objects
        
        var selected_circle = d3.select("#circle_" + id);
        var selected_text = d3.select("#text_" + id);
        
        selected_circle.transition().attr("r", 0);
        selected_circle.classed("selected", true);
        
        selected_text.transition().attr("font-size", 0);
        selected_text.classed("selected", true);
        
        cluster_objects[selected_category] = 
            svg.selectAll()
                .data(x.apps)
                .enter().append("circle")
                .classed(x.id, true)
                .style("stroke", "gray")
                .style("fill", "white")
                .attr("href", "google.com")
                .attr("data-category", function(d, i){
                  return x.name;
                })
                .attr("r", function(d, i){
                  return 0;
                })
                .attr("cx", function(d, i){
                  var dist = d.r + x.r + pad;
                  return x.x + Math.cos(angle*i)*dist;
                })
                .attr("cy", function(d, i){
                  var dist = d.r + x.r + pad;
                  return x.y + Math.sin(angle*i)*dist;
                })
                .style("fill", "rgba(32,43,213,0.13)")
                .transition()
                .attr('r', function(d, i){
                  return d.r;
                })
                ;
                console.log(cluster_objects);
    }

  function deselect_old_cluster(svg){
    /* CLEAN UP OLD CIRCLES */
    // re-show the previous selected circle if it exists
    
    // first deselect the circle
    var old_cluster = typeof selected_category === 'undefined' ? svg.selectAll() :
      svg.selectAll("#circle_" + selected_category); 
    var selected_obj = old_cluster.classed('selected', false)
      .transition()
      .attr('r', function(d){
        return d.r;
      });
      
    // then deselect the circle's text
    old_cluster = typeof selected_category === 'undefined' ? svg.selectAll() :
        svg.selectAll("#text_" + selected_category); 
    selected_obj = old_cluster.classed('selected', false)
        .transition()
        .attr('font-size', fsize);

    var old_apps = typeof selected_category === 'undefined' ? svg.selectAll() 
      : svg.selectAll("." + selected_category); 
    old_apps.transition().attr('r', 0).remove();
  }
  
  function parse_data(json){
    console.log(json); // this will show the info it in firebug console
    // grab the categories
    var new_json = {};
    var dataset = [];
    var categories = _.unique(_.pluck(_.values(json), 'category'));

    _.each(categories, function(cat, i){
      new_json[cat] = [];
    });

    // create new json to pass in to constructors
    _.each(json, function(obj){
      new_json[obj.category].push(obj);
    });

    // TEMPORARY WAY TO CREATE UNIQUE ID'S
    var id_index = 0;
    _.each(new_json, function(obj, key, list){
      var new_cluster = new window.Cluster(key, obj);
      new_cluster.id = 'category' + id_index;
      dataset.push(new_cluster);
      id_index += 1;
    });

    return dataset;
  }
});


