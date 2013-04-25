(function(){
  window.App = function(json) {
    this.r = 0;
    this.img = json.img;
    this.url = json.url;
    this.id = json.id;
    this.close = json.close;
    this.open = json.open;
  };
})();


(function(){
  window.Cluster = function(name, json) {
    this.name = name;
    this.r = 0;
    this.apps = [];
    var that = this;

    _.each(json, function(app){
      that.apps.push(new window.App(app));
    });

    this.value = this.apps.length;
  };
})();

