(function(){
  window.App = function(json) {
    this.x = json.x;
    this.y = json.y;
    this.r = 50;
    this.img = json.img;
    this.url = json.url;
    this.id = json.id;
  };
})();


(function(){
  window.Cluster = function(name, json) {
    this.name = name;
    this.x = Math.random();
    this.y = Math.random();
    this.r = 100;
    this.apps = [];
    var that = this;

    _.each(json, function(app){
      that.apps.push(new window.App(app));
    });
  };
})();

