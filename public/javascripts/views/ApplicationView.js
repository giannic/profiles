root.app.views.ApplicationView = Backbone.View.extend({

  stroke_color: 'rgba(201, 219, 242, 0.8)',
  cluster_fill: 'rgba(200, 220, 255, 0.4)',
  tagName:  "td",
  // width should be a 6th of the size of the grid 
  // 6 = number of items per row
  // DEFAULT VALUES FOR WIDTH/HEIGHT
  width: Math.ceil(1000/6), // $('#grid').width() / 6,
  height: Math.ceil(1000/6), // square for now
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
    console.log('this is the width:');
    console.log(Math.ceil(data.width));
    console.log('this is the height:');
    console.log(Math.ceil(data.height));
    this.width = Math.ceil(data.width);
    this.height = Math.ceil(data.height);
    this.r = data.width / 2;
    this.cx = this.r;
    this.cy = this.r;
    // this.listenTo(this.model, 'change', this.render);
    // this.listenTo(this.model, 'destroy', this.remove);
  },

  render: function() {
    console.log(this.width);
    console.log(this.height);
    console.log(this.model);
    console.log('hi i amd in here');
    console.log(d3.select(this));
    this.$el.html('');
    // should be square (circles)
    this.$el.width(this.width);
    this.$el.height(this.height);
    console.log(this.width);
    console.log(this.height);
    console.log($('#grid').width());
    console.log('this is the width:');
    console.log(this.r);
    console.log(this.cx);
    console.log(this.cy);
    svg = d3.select(this.el).append('svg')
      .attr('width', this.width)  // set the width
      .attr('height', this.height)  // set the height
      .style('display', 'block')  // set the height
      .style('margin', 'auto')  // set the height
      .append('g').append('circle')
      .attr('r', this.r)
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('stroke', this.stroke_color)
      .style('fill', this.cluster_fill);
    
    return this;
  }

});
