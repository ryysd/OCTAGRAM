// Generated by CoffeeScript 1.6.3
var Footer, MsgBox, R,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

R = Config.R;

MsgBox = (function(_super) {
  var MsgWindow;

  __extends(MsgBox, _super);

  MsgBox.WIDTH = 544;

  MsgBox.HEIGHT = 128;

  /*
   inner class
  */


  MsgWindow = (function(_super1) {
    __extends(MsgWindow, _super1);

    MsgWindow.WIDTH = 544;

    MsgWindow.HEIGHT = 128;

    function MsgWindow(x, y) {
      MsgWindow.__super__.constructor.call(this, MsgWindow.WIDTH, MsgWindow.HEIGHT);
      this.x = x;
      this.y = y;
      this.image = Game.instance.assets[R.BACKGROUND_IMAGE.MSGBOX];
    }

    return MsgWindow;

  })(ViewSprite);

  function MsgBox(x, y) {
    MsgBox.__super__.constructor.call(this, MsgWindow.WIDTH, MsgWindow.HEIGHT);
    this.x = x;
    this.y = y;
    this.window = new MsgWindow(0, 0);
    this.addChild(this.window);
    this.label = new Label;
    this.label.font = "16px 'Meiryo UI'";
    this.label.color = '#FFF';
    this.label.x = 10;
    this.label.y = 30;
    this.addChild(this.label);
    this.label.width = MsgWindow.WIDTH * 0.9;
  }

  MsgBox.prototype.initEvent = function(world) {
    var _this = this;
    world.player.addEventListener('move', function(evt) {
      var player, point;
      player = evt.target;
      point = evt.params;
      if (point !== false) {
        return _this.print(R.String.move(player.name, point.x + 1, point.y + 1) + R.String.state(player.hp, player.energy));
      } else {
        return _this.print(R.String.CANNOTMOVE);
      }
    });
    world.player.addEventListener('shot', function(evt) {
      var player, ret;
      player = evt.target;
      ret = evt.params;
      if (ret !== false) {
        return _this.print(R.String.shot(player.name) + R.String.state(player.hp, player.energy));
      } else {
        return _this.print(R.String.CANNOTSHOT);
      }
    });
    return world.player.addObserver("hp", function(hp) {
      if (hp <= 0) {
        return _this.print(R.String.die(world.player.name));
      }
    });
  };

  MsgBox.prototype.print = function(msg) {
    return this.label.text = "" + msg;
  };

  return MsgBox;

}).call(this, ViewGroup);

Footer = (function(_super) {
  __extends(Footer, _super);

  function Footer(x, y) {
    Footer.__super__.constructor.apply(this, arguments);
    this.x = x;
    this.y = y;
    this.addView(new MsgBox(20, 0));
  }

  return Footer;

})(ViewGroup);
