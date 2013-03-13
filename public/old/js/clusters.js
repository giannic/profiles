$(function(){
    var fsize = 12;
    var image_width = 50;
    var image_height = 50;
    var stroke_color = 'rgba(201, 219, 242, 0.8)';
    var cluster_fill = 'rgba(223, 255, 255, 0.3)';
    var app_fill = 'rgba(232, 251, 255, 0.7)';
    var text_color = 'rgba(166,214,255,1.0)';
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

      // console.log(defs.selectAll()
      //     .data(all_images));

      // console.log(defs.selectAll()
      //     .data(['hi', 'hihi', 'hihihi','hihihihi']));
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
              select_new_cluster(svg, selected_category, x);
          });
    var circles = groups.append("circle")
        .style("stroke", stroke_color)
        .style("fill", cluster_fill)
        .attr("r", function(x){
            return x.r;
        })
        .attr("id", function(x){
            return "circle_" + x.id;
        });

    var label = groups.append("text")
        .text(function(x){
            return x.name;
        })
        .attr("id", function(x){
            return "text_" + x.id;
        })
        .attr({
            "alignment-baseline": "middle",
            "text-anchor": "middle",
            "font-size": fsize,
            "font-family": "Helvetica"
        })
        .style('fill', text_color);
    });

    function select_new_cluster(svg, id, x){
        
        var angle = 360/x.apps.length;
        var pad = 5;

        var selected_circle = d3.select("#circle_" + id);
        var selected_text = d3.select("#text_" + id);
        
        selected_circle.transition().attr("r", 0);
        selected_circle.classed("selected", true);
        
        selected_text.transition().attr("font-size", 0);
        selected_text.classed("selected", true);
  
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
                .attr("xlink:href", function(d, i){
                  return d.url;  
                })
                .classed(x.id, true);

                // append each app
        cluster_apps[selected_category].append("circle")
            .style("stroke", stroke_color)
            .style("fill", cluster_fill)
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
              d.x = x.x + Math.cos(angle*i)*dist;
              return d.x;
            })
            .attr("cy", function(d, i){
              var dist = d.r + x.r + pad;
              d.y = x.y + Math.sin(angle*i)*dist;
              return d.y;
            })
            .style("fill", app_fill)

            .transition()
            .attr('r', function(d, i){
              return d.r;
            });
        cluster_apps[selected_category]  // append each image
            .append('image')
            .attr('xlink:href', function(d, i){
              return d.img;
            })
            .attr("x", function(d, i){
               
              return d.x - image_width/2;
            })
            .attr("y", function(d, i){
              return d.y - image_width/2;
            })
            .classed('image_' + selected_category, true)
            .transition()
            .attr("width", image_width)
            .attr("height", image_height)
            .attr("opacity", 0.6)
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


