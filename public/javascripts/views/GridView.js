root.app.views.GridView = Backbone.View.extend({

  tagName:  "div",
  COLUMNS: 6,  // the number items in each row
  ROW_MULTIPLIER: 3/4,  // the size decrease with each row
  id: 'grid',
  className: 'vis',
  // default width of 1024
  width: 1024,


  template: _.template(root.app.templates.grid),

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
  },

  render: function() {
    this.$el.width(this.width);
    this.$el.html(this.template(this.collection.toJSON()));
    // this.$el.toggleClass('done', this.model.get('done'));
    // this.input = this.$('.edit');


    // iterate over it. for every 5, create a new table row, and then start appending to that row.
    var current_row;
    var that = this;
    var current_column_width = that.width / that.COLUMNS;
    var row_count = (that.width / current_column_width);
    var row_index = 0;  // position in the row
    this.collection.each(function(item, i) {
      // console.log(item);
      // console.log((that.width / current_column_width));
      // console.log(i % (that.width / current_column_width));
      // console.log(i);
      // console.log('hi');
      // console.log('i: ' + i);
      // console.log('r: ' + row_count);
      // if we've reached the end of a row (if index / current_column_width = 0 and it's not the first)
      if(row_index % row_count === 0) {
        if(row_index !== 0) {
          // console.log('IT REACHES HEREEEEEEEEEE');
          current_column_width = current_column_width * that.ROW_MULTIPLIER;
          // row_count = Math.floor(that.width / current_column_width);
          row_count = Math.floor(row_count / that.ROW_MULTIPLIER);
          row_index = 0;
        }
        that.$el.append(current_row);
        current_row = $('<div class="row"><div class="row_wrapper"></div></div>');
        current_row.width(that.width);
      }
      current_row.find('.row_wrapper').append(new app.views.ApplicationView({model: item, 
                                                        width: current_column_width, 
                                                        height: current_column_width}).render().el);
      row_index++;
    });

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
