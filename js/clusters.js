$(function(){
    var fsize = 16;
    var image_width = 100;
    var image_height = 100;
    var stroke_color = 'rgba(201, 219, 242, 0.8)';
    var cluster_fill = 'rgba(223, 255, 255, 0.3)';
    var app_fill = 'rgba(232, 251, 255, 0.7)';
    var text_color = 'rgba(166,214,255,1.0)';
    var selected_category;  // selected on hover
    var clicked_category;
    var cluster_apps = {};
    var pad = 5; // padding for boundary circle + app circles

    $.getJSON("scripts/usage_data.json", function(json) {
        var dataset = parse_data(json);
        console.log(dataset);

        var all_images = [];
        var svg = d3.select("#circles")
            .append("svg")
            .attr("width", 1000)
            .attr("height", 1000);
        var defs = svg.append('defs');

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
            // clicked should only keep everything expanded
            // set a boolean and check in deselect
            // deselect previously clicked one
            deselect_old_cluster(svg, x, clicked_category);
            clicked_category = x.id;
            // TODO: move so focuses in center?
        })
        .on("mouseenter", function(x, i){
            selected_category = x.id;
            if (!clicked_category || (clicked_category != selected_category))
                select_new_cluster(svg, x);
        })
        .on("mouseleave", function(x, i){
            // TODO: double check if access after clicking on link
            if (clicked_category != selected_category)
                deselect_old_cluster(svg, x, selected_category);
        });

    // TODO: use if contracting category circle
    // hidden boundary circles - use if contracting category circle
    /*var bound_circles = groups.append("circle")
        .attr("opacity", 0)
        .attr("r", function(x) {
            return x.r;// + 50*2 + pad*2; // increase radius after hover
        })
        .attr("id", function(x){
            return "hidden_" + x.id;
        });
    */

    // category circles
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

    function select_new_cluster(svg, x){
        var angle = 360/x.apps.length;

        var selected_circle = d3.select("#circle_" + selected_category);
        var selected_text = d3.select("#text_" + selected_category);

        selected_circle.transition()
            .attr("r", function(x){
                return x.r + image_width + pad*2;
            });
        selected_circle.classed("selected", true);

        // TODO: use if contracting category circle
        //selected_text.transition().attr("font-size", 0);

        selected_text.classed("selected", true);
        var category = svg.selectAll("#" + x.id);
        
        // assign the created objects into the corresponding cluster_objects
        cluster_apps[selected_category] = 
            category.selectAll()
                .data(x.apps)
                .enter()
                .append("a")
                .attr("data-category", x.name)
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
              d.x = Math.cos(angle*i)*dist;
              return d.x;
            })
            .attr("cy", function(d, i){
              var dist = d.r + x.r + pad;
              d.y = Math.sin(angle*i)*dist;
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

    function deselect_old_cluster(svg, x, old_category){
        /* CLEAN UP OLD CIRCLES */
        // old_category represents cluster to deselect (either clicked or selected)

        // first deselect the circle
        var old_cluster = typeof old_category === 'undefined' ? svg.selectAll() :
            svg.selectAll("#circle_" + old_category); 
        var selected_obj = old_cluster.classed('selected', false)
            .transition()
            .attr('r', function(d){
                return d.r;
            });

        // TODO: use if contracting category circle
        // then deselect the circle's text
        /*old_cluster = typeof selected_category === 'undefined' ? svg.selectAll() :
            svg.selectAll("#text_" + selected_category); 
        selected_obj = old_cluster.classed('selected', false)
            .transition()
            .attr('font-size', fsize);
        */

        // then deselect the circle's images
        old_cluster = typeof old_category === 'undefined' ? svg.selectAll() :
            svg.selectAll(".image_" + old_category);
        selected_obj = old_cluster.classed('selected', false)
            .transition()
            .attr('width', 0)
            .attr('height', 0);

        // TODO: use if contracting category circle
        // decrease the bound of the hidden circle
        /*svg.selectAll("#hidden_" + selected_category)
            .attr("r", function(x){
                return x.r;
            }); 
        */
        var old_apps = typeof old_category === 'undefined' ? svg.selectAll() 
            : svg.selectAll("." + old_category); 
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


