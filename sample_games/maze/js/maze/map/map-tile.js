// Generated by CoffeeScript 1.6.3
var MapTile,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapTile = (function(_super) {
  var TileSprite;

  __extends(MapTile, _super);

  MapTile.WIDTH = 48;

  MapTile.HEIGHT = 48;

  TileSprite = (function(_super1) {
    __extends(TileSprite, _super1);

    function TileSprite() {
      TileSprite.__super__.constructor.call(this, MapTile.WIDTH, MapTile.HEIGHT);
      this.image = Game.instance.assets[R.MAP.SRC];
    }

    return TileSprite;

  })(Sprite);

  function MapTile(x, y) {
    MapTile.__super__.constructor.apply(this, arguments);
    this.tile = new TileSprite;
    this.addChild(this.tile);
    this.elementData = [];
    this.index = {
      x: x,
      y: y
    };
    this.x = MapTile.WIDTH * x;
    this.y = MapTile.HEIGHT * y;
  }

  MapTile.prototype.pushElement = function(element) {
    this.elementData.push(element);
    return this.addChild(element);
  };

  MapTile.prototype.onride = function(player) {
    var e, _i, _len, _ref, _results;
    _ref = this.elementData;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      _results.push(e.onride(player));
    }
    return _results;
  };

  MapTile.prototype.isThrough = function() {
    return this.elementData.every(function(e) {
      return e.isThrough();
    });
  };

  return MapTile;

})(Group);