root.app.models.Application = Backbone.Model.extend({

  defaults: function() {
    return {
      name: 'Default Name',
      number: 0,
      url: 'http://www.google.com',
      img: 'http://www.placekitten.com/50/50',
      open: [],
      close: [],
      category: 'stuff'
    };
  },

  initialize: function(){

  }

});

root.app.collections.Applications = Backbone.Collection.extend({

  model: root.app.models.Application,

  initialize: function() {
    this.by = 'open';
  },

  done: function() {
    return this.where({done: true});
  },

  remaining: function() {
    return this.without.apply(this, this.done());
  },
  nextOrder: function() {
    if (!this.length) return 1;
    return this.last().get('order') + 1;
  },
  comparator: function(model) {
    // number of times opened

    return -model.get(this.by).length;
  }

});
