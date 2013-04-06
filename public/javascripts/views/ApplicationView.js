(function(){
  app.views.ApplicationView = Backbone.View.extend({
      fsize: 16,
      tagName:  'div',
      className: 'application',
      // width should be a 6th of the size of the grid
      // 6 = number of items per row
      // DEFAULT VALUES FOR WIDTH/HEIGHT
      width: Math.floor(1000/6), // $('#grid').width() / 6,
      height: Math.floor(1000/6), // square for now
      margin: 7,
      r: 1000/12, // temporary


      template: _.template(app.templates.application),

      events: {
          // "click .toggle"   : "toggleDone",
          // "dblclick .view"  : "edit",
          // "click a.destroy" : "clear",
          // "keypress .edit"  : "updateOnEnter",
          // "blur .edit"      : "close"
          "mouseenter" : "hover_expand",
          "mouseleave" : "hover_contract"
      },

      // passes in the window width/height
      initialize: function(data) {
          this.width = Math.floor(data.width * 3/4) - 2 * this.margin;
          this.height = Math.floor(data.height * 3/4) - 2 * this.margin;
          this.$el.css('margin', this.margin);
          this.r = (data.width) / 2 - this.margin - 1;  // subtract the border
          this.cx = this.r;
          this.cy = this.r;
      },

      render: function() {
        // return render_d3.call(this);
        return render_html.call(this);
      },
      
      hover_expand: function() {
        var that = this;
        this.$el.stop().animate({
          opacity: 1.0,
          height: that.margin * 2 + that.height + that.height / 2,
          width: that.margin * 2 + that.width + that.width / 2
        }, 300, function(){
          console.log('expanded!');  
        });
      },

      hover_contract: function() {
        var that = this;
        this.$el.stop().animate({
          opacity: 1.0,
          height: that.height,
          width: that.width
        }, 300, function(){
          console.log('contracted!');  
        });

      }
  });

  var images = [
    'img/behance-square.png',
    'img/blogger-square.png',
    'img/deviantart-square.png',
    'img/digg-square.png',
    'img/facebook-square.png',
    'img/flickr-square.png',
    'img/googleplus-square.png',
    'img/instagram-square.png',
    'img/lastfm-square.png',
    'img/linkedin-square.png',
    'img/livejournal-square.png',
    'img/paypal-square.png',
    'img/orkut-square.png',
    'img/picasa-square.png',
    'img/pinterest-square.png',
    'img/skype-square.png',
    'img/soundcloud-square.png',
    'img/stumbleupon-square.png',
    'img/tumblr-square.png'
  ];

  function render_html() {
    this.$el.html(this.template({application: this.model.toJSON()}));
    // TEMPORAROY TODO: remove image
    this.$el.css('background-image', 'url(' + images[Math.floor(Math.random() * (images.length))] + ')');
    this.$el.css('background-size', '100% 100%');  // resize backgorund image
    this.$el.width(this.width);
    this.$el.height(this.height);
    return this;
  }

  function render_d3(){
    var that = this;
    this.$el.html('');
    // should be square (circles)
    this.$el.width(this.width);
    this.$el.height(this.height);
    svg = d3.select(this.el).append('svg')
        .attr('width', this.width)  // set the width
        .attr('height', this.height)  // set the height
        .style('display', 'block')
        .style('margin', 'auto');

    group = svg.append('a')
        .attr("xlink:href", 'http://' + this.model.get('url'));
        // for circles
        // .attr('transform', function(){
        //     return 'translate(' + [that.cx, that.cy] + ')';
        // });
    // image = group.append('image')
    //         .attr('xlink:href', this.model.get('img'));

    circle = group.append('rect')
        .attr("class", "vis-shape")
        .attr('width', this.r)
        .attr('height', this.r)
        .attr('width', this.width)
        .attr('height', this.height);
        //.style('stroke', this.stroke_color)
        //.style('fill', this.cluster_fill);

    group.append("text")
         .text(this.model.get('url'))
         .attr("class", "vis-label")
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
        });
        //.style('fill', this.text_color);
    return this;

  }

})();
