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
      margin: 15,
      r: 1000/12, // temporary
      selected: false,

      template: _.template(app.templates.application),

      events: {
          // "click .toggle"   : "toggleDone",
          // "dblclick .view"  : "edit",
          // "click a.destroy" : "clear",
          // "keypress .edit"  : "updateOnEnter",
          // "blur .edit"      : "close"
          "mouseenter" : "hover_expand",
          "mouseleave" : "hover_contract",
          "click .delete" : "delete_app"
      },

      // passes in the window width/height
      initialize: function(data) {
          var that = this;
          _.each(data, function(value, key){

            that[key] = value;
          });
          this.width = Math.floor(data.width * 3/4) - 2 * this.margin;
          this.height = Math.floor(data.height * 3/4) - 2 * this.margin;
          this.$el.css({
            'margin': that.margin,
          });
          this.r = (data.width) / 2 - this.margin - 1;  // subtract the border
          this.cx = this.r;
          this.cy = this.r;
          this.render();
      },

      render: function() {
        if(this.selected) this.$el.addClass('selected');
        // return render_d3.call(this);
        return render_html.call(this);
      },

      hover_expand: function() {
        var that = this;

        var new_height = that.margin * 2 + that.height + that.height / 2;
        var new_width = that.margin * 2 + that.width + that.width / 2;
        var new_top = -Math.abs((new_height - that.height) / 2);
        var new_left = -Math.abs((new_width - that.width) / 2);


        this.$el.find('.application-inner').stop().animate({
          opacity: 1.0,
          height: new_height,
          width: new_width,
          left: new_left,
          top: new_top
        }, 100);
    
        this.$el.css('z-index',11);
     
        this.$el.find('.url').css('display', 'block');
        this.$el.find('.delete').toggle();

        var snd_height = that.margin * 2 + that.height/2 + that.height / 2;
        var snd_width = that.margin * 2 + that.width/2 + that.width / 2;
        var snd_top = -Math.abs((snd_height - that.height) / 2);
        var snd_left = -Math.abs((snd_width - that.width) / 2);
        var corner_height = that.margin * 2 + that.height/2 + that.height / 4;
        var corner_width =  that.margin * 2 + that.width/2 + that.width / 4;
        var corner_top = -Math.abs((corner_height - that.height) / 2);
        var corner_left = -Math.abs((corner_width - that.width) / 2);

        grid_vent.trigger('hover-expand', {
          row: this.row,
          column: this.column,
          height: snd_height,
          width: snd_width,
          left: snd_left,
          top: snd_top,
          corner_height: corner_height,
          corner_width: corner_width,
          corner_left: corner_left,
          corner_top: corner_top
        });
      },


      hover_contract: function() {
        var that = this;
        grid_vent.trigger('hover-contract', {
          height: that.height,
          width: that.width,
          left: 0,
          top: 0
        });

        this.$el.find('.application-inner').stop().animate({
          opacity: 0.6,
          height: that.height,
          width: that.width,
          left: 0,
          top: 0
        }, 100);

        this.$el.css('z-index',10);

        this.$el.find('.url').css('display', 'none');
        this.$el.find('.delete').toggle();
      },

      delete_app: function() {
        grid_vent.trigger('grid-delete', this);
      }
  });

  var images = [
    'img/app_icons/behance-square.png',
    'img/app_icons/blogger-square.png',
    'img/app_icons/deviantart-square.png',
    'img/app_icons/digg-square.png',
    'img/app_icons/facebook-square.png',
    'img/app_icons/flickr-square.png',
    'img/app_icons/googleplus-square.png',
    'img/app_icons/instagram-square.png',
    'img/app_icons/lastfm-square.png',
    'img/app_icons/linkedin-square.png',
    'img/app_icons/livejournal-square.png',
    'img/app_icons/paypal-square.png',
    'img/app_icons/orkut-square.png',
    'img/app_icons/picasa-square.png',
    'img/app_icons/pinterest-square.png',
    'img/app_icons/skype-square.png',
    'img/app_icons/soundcloud-square.png',
    'img/app_icons/stumbleupon-square.png',
    'img/app_icons/tumblr-square.png'
  ];


  function render_html() {
    var image_default = 'img/app_icons/social-networks-square.png';
    this.$el.html(this.template({application: this.model.toJSON(),
                                 img: this.model.get('url').substring(0, this.model.get('url').lastIndexOf(".")),
                                 img_default: image_default
    }));
    // TEMPORAROY TODO: remove image
    //this.$el.append($(app.templates.grid_img));
    // this.$el.append(_.template(app.templates.grid_img, {img: images[Math.floor(Math.random() * (images.length))]}));
    //this.$el.css('background-image', 'url(' + images[Math.floor(Math.random() * (images.length))] + ')');
    //this.$el.css('background-size', '100% 100%');  // resize backgorund image
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
