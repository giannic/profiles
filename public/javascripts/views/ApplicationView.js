root.app.views.ApplicationView = Backbone.View.extend({

  fsize: 16,
  text_color: 'rgba(120,174,255,1.0)',
  stroke_color: 'rgba(201, 219, 242, 0.8)',
  cluster_fill: 'rgba(200, 220, 255, 0.4)',
  tagName:  'div',
  className: 'application',
  // width should be a 6th of the size of the grid 
  // 6 = number of items per row
  // DEFAULT VALUES FOR WIDTH/HEIGHT
  width: Math.floor(1000/6), // $('#grid').width() / 6,
  height: Math.floor(1000/6), // square for now
  margin: 7,
  r: 1000/12, // temporary
  

  template: _.template(root.app.templates.application),

  events: {
    // "click .toggle"   : "toggleDone",
    // "dblclick .view"  : "edit",
    // "click a.destroy" : "clear",
    // "keypress .edit"  : "updateOnEnter",
    // "blur .edit"      : "close"
  },

  initialize: function(data) {
    console.log(this.model.attributes);
    this.width = Math.floor(data.width) - 2 * this.margin;
    this.height = Math.floor(data.height) - 2 * this.margin;
    this.$el.css('margin', this.margin);
    this.r = (data.width) / 2 - this.margin - 1;  // subtract the border
    this.cx = this.r;
    this.cy = this.r;
  },

  render: function() {
    var that = this;
    this.$el.html('');
    // should be square (circles)
    this.$el.width(this.width);
    this.$el.height(this.height);
    svg = d3.select(this.el).append('svg')
      .attr('width', this.width)  // set the width
      .attr('height', this.height)  // set the height
      .style('display', 'block')  // set the height
      .style('margin', 'auto'); // set the height

    group = svg.append('a')
      .attr("xlink:href", 'http://' + this.model.get('url'))
      .attr('transform', function(){
        return 'translate(' + [that.cx, that.cy] + ')';
      });
    // image = group.append('image')
    //         .attr('xlink:href', this.model.get('img'));
      
    circle = group.append('circle')
      .attr('r', this.r)
      .attr('width', this.width)
      .attr('height', this.height)
      
      .style('stroke', this.stroke_color)
      .style('fill', this.cluster_fill);
 
    group.append("text")
         .text(this.model.get('url'))
         .attr({
           "alignment-baseline": "middle",
           "text-anchor": "middle",
           "font-family": "Helvetica"
         })
        .attr("font-size", function(){
                             if (0.8*that.r < 12)
                               return 8;
                             else 
                               return 0.16*that.r;
                           })
        .style('fill', this.text_color);

   
    return this;
  }

});
