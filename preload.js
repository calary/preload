/*
resource: src array
each callback: function ( number )
finish callback: function ( Image[] )
*/
var Preload = function(){
  var total = 0;
  var finished = 0;
  var onEachLoad = function(){};
  var onTotalLoad = function(){};
  var onLoad = function(){
    var i, len;
    finished++;
    onEachLoad(finished / total);
    if(finished >= total) {
      for(i = 0, len = loadableArray.length; i < len; i++) {
        loadableArray[i].isLoaded = true;
      }
      commonArray = [];
      loadableArray = [];
      total = 0;
      finished = 0;
      onTotalLoad();
    }
  };
  var commonArray = [];
  var loadableArray = [];

  var Loadable = function(src){
    Array.call(this);
    this.push.apply(this, src);
    this.isLoaded = false;
  };
  Loadable.prototype = new Array();
  Loadable.prototype.load = function(callback){
    var i, len;
    for(i = 0, len = this.length; i < len; i++) {
      img = new Image();
      img.src = this[i];
      this[i] = img;
      if(img.complete) {
        callback();
        continue;
      }
      img.onload = callback;
    }
  };

  return {
    Loadable: Loadable,
    add: function(src){
      if(src instanceof Loadable) {
        if(!src.isLoaded) {
          loadableArray.push(src);
          total += src.length;
        } 
      } else if(src instanceof Array) {
        commonArray.push.apply(commonArray, src);
        total += src.length;
      } else if(typeof src == 'string') {
        commonArray.push(src);
        total += 1;
      }
      return this;
    },
    addPageImage: function(){
      var all = document.body.getElementsByTagName('*');
      var imgUrls = {}, url = [];
      var i, len;
      for(i = 0, len = all.length; i < len; i++) {
          if(all[i].tagName.toLowerCase() == 'img') {
              if(all[i].src) {
                  imgUrls[all[i].src] = true;
              } 
          } else {
              var bg = window.getComputedStyle(all[i], null).backgroundImage;
              if(/url/.test(bg)) {
                  bg = bg.replace(/url\("?([^"]+)"?\)/, '$1');
                  imgUrls[bg] = true;
              }
          }
      }
      for(i in imgUrls) {
        url.push(i);
      }
      this.add(url);
      return this;
    },
    load: function(eachLoad, totalLoad){
      var i, len;
      onEachLoad = eachLoad || onEachLoad;
      onTotalLoad = totalLoad || onTotalLoad;
      if(total <= 0) {
        onTotalLoad();
        return this;
      }
      loadableArray.push(new Loadable(commonArray));
      for(i = 0, len = loadableArray.length; i < len; i++) {
        loadableArray[i].load(onLoad);
      }
      return this;
    }
  }
}();