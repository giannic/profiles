root.app.views.GridView = Backbone.View.extend({

  tagName:  "div",
  COLUMNS: 6,  // the number items in each row
  // default width of 1024
  id: 'grid',
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
    this.width = 1024;
    
  },

  render: function() {
    this.$el.html(this.template(this.collection.toJSON()));
    // this.$el.toggleClass('done', this.model.get('done'));
    // this.input = this.$('.edit');
    

    // iterate over it. for every 5, create a new table row, and then start appending to that row.
    var index = 0;
    var current_row;
    var that = this;
    this.collection.each(function(item, i) {
      if(i % that.COLUMNS === 0) {
        that.$el.append(current_row);
        current_row = $('<div class="row"></div>');
        current_row.width(that.width);
      }
      current_row.append(new app.views.ApplicationView({model: item, 
                                                        width: that.width / that.COLUMNS, 
                                                        height: that.width / that.COLUMNS}).render().el);
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
