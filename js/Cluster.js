var dataset = 
  [{
    name: "test",
    x: 200,
    y: 300,
    r: 25,
    apps: [{
            x: 100,
            y: 30,
            r: 10
           },
           {
            x: 200,
            y: 40,
            r: 20
           }
          ]
  }];


(function(){
  window.App = function(json) {
    this.x = json.x;
    this.y = json.y;
    this.r = json.r;
    this.img = json.img;
  };
})();


(function(){
  window.Cluster = function(name, json) {
    this.name = name;
    this.x = undefined;
    this.y = undefined;
    this.r = undefined;
    this.apps = [];
    var that = this;

    _.each(json, function(app){
      that.apps.push(new window.App(app));
    });
  };
})();

