(function(){

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.models.Application = Backbone.Model.extend({

    defaults: function() {
      
    },
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });

  root.collections.Applications = Backbone.Collection.extend({

    model: Todo,

    localStorage: new Backbone.LocalStorage("todos-backbone"),

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
    comparator: 'order'

  });

})();
