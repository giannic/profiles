app.views.GridView = Backbone.View.extend({

  tagName:  "div",
  COLUMNS: 10,  // the number items in each row
  ROW_MULTIPLIER: 3/4,  // the size decrease with each row
  id: 'grid',
  className: 'vis',
  // default width of 1024
  width: 1024,
  apps: [],
  expanded_apps: [],
  expanded_corners: [],


  template: _.template(app.templates.grid),

  events: {
    // "click .toggle"   : "toggleDone",
    // "dblclick .view"  : "edit",
    // "click a.destroy" : "clear",
    // "keypress .edit"  : "updateOnEnter",
    // "blur .edit"      : "close"
  },

  initialize: function() {
    // set the width to the width of body
    this.width = WINDOW_WIDTH;
    this.height = WINDOW_HEIGHT;
    this.$el.width(this.width);
    this.$el.height(this.height);
    this.listenTo(grid_vent, 'hover-expand', this.expand_entities);
    this.listenTo(grid_vent, 'hover-contract', this.contract_entities);
  },

  render: function() {
    this.apps = [];
    this.$el.width(this.width);
    this.$el.html(this.template(this.collection.toJSON()));
    // this.$el.toggleClass('done', this.model.get('done'));
    // this.input = this.$('.edit');

    var current_row;
    var that = this;
    var current_column_width = that.width / that.COLUMNS;
    var row_index = 0;  // position in the row
    var row_num = 0;
    this.collection.each(function(item, i) {
        var current_column = row_index < that.COLUMNS ? row_index : row_index % that.COLUMNS;
        if (current_column === 0) {
            that.$el.append(current_row);
            current_row = $(app.templates.grid_row);
            current_row.width(that.width);
            row_num++;
        }
        var new_app = new app.views.ApplicationView({
                            model: item,
                            width: current_column_width,
                            height: current_column_width,
                            row: row_num,
                            column: current_column
                           });
        that.apps.push(new_app);
        current_row.find('.row-wrapper').append(new_app.render().el);
        row_index++;
    });

    // append the last row
    that.$el.append(current_row);
    // set the last row to the full width of other rows
    // TODO: HARDCODED WIDTH
    $(current_row).find('.row-wrapper').width(1020);  
    return this;
  },

  expand_entities: function(data) {
    this.expanded_apps = [];  // reset expanded apps
    this.expanded_corners = [];  // reset expanded apps
    var row = data.row;
    var column = data.column;
    var height = data.height;
    var width = data.width;

    var num_rows = Math.ceil(this.apps.length / this.COLUMNS);

    // expand top, bottom, left, right
    // row and columns for each
    var right_index = column + 1 >= this.COLUMNS ? this.COLUMNS : column + 1;
    var left_index = column - 1 < 0 ? 0 : column - 1;
    var top_index = row - 2 <= 0 ? 0 : row - 2;
    var below_index = row > num_rows ? num_rows : row;
 
    var row_above = top_index * this.COLUMNS;
    var row_below = below_index * this.COLUMNS;   
    var row_current = (row - 1) * this.COLUMNS;
    var column_right = right_index;
    var column_left = left_index;
    var column_current = column;

    var right = this.apps[row_current + column_right];
    var left = this.apps[row_current + column_left];
    var top = this.apps[row_above + column_current];
    var bottom = this.apps[row_below + column_current];

    var left_col = column - 1 >= 0;
    var top_row = row - 2 >= 0;
    var bottom_row = row <= num_rows;
    var right_col = column + 1 < this.COLUMNS;

    if(bottom_row && bottom)
      this.expanded_apps.push(bottom);
    if(right_col && right)
      this.expanded_apps.push(right);
    if(left_col && left)
      this.expanded_apps.push(left);
    if(top_row && top)
      this.expanded_apps.push(top);

    // expand corners
    if(top_row) {
      if(left_col)
        var tl = this.apps[row_above + column_left];
      var tr = this.apps[row_above + column_right];
    }
    if(left_col)
      var bl = this.apps[row_below + column_left];
    var br = this.apps[row_below + column_right];


    this.expanded_corners.push(tl);
    // if(!top_row)
    this.expanded_corners.push(tr);
    this.expanded_corners.push(bl);
    // if(!bottom_row)
    this.expanded_corners.push(br);
    
    console.log(this.expanded_apps)
    _.each(this.expanded_apps, function(item){
      if(item)
        item.$el.find('.application-inner').stop().animate({
            width: width,
            height: height,
            left: data.left,
            top: data.top,
            opacity: 0.8
          }, 200, function(){
        });
    });

    var corner_width = data.corner_width;
    var corner_height = data.corner_height;
    var corner_left = data.corner_left;
    var corner_top = data.corner_top;
    _.each(this.expanded_corners, function(item){
      if(item)
        item.$el.find('.application-inner').stop().animate({
            width: corner_width,
            height: corner_height,
            left: corner_left,
            top: corner_top,
            opacity: 0.8
          }, 200, function(){
        });
    });

    

    // var right = column + 1 >= COLUMN ? this.apps[this.apps.length - 1] : 
    //                                               this.apps[(row-1) * COLUMNS + column + 1];

    // var left = column - 1 < 0 ? this.apps[0] : this.apps[(row-1) * COLUMNS + column - 1];
    // var above = row - 2 >= 0 ? this.apps[0] : this.apps[(row - 2) * COLUMNS = column]
    // var below = row
  },

  contract_entities: function(data) {
    
    _.each(_.union(this.expanded_apps, this.expanded_corners), function(item){
      if(item)
        item.$el.find('.application-inner').stop().animate({
            width: data.width,
            height: data.height,
            left: data.left,
            top: data.top,
            opacity: 0.6
          }, 200, function(){
        });
    });


  },

  toggleDone: function() {
    // this.model.toggle();
  },

  edit: function() {
    // this.$el.addClass("editing");
    // this.input.focus();
  },

  close: function() {
    
  },

  updateOnEnter: function(e) {
  },

  clear: function() {
  }

});
