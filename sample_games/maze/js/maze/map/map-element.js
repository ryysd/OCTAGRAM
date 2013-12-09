// Generated by CoffeeScript 1.6.3
var BlockElement, ElementFactory, GoalElement, MapElement, RoadElement, StartElement, TreasureElement,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapElement = (function(_super) {
  __extends(MapElement, _super);

  MapElement.WIDTH = 48;

  MapElement.HEIGHT = 48;

  function MapElement(id, x, y) {
    this.id = id != null ? id : 0;
    MapElement.__super__.constructor.call(this, MapElement.WIDTH, MapElement.HEIGHT);
    this.image = Game.instance.assets[R.MAP.SRC];
    this.frame = this.id;
    this.index = {
      x: x,
      y: y
    };
    this.x = MapElement.WIDTH * x;
    this.y = MapElement.HEIGHT * y;
    this.item = null;
  }

  MapElement.prototype.isImpassable = function() {
    return 1;
  };

  MapElement.prototype.setItem = function(item) {
    this.item = item;
    this.parentNode.addChild(this.item);
    this.item.x = this.x;
    return this.item.y = this.y;
  };

  MapElement.prototype.onride = function(player) {
    if (this.item) {
      player.addItem(this.item);
      this.item.parentNode.removeChild(this.item);
      return this.item = null;
    }
  };

  return MapElement;

})(Sprite);

BlockElement = (function(_super) {
  __extends(BlockElement, _super);

  BlockElement.ID = 4;

  function BlockElement(x, y) {
    BlockElement.__super__.constructor.call(this, BlockElement.ID, x, y);
  }

  BlockElement.prototype.isImpassable = function() {
    return 1;
  };

  return BlockElement;

})(MapElement);

RoadElement = (function(_super) {
  __extends(RoadElement, _super);

  RoadElement.ID = 0;

  function RoadElement(x, y) {
    RoadElement.__super__.constructor.call(this, RoadElement.ID, x, y);
  }

  RoadElement.prototype.isImpassable = function() {
    return 0;
  };

  return RoadElement;

})(MapElement);

StartElement = (function(_super) {
  __extends(StartElement, _super);

  StartElement.ID = 14;

  function StartElement(x, y) {
    StartElement.__super__.constructor.call(this, StartElement.ID, x, y);
  }

  StartElement.prototype.isImpassable = function() {
    return 0;
  };

  return StartElement;

})(MapElement);

GoalElement = (function(_super) {
  __extends(GoalElement, _super);

  GoalElement.ID = 13;

  function GoalElement(x, y) {
    GoalElement.__super__.constructor.call(this, GoalElement.ID, x, y);
  }

  GoalElement.prototype.isImpassable = function() {
    return 0;
  };

  GoalElement.prototype.onride = function(player) {
    GoalElement.__super__.onride.apply(this, arguments);
    return player.dispatchEvent(new MazeEvent('goal'));
  };

  return GoalElement;

})(MapElement);

TreasureElement = (function(_super) {
  __extends(TreasureElement, _super);

  TreasureElement.ID = 25;

  function TreasureElement(x, y) {
    TreasureElement.__super__.constructor.call(this, TreasureElement.ID, x, y);
  }

  TreasureElement.prototype.isImpassable = function() {
    return 0;
  };

  TreasureElement.prototype.affect = function(player) {
    return player.addItem(new Key);
  };

  return TreasureElement;

})(MapElement);

ElementFactory = (function() {
  function ElementFactory() {}

  ElementFactory.create = function(id, x, y) {
    var ret;
    switch (id) {
      case RoadElement.ID:
        ret = new RoadElement(x, y);
        break;
      case BlockElement.ID:
        ret = new BlockElement(x, y);
        break;
      case StartElement.ID:
        ret = new StartElement(x, y);
        break;
      case GoalElement.ID:
        ret = new GoalElement(x, y);
        break;
      case TreasureElement.ID:
        ret = new TreasureElement(x, y);
    }
    return ret;
  };

  return ElementFactory;

})();
