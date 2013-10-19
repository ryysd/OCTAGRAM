// Generated by CoffeeScript 1.6.3
var Octagram,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Octagram = (function() {
  function Octagram(path) {
    var $octagramContent, contentWindow,
      _this = this;
    this.core = null;
    $octagramContent = $('<iframe seamless></iframe>').attr('id', 'octagram-content').attr('src', path + '/content.html').attr('width', '640').attr('height', '640');
    $('#octagram').append($octagramContent);
    contentWindow = $octagramContent[0].contentWindow;
    contentWindow.isContent = true;
    contentWindow.onload = function() {
      _this.core = new contentWindow.OctagramCore(16, 16, 640, 640, "./resource/");
      _this.core.start();
      return _this.core.onload = function() {
        var scene;
        scene = new contentWindow.Scene(_this.core);
        _this.core.pushScene(scene);
        return _this.onload();
      };
    };
  }

  Octagram.prototype.createProgramInstance = function() {
    return this.core.octagrams.createInstance();
  };

  Octagram.prototype.showProgram = function(program) {
    return this.core.octagrams.show(program);
  };

  Octagram.prototype.getInstance = function(id) {
    return this.core.octagrams.getInstance(id);
  };

  Octagram.prototype.copyObjectToLocal = function(local) {
    var ignores, key, value, _ref, _results;
    ignores = ['Resources', 'TipUtil'];
    _ref = local.parent.octagram;
    _results = [];
    for (key in _ref) {
      value = _ref[key];
      if (!(__indexOf.call(ignores, key) >= 0)) {
        console.log('import : ' + key);
        _results.push(local[key] = value);
      } else {
        _results.push(console.log('ignore : ' + key));
      }
    }
    return _results;
  };

  Octagram.prototype.copyAssetsToHost = function(local) {
    var key, value, _ref, _results;
    console.log(local.Game.instance.assets);
    _ref = local.Game.instance.assets;
    _results = [];
    for (key in _ref) {
      value = _ref[key];
      console.log('load asset :' + key);
      _results.push(local.parent.Game.instance.assets[key] = value);
    }
    return _results;
  };

  Octagram.prototype.onload = function() {};

  return Octagram;

})();

octagram.Octagram = Octagram;