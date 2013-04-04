$(function(){
    var window_width = WINDOW_WIDTH - 30,
        window_height = WINDOW_HEIGHT - 50, // TODO: subtract size of menubar
        image_width = [], // image widths of the apps
        image_height = [],
        selected_category,  // selected on hover, app id
        clicked_category,
        cluster_apps = {},
        pad = 10, // padding for boundary circle + app circles
        max_apps = -1; // max number of apps that exists in user's categories
        num_categories = 0,
        nodes = {},
        force = 0,
        foci = 0, // to keep track of focal pos for each node
        collision_padding = 15; // padding for collisions

    var svg = d3.select("#circles")
                .append("svg")
                .attr("width", window_width)
                .attr("height", window_height),
        defs = svg.append('defs');

    // use json data to create dataset and groups
    $.getJSON("usage_data.json", function(json) {
        var dataset,
            groups, circles, label;
        dataset = parse_data(json);
        num_categories = dataset.length;

        nodes = dataset;

        for (var i = 0; i < dataset.length; i++) {
            if (dataset[i].apps.length > max_apps) {
                max_apps = dataset[i].apps.length;
            }
        }

        force = d3.layout.force()
            .size([window_width, window_height])
            .nodes(nodes)
            .alpha(0.1)
            .charge(0) // charge is node-node attraction/repulsion
            .gravity(0) // gravity -> move to center
            .friction(0.3) // lower so doesn't bounce too much off boundary
            .on("tick", tick)
            .start();

        // groups contain category information
        groups = svg.selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("id", function(x){
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
                if (x.r < 50) {
                    x.r = 50;
                }

                // x.r is unchanging radius
                // x.radius changes upon mouseenter/leave
                x.radius = x.r;
                image_width[i] = image_height[i] = 0.8*x.r;

                // force layout will automatically choose x/y
                return "translate(" + [x.x, x.y] + ")";
            })
            .on("mouseenter", function(x, i) {
                // category selected
                if (!selected_category || selected_category != x.id) {
                    if (!clicked_category ||
                        (clicked_category != x.id)) {
                        // check if for some reason there's eome other selected category
                        if (selected_category && (selected_category != clicked_category))
                            deselect_old_cluster(selected_category);
                        selected_category = x.id;
                        select_new_cluster(x, i);
                    }
                }
            })
            .on("mouseleave", function(x, i) {
                if (clicked_category != selected_category) {
                    if (x.id == selected_category) {
                        // add a radius check to reduce some of the instabilities
                        // caused by mouseleave firing when a circle moves away from mouse
                        // on hover and doesn't transition radius size on time
                        // not perfect if you go in between circles
                        var circle = d3.select("#circle_" + x.id);
                        var check_x = d3.event.pageX - circle.attr("cx"),//x.x,
                            check_y = d3.event.pageY - circle.attr("cy"),//x.y,
                            dist = Math.sqrt(check_x*check_x + check_y*check_y);

                        // check the radius of the circle
                        var cr = circle.attr("r");
                        if (dist > cr) {
                            d3.transition().each("end", deselect_old_cluster(selected_category));
                            selected_category = "";
                        }
                    }
                }
            })
            .on("mousedown", function(x){
                // make sure double click doesn't contract
                if (clicked_category != x.id) {
                    // deselect any previously clicked ones
                    // doesn't actually select otherwise
                    if (clicked_category)
                        deselect_old_cluster(clicked_category);
                    clicked_category = x.id;
                }
            });

        // category circles
        circles = groups.append("circle")
            .attr("class", "vis-shape")
            .attr("r", function(x){
                return x.r;
            })
            .attr("id", function(x){
                return "circle_" + x.id;
            });

        label = groups.append("text")
            .text(function(x){
                return x.name;
            })
            .attr("class", "vis-label")
            .attr("id", function(x){
                return "text_" + x.id;
            })
            .attr("font-size", function(x){
                // reduce the font size based on the radius
                if (0.16*x.r < 12)
                    return 12;
                return 0.16*x.r;
            });

        groups.append("text")
            .text("More")
            .attr("class", "vis-sublabel")
            .attr("font-size", function(x) {
                // reduce the font size based on the radius
                if (0.16*x.r < 12)
                    return 12;
                return 0.1*x.r;
            })
            .attr("dy", "14px")
            .on("mousedown", function() {
                more_apps();
            });
        
    });

    $('#circles').click(function(e) {
        // make sure it's not within a cluster
        if (!e.target.id) {
            if (clicked_category) {
                deselect_old_cluster(clicked_category);
                clicked_category = "";
                selected_category = "";
            }
        }
    });

    // collision & tick from https://gist.github.com/GerHobbelt/3116713
    function tick(e) {
        force.stop();
        var q = d3.geom.quadtree(nodes),
            i = 0,
            n = nodes.length;

        // there's nothing selected/clicked?
        if (!clicked_category && !selected_category) {
            if (foci) {
                // try to fix its location
                var k = .1 * e.alpha;
                nodes.forEach(function(o, i) {
                    if (o.id != clicked_category) {
                        o.y += (foci[i].y - o.y) * k;
                        o.x += (foci[i].x - o.x) * k;
                    }
                });
            }
        }

        //force.friction(0.1);
        while (++i < n) {
            q.visit(collide(nodes[i]));
        }

        // update the category positions based on collisions
        svg.selectAll("g")
            .each(cluster(10 * e.alpha * e.alpha))
            .attr("transform", function(d, i) {
                d.x = Math.max(d.radius, Math.min(window_width - d.radius, d.x));
                d.y = Math.max(d.radius, Math.min(window_height - d.radius, d.y));
                // save the positions if foci not set yet
                if (!foci) {
                    // save this value of x and y to fix to this position
                    foci = [];
                }
                if (!foci[i]) {
                    foci[i] = {x: d.x, y: d.y};
                }
                return "translate(" + [d.x, d.y] + ")";
            })
        force.resume();
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
        var max;

        // Find the largest node for each cluster.
        // whatever one is selected is the 'max' so it will center
        nodes.forEach(function(d) {
            if (!clicked_category) {
                if (!max || (d.r > max.r))
                    max = d;
            }
            else {
                if (d.id == clicked_category)
                    max = d;
            }
        });

<<<<<<< HEAD
      // Find the largest node for each cluster.
      nodes.forEach(function(d) {
        if (!(d.color in max) || (d.radius > max[d.color].radius)) {
          max[d.color] = d;
        }
      });

      return function(d) {
        var node = max[d.color],
            l, r, x, y,
            k = 1,
            i = -1;

        // For cluster nodes, apply custom gravity.
        if (node == d) {
          node = {x: window_width / 2, y: window_height / 2, radius: -d.radius};
          k = .1 * Math.sqrt(d.radius);
        }
=======
        return function(d) {
            var node = max,
                l,
                r,
                x,
                y,
                k = 1,
                i = -1;

            // For cluster nodes, apply custom gravity.
            if (node == d) {
                node = {x: window_width / 2, y: window_height / 2, radius: -d.radius};
                k = .1 * Math.sqrt(d.radius);
            }
>>>>>>> 7e1a518b05763ee9281f95eb982627b55a8b6222

            x = d.x - node.x;
            y = d.y - node.y;
            l = Math.sqrt(x * x + y * y);
            r = d.radius + node.radius;
            if (l != r) {
                l = (l - r) / l * alpha * k;
                d.x -= x *= l;
                d.y -= y *= l;
                node.x += x;
                node.y += y;
            }
        };
    }

    // Resolve collisions between nodes.
    function collide(node) {
        var r = node.radius + collision_padding;
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = node.radius + quad.point.radius + collision_padding;
                // there's a collision if distance is less than r
                if (l < r) {
                    l = (l - r) / l * .1;
                    node.x -= x *= l;
                    node.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 ||
                   x2 < nx1 ||
                   y1 > ny2 ||
                   y2 < ny1;
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
                .enter()
                .append("a")
                .attr("data-category", x.name)
                .attr("id", "link_" + x.id)
                .attr("xlink:href", function(d){
                    return d.url;
                })

        // append each app
        // need circle for appending image, don't display it
        cluster_apps[selected_category].append("circle")
            .attr("display", "none")
            .attr("id", "link_circle_" + x.id)
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
            .attr('xlink:href', function(d) {
              return d.img;
            })
            .attr("id", "link_img_" + x.id)
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
                return image_width[i];
            })
            .attr("height", function(d){
                return image_height[i];
            })

        var hovers = svg.selectAll("image") // this should change
            .on("mouseenter", function() {
                show_stats();
                d3.event.stopPropagation();
            })
            .on("mouseleave", function() {
                hide_stats();
            });
    }

    function deselect_old_cluster(old_category) {
        // old_category is the cluster to deselect (either clicked or selected)

        // first deselect the circle
        var old_cluster = typeof old_category === 'undefined' ? svg.selectAll() :
            svg.selectAll("#circle_" + old_category);

        var selected_obj = old_cluster.classed('selected', false)
            .transition()
            .attr('r', function(d){
                d.radius = d.r;
                return d.r;
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

    // displays the shadow box over apps for more apps
    function more_apps() {
        $("#more-apps-box").width(0)
                           .height(0)
                           .show()
                           .animate({
                                width: WINDOW_WIDTH,
                                height: WINDOW_HEIGHT
                           }, 500);
    }
});


