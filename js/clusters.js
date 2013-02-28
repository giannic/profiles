$(function(){
    var fsize = 20;
    var selected_category;
    var cluster_apps = {};

  $.getJSON("scripts/usage_data.json", function(json) {
    var dataset = parse_data(json);
    console.log(dataset);

    var selected;
  
    var all_images = [];
    var svg = d3.select("#circles")
      .append("svg")
      .attr("width", 1000)
      .attr("height", 1000);
    var defs = svg.append('defs');
    // create the images
    // for the category, run through each app and generate its corresponding image
    // {
    //   id: url
    // }
    // TODO: refactor? is this necessary
    all_images = _.object(_.map(_.flatten(_.pluck(dataset, 'apps')), function(val){
                   return [val.id, val.img];
                 }));

    console.log(defs.selectAll()
      .data(all_images));

    console.log(defs.selectAll()
      .data(['hi', 'hihi', 'hihihi','hihihihi']));
    defs.selectAll()
      .data(_.pairs(all_images))  // index 0 is id, index 1 is url TODO: refactor
      .enter().append('svg:pattern')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 50)
        .attr("height", 50)
        .attr("data-image-id", function(d){
          return d[0];  
        })
        // now append the image....
      .append('image')
        .attr('xlink:href', function(d, i){
          console.log(d);
          console.log(d);
          return d[1];
        })
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 50)
        .attr("height", 50)

        ;

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

            var angle = 360/x.apps.length;
            var pad = 5;

            // assign the created objects into the corresponding cluster_objects
            cluster_apps[selected_category] = 
                svg.selectAll()
                    .data(x.apps)
                    .enter()
                    .append("a")
                    .attr("id", function(x){
                        return x.id;
                    })
                    .attr("data-category", function(d, i){
                      return x.name;
                    })
                    .attr("xlink:href", "http://www.google.com")
                    .classed(x.id, true);

                    // append each app
            cluster_apps[selected_category].append("circle")
                      .style("stroke", "gray")
                      .style("fill", "white")
                      .attr("href", "google.com")
                      .classed(x.id, true)
                      .attr("r", function(d, i){
                        return 0;
                      })
                      .attr("id", function(d, i){
                        return d.id;
                      })
                      .attr("cx", function(d, i){
                        var dist = d.r + x.r + pad;
                        d.x = x.x + Math.cos(angle*i)*dist
                        return d.x;
                      })
                      .attr("cy", function(d, i){
                        var dist = d.r + x.r + pad;
                        d.y = x.y + Math.sin(angle*i)*dist
                        return d.y;
                      })
                      .style("fill", "rgba(32,43,213,0.13)")

                      .transition()
                      .attr('r', function(d, i){
                        return d.r;
                      });
              cluster_apps[selected_category]  // append each image
                        .append('image')
                        .attr('xlink:href', function(d, i){
                          console.log('HERE')
                          console.log(d)
                          return d.img;
                        })
                        .attr("x", function(d, i){
                          return d.x;
                        })
                        .attr("y", function(d, i){
                          return d.y;
                        })
                        .classed('image_' + selected_category, true)
                        .transition()
                        .attr("width", 50)
                        .attr("height", 50)
                        ;
                      console.log('this is')
                      console.log(cluster_apps);
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
        
        cluster_apps[selected_category] = 
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

    // then deselect the circle's text
    old_cluster = typeof selected_category === 'undefined' ? svg.selectAll() :
        svg.selectAll(".image_" + selected_category); 
    selected_obj = old_cluster.classed('selected', false)
        .transition()
        .attr('width', 0)
        .attr('height', 0);

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


