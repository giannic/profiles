$(function(){
    var window_width = $(window).width() - 50,
        window_height = $(window).height() - 50, // TODO: subtract size of menubar
        image_width = [], // image widths of the apps
        image_height = [],
        stroke_color = 'rgba(201, 219, 242, 0.8)',
        cluster_fill = 'rgba(200, 220, 255, 0.4)',
        text_color = 'rgba(120,174,255,1.0)',
        selected_category,  // selected on hover
        clicked_category,
        cluster_apps = {},
        pad = 10, // padding for boundary circle + app circles
        max_apps = -1; // max number of apps that exists in user's categories
        total_apps = 0; // total number of apps this user has
        num_categories = 0,
        groups = 0,
        nodes = {},
        radius = d3.scale.sqrt().range([0, window_height/2]);

    var svg = d3.select("#circles")
                .append("svg")
                .attr("width", window_width)
                .attr("height", window_height),
        defs = svg.append('defs');
    
    $.getJSON("usage_data.json", function(json) {
        var dataset = parse_data(json);
        num_categories = dataset.length;
        
        nodes = dataset;
        var force = d3.layout.force()
            .size([window_width, window_height])
            .nodes(nodes)
            .gravity(0)
            .charge(0)
            .on("tick", tick)
            .start();

        // groups contain category information
        groups = svg.selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("id", function(x){
                // add all the positions first
                if (x.apps.length > max_apps)
                    max_apps = x.apps.length;
                total_apps += x.apps.length;
                return x.id;
            })
            .attr("transform", function(x, i) {
                // scale the category circle and image size
                // get the r of enlarged circle (rough calculation, assuming grid config)
                var r = Math.floor(Math.sqrt((window_width*window_height)/(4*num_categories)));
                // reduce it to r of the smaller circle
                x.r = (r - (2*pad))/1.8;
                // update the r for expansion
                x.r = (x.apps.length/max_apps)*x.r;
                // cap it so it's not terribly small
                if (x.r < 50)
                    x.r = 50;
                x.radius = x.r;
                image_width[i] = image_height[i] = 0.8*x.r;

                return "translate(" + [x.x, x.y] + ")";
            })
            .on("mousedown", function(x){
                // make sure double click doesn't contract
                if (clicked_category != x.id) {
                    // deselect any previously clicked ones
                    deselect_old_cluster(x, clicked_category);
                    clicked_category = x.id;
                }
                // TODO: move so focuses in center?
            })
            .on("mouseover", function(x, i){
                // only has effect if no category selected, or different
                // category selected
                if (!selected_category || selected_category != x.id) {
                    selected_category = x.id;
                    // note: issues when overlap
                    // only select when hovering over parent (which has no class)
                    var target = d3.event.relatedTarget.getAttribute("class");
                    if (target == null) {
                        if (!clicked_category ||
                            (clicked_category != selected_category)) {
                            select_new_cluster(x, i);
                        }
                    }
                }
            })
            .on("mouseout", function(x){
                // don't contract a clicked category
                if (clicked_category != selected_category) {
                    var target = d3.event.relatedTarget.getAttribute("class");
                    if (target == null) {
                        deselect_old_cluster(x, selected_category);
                        selected_category = "";
                    }
                }
            });

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
                "font-family": "Helvetica"
            })
            .attr("font-size", function(x){
                // reduce the font size based on the radius
                if (0.16*x.r < 12)
                    return 12;
                return 0.16*x.r;
            })
            .style('fill', text_color);
    });

    function tick(e) {
        groups
            .each(collide(.5))
            .attr("transform", function(d) {
                // constrain x and y here so doesn't go out of browser
                var x = Math.max(d.r, Math.min(window_width - d.r, d.x));
                var y = Math.max(d.r, Math.min(window_height - d.r, d.y));
                //console.log(d.radius);
                return "translate(" + [x, y] + ")";
            })
    }

    // Resolve collisions between nodes.
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function(d) {
            var r = d.radius + radius.domain()[1] + pad,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.color !== quad.point.color) * pad;
                    if (l < r) {
                      l = (l - r) / l * alpha;
                      d.x -= x *= l;
                      d.y -= y *= l;
                      quad.point.x += x;
                      quad.point.y += y;
                    }
              }
              return x1 > nx2
                  || x2 < nx1
                  || y1 > ny2
                  || y2 < ny1;
          });
      };
    }

    function select_new_cluster(x, i) {
        var angle = (360/x.apps.length)*Math.PI/180, // RADIANS
            selected_circle = d3.select("#circle_" + selected_category),
            selected_text = d3.select("#text_" + selected_category),
            r = x.r;

        selected_circle.transition()
            .attr("r", function(x){
                x.radius = r + image_width[i] + pad*2;
                return x.radius;
            });

        // need to keep both selected so parent is the only unclassed
        selected_circle.classed("selected", true);
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

        // append each app
        // need circle for appending image, don't display it
        cluster_apps[selected_category].append("circle")
            .attr("display", "none")
            .attr("cx", function(d, j){
                var dist = image_width[i]/2 + x.r + pad;
                d.x = Math.cos(angle*j)*dist;
                return d.x;
            })
            .attr("cy", function(d, j){
                var dist = image_width[i]/2 + x.r + pad;
                d.y = Math.sin(angle*j)*dist;
                return d.y;
            });

        // append each image
        cluster_apps[selected_category]
            .append('image')
            .attr('xlink:href', function(d){
              return d.img;
            })
            .attr("x", function(d){
              return d.x - image_width[i]/2;
            })
            .attr("y", function(d){
              return d.y - image_width[i]/2;
            })
            .classed('image_' + selected_category, true)
            .transition()
            .attr("width", function(d){
                // make the app img about 80% size of category
                return 0.8*x.r;
            })
            .attr("height", function(d){
                return 0.8*x.r;
            })

        var hovers = svg.selectAll("a")
            .on("mouseover", function() {
                show_stats();
                d3.event.stopPropagation();
            })
            .on("mouseout", function() {
                hide_stats();
                // TODO: fix not that stable, if you move your mouse really fast
                // it doesn't access other mouseout
                d3.event.stopPropagation();
            });
    }

    function deselect_old_cluster(x, old_category) {
        // old_category is the cluster to deselect (either clicked or selected)

        // first deselect the circle
        var old_cluster = typeof old_category === 'undefined' ? svg.selectAll() :
            svg.selectAll("#circle_" + old_category);
        
        var selected_obj = old_cluster.classed('selected', false)
            .transition()
            .attr('r', function(x){
                x.radius = x.r;
                return x.r;
            });

        // then deselect the circle's images
        old_cluster = typeof old_category === 'undefined' ? svg.selectAll() :
            svg.selectAll(".image_" + old_category);
        selected_obj = old_cluster.classed('selected', false)
            .transition()
            .attr('width', 0)
            .attr('height', 0);

        var old_apps = typeof old_category === 'undefined' ? svg.selectAll()
            : svg.selectAll("." + old_category);
        old_apps.transition().attr('r', 0).remove();
    }

    function parse_data(json) {
        // grab the categories
        var new_json = {},
            dataset = [],
            categories = _.unique(_.pluck(_.values(json), 'category'));

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


