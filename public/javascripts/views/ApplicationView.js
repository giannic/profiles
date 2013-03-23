root.app.views.ApplicationView = Backbone.View.extend({

  stroke_color: 'rgba(201, 219, 242, 0.8)',
  cluster_fill: 'rgba(200, 220, 255, 0.4)',
  tagName:  "td",
  // width should be a 6th of the size of the grid 
  // 6 = number of items per row
  width: 1000/6, // $('#grid').width() / 6,
  height: 1000/6, // square for now
  r: 1000/12, // temporary
  cx: 1000/12,
  cy: 1000/12,

  template: _.template(root.app.templates.application),

  events: {
    // "click .toggle"   : "toggleDone",
    // "dblclick .view"  : "edit",
    // "click a.destroy" : "clear",
    // "keypress .edit"  : "updateOnEnter",
    // "blur .edit"      : "close"
  },

  initialize: function(width) {
    // this.listenTo(this.model, 'change', this.render);
    // this.listenTo(this.model, 'destroy', this.remove);
  },

  render: function() {
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
    console.log(this.r)
    console.log(this.cx)
    console.log(this.cy)
    svg = d3.select(this.el).append('svg').append('g').append('circle')
      .attr('r', this.r)
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('stroke', this.stroke_color)
      .style('fill', this.cluster_fill);
    // svg.
    // this.$el.html(this.template(this.model.toJSON()));
    // this.$el.toggleClass('done', this.model.get('done'));
    // this.input = this.$('.edit');
    return this;
  },

  toggleDone: function() {
    // this.model.toggle();
  },

  edit: function() {
    // this.$el.addClass("editing");
    // this.input.focus();
  },

  close: function() {
    // var value = this.input.val();
    // if (!value) {
    //   this.clear();
    // } else {
    //   this.model.save({title: value});
    //   this.$el.removeClass("editing");
    // }
  },

  updateOnEnter: function(e) {
    // if (e.keyCode == 13) this.close();
  }, 
  clear: function() {
    // this.model.destroy();
  }

});
