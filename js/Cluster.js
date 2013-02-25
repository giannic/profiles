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
  window.Cluster = function(json) {
    this.name = json.name;
    this.x = undefined;
    this.y = undefined;
    this.r = undefined;
    this.apps = json.apps;
  };

  Cluster.prototype.setX(new_x){
    this.x = new_x;
  }
  Cluster.prototype.setX(new_x){
    this.x = new_x;
  }

  QuadTree.prototype.clear = function(userid) {

  };
  // for testing
  QuadTree.prototype.printTree = function() {
    
  };
}());
