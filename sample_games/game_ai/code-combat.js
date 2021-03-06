// mt.js 0.2.4 (2005-12-23)

/*

Mersenne Twister in JavaScript based on "mt19937ar.c"

 * JavaScript version by Magicant: Copyright (C) 2005 Magicant


 * Original C version by Makoto Matsumoto and Takuji Nishimura
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/mt.html

Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

  1. Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in the
     documentation and/or other materials provided with the distribution.

  3. The names of its contributors may not be used to endorse or promote 
     products derived from this software without specific prior written 
     permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/


// Methods whose name starts with "_" are private methods.
// Don't call them externally!


/**
 * Constructor: MersenneTwister([integer/Array<integer> seed])
 * initializes the object with the given seed.
 * The seed may be an integer or an array of integers.
 * If the seed is not given, the object will be initialized with the current
 * time: new Date().getTime().
 * See also: setSeed(seed).
 */
function MersenneTwister(seed) {
	if (arguments.length == 0)
		seed = new Date().getTime();
	
	this._mt = new Array(624);
	this.setSeed(seed);
}

/** multiplies two uint32 values and returns a uint32 result. */
MersenneTwister._mulUint32 = function(a, b) {
	var a1 = a >>> 16, a2 = a & 0xffff;
	var b1 = b >>> 16, b2 = b & 0xffff;
	return (((a1 * b2 + a2 * b1) << 16) + a2 * b2) >>> 0;
};

/** returns ceil(value) if value is finite number, otherwise 0. */
MersenneTwister._toNumber = function(x) {
	return (typeof x == "number" && !isNaN(x)) ? Math.ceil(x) : 0;
};

/**
 * Method: setSeed(integer/Array<integer> seed)
 * resets the seed. The seed may be an integer or an array of integers.
 * Elements in the seed array that are not numbers will be treated as 0.
 * Numbers that are not integers will be rounded down.
 * The integer(s) should be greater than or equal to 0 and less than 2^32.
 * This method is compatible with init_genrand and init_by_array function of
 * the original C version.
 */
MersenneTwister.prototype.setSeed = function(seed) {
	var mt = this._mt;
	if (typeof seed == "number") {
		mt[0] = seed >>> 0;
		for (var i = 1; i < mt.length; i++) {
			var x = mt[i-1] ^ (mt[i-1] >>> 30);
			mt[i] = MersenneTwister._mulUint32(1812433253, x) + i;
		}
		this._index = mt.length;
	} else if (seed instanceof Array) {
		var i = 1, j = 0;
		this.setSeed(19650218);
		for (var k = Math.max(mt.length, seed.length); k > 0; k--) {
			var x = mt[i-1] ^ (mt[i-1] >>> 30);
			x = MersenneTwister._mulUint32(x, 1664525);
			mt[i] = (mt[i] ^ x) + (seed[j] >>> 0) + j;
			if (++i >= mt.length) {
				mt[0] = mt[mt.length-1];
				i = 1;
			}
			if (++j >= seed.length) {
				j = 0;
			}
		}
		for (var k = mt.length - 1; k > 0; k--) {
			var x = mt[i-1] ^ (mt[i-1] >>> 30);
			x = MersenneTwister._mulUint32(x, 1566083941);
			mt[i] = (mt[i] ^ x) - i;
			if (++i >= mt.length) {
				mt[0] = mt[mt.length-1];
				i = 1;
			}
		}
		mt[0] = 0x80000000;
	} else {
		throw new TypeError("MersenneTwister: illegal seed.");
	}
};

/** returns the next random Uint32 value. */
MersenneTwister.prototype._nextInt = function() {
	var mt = this._mt, value;
	
	if (this._index >= mt.length) {
		var k = 0, N = mt.length, M = 397;
		do {
			value = (mt[k] & 0x80000000) | (mt[k+1] & 0x7fffffff);
			mt[k] = mt[k+M] ^ (value >>> 1) ^ ((value & 1) ? 0x9908b0df : 0);
		} while (++k < N-M);
		do {
			value = (mt[k] & 0x80000000) | (mt[k+1] & 0x7fffffff);
			mt[k] = mt[k+M-N] ^ (value >>> 1) ^ ((value & 1) ? 0x9908b0df : 0);
		} while (++k < N-1);
		value = (mt[N-1] & 0x80000000) | (mt[0] & 0x7fffffff);
		mt[N-1] = mt[M-1] ^ (value >>> 1) ^ ((value & 1) ? 0x9908b0df : 0);
		this._index = 0;
	}
	
	value = mt[this._index++];
	value ^=  value >>> 11;
	value ^= (value <<   7) & 0x9d2c5680;
	value ^= (value <<  15) & 0xefc60000;
	value ^=  value >>> 18;
	return value >>> 0;
};

/**
 * Method: nextInt([[number min,] number max])
 * returns a random integer that is greater than or equal to min and less than
 * max. The value of (max - min) must be positive number less or equal to 2^32.
 * If min is not given or not a number, this method uses 0 for min.
 * If neither of min and max is given or max is out of range, this method
 * uses 2^32 for max.
 * This method is compatible with genrand_int32 function of the original C
 * version for min=0 & max=2^32, but not with genrand_int31 function.
 */
MersenneTwister.prototype.nextInt = function() {
	var min, sup;
	switch (arguments.length) {
	case 0:
		return this._nextInt();
	case 1:
		min = 0;
		sup = MersenneTwister._toNumber(arguments[0]);
		break;
	default:
		min = MersenneTwister._toNumber(arguments[0]);
		sup = MersenneTwister._toNumber(arguments[1]) - min;
		break;
	}
	
	if (!(0 < sup && sup < 0x100000000))
		return this._nextInt() + min;
	if ((sup & (~sup + 1)) == sup)
		return ((sup - 1) & this._nextInt()) + min;
	
	var value;
	do {
		value = this._nextInt();
	} while (sup > 4294967296 - (value - (value %= sup)));
	return value + min;
};

/**
 * Method: next()
 * returns a random number that is greater than or equal to 0 and less than 1.
 * This method is compatible with genrand_res53 function of the original C
 * version.
 */
MersenneTwister.prototype.next = function() {
	var a = this._nextInt() >>> 5, b = this._nextInt() >>> 6;
	return (a * 0x4000000 + b) / 0x20000000000000; 
};

var Config, IS_MOBILE, RobotAIGame;

if (typeof IS_MOBILE === "undefined" || IS_MOBILE === null) {
  IS_MOBILE = false;
} else {
  Environment.Mobile = true;
}

(function() {
  var classes, cls, _i, _len, _results;
  classes = [enchant.model.SpriteModel, enchant.model.GroupModel];
  _results = [];
  for (_i = 0, _len = classes.length; _i < _len; _i++) {
    cls = classes[_i];
    cls.prototype.__constructor = cls.prototype.constructor;
    _results.push(cls.prototype.constructor = function() {
      if (this.properties == null) {
        this.properties = {};
      }
      Object.defineProperties(this, this.properties);
      return this.__constructor.apply(this, arguments);
    });
  }
  return _results;
})();

RobotAIGame = (function() {
  function RobotAIGame() {}

  RobotAIGame.END = {
    KILL: 1,
    TIMERT: 2
  };

  return RobotAIGame;

})();

Config = (function() {
  function Config() {}

  Config.GAME_WIDTH = 640;

  Config.GAME_HEIGHT = 640;

  Config.GAME_OFFSET_X = 0;

  Config.GAME_OFFSET_Y = 0;

  Config.IS_MOBILE = IS_MOBILE;

  Config.EDITOR_MOBILE_SCALE_X = 0.2;

  Config.EDITOR_MOBILE_SCALE_Y = 0.2;

  Config.EDITOR_MOBILE_OFFSET_X = 640 - 128;

  Config.EDITOR_MOBILE_OFFSET_Y = 640 - 128;

  Config.OCTAGRAM_DIR = (typeof UserConfig !== "undefined" && UserConfig !== null) ? UserConfig.OCTAGRAM_DIR : "./js/octagram";

  return Config;

})();

Config.R = (function() {
  function R() {}

  R.RESOURCE_DIR = (typeof UserConfig !== "undefined" && UserConfig !== null) && (UserConfig.R != null) ? UserConfig.R.RESOURCE_DIR : "resources";

  R.CHAR = {
    PLAYER: "" + R.RESOURCE_DIR + "/robot/player.png",
    ENEMY: "" + R.RESOURCE_DIR + "/robot/enemy.png"
  };

  R.BACKGROUND_IMAGE = {
    SPACE: "" + R.RESOURCE_DIR + "/background/background_space.png",
    HEADER: "" + R.RESOURCE_DIR + "/background/header.png",
    HP_RED: "" + R.RESOURCE_DIR + "/background/hp_red.png",
    HP_GREEN: "" + R.RESOURCE_DIR + "/background/hp_green.png",
    TIMER: "" + R.RESOURCE_DIR + "/background/timer.png",
    HP_ENCLOSE: "" + R.RESOURCE_DIR + "/background/hpenclose.png",
    ENERGY: "" + R.RESOURCE_DIR + "/background/energy.png",
    PLATE: "" + R.RESOURCE_DIR + "/background/plate.png",
    PLATE_OVERLAY: "" + R.RESOURCE_DIR + "/background/plate_overlay.png",
    PLATE_ENERGY: "" + R.RESOURCE_DIR + "/background/plate_energy.png",
    MSGBOX: "" + R.RESOURCE_DIR + "/background/msgbox.png"
  };

  R.UI = {
    FONT0: "" + R.RESOURCE_DIR + "/ui/font0.png",
    ICON0: "" + R.RESOURCE_DIR + "/ui/icon0.png",
    PAD: "" + R.RESOURCE_DIR + "/ui/pad.png",
    APAD: "" + R.RESOURCE_DIR + "/ui/apad.png"
  };

  R.EFFECT = {
    EXPLOSION: "" + R.RESOURCE_DIR + "/effect/explosion_64x64.png",
    SHOT: "" + R.RESOURCE_DIR + "/effect/shot_player.png",
    SPOT_NORMAL: "" + R.RESOURCE_DIR + "/effect/spot_normal.png",
    SPOT_WIDE: "" + R.RESOURCE_DIR + "/effect/spot_wide.png",
    SPOT_DUAL: "" + R.RESOURCE_DIR + "/effect/spot_dual.png",
    ENPOWER_NORMAL: "" + R.RESOURCE_DIR + "/effect/enpower_normal.png",
    ENPOWER_WIDE: "" + R.RESOURCE_DIR + "/effect/enpower_wide.png",
    ENPOWER_DUAL: "" + R.RESOURCE_DIR + "/effect/enpower_dual.png"
  };

  R.BULLET = {
    ENEMY: "" + R.RESOURCE_DIR + "/bullet/bullet1.png",
    NORMAL: "" + R.RESOURCE_DIR + "/bullet/normal.png",
    WIDE: "" + R.RESOURCE_DIR + "/bullet/wide.png",
    DUAL: "" + R.RESOURCE_DIR + "/bullet/dual.png"
  };

  R.ITEM = {
    NORMAL_BULLET: "" + R.RESOURCE_DIR + "/item/normal_bullet_item.png",
    WIDE_BULLET: "" + R.RESOURCE_DIR + "/item/wide_bullet_item.png",
    DUAL_BULLET: "" + R.RESOURCE_DIR + "/item/dual_bullet_item.png",
    STATUS_BULLET: "" + R.RESOURCE_DIR + "/item/status_bullet.png"
  };

  R.TIP = {
    ARROW: "" + R.RESOURCE_DIR + "/tip/arrow.png",
    LIFE: "" + R.RESOURCE_DIR + "/tip/life.png",
    PICKUP_BULLET: "" + R.RESOURCE_DIR + "/tip/plus_bullet.png",
    SHOT_BULLET: "" + R.RESOURCE_DIR + "/tip/shot_bullet.png",
    SEARCH_BARRIER: "" + R.RESOURCE_DIR + "/tip/search_barrier.png",
    SEARCH_ENEMY: "" + R.RESOURCE_DIR + "/tip/search_enemy.png",
    CURRENT_DIRECT: "" + R.RESOURCE_DIR + "/tip/arrow.png",
    REST_BULLET: "" + R.RESOURCE_DIR + "/tip/rest_bullet.png",
    RANDOM_MOVE: "" + R.RESOURCE_DIR + "/tip/random_move.png",
    MOVE_TO_ENEMY: "" + R.RESOURCE_DIR + "/tip/move_to_enemy.png",
    MOVE_FROM_ENEMY: "" + R.RESOURCE_DIR + "/tip/move_from_enemy.png",
    ENERGY: "" + R.RESOURCE_DIR + "/tip/energy.png",
    REST_ENERGY_PLAYER: "" + R.RESOURCE_DIR + "/tip/rest_energy_player.png",
    REST_ENERGY_ENEMY: "" + R.RESOURCE_DIR + "/tip/rest_energy_enemy.png",
    DISTANCE: "" + R.RESOURCE_DIR + "/tip/distance.png"
  };

  return R;

})();

Config.Frame = (function() {
  var setAllFrame;

  function Frame() {}

  Frame.DIAMETER = 1;

  setAllFrame = function() {
    Frame.ROBOT_MOVE = 12 / Frame.DIAMETER;
    Frame.ROBOT_HIGH_SEEPD_MOVE = 8 / Frame.DIAMETER;
    Frame.ROBOT_WAIT = 8 / Frame.DIAMETER;
    Frame.ROBOT_TURN = 8 / Frame.DIAMETER;
    Frame.ROBOT_SUPPLY = 80 / Frame.DIAMETER;
    Frame.BULLET = 20 / Frame.DIAMETER;
    Frame.NATURAL_MAP_ENERGY_RECAVERY = 100 / Frame.DIAMETER;
    Frame.NATURAL_ROBOT_ENERGY_RECAVERY = 192 / Frame.DIAMETER;
    return Frame.GAME_TIMER_CLOCK = 28 / Frame.DIAMETER;
  };

  setAllFrame();

  Frame.setGameSpeed = function(diameter) {
    if (diameter == null) {
      diameter = 1;
    }
    if ((0 < diameter && diameter <= 4) && diameter % 2 === 0) {
      Config.Frame.DIAMETER = diameter;
    }
    if (diameter === 1) {
      Config.Frame.DIAMETER = 1;
    }
    setAllFrame();
    return diameter;
  };

  return Frame;

})();

Config.Energy = (function() {
  function Energy() {}

  Energy.MOVE = 8;

  Energy.HIGH_SEEPD_MOVE = 14;

  Energy.APPROACH = 10;

  Energy.LEAVE = 10;

  Energy.SHOT = 50;

  Energy.TURN = 8;

  return Energy;

})();

Config.R.String = (function() {
  function String() {}

  String.PLAYER = "プレイヤー";

  String.ENEMY = "エネミー";

  String.CANNOTMOVE = "移動できません。";

  String.CANNOTSHOT = "弾切れです。";

  String.CANNOTPICKUP = "弾を補充できません。";

  String.pickup = function(s) {
    return "" + s + "は弾を一つ補充しました。";
  };

  String.shot = function(s) {
    return "" + s + "は攻撃しました。";
  };

  String.turn = function(s) {
    return "" + s + "は敵をサーチしています。";
  };

  String.move = function(s, x, y) {
    return "" + s + "は(" + x + "," + y + ")に移動しました。";
  };

  String.supply = function(s, e) {
    return "" + s + "は" + e + "エネルギー補給しました。";
  };

  String.state = function(h, e) {
    return "(HP: " + h + ", エネルギー: " + e + ")";
  };

  String.die = function(s) {
    return "" + s + "はHPが0になりました。";
  };

  String.timelimit = function(s) {
    return "タイムアップで" + s + "は判定負けとなります。";
  };

  String.win = function(s) {
    return "" + s + "の勝利になります。";
  };

  return String;

})();

// Generated by CoffeeScript 1.6.3
var Direct, Point, RobotEvent, Stack, Util, toi,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

toi = function(i) {
  return parseInt(i);
};

RobotEvent = (function(_super) {
  __extends(RobotEvent, _super);

  function RobotEvent(type, params) {
    this.params = params != null ? params : {};
    RobotEvent.__super__.constructor.call(this, type);
  }

  return RobotEvent;

})(enchant.Event);

Direct = (function() {
  var bit, _direct_len, _directs;

  function Direct() {}

  bit = 1;

  Direct.NONE = 0;

  Direct.LEFT = bit << 0;

  Direct.RIGHT = bit << 1;

  Direct.UP = bit << 2;

  Direct.DOWN = bit << 3;

  _directs = [Direct.RIGHT, Direct.RIGHT | Direct.DOWN, Direct.LEFT | Direct.DOWN, Direct.LEFT, Direct.LEFT | Direct.UP, Direct.RIGHT | Direct.UP];

  _direct_len = _directs.length;

  Direct.each = function(func) {
    var i, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = _directs.length; _i < _len; _i++) {
      i = _directs[_i];
      _results.push(func(i));
    }
    return _results;
  };

  Direct.next = function(direct) {
    var i, v, _i, _len;
    for (i = _i = 0, _len = _directs.length; _i < _len; i = ++_i) {
      v = _directs[i];
      if (v === direct) {
        return _directs[(i + 1) % _direct_len];
      }
    }
    return direct;
  };

  Direct.prev = function(direct) {
    var i, v, _i, _len;
    for (i = _i = 0, _len = _directs.length; _i < _len; i = ++_i) {
      v = _directs[i];
      if (v === direct) {
        return _directs[(i + _direct_len - 1) % _direct_len];
      }
    }
    return direct;
  };

  return Direct;

})();

Point = (function() {
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  Point.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  Point.prototype.sub = function(point) {
    this.x -= point.x;
    this.y -= point.y;
    return this;
  };

  Point.prototype.add = function(point) {
    this.x += point.x;
    this.y += point.y;
    return this;
  };

  return Point;

})();

Util = (function() {
  function Util() {}

  Util.toMillisec = function(frame) {
    return frame * 1000 / Game.instance.fps;
  };

  Util.includedAngle = function(vec1, vec2) {
    var dot, len1, len2, tmp;
    tmp = 1;
    if ((vec1.y * vec2.x - vec1.x * vec2.y) < 0) {
      tmp *= -1;
    }
    dot = vec1.x * vec2.x + vec1.y * vec2.y;
    len1 = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
    len2 = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
    return tmp * Math.acos(dot / (len1 * len2));
  };

  Util.lengthPointToPoint = function(p1, p2) {
    var x, y;
    x = Math.abs(p1.x - p2.x);
    y = Math.abs(p1.y - p2.y);
    return Math.sqrt(x * x + y * y);
  };

  Util.toDeg = function(r) {
    return r * 180.0 / (Math.atan(1.0) * 4.0);
  };

  Util.toRad = function(deg) {
    return deg * Math.PI / 180;
  };

  Util.toCartesianCoordinates = function(r, rad) {
    return new Point(r * Math.cos(rad), r * Math.sin(rad));
  };

  Util.dispatchEvent = function(name, hash) {
    var evt, k, v;
    evt = document.createEvent('UIEvent', false);
    evt.initUIEvent(name, true, true);
    for (k in hash) {
      v = hash[k];
      evt[k] = v;
    }
    return document.dispatchEvent(evt);
  };

  return Util;

})();

Stack = (function() {
  function Stack(maxSize) {
    this.maxSize = maxSize;
    this.s = [];
  }

  Stack.prototype.push = function(item) {
    if (this.maxSize >= this.s.length) {
      return this.s.push(item);
    }
  };

  Stack.prototype.pop = function() {
    if (this.s.length > 0) {
      return this.s.pop();
    }
  };

  Stack.prototype.size = function() {
    return this.s.length;
  };

  return Stack;

})();

// Generated by CoffeeScript 1.6.3
var DEBUG, Debug;

DEBUG = true;

Debug = (function() {
  function Debug() {}

  Debug.log = function(obj) {
    return DEBUG && console.log("[AIGame Log]" + obj);
  };

  Debug.dump = function(obj) {
    return DEBUG && console.log(obj);
  };

  return Debug;

})();

var DualEnpowerEffect, Effect, EnpowerEffect, Explosion, NormalEnpowerEffect, R, ShotEffect, SpotDualEffect, SpotEffect, SpotNormalEffect, SpotWideEffect, WideEnpowerEffect,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

R = Config.R;

Effect = (function(_super) {
  __extends(Effect, _super);

  function Effect(w, h, endFrame, step) {
    this.endFrame = endFrame;
    this.step = step;
    Effect.__super__.constructor.call(this, w, h);
    this.frame = 0;
  }

  Effect.prototype.onenterframe = function() {
    if (this.age % this.step === 0) {
      this.frame += 1;
      if (this.frame > this.endFrame) {
        return this.parentNode.removeChild(this);
      }
    }
  };

  return Effect;

})(Sprite);

Explosion = (function(_super) {
  __extends(Explosion, _super);

  Explosion.SIZE = 64;

  function Explosion(x, y) {
    Explosion.__super__.constructor.call(this, Explosion.SIZE, Explosion.SIZE, 24, 1);
    this.image = Game.instance.assets[R.EFFECT.EXPLOSION];
    this.x = x;
    this.y = y;
  }

  return Explosion;

})(Effect);

ShotEffect = (function(_super) {
  __extends(ShotEffect, _super);

  ShotEffect.SIZE = 64;

  function ShotEffect(x, y) {
    ShotEffect.__super__.constructor.call(this, Explosion.SIZE, Explosion.SIZE, 16, 1);
    this.image = Game.instance.assets[R.EFFECT.SHOT];
    this.x = x;
    this.y = y;
  }

  return ShotEffect;

})(Effect);

SpotEffect = (function(_super) {
  __extends(SpotEffect, _super);

  SpotEffect.SIZE = 64;

  function SpotEffect(x, y, image) {
    SpotEffect.__super__.constructor.call(this, SpotEffect.SIZE, SpotEffect.SIZE, 10, 3);
    this.image = Game.instance.assets[image];
    this.x = x;
    this.y = y;
  }

  SpotEffect.prototype.onenterframe = function() {
    if (this.age % this.step === 0) {
      this.frame += 1;
      if (this.frame > this.endFrame) {
        return this.frame = 0;
      }
    }
  };

  return SpotEffect;

})(Effect);

SpotNormalEffect = (function(_super) {
  __extends(SpotNormalEffect, _super);

  function SpotNormalEffect(x, y) {
    SpotNormalEffect.__super__.constructor.call(this, x, y, R.EFFECT.SPOT_NORMAL);
  }

  return SpotNormalEffect;

})(SpotEffect);

SpotWideEffect = (function(_super) {
  __extends(SpotWideEffect, _super);

  function SpotWideEffect(x, y) {
    SpotWideEffect.__super__.constructor.call(this, x, y, R.EFFECT.SPOT_WIDE);
  }

  return SpotWideEffect;

})(SpotEffect);

SpotDualEffect = (function(_super) {
  __extends(SpotDualEffect, _super);

  function SpotDualEffect(x, y) {
    SpotDualEffect.__super__.constructor.call(this, x, y, R.EFFECT.SPOT_DUAL);
  }

  return SpotDualEffect;

})(SpotEffect);

EnpowerEffect = (function(_super) {
  __extends(EnpowerEffect, _super);

  EnpowerEffect.SIZE = 128;

  function EnpowerEffect(x, y, image) {
    EnpowerEffect.__super__.constructor.call(this, EnpowerEffect.SIZE, EnpowerEffect.SIZE, 10, 2);
    this.image = Game.instance.assets[image];
    this.x = x - EnpowerEffect.SIZE * 0.25;
    this.y = y - EnpowerEffect.SIZE * 0.25;
  }

  return EnpowerEffect;

})(Effect);

NormalEnpowerEffect = (function(_super) {
  __extends(NormalEnpowerEffect, _super);

  function NormalEnpowerEffect(x, y) {
    NormalEnpowerEffect.__super__.constructor.call(this, x, y, R.EFFECT.ENPOWER_NORMAL);
  }

  return NormalEnpowerEffect;

})(EnpowerEffect);

WideEnpowerEffect = (function(_super) {
  __extends(WideEnpowerEffect, _super);

  function WideEnpowerEffect(x, y) {
    WideEnpowerEffect.__super__.constructor.call(this, x, y, R.EFFECT.ENPOWER_WIDE);
  }

  return WideEnpowerEffect;

})(EnpowerEffect);

DualEnpowerEffect = (function(_super) {
  __extends(DualEnpowerEffect, _super);

  function DualEnpowerEffect(x, y) {
    DualEnpowerEffect.__super__.constructor.call(this, x, y, R.EFFECT.ENPOWER_DUAL);
  }

  return DualEnpowerEffect;

})(EnpowerEffect);

var Bullet, BulletFactory, BulletGroup, BulletType, DualBullet, DualBulletPart, NormalBullet, SpritePool, WideBullet, WideBulletPart,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SpritePool = (function() {
  function SpritePool(createFunc, maxAllocSize, maxPoolSize) {
    this.createFunc = createFunc;
    this.maxAllocSize = maxAllocSize;
    this.maxPoolSize = maxPoolSize;
    this.sprites = [];
    this.count = 0;
    this.freeCallback = null;
  }

  SpritePool.prototype.setDestructor = function(destructor) {
    this.destructor = destructor;
  };

  SpritePool.prototype.alloc = function() {
    var sprite;
    if (this.count > this.maxAllocSize) {
      return null;
    }
    if (this.sprites.length === 0) {
      sprite = this.createFunc();
    } else {
      sprite = this.sprites.pop();
    }
    this.count++;
    return sprite;
  };

  SpritePool.prototype.free = function(sprite) {
    if (this.sprites.length < this.maxPoolSize) {
      this.sprites[this.sprites.length] = sprite;
    }
    this.count--;
    if (this.destructor != null) {
      return this.destructor(sprite);
    }
  };

  return SpritePool;

})();

BulletFactory = (function() {
  function BulletFactory() {}

  BulletFactory.create = function(type, robot) {
    var bullet;
    bullet = null;
    switch (type) {
      case BulletType.NORMAL:
        bullet = new NormalBullet();
        break;
      case BulletType.WIDE:
        bullet = new WideBullet();
        break;
      case BulletType.DUAL:
        bullet = new DualBullet();
        break;
      default:
        return false;
    }
    bullet.holder = robot;
    return bullet;
  };

  return BulletFactory;

})();

BulletType = (function() {
  function BulletType() {}

  BulletType.NORMAL = 1;

  BulletType.WIDE = 2;

  BulletType.DUAL = 3;

  return BulletType;

})();

Bullet = (function(_super) {
  __extends(Bullet, _super);

  function Bullet(w, h, type, maxFrame) {
    this.type = type;
    this.maxFrame = maxFrame != null ? maxFrame : Config.Frame.BULLET;
    this.onDestroy = __bind(this.onDestroy, this);
    Bullet.__super__.constructor.call(this, w, h);
    this.rotate(90);
  }

  Bullet.prototype._getRotate = function(direct) {};

  Bullet.prototype.shot = function(x, y, direct) {
    this.x = x;
    this.y = y;
    this.direct = direct != null ? direct : Direct.RIGHT;
    return RobotWorld.instance.bullets.push(this);
  };

  Bullet.prototype.setOnDestoryEvent = function(event) {
    this.event = event;
  };

  Bullet.prototype.hit = function(robot) {
    var explosion;
    robot.damege();
    explosion = new Explosion(robot.x, robot.y);
    this.scene.addChild(explosion);
    return this.onDestroy();
  };

  Bullet.prototype.onDestroy = function() {
    if (this.animated) {
      if (this.event != null) {
        this.event(this);
      }
      this.animated = false;
      return this.parentNode.removeChild(this);
    }
  };

  Bullet.prototype.withinRange = function(offset, target, direct) {
    var i, point, rotate, _i, _ref;
    if (direct == null) {
      direct = Direct.RIGHT;
    }
    rotate = this._getRotate(direct);
    for (i = _i = 1, _ref = this.length; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      point = Util.toCartesianCoordinates(68 * i, Util.toRad(rotate));
      point.x = toi(point.x) + offset.x;
      point.y = toi(point.y) + offset.y;
      if (Util.lengthPointToPoint(point, target) <= 32) {
        return true;
      }
    }
    return false;
  };

  return Bullet;

})(Sprite);

/*
  grouping Bullet Class
  behave like Bullet Class
*/


BulletGroup = (function(_super) {
  __extends(BulletGroup, _super);

  function BulletGroup(type, maxFrame) {
    var _this = this;
    this.type = type;
    this.maxFrame = maxFrame;
    this.onDestroy = __bind(this.onDestroy, this);
    BulletGroup.__super__.constructor.apply(this, arguments);
    this.bullets = [];
    Object.defineProperty(this, "animated", {
      get: function() {
        var animated, i, _i, _len, _ref;
        animated = true;
        _ref = _this.bullets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          animated = animated && i.animated;
        }
        return animated;
      }
    });
    Object.defineProperty(this, "holder", {
      get: function() {
        return _this.bullets[0].holder;
      },
      set: function(robot) {
        var v, _i, _len, _ref, _results;
        _ref = _this.bullets;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          _results.push(v.holder = robot);
        }
        return _results;
      }
    });
  }

  BulletGroup.prototype.shot = function(x, y, direct) {
    var i, _i, _len, _ref, _results;
    if (direct == null) {
      direct = Direct.RIGHT;
    }
    _ref = this.bullets;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      _results.push(i.shot(x, y, direct));
    }
    return _results;
  };

  BulletGroup.prototype.setOnDestoryEvent = function(event) {
    this.event = event;
  };

  BulletGroup.prototype.hit = function(robot) {
    var explosion;
    robot.damege();
    explosion = new Explosion(robot.x, robot.y);
    this.scene.addChild(explosion);
    return this.onDestroy();
  };

  BulletGroup.prototype.within = function(s, value) {
    var animated, i, _i, _len, _ref;
    _ref = this.bullets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      animated = i.within(s, value);
      if (animated === true) {
        return true;
      }
    }
    return false;
  };

  BulletGroup.prototype.onDestroy = function() {
    var i, _i, _len, _ref, _results;
    if (this.animated === true) {
      if (this.event != null) {
        this.event(this);
      }
      _ref = this.bullets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(i.onDestroy());
      }
      return _results;
    }
  };

  BulletGroup.prototype.withinRange = function(offset, target, direct) {
    var i, _i, _len, _ref;
    if (direct == null) {
      direct = Direct.RIGHT;
    }
    _ref = this.bullets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      if (i.withinRange(offset, target, direct) === true) {
        return true;
      }
    }
    return false;
  };

  return BulletGroup;

})(Group);

/*
  straight forward 2 plates
*/


NormalBullet = (function(_super) {
  __extends(NormalBullet, _super);

  NormalBullet.WIDTH = 64;

  NormalBullet.HEIGHT = 64;

  function NormalBullet() {
    this.length = 4;
    NormalBullet.__super__.constructor.call(this, NormalBullet.WIDTH, NormalBullet.HEIGHT, BulletType.NORMAL);
    this.image = Game.instance.assets[R.BULLET.NORMAL];
  }

  NormalBullet.prototype._getRotate = function(direct) {
    var rotate;
    rotate = 0;
    if ((direct & Direct.LEFT) !== 0) {
      rotate += 180;
    }
    if ((direct & Direct.UP) !== 0) {
      if ((direct & Direct.LEFT) !== 0) {
        rotate += 60;
      } else {
        rotate -= 60;
      }
    } else if ((direct & Direct.DOWN) !== 0) {
      if ((direct & Direct.LEFT) !== 0) {
        rotate -= 60;
      } else {
        rotate += 60;
      }
    }
    return rotate;
  };

  NormalBullet.prototype.shot = function(x, y, direct) {
    var point, rotate;
    this.x = x;
    this.y = y;
    this.direct = direct != null ? direct : Direct.RIGHT;
    NormalBullet.__super__.shot.call(this, this.x, this.y, this.direct);
    this.animated = true;
    if (this._rorateDeg != null) {
      this.rotate(-this._rorateDeg);
    }
    rotate = this._getRotate(this.direct);
    this.rotate(rotate);
    this._rorateDeg = rotate;
    point = Util.toCartesianCoordinates(68 * this.length, Util.toRad(rotate));
    return this.tl.fadeOut(this.maxFrame).and().moveBy(toi(point.x), toi(point.y), this.maxFrame).then(function() {
      return this.onDestroy();
    });
  };

  return NormalBullet;

})(Bullet);

/*
  spread in 2 directions`
*/


WideBulletPart = (function(_super) {
  __extends(WideBulletPart, _super);

  WideBulletPart.WIDTH = 64;

  WideBulletPart.HEIGHT = 64;

  WideBulletPart.MAX_FRAME = 20;

  function WideBulletPart(parent, left) {
    this.parent = parent;
    this.left = left != null ? left : true;
    WideBulletPart.__super__.constructor.call(this, WideBulletPart.WIDTH, WideBulletPart.HEIGHT, BulletType.WIDE, WideBulletPart.MAX_FRAME);
    this.length = 2;
    this.image = Game.instance.assets[R.BULLET.WIDE];
    this.frame = 1;
  }

  WideBulletPart.prototype._getRotate = function(direct) {
    var rotate;
    rotate = 0;
    if ((direct & Direct.LEFT) !== 0) {
      rotate += 180;
    }
    if ((direct & Direct.UP) !== 0) {
      if ((direct & Direct.LEFT) !== 0) {
        rotate += 60;
      } else {
        rotate -= 60;
      }
    } else if ((direct & Direct.DOWN) !== 0) {
      if ((direct & Direct.LEFT) !== 0) {
        rotate -= 60;
      } else {
        rotate += 60;
      }
    }
    if (this.left === true) {
      rotate -= 60;
    } else {
      rotate += 60;
    }
    return rotate;
  };

  WideBulletPart.prototype.shot = function(x, y, direct) {
    var point, rotate;
    this.x = x;
    this.y = y;
    this.direct = direct != null ? direct : Direct.RIGHT;
    WideBulletPart.__super__.shot.call(this, this.x, this.y, this.direct);
    this.animated = true;
    if (this._rorateDeg != null) {
      this.rotate(-this._rorateDeg);
    }
    rotate = this._getRotate(this.direct);
    this.rotate(rotate);
    this._rorateDeg = rotate;
    point = Util.toCartesianCoordinates(68 * this.length, Util.toRad(rotate));
    return this.tl.fadeOut(this.maxFrame).and().moveBy(toi(point.x), toi(point.y), this.maxFrame).then(function() {
      return this.parent.onDestroy();
    });
  };

  return WideBulletPart;

})(Bullet);

WideBullet = (function(_super) {
  __extends(WideBullet, _super);

  function WideBullet() {
    var i, _i, _len, _ref;
    WideBullet.__super__.constructor.call(this, BulletType.WIDE, WideBulletPart.MAX_FRAME);
    this.bullets.push(new WideBulletPart(this, true));
    this.bullets.push(new WideBulletPart(this, false));
    _ref = this.bullets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      this.addChild(i);
    }
  }

  return WideBullet;

})(BulletGroup);

DualBulletPart = (function(_super) {
  __extends(DualBulletPart, _super);

  DualBulletPart.WIDTH = 64;

  DualBulletPart.HEIGHT = 64;

  DualBulletPart.MAX_FRAME = 20;

  function DualBulletPart(parent, back) {
    this.parent = parent;
    this.back = back != null ? back : true;
    DualBulletPart.__super__.constructor.call(this, DualBulletPart.WIDTH, DualBulletPart.HEIGHT, BulletType.DUAL, DualBulletPart.MAX_FRAME);
    this.length = 2;
    this.image = Game.instance.assets[R.BULLET.DUAL];
    this.frame = 1;
  }

  DualBulletPart.prototype._getRotate = function(direct) {
    var rotate;
    rotate = 0;
    if ((this.direct & Direct.LEFT) !== 0) {
      rotate += 180;
    }
    if ((this.direct & Direct.UP) !== 0) {
      if ((this.direct & Direct.LEFT) !== 0) {
        rotate += 60;
      } else {
        rotate -= 60;
      }
    } else if ((this.direct & Direct.DOWN) !== 0) {
      if ((this.direct & Direct.LEFT) !== 0) {
        rotate -= 60;
      } else {
        rotate += 60;
      }
    }
    if (this.back === true) {
      rotate += 180;
    }
    return rotate;
  };

  DualBulletPart.prototype.shot = function(x, y, direct) {
    var point, rotate;
    this.x = x;
    this.y = y;
    this.direct = direct != null ? direct : Direct.RIGHT;
    DualBulletPart.__super__.shot.call(this, this.x, this.y, this.direct);
    this.animated = true;
    if (this._rorateDeg != null) {
      this.rotate(-this._rorateDeg);
    }
    rotate = this._getRotate(this.direct);
    this.rotate(rotate);
    this._rorateDeg = rotate;
    point = Util.toCartesianCoordinates(68 * this.length, Util.toRad(rotate));
    return this.tl.moveBy(toi(point.x), toi(point.y), this.maxFrame).then(function() {
      return this.parent.onDestroy();
    });
  };

  return DualBulletPart;

})(Bullet);

DualBullet = (function(_super) {
  __extends(DualBullet, _super);

  function DualBullet() {
    var i, _i, _len, _ref;
    DualBullet.__super__.constructor.call(this, BulletType.DUAL, DualBulletPart.MAX_FRAME);
    this.bullets.push(new DualBulletPart(this, true));
    this.bullets.push(new DualBulletPart(this, false));
    _ref = this.bullets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      this.addChild(i);
    }
  }

  return DualBullet;

})(BulletGroup);

var DualBulletItem, Item, NormalBulletItem, WideBulletItem,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Item = (function(_super) {
  __extends(Item, _super);

  function Item(w, h) {
    this.onComplete = __bind(this.onComplete, this);
    Item.__super__.constructor.call(this, w, h);
    this.animated = true;
    RobotWorld.instance.items.push(this);
  }

  Item.prototype.onComplete = function() {
    if (this.event != null) {
      this.event(this);
    }
    this.animated = false;
    return this.parentNode.removeChild(this);
  };

  Item.prototype.setOnCompleteEvent = function(event) {
    this.event = event;
  };

  return Item;

})(Sprite);

NormalBulletItem = (function(_super) {
  var FRAME;

  __extends(NormalBulletItem, _super);

  NormalBulletItem.SIZE = 64;

  FRAME = 40;

  function NormalBulletItem(x, y) {
    NormalBulletItem.__super__.constructor.call(this, NormalBulletItem.SIZE, NormalBulletItem.SIZE);
    this.x = x;
    this.y = y - 8;
    this.image = Game.instance.assets[R.ITEM.NORMAL_BULLET];
    this.tl.fadeOut(FRAME).and().moveBy(0, -48, FRAME).then(function() {
      return this.onComplete();
    });
  }

  return NormalBulletItem;

})(Item);

WideBulletItem = (function(_super) {
  var FRAME;

  __extends(WideBulletItem, _super);

  WideBulletItem.SIZE = 64;

  FRAME = 40;

  function WideBulletItem(x, y) {
    WideBulletItem.__super__.constructor.call(this, WideBulletItem.SIZE, WideBulletItem.SIZE);
    this.x = x;
    this.y = y - 8;
    this.image = Game.instance.assets[R.ITEM.WIDE_BULLET];
    this.tl.fadeOut(FRAME).and().moveBy(0, -48, FRAME).then(function() {
      return this.onComplete();
    });
  }

  return WideBulletItem;

})(Item);

DualBulletItem = (function(_super) {
  var FRAME;

  __extends(DualBulletItem, _super);

  DualBulletItem.SIZE = 64;

  FRAME = 40;

  function DualBulletItem(x, y) {
    DualBulletItem.__super__.constructor.call(this, DualBulletItem.SIZE, DualBulletItem.SIZE);
    this.x = x;
    this.y = y - 8;
    this.image = Game.instance.assets[R.ITEM.DUAL_BULLET];
    this.tl.fadeOut(FRAME).and().moveBy(0, -48, FRAME).then(function() {
      return this.onComplete();
    });
  }

  return DualBulletItem;

})(Item);

var EnemyRobot, ItemQueue, PlayerRobot, R, Robot,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

R = Config.R;

/*
  store bullet objects
*/


ItemQueue = (function() {
  function ItemQueue(collection, max) {
    this.collection = collection != null ? collection : [];
    this.max = max != null ? max : -1;
  }

  ItemQueue.prototype.enqueue = function(item) {
    if (this.max !== -1 && this.max <= this.collection.length) {
      return false;
    } else {
      this.collection.push(item);
      return true;
    }
  };

  ItemQueue.prototype.dequeue = function(count) {
    var i, ret, _i;
    if (count == null) {
      count = 1;
    }
    ret = [];
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      ret.push(this.collection.shift());
    }
    return ret;
  };

  ItemQueue.prototype.empty = function() {
    return this.collection.length === 0;
  };

  ItemQueue.prototype.index = function(i) {
    return this.collection[i];
  };

  ItemQueue.prototype.size = function() {
    return this.collection.length;
  };

  return ItemQueue;

})();

Robot = (function(_super) {
  var DIRECT_FRAME, FRAME_DIRECT;

  __extends(Robot, _super);

  Robot.MAX_HP = 6;

  Robot.MAX_ENERGY = 240;

  Robot.STEAL_ENERGY_UNIT = 80;

  Robot.MAX_STEAL_ENERGY = 80;

  Robot.TURN_CLOCKWISE = 1;

  Robot.TURN_COUNTERCLOCKWISE = 2;

  DIRECT_FRAME = {};

  DIRECT_FRAME[Direct.NONE] = 0;

  DIRECT_FRAME[Direct.RIGHT] = 0;

  DIRECT_FRAME[Direct.RIGHT | Direct.DOWN] = 5;

  DIRECT_FRAME[Direct.LEFT | Direct.DOWN] = 7;

  DIRECT_FRAME[Direct.LEFT] = 2;

  DIRECT_FRAME[Direct.LEFT | Direct.UP] = 6;

  DIRECT_FRAME[Direct.RIGHT | Direct.UP] = 4;

  FRAME_DIRECT = {};

  FRAME_DIRECT[0] = Direct.RIGHT;

  FRAME_DIRECT[5] = Direct.RIGHT | Direct.DOWN;

  FRAME_DIRECT[7] = Direct.LEFT | Direct.DOWN;

  FRAME_DIRECT[2] = Direct.LEFT;

  FRAME_DIRECT[6] = Direct.LEFT | Direct.UP;

  FRAME_DIRECT[4] = Direct.RIGHT | Direct.UP;

  function Robot(width, height) {
    var plate, pos;
    Robot.__super__.constructor.call(this, width, height);
    this.name = "robot";
    this.setup("hp", Robot.MAX_HP);
    this.setup("energy", Robot.MAX_ENERGY);
    this.plateState = 0;
    this._consumptionEnergy = 0;
    plate = Map.instance.getPlate(0, 0);
    this.prevPlate = this.currentPlate = plate;
    this._animated = false;
    RobotWorld.instance.addChild(this);
    pos = plate.getAbsolutePos();
    this.moveTo(pos.x, pos.y);
  }

  Robot.prototype.properties = {
    direct: {
      get: function() {
        if (FRAME_DIRECT[this.frame] != null) {
          return FRAME_DIRECT[this.frame];
        } else {
          return FRAME_DIRECT[Direct.RIGHT];
        }
      },
      set: function(direct) {
        if (DIRECT_FRAME[direct] != null) {
          return this.frame = DIRECT_FRAME[direct];
        }
      }
    },
    animated: {
      get: function() {
        return this._animated;
      },
      set: function(value) {
        return this._animated = value;
      }
    },
    pos: {
      get: function() {
        return this.currentPlate.pos;
      }
    },
    currentPlateEnergy: {
      get: function() {
        return this.currentPlate.energy;
      }
    },
    consumptionEnergy: {
      get: function() {
        return this._consumptionEnergy;
      }
    }
  };

  Robot.prototype._moveDirect = function(direct, onComplete) {
    var plate, ret,
      _this = this;
    if (onComplete == null) {
      onComplete = function() {};
    }
    plate = Map.instance.getTargetPoision(this.currentPlate, direct);
    this.direct = direct;
    ret = this._move(plate, function() {
      var pos;
      pos = plate.getAbsolutePos();
      _this.prevPlate.dispatchEvent(new RobotEvent('away', {
        robot: _this
      }));
      _this.currentPlate.dispatchEvent(new RobotEvent('ride', {
        robot: _this
      }));
      return _this.tl.moveTo(pos.x, pos.y, Config.Frame.ROBOT_MOVE).then(function() {
        _this.dispatchEvent(new RobotEvent('move', ret));
        return onComplete();
      });
    });
    return ret;
  };

  Robot.prototype._move = function(plate, closure) {
    var pos, ret;
    ret = false;
    this.prevPlate = this.currentPlate;
    if ((plate != null) && plate.lock === false) {
      pos = plate.getAbsolutePos();
      this.currentPlate = plate;
      closure();
      ret = new Point(plate.ix, plate.iy);
    } else {
      ret = false;
    }
    return ret;
  };

  Robot.prototype.directFrame = function(direct) {
    return DIRECT_FRAME[direct];
  };

  Robot.prototype.consumeEnergy = function(value) {
    if (this.energy - value >= 0) {
      this.energy -= value;
      this._consumptionEnergy += value;
      return true;
    } else {
      return false;
    }
  };

  Robot.prototype.supplyEnergy = function(value) {
    if (this.energy + value <= Robot.MAX_ENERGY) {
      this.energy += value;
      return value;
    } else {
      value = Robot.MAX_ENERGY - this.energy;
      this.energy = Robot.MAX_ENERGY;
    }
    return value;
  };

  Robot.prototype.enoughEnergy = function(value) {
    return (this.energy - value) >= 0;
  };

  Robot.prototype.damege = function() {
    this.hp -= 1;
    if (this.hp <= 0) {
      return this.dispatchEvent(new RobotEvent("die", {}));
    }
  };

  Robot.prototype.update = function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.onKeyInput(Game.instance.input);
    if (Robot.MAX_ENERGY > this.energy && this.age % Config.Frame.NATURAL_ROBOT_ENERGY_RECAVERY === 0) {
      this.supplyEnergy(Robot.MAX_ENERGY / 12);
    }
    return true;
  };

  Robot.prototype.onKeyInput = function(input) {};

  Robot.prototype.reset = function(x, y) {
    var plate;
    this.hp = Robot.MAX_HP;
    this.energy = Robot.MAX_ENERGY;
    plate = Map.instance.getPlate(x, y);
    return this.moveImmediately(plate);
  };

  Robot.prototype.move = function(direct, onComplete) {
    var ret;
    if (onComplete == null) {
      onComplete = function() {};
    }
    ret = false;
    if (this.enoughEnergy(Config.Energy.MOVE)) {
      ret = this._moveDirect(direct, onComplete);
      if (ret) {
        this.consumeEnergy(Config.Energy.MOVE);
      }
    }
    return ret;
  };

  Robot.prototype.approach = function(robot, onComplete) {
    var direct, enemyPos, ret, robotPos;
    if (onComplete == null) {
      onComplete = function() {};
    }
    ret = false;
    if (!this.enoughEnergy(Config.Energy.APPROACH)) {
      return ret;
    }
    enemyPos = robot.pos;
    robotPos = this.pos;
    robotPos.sub(enemyPos);
    direct = Direct.NONE;
    if (robotPos.x > 0) {
      direct |= Direct.LEFT;
    } else if (robotPos.x < 0) {
      direct |= Direct.RIGHT;
    }
    if (robotPos.y > 0) {
      direct |= Direct.UP;
      if (robotPos.x === 0) {
        direct |= Direct.RIGHT;
      }
    } else if (robotPos.y < 0) {
      direct |= Direct.DOWN;
      if (robotPos.x === 0) {
        direct |= Direct.LEFT;
      }
    }
    if (direct !== Direct.NONE && direct !== Direct.UP && direct !== Direct.DOWN) {
      ret = this._moveDirect(direct, onComplete);
      if (ret) {
        this.consumeEnergy(Config.Energy.APPROACH);
      }
    }
    return ret;
  };

  Robot.prototype.leave = function(robot, onComplete) {
    var direct, enemyPos, plate, ret, robotPos;
    if (onComplete == null) {
      onComplete = function() {};
    }
    ret = false;
    if (!this.enoughEnergy(Config.Energy.LEAVE)) {
      return ret;
    }
    enemyPos = robot.pos;
    robotPos = this.pos;
    robotPos.sub(enemyPos);
    direct = Direct.NONE;
    if (robotPos.x >= 0) {
      direct |= Direct.RIGHT;
    } else if (robotPos.x < 0) {
      direct |= Direct.LEFT;
    }
    if (robotPos.y >= 0) {
      direct |= Direct.DOWN;
      if (robotPos.x === 0) {
        direct |= Direct.LEFT;
      }
    } else if (robotPos.y < 0) {
      direct |= Direct.UP;
      if (robotPos.x === 0) {
        direct |= Direct.RIGHT;
      }
    }
    if (direct !== Direct.NONE && direct !== Direct.UP && direct !== Direct.DOWN) {
      plate = Map.instance.getTargetPoision(this.currentPlate, direct);
      if (!plate) {
        direct &= ~(Direct.DOWN | Direct.UP);
      }
      ret = this._moveDirect(direct, onComplete);
      if (ret) {
        this.consumeEnergy(Config.Energy.LEAVE);
      }
    }
    return ret;
  };

  Robot.prototype.moveImmediately = function(plate) {
    var ret,
      _this = this;
    ret = this._move(plate, function() {
      var pos;
      pos = plate.getAbsolutePos();
      _this.moveTo(pos.x, pos.y);
      _this.prevPlate.dispatchEvent(new RobotEvent('away', {
        robot: _this
      }));
      return _this.currentPlate.dispatchEvent(new RobotEvent('ride', {
        robot: _this
      }));
    });
    return ret;
  };

  Robot.prototype.shot = function(onComplete) {
    var blt, ret;
    if (onComplete == null) {
      onComplete = function() {};
    }
    ret = false;
    if (this.enoughEnergy(Config.Energy.SHOT)) {
      blt = BulletFactory.create(BulletType.NORMAL, this);
      blt.shot(this.x, this.y, this.direct);
      this.tl.delay(blt.maxFrame).then(onComplete);
      ret = {
        type: BulletType.NORMAL
      };
      this.dispatchEvent(new RobotEvent('shot', ret));
      this.consumeEnergy(Config.Energy.SHOT);
    }
    return ret;
  };

  Robot.prototype.turn = function(rotation, onComplete) {
    var _this = this;
    if (onComplete == null) {
      onComplete = function() {};
    }
    return this.tl.delay(Config.Frame.ROBOT_TURN).then(function() {
      if (rotation === Robot.TURN_CLOCKWISE) {
        _this.direct = Direct.next(_this.direct);
      } else {
        _this.direct = Direct.prev(_this.direct);
      }
      onComplete(_this);
      _this.consumeEnergy(Config.Energy.TURN);
      return _this.dispatchEvent(new RobotEvent('turn', {}));
    });
  };

  Robot.prototype.supply = function(energy, onComplete) {
    var ret,
      _this = this;
    if (onComplete == null) {
      onComplete = function() {};
    }
    if ((0 < energy && energy <= Robot.MAX_STEAL_ENERGY)) {
      this.parentNode.addChild(new NormalEnpowerEffect(this.x, this.y));
      ret = this.supplyEnergy(this.currentPlate.stealEnergy(energy));
      this.dispatchEvent(new RobotEvent('supply', {
        energy: ret
      }));
      return this.tl.delay(Robot.supplyFrame(energy)).then(function() {
        return onComplete(_this);
      });
    }
  };

  Robot.supplyFrame = function(energy) {
    return energy - parseInt((energy - 1) / 10);
  };

  return Robot;

})(SpriteModel);

PlayerRobot = (function(_super) {
  __extends(PlayerRobot, _super);

  PlayerRobot.WIDTH = 64;

  PlayerRobot.HEIGHT = 74;

  PlayerRobot.UPDATE_FRAME = 10;

  function PlayerRobot(parentNode) {
    this.onDebugComplete = __bind(this.onDebugComplete, this);
    PlayerRobot.__super__.constructor.call(this, PlayerRobot.WIDTH, PlayerRobot.HEIGHT, parentNode);
    this.name = R.String.PLAYER;
    this.image = Game.instance.assets[R.CHAR.PLAYER];
    this.plateState = Plate.STATE_PLAYER;
  }

  PlayerRobot.prototype.onKeyInput = function(input) {
    var ret;
    if (this.animated === true) {
      return;
    }
    ret = true;
    if (input.w === true && input.p === true) {
      this.animated = true;
      ret = this.move(Direct.LEFT | Direct.UP, this.onDebugComplete);
    } else if (input.a === true && input.p === true) {
      this.animated = true;
      ret = this.move(Direct.LEFT, this.onDebugComplete);
    } else if (input.x === true && input.p === true) {
      this.animated = true;
      ret = this.move(Direct.LEFT | Direct.DOWN, this.onDebugComplete);
    } else if (input.d === true && input.p === true) {
      this.animated = true;
      ret = this.move(Direct.RIGHT, this.onDebugComplete);
    } else if (input.e === true && input.p === true) {
      this.animated = true;
      ret = this.move(Direct.RIGHT | Direct.UP, this.onDebugComplete);
    } else if (input.c === true && input.p === true) {
      this.animated = true;
      ret = this.move(Direct.RIGHT | Direct.DOWN, this.onDebugComplete);
    } else if (input.q === true && input.n === true) {
      this.animated = true;
      ret = this.shot(this.onDebugComplete);
    }
    if (ret === false) {
      return this.onDebugComplete();
    }
  };

  PlayerRobot.prototype.onDebugComplete = function() {
    return this.animated = false;
  };

  return PlayerRobot;

})(Robot);

EnemyRobot = (function(_super) {
  __extends(EnemyRobot, _super);

  EnemyRobot.WIDTH = 64;

  EnemyRobot.HEIGHT = 74;

  EnemyRobot.UPDATE_FRAME = 10;

  function EnemyRobot(parentNode) {
    this.onDebugComplete = __bind(this.onDebugComplete, this);
    EnemyRobot.__super__.constructor.call(this, EnemyRobot.WIDTH, EnemyRobot.HEIGHT, parentNode);
    this.name = R.String.ENEMY;
    this.image = Game.instance.assets[R.CHAR.ENEMY];
    this.plateState = Plate.STATE_ENEMY;
  }

  EnemyRobot.prototype.onKeyInput = function(input) {
    var ret;
    if (this.animated === true) {
      return;
    }
    ret = true;
    if (input.w === true && input.o === true) {
      this.animated = true;
      ret = this.move(Direct.LEFT | Direct.UP, this.onDebugComplete);
    } else if (input.a === true && input.o === true) {
      this.animated = true;
      ret = this.move(Direct.LEFT, this.onDebugComplete);
    } else if (input.x === true && input.o === true) {
      this.animated = true;
      ret = this.move(Direct.LEFT | Direct.DOWN, this.onDebugComplete);
    } else if (input.d === true && input.o === true) {
      this.animated = true;
      ret = this.move(Direct.RIGHT, this.onDebugComplete);
    } else if (input.e === true && input.o === true) {
      this.animated = true;
      ret = this.move(Direct.RIGHT | Direct.UP, this.onDebugComplete);
    } else if (input.c === true && input.o === true) {
      this.animated = true;
      ret = this.move(Direct.RIGHT | Direct.DOWN, this.onDebugComplete);
    }
    if (ret === false) {
      return this.onDebugComplete();
    }
  };

  EnemyRobot.prototype.onDebugComplete = function() {
    return this.animated = false;
  };

  return EnemyRobot;

})(Robot);

// Generated by CoffeeScript 1.6.3
var InstrCommon, TipInfo;

InstrCommon = (function() {
  var RobotDirect, directs, frame;

  function InstrCommon() {}

  RobotDirect = (function() {
    function RobotDirect(value, frame) {
      this.value = value;
      this.frame = frame;
    }

    return RobotDirect;

  })();

  directs = [Direct.RIGHT, Direct.RIGHT | Direct.DOWN, Direct.LEFT | Direct.DOWN, Direct.LEFT, Direct.LEFT | Direct.UP, Direct.RIGHT | Direct.UP];

  frame = [0, 5, 7, 2, 6, 4];

  InstrCommon.getRobotDirect = function(i) {
    return new RobotDirect(directs[i], frame[i]);
  };

  InstrCommon.getDirectSize = function() {
    return directs.length;
  };

  InstrCommon.getDirectIndex = function(direct) {
    return directs.indexOf(direct);
  };

  InstrCommon.getFrame = function(direct) {
    var i, _i, _ref;
    for (i = _i = 0, _ref = directs.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (directs[i] === direct) {
        return frame[i];
      }
    }
    return 0;
  };

  return InstrCommon;

})();

TipInfo = (function() {
  function TipInfo(description) {
    this.description = description;
    this.params = {};
    this.labels = {};
  }

  TipInfo.prototype.addParameter = function(id, column, labels, value) {
    var param;
    param = {
      column: column,
      labels: labels
    };
    this.labels[id] = param.labels[value];
    return this.params[id] = param;
  };

  TipInfo.prototype.changeLabel = function(id, value) {
    return this.labels[id] = this.params[id].labels[value];
  };

  TipInfo.prototype.getLabel = function(id) {
    return this.labels[id];
  };

  TipInfo.prototype.getDescription = function() {
    var k, v, values;
    values = (function() {
      var _ref, _results;
      _ref = this.labels;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push(v);
      }
      return _results;
    }).call(this);
    return this.description(values);
  };

  return TipInfo;

})();

// Generated by CoffeeScript 1.6.3
var ApproachInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ApproachInstruction = (function(_super) {
  __extends(ApproachInstruction, _super);

  /*
    Approach Instruction
  */


  function ApproachInstruction(robot, enemy) {
    this.robot = robot;
    this.enemy = enemy;
    ApproachInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.icon = new Icon(Game.instance.assets[R.TIP.MOVE_TO_ENEMY], 32, 32);
  }

  ApproachInstruction.prototype.action = function() {
    var ret,
      _this = this;
    ret = this.robot.approach(this.enemy, function() {
      return _this.onComplete();
    });
    return this.setAsynchronous(ret !== false);
  };

  ApproachInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new ApproachInstruction(this.robot, this.enemy));
    return obj;
  };

  ApproachInstruction.prototype.mkDescription = function() {
    return "敵機に近づくように移動します。<br>(消費エネルギー " + Config.Energy.APPROACH + " 消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
  };

  ApproachInstruction.prototype.getIcon = function() {
    this.icon.frame = 0;
    return this.icon;
  };

  return ApproachInstruction;

})(ActionInstruction);

// Generated by CoffeeScript 1.6.3
var LeaveInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LeaveInstruction = (function(_super) {
  __extends(LeaveInstruction, _super);

  /*
    Leave Instruction
  */


  function LeaveInstruction(robot, enemy) {
    this.robot = robot;
    this.enemy = enemy;
    LeaveInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.icon = new Icon(Game.instance.assets[R.TIP.MOVE_FROM_ENEMY], 32, 32);
  }

  LeaveInstruction.prototype.action = function() {
    var ret,
      _this = this;
    ret = this.robot.leave(this.enemy, function() {
      return _this.onComplete();
    });
    return this.setAsynchronous(ret !== false);
  };

  LeaveInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new LeaveInstruction(this.robot, this.enemy));
    return obj;
  };

  LeaveInstruction.prototype.mkDescription = function() {
    return "敵機から離れるように移動します。<br>(消費エネルギー " + Config.Energy.LEAVE + " 消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
  };

  LeaveInstruction.prototype.getIcon = function() {
    this.icon.frame = 0;
    return this.icon;
  };

  return LeaveInstruction;

})(ActionInstruction);

// Generated by CoffeeScript 1.6.3
var MoveInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MoveInstruction = (function(_super) {
  __extends(MoveInstruction, _super);

  /*
    Move Instruction
  */


  function MoveInstruction(robot) {
    var column, labels;
    this.robot = robot;
    MoveInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    column = "移動方向";
    labels = ["右", "右下", "左下", "左", "左上", "右上"];
    this.directParam = new TipParameter(column, 0, 0, 5, 1);
    this.directParam.id = "direct";
    this.addParameter(this.directParam);
    this.tipInfo = new TipInfo(function(labels) {
      return "" + labels[0] + "に1マス移動します。<br>(消費エネルギー " + Config.Energy.MOVE + " 消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
    });
    this.tipInfo.addParameter(this.directParam.id, column, labels, 0);
    this.icon = new Icon(Game.instance.assets[R.TIP.ARROW], 32, 32);
  }

  MoveInstruction.prototype.action = function() {
    var direct, ret,
      _this = this;
    ret = true;
    direct = InstrCommon.getRobotDirect(this.directParam.value);
    ret = this.robot.move(direct.value, function() {
      return _this.onComplete();
    });
    return this.setAsynchronous(ret !== false);
  };

  MoveInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new MoveInstruction(this.robot));
    obj.directParam.value = this.directParam.value;
    return obj;
  };

  MoveInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.directParam.id) {
      this.directParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  MoveInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  MoveInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  MoveInstruction.prototype.getIcon = function() {
    this.icon.frame = this.directParam.value;
    return this.icon;
  };

  return MoveInstruction;

})(ActionInstruction);

// Generated by CoffeeScript 1.6.3
var RandomMoveInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

RandomMoveInstruction = (function(_super) {
  __extends(RandomMoveInstruction, _super);

  /*
    Random Move Instruction
  */


  function RandomMoveInstruction(robot) {
    this.robot = robot;
    RandomMoveInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.icon = new Icon(Game.instance.assets[R.TIP.RANDOM_MOVE], 32, 32);
  }

  RandomMoveInstruction.prototype.action = function() {
    var direct, plate, rand, ret,
      _this = this;
    ret = false;
    plate = null;
    while (plate === null) {
      rand = Random.nextInt() % InstrCommon.getDirectSize();
      direct = InstrCommon.getRobotDirect(rand);
      plate = Map.instance.getTargetPoision(this.robot.currentPlate, direct.value);
    }
    ret = this.robot.move(direct.value, function() {
      return _this.onComplete();
    });
    return this.setAsynchronous(ret !== false);
  };

  RandomMoveInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new RandomMoveInstruction(this.robot));
    return obj;
  };

  RandomMoveInstruction.prototype.mkDescription = function() {
    return "移動可能なマスにランダムに移動します。<br>(消費エネルギー " + Config.Energy.MOVE + " 消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
  };

  RandomMoveInstruction.prototype.getIcon = function() {
    this.icon.frame = 0;
    return this.icon;
  };

  return RandomMoveInstruction;

})(ActionInstruction);

// Generated by CoffeeScript 1.6.3
var ShotInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ShotInstruction = (function(_super) {
  __extends(ShotInstruction, _super);

  /*
    Shot Instruction
  */


  function ShotInstruction(robot) {
    this.robot = robot;
    ShotInstruction.__super__.constructor.apply(this, arguments);
    this.icon = new Icon(Game.instance.assets[R.TIP.SHOT_BULLET], 32, 32);
    this.setAsynchronous(true);
  }

  ShotInstruction.prototype.action = function() {
    var ret,
      _this = this;
    ret = this.robot.shot(function() {
      return _this.onComplete();
    });
    return this.setAsynchronous(ret !== false);
  };

  ShotInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new ShotInstruction(this.robot));
    return obj;
  };

  ShotInstruction.prototype.mkDescription = function() {
    return "弾を撃ちます。<br>射程距離:前方方向に距離5<br>(消費エネルギー " + Config.Energy.SHOT + " 消費フレーム " + Config.Frame.BULLET + "フレーム)";
  };

  ShotInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  ShotInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return ShotInstruction;

})(ActionInstruction);

// Generated by CoffeeScript 1.6.3
var SupplyInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SupplyInstruction = (function(_super) {
  __extends(SupplyInstruction, _super);

  /*
    Shot Instruction
  */


  function SupplyInstruction(robot) {
    var column, i, labels, _i, _ref;
    this.robot = robot;
    SupplyInstruction.__super__.constructor.apply(this, arguments);
    this.tipInfo = new TipInfo(function(labels) {
      return "現在いるマスからエネルギーを最大" + labels[0] + "補給します。<br>" + labels[0] + "未満しか残っていない場合はその分補給します。<br>(消費エネルギー 0 消費フレーム " + (Robot.supplyFrame(toi(labels[0]))) + "フレーム)";
    });
    column = "エネルギー量";
    this.energyParam = new TipParameter(column, 1, 1, Robot.MAX_STEAL_ENERGY / 10, 1);
    this.energyParam.id = "energy";
    this.energyParam.value = 1;
    labels = [];
    for (i = _i = 1, _ref = Robot.MAX_STEAL_ENERGY / 10; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      labels[String(i)] = i * 10;
    }
    this.addParameter(this.energyParam);
    this.tipInfo.addParameter(this.energyParam.id, column, labels, 1);
    this.icon = new Icon(Game.instance.assets[R.TIP.ENERGY], 32, 32);
    this.setAsynchronous(true);
  }

  SupplyInstruction.prototype.action = function() {
    var energy, ret, _ref,
      _this = this;
    energy = (0 < (_ref = this.energyParam.value * 10) && _ref <= Robot.MAX_STEAL_ENERGY) ? this.energyParam.value * 10 : Robot.MAX_STEAL_ENERGY;
    ret = this.robot.supply(energy, function() {
      return _this.onComplete();
    });
    return this.setAsynchronous(ret !== false);
  };

  SupplyInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new SupplyInstruction(this.robot));
    obj.energyParam.value = this.energyParam.value;
    return obj;
  };

  SupplyInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.energyParam.id) {
      this.energyParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  SupplyInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  SupplyInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  SupplyInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return SupplyInstruction;

})(ActionInstruction);

// Generated by CoffeeScript 1.6.3
var TurnEnemyScanInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TurnEnemyScanInstruction = (function(_super) {
  __extends(TurnEnemyScanInstruction, _super);

  /*
    Turn Enemy Scan Instruction
  */


  function TurnEnemyScanInstruction(robot, opponent) {
    var column, labels;
    this.robot = robot;
    this.opponent = opponent;
    TurnEnemyScanInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.tipInfo = new TipInfo(function(labels) {
      return "" + labels[0] + "に" + labels[1] + "回ターンします。<br>その途中に射程圏内に入っていれば、<br>青い矢印に進みます。<br>そうでなければ赤い矢印に進みます。<br>(消費エネルギー 1ターン当たり" + Config.Energy.TURN + " 消費フレーム 1ターン当たり" + Config.Frame.ROBOT_TURN + "フレーム)      ";
    });
    column = "回転方向";
    labels = ["時計回り", "反時計回り"];
    this.rotateParam = new TipParameter(column, 0, 0, 1, 1);
    this.rotateParam.id = "rotate";
    this.addParameter(this.rotateParam);
    this.tipInfo.addParameter(this.rotateParam.id, column, labels, 1);
    column = "回転回数";
    labels = [0, 1, 2, 3, 4, 5];
    this.lengthParam = new TipParameter(column, 0, 0, 5, 1);
    this.lengthParam.id = "length";
    this.addParameter(this.lengthParam);
    this.tipInfo.addParameter(this.lengthParam.id, column, labels, 0);
    this.icon = new Icon(Game.instance.assets[R.TIP.SEARCH_ENEMY], 32, 32);
  }

  TurnEnemyScanInstruction.prototype.action = function() {
    var count, i, turnOnComplete,
      _this = this;
    count = this.lengthParam.value;
    i = 0;
    turnOnComplete = function(robot) {
      var bullet;
      bullet = BulletFactory.create(BulletType.NORMAL, _this.robot);
      if (bullet.withinRange(_this.robot, _this.opponent, _this.robot.direct)) {
        _this.onComplete(true);
        return;
      }
      if (i < count) {
        i += 1;
        return _this.robot.turn(_this.rotateParam.value + 1, turnOnComplete);
      } else {
        return _this.onComplete(false);
      }
    };
    return this.robot.tl.delay(Config.Frame.ROBOT_TURN).then(function() {
      return turnOnComplete(_this.robot);
    });
  };

  TurnEnemyScanInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new TurnEnemyScanInstruction(this.robot, this.opponent));
    obj.rotateParam.value = this.rotateParam.value;
    obj.lengthParam.value = this.lengthParam.value;
    return obj;
  };

  TurnEnemyScanInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.rotateParam.id) {
      this.rotateParam = parameter;
    } else if (parameter.id === this.lengthParam.id) {
      this.lengthParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  TurnEnemyScanInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  TurnEnemyScanInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  TurnEnemyScanInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return TurnEnemyScanInstruction;

})(BranchInstruction);

// Generated by CoffeeScript 1.6.3
var EnergyBranchInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EnergyBranchInstruction = (function(_super) {
  __extends(EnergyBranchInstruction, _super);

  function EnergyBranchInstruction(robot) {
    var column, i, labels, _i, _ref;
    this.robot = robot;
    EnergyBranchInstruction.__super__.constructor.apply(this, arguments);
    this.tipInfo = new TipInfo(function(labels) {
      return "プレイヤーのエネルギー残量が" + labels[0] + "以上の時青矢印に進みます。<br>" + labels[0] + "未満の時は赤矢印に進みます。";
    });
    column = "エネルギー";
    labels = {};
    for (i = _i = 0, _ref = Robot.MAX_ENERGY; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      labels[String(i)] = i;
    }
    this.energyParam = new TipParameter(column, 0, 0, Robot.MAX_ENERGY, 1);
    this.energyParam.id = "size";
    this.addParameter(this.energyParam);
    this.tipInfo.addParameter(this.energyParam.id, column, labels, 1);
    this.icon = new Icon(Game.instance.assets[R.TIP.REST_ENERGY_PLAYER], 32, 32);
  }

  EnergyBranchInstruction.prototype.action = function() {
    return this.energyParam.value <= this.robot.energy;
  };

  EnergyBranchInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new EnergyBranchInstruction(this.robot));
    obj.energyParam.value = this.energyParam.value;
    return obj;
  };

  EnergyBranchInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.energyParam.id) {
      this.energyParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  EnergyBranchInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  EnergyBranchInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  EnergyBranchInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return EnergyBranchInstruction;

})(BranchInstruction);

// Generated by CoffeeScript 1.6.3
var EnemyEnergyBranchInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EnemyEnergyBranchInstruction = (function(_super) {
  __extends(EnemyEnergyBranchInstruction, _super);

  function EnemyEnergyBranchInstruction(enemy) {
    var column, i, labels, _i, _ref;
    this.enemy = enemy;
    EnemyEnergyBranchInstruction.__super__.constructor.apply(this, arguments);
    this.tipInfo = new TipInfo(function(labels) {
      return "敵機のエネルギー残量が" + labels[0] + "以上の時青矢印に進みます。<br>" + labels[0] + "未満の時は赤矢印に進みます。";
    });
    column = "エネルギー";
    labels = {};
    for (i = _i = 0, _ref = Robot.MAX_ENERGY; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      labels[String(i)] = i;
    }
    this.energyParam = new TipParameter(column, 0, 0, Robot.MAX_ENERGY, 1);
    this.energyParam.id = "size";
    this.addParameter(this.energyParam);
    this.tipInfo.addParameter(this.energyParam.id, column, labels, 1);
    this.icon = new Icon(Game.instance.assets[R.TIP.REST_ENERGY_ENEMY], 32, 32);
  }

  EnemyEnergyBranchInstruction.prototype.action = function() {
    return this.energyParam.value <= this.enemy.energy;
  };

  EnemyEnergyBranchInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new EnemyEnergyBranchInstruction(this.enemy));
    obj.energyParam.value = this.energyParam.value;
    return obj;
  };

  EnemyEnergyBranchInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.energyParam.id) {
      this.energyParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  EnemyEnergyBranchInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  EnemyEnergyBranchInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  EnemyEnergyBranchInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return EnemyEnergyBranchInstruction;

})(BranchInstruction);

// Generated by CoffeeScript 1.6.3
var EnemyDistanceInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EnemyDistanceInstruction = (function(_super) {
  __extends(EnemyDistanceInstruction, _super);

  /*
    Enemy Distance Instruction
  */


  function EnemyDistanceInstruction(robot, enemy) {
    var column, labels,
      _this = this;
    this.robot = robot;
    this.enemy = enemy;
    EnemyDistanceInstruction.__super__.constructor.apply(this, arguments);
    this.tipInfo = new TipInfo(function(labels) {
      return "敵機との距離が" + labels[0] + "の場合青い矢印に進みます。<br>そうでなければ、赤い矢印に進みます。      ";
    });
    column = "距離";
    labels = ["近距離", "中距離", "遠距離"];
    this.distanceParam = new TipParameter(column, 0, 0, 2, 1);
    this.distanceParam.id = "distance";
    this.addParameter(this.distanceParam);
    this.tipInfo.addParameter(this.distanceParam.id, column, labels, 0);
    this.icon = new Icon(Game.instance.assets[R.TIP.DISTANCE], 32, 32);
    this.conditions = [
      function() {
        var _ref;
        return (0 < (_ref = _this._distance()) && _ref <= 3);
      }, function() {
        var _ref;
        return (3 < (_ref = _this._distance()) && _ref <= 7);
      }, function() {
        return 7 < _this._distance();
      }
    ];
  }

  EnemyDistanceInstruction.prototype._distance = function() {
    var enemyPos, robotPos;
    enemyPos = this.enemy.pos;
    robotPos = this.robot.pos;
    robotPos.sub(enemyPos);
    return robotPos.length();
  };

  EnemyDistanceInstruction.prototype.action = function() {
    return this.conditions[this.distanceParam.value]();
  };

  EnemyDistanceInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new EnemyDistanceInstruction(this.robot, this.enemy));
    obj.distanceParam.value = this.distanceParam.value;
    return obj;
  };

  EnemyDistanceInstruction.prototype.onParameterChanged = function(parameter) {
    this.distanceParam = parameter;
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  EnemyDistanceInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  EnemyDistanceInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  EnemyDistanceInstruction.prototype.getIcon = function() {
    this.icon.frame = this.distanceParam.value;
    return this.icon;
  };

  return EnemyDistanceInstruction;

})(BranchInstruction);

// Generated by CoffeeScript 1.6.3
var HpBranchInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

HpBranchInstruction = (function(_super) {
  __extends(HpBranchInstruction, _super);

  function HpBranchInstruction(robot) {
    var column, i, labels, _i, _ref;
    this.robot = robot;
    HpBranchInstruction.__super__.constructor.apply(this, arguments);
    this.tipInfo = new TipInfo(function(labels) {
      return "HPが" + labels[0] + "以上の時青矢印に進みます。<br>" + labels[0] + "未満の時は赤矢印に進みます。";
    });
    column = "HP";
    labels = {};
    for (i = _i = 1, _ref = Robot.MAX_HP; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      labels[String(i)] = i;
    }
    this.hpParam = new TipParameter(column, 1, 1, Robot.MAX_HP, 1);
    this.hpParam.id = "size";
    this.addParameter(this.hpParam);
    this.tipInfo.addParameter(this.hpParam.id, column, labels, 1);
    this.icon = new Icon(Game.instance.assets[R.TIP.LIFE], 32, 32);
  }

  HpBranchInstruction.prototype.action = function() {
    return this.hpParam.value <= this.robot.hp;
  };

  HpBranchInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new HpBranchInstruction(this.robot));
    obj.hpParam.value = this.hpParam.value;
    return obj;
  };

  HpBranchInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.hpParam.id) {
      this.hpParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  HpBranchInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  HpBranchInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  HpBranchInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return HpBranchInstruction;

})(BranchInstruction);

// Generated by CoffeeScript 1.6.3
var ResourceBranchInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ResourceBranchInstruction = (function(_super) {
  __extends(ResourceBranchInstruction, _super);

  function ResourceBranchInstruction(robot) {
    var column, i, labels, _i, _ref;
    this.robot = robot;
    ResourceBranchInstruction.__super__.constructor.apply(this, arguments);
    this.tipInfo = new TipInfo(function(labels) {
      return "現在いるマスにエネルギーが" + labels[0] + "以上ある時青矢印に進みます。<br>" + labels[0] + "未満の時は赤矢印に進みます。";
    });
    column = "エネルギー";
    labels = {};
    for (i = _i = 0, _ref = Plate.MAX_ENERGY; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      labels[String(i)] = i;
    }
    this.energyParam = new TipParameter(column, 0, 0, Plate.MAX_ENERGY, 1);
    this.energyParam.id = "size";
    this.addParameter(this.energyParam);
    this.tipInfo.addParameter(this.energyParam.id, column, labels, 1);
    this.icon = new Icon(Game.instance.assets[R.TIP.ENERGY], 32, 32);
  }

  ResourceBranchInstruction.prototype.action = function() {
    return this.energyParam.value <= this.robot.currentPlateEnergy;
  };

  ResourceBranchInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new ResourceBranchInstruction(this.robot));
    obj.energyParam.value = this.energyParam.value;
    return obj;
  };

  ResourceBranchInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.energyParam.id) {
      this.energyParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  ResourceBranchInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  ResourceBranchInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  ResourceBranchInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return ResourceBranchInstruction;

})(BranchInstruction);

// Generated by CoffeeScript 1.6.3
var Background, MeterView, R, ViewGroup, ViewSprite,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

R = Config.R;

ViewGroup = (function(_super) {
  __extends(ViewGroup, _super);

  function ViewGroup(x, y) {
    ViewGroup.__super__.constructor.call(this, x, y);
    this._childs = [];
  }

  ViewGroup.prototype.addView = function(view) {
    this._childs.push(view);
    return this.addChild(view);
  };

  ViewGroup.prototype.initEvent = function(world) {
    var view, _i, _len, _ref, _results;
    _ref = this._childs;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      _results.push(view.initEvent(world));
    }
    return _results;
  };

  return ViewGroup;

})(Group);

ViewSprite = (function(_super) {
  __extends(ViewSprite, _super);

  function ViewSprite(x, y) {
    ViewSprite.__super__.constructor.call(this, x, y);
  }

  ViewSprite.prototype.initEvent = function(world) {};

  return ViewSprite;

})(Sprite);

Background = (function(_super) {
  __extends(Background, _super);

  Background.SIZE = 640;

  function Background(x, y) {
    Background.__super__.constructor.call(this, Background.SIZE, Background.SIZE);
    this.image = Game.instance.assets[R.BACKGROUND_IMAGE.SPACE];
    this.x = x;
    this.y = y;
  }

  return Background;

})(ViewSprite);

MeterView = (function(_super) {
  var MeterBar, MeterEnclose, MeterEnclosePart;

  __extends(MeterView, _super);

  MeterView.MAX_HP = 4;

  /*
   inner class
  */


  MeterBar = (function(_super1) {
    __extends(MeterBar, _super1);

    function MeterBar(x, y, height, maxValue, resource) {
      this.height = height;
      this.maxValue = maxValue;
      MeterBar.__super__.constructor.call(this, x, y);
      this.height = height;
      this.value = this.maxValue;
      this.image = Game.instance.assets[resource];
    }

    return MeterBar;

  })(Bar);

  MeterEnclosePart = (function(_super1) {
    __extends(MeterEnclosePart, _super1);

    function MeterEnclosePart(x, y, width, height, i) {
      MeterEnclosePart.__super__.constructor.call(this, width, height);
      this.x = x;
      this.y = y;
      if (i === 0) {
        this.frame = 0;
      } else if (i === Robot.MAX_HP - 1) {
        this.frame = 2;
      } else {
        this.frame = 1;
      }
      this.image = Game.instance.assets[R.BACKGROUND_IMAGE.HP_ENCLOSE];
    }

    return MeterEnclosePart;

  })(ViewSprite);

  MeterEnclose = (function(_super1) {
    __extends(MeterEnclose, _super1);

    function MeterEnclose(x, y, width, height, count) {
      var i, _i;
      MeterEnclose.__super__.constructor.call(this, width, height);
      this.x = x;
      this.y = y;
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        this.addChild(new MeterEnclosePart(i * width, 0, width, height, i));
      }
    }

    return MeterEnclose;

  })(ViewGroup);

  function MeterView(config) {
    MeterView.__super__.constructor.apply(this, arguments);
    this.hp = new MeterBar(config.x, config.y, config.height, config.width, resource);
    this.underMeter = new MeterEnclose(x, y, this.addChild(this.underMeter));
    this.addChild(this.hp);
  }

  MeterView.prototype.reduce = function() {
    if (this.hp.value > 0) {
      return this.hp.value -= this.hp.maxValue / Robot.MAX_HP;
    }
  };

  return MeterView;

})(ViewGroup);

MeterView = (function(_super) {
  var Meter, MeterBackground, MeterBackgroundPart;

  __extends(MeterView, _super);

  /*
   inner class
  */


  Meter = (function(_super1) {
    __extends(Meter, _super1);

    function Meter(x, y, width, height, resource) {
      Meter.__super__.constructor.call(this, 0, 0);
      this.height = height;
      this.value = width;
      this.maxValue = width;
      this.image = Game.instance.assets[resource];
    }

    return Meter;

  })(Bar);

  MeterBackgroundPart = (function(_super1) {
    __extends(MeterBackgroundPart, _super1);

    function MeterBackgroundPart(x, y, width, height, resource) {
      MeterBackgroundPart.__super__.constructor.call(this, width, height);
      this.x = x;
      this.y = y;
      this.image = Game.instance.assets[resource];
    }

    return MeterBackgroundPart;

  })(ViewSprite);

  MeterBackground = (function(_super1) {
    __extends(MeterBackground, _super1);

    function MeterBackground(x, y, width, height, count, resource) {
      var i, partWidth, _i;
      MeterBackground.__super__.constructor.call(this, width, height);
      partWidth = width / count;
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        this.addChild(new MeterBackgroundPart(i * partWidth, 0, partWidth, height, resource));
      }
    }

    return MeterBackground;

  })(ViewGroup);

  function MeterView(config) {
    MeterView.__super__.constructor.apply(this, arguments);
    this.x = config.x;
    this.y = config.y;
    this.partWidth = config.partWidth;
    this.count = config.count;
    this.height = config.height;
    this.width = this.partWidth * this.count;
    this.foregroundImage = config.foregroundImage;
    this.backgroundImage = config.backgroundImage;
    this.meter = new Meter(this.x, this.y, this.width, this.height, this.foregroundImage);
    this.background = new MeterBackground(this.x, this.y, this.width, this.height, this.count, this.backgroundImage);
    this.addChild(this.background);
    this.addChild(this.meter);
  }

  MeterView.prototype.decrease = function(value) {
    if (this.meter.value - value >= 0) {
      this.meter.value -= value;
      return true;
    } else {
      return false;
    }
  };

  MeterView.prototype.decreaseForce = function(value) {
    if (this.meter.value - value >= 0) {
      return this.meter.value -= value;
    } else {
      return this.meter.value = 0;
    }
  };

  MeterView.prototype.increase = function(value) {
    if (this.meter.value + value <= this.meter.maxValue) {
      this.meter.value += value;
      return true;
    } else {
      return false;
    }
  };

  MeterView.prototype.increaseForce = function(value) {
    if (this.meter.value + value <= this.meter.maxValue) {
      return this.meter.value += value;
    } else {
      return this.meter.value = this.meter.maxValue;
    }
  };

  return MeterView;

})(ViewGroup);

// Generated by CoffeeScript 1.6.3
var EnemyHp, PlayerHp,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PlayerHp = (function(_super) {
  var PART_WIDTH;

  __extends(PlayerHp, _super);

  PART_WIDTH = 48;

  function PlayerHp(x, y) {
    PlayerHp.__super__.constructor.call(this, {
      x: x,
      y: y,
      partWidth: PART_WIDTH,
      count: Robot.MAX_HP,
      height: 24,
      foregroundImage: R.BACKGROUND_IMAGE.HP_GREEN,
      backgroundImage: R.BACKGROUND_IMAGE.HP_ENCLOSE
    });
  }

  PlayerHp.prototype.initEvent = function(world) {
    var _this = this;
    return world.player.addObserver("hp", function(hp) {
      if (hp < world.player.hp) {
        return _this.decreaseForce(PART_WIDTH * (world.player.hp - hp));
      } else {
        return _this.increaseForce(PART_WIDTH * (hp - world.player.hp));
      }
    });
  };

  return PlayerHp;

})(MeterView);

EnemyHp = (function(_super) {
  var PART_WIDTH;

  __extends(EnemyHp, _super);

  PART_WIDTH = 48;

  function EnemyHp(x, y) {
    EnemyHp.__super__.constructor.call(this, {
      x: x,
      y: y,
      partWidth: PART_WIDTH,
      count: Robot.MAX_HP,
      height: 24,
      foregroundImage: R.BACKGROUND_IMAGE.HP_RED,
      backgroundImage: R.BACKGROUND_IMAGE.HP_ENCLOSE
    });
  }

  EnemyHp.prototype.initEvent = function(world) {
    var _this = this;
    return world.enemy.addObserver("hp", function(hp) {
      if (hp < world.enemy.hp) {
        return _this.decreaseForce(PART_WIDTH * (world.enemy.hp - hp));
      } else {
        return _this.increaseForce(PART_WIDTH * (hp - world.enemy.hp));
      }
    });
  };

  return EnemyHp;

})(MeterView);

// Generated by CoffeeScript 1.6.3
var EnemyEnergy, PlayerEnergy,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PlayerEnergy = (function(_super) {
  var COUNT, PART_WIDTH;

  __extends(PlayerEnergy, _super);

  PART_WIDTH = 48;

  COUNT = 5;

  function PlayerEnergy(x, y) {
    PlayerEnergy.__super__.constructor.call(this, {
      x: x,
      y: y,
      partWidth: PART_WIDTH,
      count: COUNT,
      height: 16,
      foregroundImage: R.BACKGROUND_IMAGE.ENERGY,
      backgroundImage: R.BACKGROUND_IMAGE.HP_ENCLOSE
    });
  }

  PlayerEnergy.prototype.initEvent = function(world) {
    var _this = this;
    return world.player.addObserver("energy", function(energy) {
      if (energy < world.player.energy) {
        return _this.decreaseForce(world.player.energy - energy);
      } else {
        return _this.increaseForce(energy - world.player.energy);
      }
    });
  };

  return PlayerEnergy;

})(MeterView);

EnemyEnergy = (function(_super) {
  var COUNT, PART_WIDTH;

  __extends(EnemyEnergy, _super);

  PART_WIDTH = 48;

  COUNT = 5;

  function EnemyEnergy(x, y) {
    EnemyEnergy.__super__.constructor.call(this, {
      x: x,
      y: y,
      partWidth: PART_WIDTH,
      count: COUNT,
      height: 16,
      foregroundImage: R.BACKGROUND_IMAGE.ENERGY,
      backgroundImage: R.BACKGROUND_IMAGE.HP_ENCLOSE
    });
  }

  EnemyEnergy.prototype.initEvent = function(world) {
    var _this = this;
    return world.enemy.addObserver("energy", function(energy) {
      if (energy < world.enemy.energy) {
        return _this.decreaseForce(world.enemy.energy - energy);
      } else {
        return _this.increaseForce(energy - world.enemy.energy);
      }
    });
  };

  return EnemyEnergy;

})(MeterView);

// Generated by CoffeeScript 1.6.3
var Header, R,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

R = Config.R;

Header = (function(_super) {
  __extends(Header, _super);

  Header.WIDTH = 600;

  function Header(x, y) {
    var offset;
    Header.__super__.constructor.apply(this, arguments);
    this.x = x;
    this.y = y;
    offset = 16;
    this.addView(new PlayerHp(offset + 8, offset));
    this.addView(new EnemyHp(Header.WIDTH / 2 + 8 + offset, offset));
    this.addView(new PlayerEnergy(8 + offset, 26 + offset));
    this.addView(new EnemyEnergy(Header.WIDTH / 2 + 8 + offset, 26 + offset));
    this.addView(new TimerView(8, 0));
  }

  return Header;

})(ViewGroup);

// Generated by CoffeeScript 1.6.3
var TimerView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TimerView = (function(_super) {
  var PART_WIDTH;

  __extends(TimerView, _super);

  PART_WIDTH = 48;

  function TimerView(x, y) {
    TimerView.__super__.constructor.call(this, {
      x: x,
      y: y,
      partWidth: PART_WIDTH,
      count: 13,
      height: 8,
      foregroundImage: R.BACKGROUND_IMAGE.TIMER,
      backgroundImage: R.BACKGROUND_IMAGE.HP_ENCLOSE
    });
  }

  TimerView.prototype.initEvent = function(world) {
    var _this = this;
    world.addEventListener("ontimer", function(evt) {
      return _this.decreaseForce(PART_WIDTH / 8);
    });
    return world.addEventListener("gameend", function(evt) {
      return _this.increaseForce(PART_WIDTH * 13);
    });
  };

  return TimerView;

})(MeterView);

// Generated by CoffeeScript 1.6.3
var Map, Plate, R,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

R = Config.R;

Plate = (function(_super) {
  var Body, EnergyOverlay, Overlay;

  __extends(Plate, _super);

  Plate.MAX_ENERGY = 160;

  Plate.HEIGHT = 74;

  Plate.WIDTH = 64;

  Plate.STATE_NORMAL = 0;

  Plate.STATE_PLAYER = 1;

  Plate.STATE_ENEMY = 2;

  Plate.STATE_SELECTED = 3;

  Body = (function(_super1) {
    __extends(Body, _super1);

    function Body() {
      Body.__super__.constructor.call(this, Plate.WIDTH, Plate.HEIGHT);
      this.image = Game.instance.assets[R.BACKGROUND_IMAGE.PLATE];
    }

    return Body;

  })(Sprite);

  EnergyOverlay = (function(_super1) {
    __extends(EnergyOverlay, _super1);

    function EnergyOverlay() {
      EnergyOverlay.__super__.constructor.call(this, Plate.WIDTH, Plate.HEIGHT);
      this.image = Game.instance.assets[R.BACKGROUND_IMAGE.PLATE_ENERGY];
      this.opacity = 0;
    }

    return EnergyOverlay;

  })(Sprite);

  Overlay = (function(_super1) {
    __extends(Overlay, _super1);

    function Overlay() {
      Overlay.__super__.constructor.call(this, Plate.WIDTH, Plate.HEIGHT);
      this.image = Game.instance.assets[R.BACKGROUND_IMAGE.PLATE_OVERLAY];
    }

    return Overlay;

  })(Sprite);

  function Plate(x, y, ix, iy) {
    var _this = this;
    this.ix = ix;
    this.iy = iy;
    Plate.__super__.constructor.call(this, Plate.WIDTH, Plate.HEIGHT);
    this.x = x;
    this.y = y;
    this.lock = false;
    this.energy = Plate.MAX_ENERGY;
    this.pravState = Plate.STATE_NORMAL;
    this.body = new Body();
    this.overlay = new Overlay();
    this.energyOverlay = new EnergyOverlay();
    this.addChild(this.body);
    this.addChild(this.energyOverlay);
    this.addChild(this.overlay);
    this.addEventListener('away', function(evt) {
      return _this.onRobotAway(evt.params.robot);
    });
    this.addEventListener('ride', function(evt) {
      return _this.onRobotRide(evt.params.robot);
    });
    Object.defineProperties(this, this.properties);
  }

  Plate.prototype.properties = {
    pos: {
      get: function() {
        return new Point(toi(Math.ceil(this.iy / 2)) + this.ix, this.iy);
      }
    }
  };

  Plate.prototype.setState = function(state) {
    this.pravState = this.overlay.frame;
    this.overlay.frame = state;
    if (state === Plate.STATE_PLAYER || state === Plate.STATE_ENEMY) {
      return this.lock = true;
    } else {
      return this.lock = false;
    }
  };

  Plate.prototype.setBody = function() {
    if (this.energy <= 0) {
      return this.energyOverlay.opacity = 1;
    } else {
      return this.energyOverlay.opacity = (Plate.MAX_ENERGY - this.energy) / Plate.MAX_ENERGY;
    }
  };

  Plate.prototype.setPrevState = function() {
    return this.setState(this.prevState);
  };

  Plate.prototype.stealEnergy = function(value) {
    if (this.energy - value >= 0) {
      this.energy -= value;
    } else {
      value = this.energy;
    }
    this.setBody();
    return value;
  };

  Plate.prototype.saveEnergy = function(value) {
    if (this.energy + value <= Plate.MAX_ENERGY) {
      this.energy += value;
    } else {
      this.energy = Plate.MAX_ENERGY;
    }
    return this.setBody();
  };

  Plate.prototype.getAbsolutePos = function() {
    var i, offsetX, offsetY;
    i = this.parentNode;
    offsetX = offsetY = 0;
    while (i != null) {
      offsetX += i.x;
      offsetY += i.y;
      i = i.parentNode;
    }
    return new Point(this.x + offsetX, this.y + offsetY);
  };

  Plate.prototype.onRobotAway = function(robot) {
    return this.setState(Plate.STATE_NORMAL);
  };

  Plate.prototype.onRobotRide = function(robot) {
    return this.setState(robot.plateState);
  };

  Plate.prototype.update = function() {
    if (Plate.MAX_ENERGY > this.energy && this.age % Config.Frame.NATURAL_MAP_ENERGY_RECAVERY === 0) {
      return this.saveEnergy(Plate.MAX_ENERGY / 10);
    }
  };

  Plate.prototype.reset = function() {
    return this.saveEnergy(Plate.MAX_ENERGY);
  };

  return Plate;

})(ViewGroup);

Map = (function(_super) {
  __extends(Map, _super);

  Map.WIDTH = 9;

  Map.HEIGHT = 7;

  Map.OFFSET_SIZE = 5;

  Map.UNIT_HEIGHT = Plate.HEIGHT;

  Map.UNIT_WIDTH = Plate.WIDTH;

  function Map(x, y) {
    var list, offset, plate, tx, ty, _i, _j, _ref, _ref1;
    if (Map.instance != null) {
      return Map.instance;
    }
    Map.__super__.constructor.apply(this, arguments);
    Map.instance = this;
    this.plateMatrix = [];
    offset = 64 / 4;
    for (ty = _i = 0, _ref = Map.HEIGHT; 0 <= _ref ? _i < _ref : _i > _ref; ty = 0 <= _ref ? ++_i : --_i) {
      list = [];
      for (tx = _j = 0, _ref1 = Map.WIDTH; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; tx = 0 <= _ref1 ? ++_j : --_j) {
        if (ty % 2 === 0) {
          plate = new Plate(tx * Map.UNIT_WIDTH, (ty * Map.UNIT_HEIGHT) - ty * offset, tx, ty);
        } else {
          plate = new Plate(tx * Map.UNIT_WIDTH + Map.UNIT_HEIGHT / 2, (ty * Map.UNIT_HEIGHT) - ty * offset, tx, ty);
        }
        list.push(plate);
        this.addChild(plate);
      }
      this.plateMatrix.push(list);
    }
    this.x = x;
    this.y = y;
    this.width = Map.WIDTH * Map.UNIT_WIDTH;
    this.height = (Map.HEIGHT - 1) * (Map.UNIT_HEIGHT - offset) + Map.UNIT_HEIGHT + 8;
  }

  Map.prototype.initEvent = function(world) {};

  Map.prototype.getPlate = function(x, y) {
    if ((0 <= x && x < Map.WIDTH) && (0 <= y && y < Map.HEIGHT)) {
      return this.plateMatrix[y][x];
    }
    return null;
  };

  Map.prototype.getPlateRandom = function() {
    return this.plateMatrix[Math.floor(Math.random() * Map.HEIGHT)][Math.floor(Math.random() * Map.WIDTH)];
  };

  Map.prototype.eachPlate = function(plate, direct, func) {
    var i, ret, _results;
    if (direct == null) {
      direct = Direct.RIGHT;
    }
    ret = plate;
    i = 0;
    _results = [];
    while (ret != null) {
      func(ret, i);
      ret = this.getTargetPoision(ret, direct);
      _results.push(i++);
    }
    return _results;
  };

  Map.prototype.eachSurroundingPlate = function(plate, func) {
    var _this = this;
    return Direct.each(function(direct) {
      var target;
      target = _this.getTargetPoision(plate, direct);
      if (target != null) {
        return func(target, direct);
      }
    });
  };

  Map.prototype.isExistObject = function(plate, direct, lenght) {
    var i, ret, _i;
    if (direct == null) {
      direct = Direct.RIGHT;
    }
    ret = plate;
    for (i = _i = 0; 0 <= lenght ? _i < lenght : _i > lenght; i = 0 <= lenght ? ++_i : --_i) {
      ret = this.getTargetPoision(ret, direct);
      if (ret === null) {
        break;
      } else if (ret.lock === true) {
        return true;
      }
    }
    return false;
  };

  Map.prototype.getTargetPoision = function(plate, direct) {
    var offset;
    if (direct == null) {
      direct = Direct.RIGHT;
    }
    if (direct === Direct.RIGHT) {
      if (this.plateMatrix[plate.iy].length > plate.ix + 1) {
        return this.plateMatrix[plate.iy][plate.ix + 1];
      } else {
        return null;
      }
    } else if (direct === Direct.LEFT) {
      if (plate.ix > 0) {
        return this.plateMatrix[plate.iy][plate.ix - 1];
      } else {
        return null;
      }
    }
    if ((direct & Direct.RIGHT) !== 0 && (direct & Direct.UP) !== 0) {
      offset = plate.iy % 2 === 0 ? 0 : 1;
      if (offset + plate.ix < Map.WIDTH && plate.iy > 0) {
        return this.plateMatrix[plate.iy - 1][offset + plate.ix];
      } else {
        return null;
      }
    } else if ((direct & Direct.RIGHT) !== 0 && (direct & Direct.DOWN) !== 0) {
      offset = plate.iy % 2 === 0 ? 0 : 1;
      if (offset + plate.ix < Map.WIDTH && plate.iy + 1 < Map.HEIGHT) {
        return this.plateMatrix[plate.iy + 1][offset + plate.ix];
      } else {
        return null;
      }
    } else if ((direct & Direct.LEFT) !== 0 && (direct & Direct.UP) !== 0) {
      offset = plate.iy % 2 === 0 ? -1 : 0;
      if (offset + plate.ix >= 0 && plate.iy > 0) {
        return this.plateMatrix[plate.iy - 1][offset + plate.ix];
      } else {
        return null;
      }
    } else if ((direct & Direct.LEFT) !== 0 && (direct & Direct.DOWN) !== 0) {
      offset = plate.iy % 2 === 0 ? -1 : 0;
      if (offset + plate.ix >= 0 && plate.iy + 1 < Map.HEIGHT) {
        return this.plateMatrix[plate.iy + 1][offset + plate.ix];
      } else {
        return null;
      }
    }
    return null;
  };

  Map.prototype.update = function() {
    var tx, ty, _i, _ref, _results;
    _results = [];
    for (ty = _i = 0, _ref = Map.HEIGHT; 0 <= _ref ? _i < _ref : _i > _ref; ty = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (tx = _j = 0, _ref1 = Map.WIDTH; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; tx = 0 <= _ref1 ? ++_j : --_j) {
          _results1.push(this.plateMatrix[ty][tx].update());
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Map.prototype.reset = function() {
    var tx, ty, _i, _ref, _results;
    _results = [];
    for (ty = _i = 0, _ref = Map.HEIGHT; 0 <= _ref ? _i < _ref : _i > _ref; ty = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (tx = _j = 0, _ref1 = Map.WIDTH; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; tx = 0 <= _ref1 ? ++_j : --_j) {
          _results1.push(this.plateMatrix[ty][tx].reset());
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  return Map;

})(ViewGroup);

// Generated by CoffeeScript 1.6.3
var Footer, MsgBox, R,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

R = Config.R;

MsgBox = (function(_super) {
  var Msg, MsgWindow;

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

  Msg = (function(_super1) {
    var SIZE;

    __extends(Msg, _super1);

    SIZE = 4;

    function Msg() {
      var i, label, _i;
      Msg.__super__.constructor.apply(this, arguments);
      this.labels = [];
      this.labelTexts = ["", "", "", ""];
      for (i = _i = 1; 1 <= SIZE ? _i <= SIZE : _i >= SIZE; i = 1 <= SIZE ? ++_i : --_i) {
        label = new Label;
        label.font = "14px 'Meiryo UI'";
        label.color = '#FFF';
        label.x = 10;
        label.y = 24 * i + 6;
        label.width = MsgWindow.WIDTH * 0.9;
        this.addChild(label);
        this.labels.push(label);
      }
    }

    Msg.prototype.add = function(string) {
      this.labelTexts[3] = this.labelTexts[2];
      this.labelTexts[2] = this.labelTexts[1];
      this.labelTexts[1] = this.labelTexts[0];
      return this.labelTexts[0] = string;
    };

    Msg.prototype.print = function() {
      var i, _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= SIZE ? _i < SIZE : _i > SIZE; i = 0 <= SIZE ? ++_i : --_i) {
        _results.push(this.labels[i].text = this.labelTexts[i]);
      }
      return _results;
    };

    return Msg;

  })(ViewGroup);

  function MsgBox(x, y) {
    MsgBox.__super__.constructor.call(this, MsgWindow.WIDTH, MsgWindow.HEIGHT);
    this.x = x;
    this.y = y;
    this.window = new MsgWindow(0, 0);
    this.addChild(this.window);
    this.msg = new Msg();
    this.addChild(this.msg);
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
    world.player.addEventListener('supply', function(evt) {
      var player, ret;
      player = evt.target;
      ret = evt.params.energy;
      if (ret !== false) {
        return _this.print(R.String.supply(player.name, ret) + R.String.state(player.hp, player.energy));
      }
    });
    world.player.addEventListener('turn', function(evt) {
      var player, ret;
      player = evt.target;
      ret = evt.params;
      if (ret !== false) {
        return _this.print(R.String.turn(player.name) + R.String.state(player.hp, player.energy));
      }
    });
    return world.addEventListener("gameend", function(evt) {
      var loseRobotName, params, winRobotName;
      params = evt.params;
      loseRobotName = params.lose.name;
      winRobotName = params.win.name;
      if (params.type === RobotAIGame.END.KILL) {
        return _this.print(R.String.die(loseRobotName) + R.String.win(winRobotName));
      } else if (params.type === RobotAIGame.END.TIME_LIMIT) {
        return _this.print(R.String.timelimit(loseRobotName) + R.String.win(winRobotName));
      }
    });
  };

  MsgBox.prototype.print = function(msg) {
    this.msg.add(msg);
    return this.msg.print();
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

var R, Random, RobotGame, RobotScene, RobotWorld, ViewWorld, runGame,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

R = Config.R;

Random = new MersenneTwister();

ViewWorld = (function(_super) {
  __extends(ViewWorld, _super);

  function ViewWorld(x, y, scene) {
    ViewWorld.__super__.constructor.call(this);
    scene.addChild(this);
    this.x = x;
    this.y = y;
    this.background = new Background(0, 0);
    this.header = new Header(0, 0);
    this.map = new Map(16, 68);
    this.footer = new Footer(25, this.map.y + this.map.height);
    this.addChild(this.background);
    this.addChild(this.header);
    this.addChild(this.map);
    this.addChild(this.footer);
  }

  ViewWorld.prototype.initEvent = function(world) {
    this.footer.initEvent(world);
    this.map.initEvent(world);
    return this.header.initEvent(world);
  };

  ViewWorld.prototype.update = function(world) {
    return this.map.update();
  };

  ViewWorld.prototype.reset = function() {
    return this.map.reset();
  };

  return ViewWorld;

})(Group);

RobotWorld = (function(_super) {
  __extends(RobotWorld, _super);

  RobotWorld.TIME_LIMIT = 13 * 8;

  function RobotWorld(x, y, scene) {
    var _this = this;
    if (RobotWorld.instance != null) {
      return RobotWorld.instance;
    }
    RobotWorld.__super__.constructor.call(this);
    RobotWorld.instance = this;
    this._robots = [];
    this.setup("bullets", []);
    this.setup("items", []);
    this.addObserver("bullets", function(data, method) {
      if (method === "push") {
        return _this.insertBefore(data, _this._robots[0]);
      }
    });
    this.addObserver("items", function(data, method) {
      if (method === "push") {
        return _this.addChild(data);
      }
    });
    this._player = new PlayerRobot(this);
    this._enemy = new EnemyRobot(this);
    this._robots.push(this._player);
    this._robots.push(this._enemy);
    scene.addChild(this);
    this.addChild(this._player);
    this.addChild(this._enemy);
    this.diePlayer = false;
    this._start = false;
    this.player.addEventListener("die", function(evt) {
      if (_this.diePlayer === false) {
        _this._start = false;
        _this.diePlayer = _this.player;
        return _this.dispatchEvent(new RobotEvent('gameend', {
          lose: _this.player,
          win: _this.enemy,
          type: RobotAIGame.END.KILL
        }));
      }
    });
    this.enemy.addEventListener("die", function(evt) {
      if (_this.diePlayer === false) {
        _this._start = false;
        _this.diePlayer = _this.enemy;
        return _this.dispatchEvent(new RobotEvent('gameend', {
          win: _this.player,
          lose: _this.enemy,
          type: RobotAIGame.END.KILL
        }));
      }
    });
    this._timer = 0;
  }

  RobotWorld.prototype.properties = {
    player: {
      get: function() {
        return this._player;
      }
    },
    enemy: {
      get: function() {
        return this._enemy;
      }
    },
    robots: {
      get: function() {
        return this._robots;
      }
    },
    timer: {
      get: function() {
        return this._timer;
      }
    }
  };

  RobotWorld.prototype.initInstructions = function(octagram) {
    var enemyProgram, playerProgram,
      _this = this;
    this.octagram = octagram;
    playerProgram = this.octagram.createProgramInstance();
    enemyProgram = this.octagram.createProgramInstance();
    this.playerProgramId = playerProgram.id;
    this.enemyProgramId = enemyProgram.id;
    playerProgram.addEventListener('onstart', function() {
      _this._start = true;
      return _this._timer = 0;
    });
    playerProgram.addInstruction(new MoveInstruction(this._player));
    playerProgram.addInstruction(new RandomMoveInstruction(this._player));
    playerProgram.addInstruction(new ApproachInstruction(this._player, this._enemy));
    playerProgram.addInstruction(new LeaveInstruction(this._player, this._enemy));
    playerProgram.addInstruction(new ShotInstruction(this._player));
    playerProgram.addInstruction(new SupplyInstruction(this._player));
    playerProgram.addInstruction(new TurnEnemyScanInstruction(this._player, this._enemy));
    playerProgram.addInstruction(new HpBranchInstruction(this._player));
    playerProgram.addInstruction(new EnemyDistanceInstruction(this._player, this._enemy));
    playerProgram.addInstruction(new EnergyBranchInstruction(this._player));
    playerProgram.addInstruction(new EnemyEnergyBranchInstruction(this._enemy));
    playerProgram.addInstruction(new ResourceBranchInstruction(this._player));
    enemyProgram.addInstruction(new MoveInstruction(this._enemy));
    enemyProgram.addInstruction(new RandomMoveInstruction(this._enemy));
    enemyProgram.addInstruction(new ApproachInstruction(this._enemy, this._player));
    enemyProgram.addInstruction(new LeaveInstruction(this._enemy, this._player));
    enemyProgram.addInstruction(new ShotInstruction(this._enemy));
    enemyProgram.addInstruction(new SupplyInstruction(this._enemy));
    enemyProgram.addInstruction(new TurnEnemyScanInstruction(this._enemy, this._player));
    enemyProgram.addInstruction(new HpBranchInstruction(this._enemy));
    enemyProgram.addInstruction(new EnemyDistanceInstruction(this._enemy, this._player));
    enemyProgram.addInstruction(new EnergyBranchInstruction(this._enemy));
    enemyProgram.addInstruction(new EnemyEnergyBranchInstruction(this._player));
    enemyProgram.addInstruction(new ResourceBranchInstruction(this._enemy));
    return this.octagram.showProgram(this.playerProgramId);
  };

  RobotWorld.prototype.initialize = function(views) {
    var plate;
    plate = Map.instance.getPlate(1, 1);
    this.player.moveImmediately(plate);
    plate = Map.instance.getPlate(7, 5);
    return this.enemy.moveImmediately(plate);
  };

  RobotWorld.prototype.collisionBullet = function(bullet, robot) {
    return bullet.holder !== robot && bullet.within(robot, 32);
  };

  RobotWorld.prototype.updateItems = function() {
    var del, i, v, _i, _len, _ref,
      _this = this;
    del = -1;
    _ref = this.items;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      v = _ref[i];
      if (v.animated === false) {
        del = i;
        this.items[i] = false;
      }
    }
    if (del !== -1) {
      return this.items.some(function(v, i) {
        if (v === false) {
          return _this.items.splice(i, 1);
        }
      });
    }
  };

  RobotWorld.prototype.updateBullets = function() {
    var del, i, robot, v, _i, _j, _len, _len1, _ref, _ref1,
      _this = this;
    del = -1;
    _ref = this._robots;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      robot = _ref[_i];
      _ref1 = this.bullets;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        v = _ref1[i];
        if (v !== false) {
          if (this.collisionBullet(v, robot)) {
            del = i;
            v.hit(robot);
            this.bullets[i] = false;
          } else if (v.animated === false) {
            del = i;
            this.bullets[i] = false;
          }
        }
      }
    }
    if (del !== -1) {
      return this.bullets.some(function(v, i) {
        if (v === false) {
          return _this.bullets.splice(i, 1);
        }
      });
    }
  };

  RobotWorld.prototype._isAnimated = function(array, func) {
    var animated, i, _i, _len;
    animated = false;
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      i = array[_i];
      animated = func(i);
      if (animated === true) {
        break;
      }
    }
    return animated;
  };

  RobotWorld.prototype._lose = function() {
    if (this.player.hp > this.enemy.hp) {
      return this.enemy;
    } else if (this.player.hp < this.enemy.hp) {
      return this.player;
    } else {
      if (this.player.consumptionEnergy > this.enemy.consumptionEnergy) {
        return this.player;
      } else if (this.player.consumptionEnergy < this.enemy.consumptionEnergy) {
        return this.enemy;
      } else {
        return this.enemy;
      }
    }
  };

  RobotWorld.prototype._win = function() {
    if (this.player.hp > this.enemy.hp) {
      return this.player;
    } else if (this.player.hp < this.enemy.hp) {
      return this.enemy;
    } else {
      if (this.player.consumptionEnergy > this.enemy.consumptionEnergy) {
        return this.enemy;
      } else if (this.player.consumptionEnergy < this.enemy.consumptionEnergy) {
        return this.player;
      } else {
        return this.player;
      }
    }
  };

  RobotWorld.prototype.reset = function() {
    this.enemy.reset(7, 5);
    this.player.reset(1, 1);
    return this.diePlayer = false;
  };

  RobotWorld.prototype.updateRobots = function() {
    var i, _i, _len, _ref, _results;
    _ref = this._robots;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      _results.push(i.update());
    }
    return _results;
  };

  RobotWorld.prototype.update = function(views) {
    if (this._start && this.age % Config.Frame.GAME_TIMER_CLOCK === 0) {
      this._timer += 1;
      this.dispatchEvent(new RobotEvent('ontimer'), {
        timer: this.timer
      });
      if (this.timer >= RobotWorld.TIME_LIMIT && this.diePlayer === false) {
        this.diePlayer = this._lose();
        this._start = false;
        this.dispatchEvent(new RobotEvent('gameend', {
          win: this._win(),
          lose: this.diePlayer,
          type: RobotAIGame.END.TIME_LIMIT
        }));
        console.log("end");
      }
    }
    this.updateItems();
    this.updateRobots();
    return this.updateBullets();
  };

  return RobotWorld;

})(GroupModel);

RobotScene = (function(_super) {
  __extends(RobotScene, _super);

  function RobotScene(game) {
    var __this;
    this.game = game;
    this.restart = __bind(this.restart, this);
    RobotScene.__super__.constructor.call(this, this);
    this.views = new ViewWorld(Config.GAME_OFFSET_X, Config.GAME_OFFSET_Y, this);
    this.world = new RobotWorld(Config.GAME_OFFSET_X, Config.GAME_OFFSET_Y, this);
    __this = this;
    this.world.addEventListener('gameend', function(evt) {
      var id, params, prg, _i, _len, _ref;
      params = evt.params;
      _ref = [this.enemyProgramId, this.playerProgramId];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        prg = this.octagram.getInstance(id);
        prg.stop();
      }
      return __this.dispatchEvent(new RobotEvent("gameend", params));
    });
    this.views.initEvent(this.world);
    this.world.initialize();
  }

  RobotScene.prototype.onenterframe = function() {
    return this.update();
  };

  RobotScene.prototype.restart = function() {
    this.views.reset();
    return this.world.reset();
  };

  RobotScene.prototype.update = function() {
    this.world.update(this.views);
    return this.views.update(this.world);
  };

  return RobotScene;

})(Scene);

RobotGame = (function(_super) {
  __extends(RobotGame, _super);

  function RobotGame(width, height, options) {
    this.options = options;
    RobotGame.__super__.constructor.call(this, width, height);
    this._assetPreload();
    this.keybind(87, 'w');
    this.keybind(65, 'a');
    this.keybind(88, 'x');
    this.keybind(68, 'd');
    this.keybind(83, 's');
    this.keybind(81, 'q');
    this.keybind(69, 'e');
    this.keybind(67, 'c');
    this.keybind(80, 'p');
    this.keybind(76, 'l');
    this.keybind(77, 'm');
    this.keybind(78, 'n');
    this.keybind(74, 'j');
    this.keybind(73, 'i');
    this.keybind(75, 'k');
    this.keybind(79, 'o');
  }

  RobotGame.prototype._assetPreload = function() {
    var load,
      _this = this;
    load = function(hash) {
      var k, path, _results;
      _results = [];
      for (k in hash) {
        path = hash[k];
        _results.push(_this.preload(path));
      }
      return _results;
    };
    load(R.CHAR);
    load(R.BACKGROUND_IMAGE);
    load(R.UI);
    load(R.EFFECT);
    load(R.BULLET);
    load(R.ITEM);
    return load(R.TIP);
  };

  RobotGame.prototype.onload = function() {
    var _this = this;
    this.scene = new RobotScene(this);
    this.pushScene(this.scene);
    this.octagram = new Octagram(Config.OCTAGRAM_DIR);
    this.octagram.onload = function() {
      _this.scene.world.initInstructions(_this.octagram);
      if (_this.options && _this.options.onload) {
        _this.options.onload();
      }
      return _this.scene.addEventListener("gameend", function(evt) {
        if (_this.options && _this.options.onend) {
          return _this.options.onend(evt.params);
        }
      });
    };
    this.assets["font0.png"] = this.assets['resources/ui/font0.png'];
    this.assets["apad.png"] = this.assets['resources/ui/apad.png'];
    this.assets["icon0.png"] = this.assets['resources/ui/icon0.png'];
    return this.assets["pad.png"] = this.assets['resources/ui/pad.png'];
  };

  return RobotGame;

})(Core);

runGame = function(options) {
  var game;
  game = new RobotGame(Config.GAME_WIDTH, Config.GAME_HEIGHT, options);
  return game.start();
};
