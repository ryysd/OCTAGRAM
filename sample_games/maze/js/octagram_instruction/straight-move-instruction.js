// Generated by CoffeeScript 1.6.3
var StraightMoveInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StraightMoveInstruction = (function(_super) {
  __extends(StraightMoveInstruction, _super);

  /*
     StraightMove Instruction
  */


  function StraightMoveInstruction(player) {
    this.player = player;
    StraightMoveInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.icon = new Icon(Game.instance.assets[R.TIP.ARROW], 32, 32);
  }

  StraightMoveInstruction.prototype.action = function() {
    var ret,
      _this = this;
    ret = false;
    ret = this.player.move(function() {
      return _this.onComplete();
    });
    return this.setAsynchronous(ret !== false);
  };

  StraightMoveInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new StraightMoveInstruction(this.player));
    return obj;
  };

  StraightMoveInstruction.prototype.mkDescription = function() {
    return "現在向いている方の目の前のマスに移動します";
  };

  StraightMoveInstruction.prototype.getIcon = function() {
    this.icon.frame = 0;
    return this.icon;
  };

  return StraightMoveInstruction;

})(ActionInstruction);
