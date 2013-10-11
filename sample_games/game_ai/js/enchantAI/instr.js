// Generated by CoffeeScript 1.6.3
var ApproachInstruction, EnemyDistanceInstruction, HoldBulletBranchInstruction, HpBranchInstruction, InstrCommon, ItemScanMoveInstruction, LeaveInstruction, MoveInstruction, RandomMoveInstruction, ShotInstruction, TipInfo, TurnEnemyScanInstruction,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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

RandomMoveInstruction = (function(_super) {
  __extends(RandomMoveInstruction, _super);

  /*
    Random Move Instruction
  */


  function RandomMoveInstruction(robot) {
    this.robot = robot;
    RandomMoveInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.icon = new Icon(Game.instance.assets[R.TIP.ARROW], 32, 32);
  }

  RandomMoveInstruction.prototype.action = function() {
    var direct, rand, ret,
      _this = this;
    ret = false;
    while (!ret) {
      rand = Random.nextInt() % InstrCommon.getDirectSize();
      direct = InstrCommon.getRobotDirect(rand);
      ret = this.robot.move(direct.value, function() {
        return _this.onComplete();
      });
    }
    return this.setAsynchronous(ret !== false);
  };

  RandomMoveInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new RandomMoveInstruction(this.robot));
    return obj;
  };

  RandomMoveInstruction.prototype.mkDescription = function() {
    return "移動可能なマスにランダムに移動します。<br>(消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
  };

  RandomMoveInstruction.prototype.getIcon = function() {
    this.icon.frame = 0;
    return this.icon;
  };

  return RandomMoveInstruction;

})(ActionInstruction);

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
    this.icon = new Icon(Game.instance.assets[R.TIP.ARROW], 32, 32);
  }

  ApproachInstruction.prototype.action = function() {
    var direct, enemyPos, ret, robotPos,
      _this = this;
    ret = false;
    enemyPos = this.enemy.pos;
    robotPos = this.robot.pos;
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
      ret = this.robot.move(direct, function() {
        return _this.onComplete();
      });
    }
    if (ret === false) {
      return this.onComplete();
    }
  };

  ApproachInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new ApproachInstruction(this.robot, this.enemy));
    return obj;
  };

  ApproachInstruction.prototype.mkDescription = function() {
    return "敵に近づくように移動します。<br>(消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
  };

  ApproachInstruction.prototype.getIcon = function() {
    this.icon.frame = 0;
    return this.icon;
  };

  return ApproachInstruction;

})(ActionInstruction);

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
    this.icon = new Icon(Game.instance.assets[R.TIP.ARROW], 32, 32);
  }

  LeaveInstruction.prototype.action = function() {
    var direct, enemyPos, ret, robotPos,
      _this = this;
    ret = false;
    enemyPos = this.enemy.pos;
    robotPos = this.robot.pos;
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
      ret = this.robot.move(direct, function() {
        return _this.onComplete();
      });
    }
    if (ret === false) {
      return this.onComplete();
    }
  };

  LeaveInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new LeaveInstruction(this.robot, this.enemy));
    return obj;
  };

  LeaveInstruction.prototype.mkDescription = function() {
    return "敵から離れるように移動します。<br>(消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
  };

  LeaveInstruction.prototype.getIcon = function() {
    this.icon.frame = 0;
    return this.icon;
  };

  return LeaveInstruction;

})(ActionInstruction);

EnemyDistanceInstruction = (function(_super) {
  __extends(EnemyDistanceInstruction, _super);

  /*
    Enemy Distance Instruction
  */


  function EnemyDistanceInstruction(robot, enemy) {
    var column, labels;
    this.robot = robot;
    this.enemy = enemy;
    EnemyDistanceInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.tipInfo = new TipInfo(function(labels) {
      return "敵との距離が" + labels[0] + "の場合青い矢印に進みます。<br>そうでなければ、赤い矢印に進みます。      ";
    });
    column = "距離";
    labels = ["近距離", "中距離", "遠距離"];
    this.distanceParam = new TipParameter(column, 0, 0, 2, 1);
    this.distanceParam.id = "distance";
    this.addParameter(this.distanceParam);
    this.tipInfo.addParameter(this.distanceParam.id, column, labels, 0);
    this.icon = new Icon(Game.instance.assets[R.TIP.SEARCH_ENEMY], 32, 32);
  }

  EnemyDistanceInstruction.prototype.action = function() {
    return true;
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
    return this.icon;
  };

  return EnemyDistanceInstruction;

})(BranchInstruction);

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
      return "" + labels[0] + "に1マス移動します。<br>(消費フレーム " + Config.Frame.ROBOT_MOVE + ")";
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
      return "" + labels[0] + "に" + labels[1] + "回ターンします。<br>その途中に所持している弾丸の射程圏内に入っていれば、<br>青い矢印に進みます。<br>そうでなければ赤い矢印に進みます。<br>(消費フレーム 1回転当たり" + Config.Frame.ROBOT_TURN + "フレーム)      ";
    });
    column = "回転方向";
    labels = ["時計回り", "反時計回り"];
    this.rotateParam = new TipParameter(column, 0, 0, 1, 1);
    this.rotateParam.id = "rotate";
    this.addParameter(this.rotateParam);
    this.tipInfo.addParameter(this.rotateParam.id, column, labels, 0);
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
    count = this.lengthParam.value + 1;
    i = 0;
    turnOnComplete = function(robot) {
      var bullet;
      if (i < count) {
        if (_this.robot.bulletQueue.size() > 0) {
          bullet = _this.robot.bulletQueue.index(0);
          if (bullet.withinRange(_this.robot, _this.opponent, _this.robot.direct)) {
            _this.onComplete(true);
            return;
          }
        }
        i += 1;
        return _this.robot.turn(turnOnComplete);
      } else {
        return _this.onComplete(false);
      }
    };
    return setTimeout((function() {
      return turnOnComplete(_this.robot);
    }), Util.toMillisec(Config.Frame.ROBOT_TURN));
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

ItemScanMoveInstruction = (function(_super) {
  __extends(ItemScanMoveInstruction, _super);

  /*
    Item Scan and Move Instruction
  */


  function ItemScanMoveInstruction(robot) {
    this.robot = robot;
    ItemScanMoveInstruction.__super__.constructor.apply(this, arguments);
    this.setAsynchronous(true);
    this.icon = new Icon(Game.instance.assets[R.TIP.SEARCH_BARRIER], 32, 32);
  }

  ItemScanMoveInstruction.prototype.action = function() {
    var _this = this;
    return setTimeout((function() {
      var ret, target, targetDirect;
      ret = false;
      target = null;
      targetDirect = null;
      Map.instance.eachSurroundingPlate(_this.robot.currentPlate, function(plate, direct) {
        if (target === null && (plate.spot != null)) {
          target = plate;
          return targetDirect = direct;
        }
      });
      if (target != null) {
        ret = _this.robot.move(targetDirect, function() {
          return _this.onComplete();
        });
        if (ret === false) {
          return _this.onComplete();
        }
      } else {
        return _this.onComplete();
      }
    }), Util.toMillisec(Config.Frame.ROBOT_WAIT));
  };

  ItemScanMoveInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new ItemScanMoveInstruction(this.robot));
    return obj;
  };

  ItemScanMoveInstruction.prototype.mkDescription = function() {
    return "周囲1マスを探索し、弾丸を見つけた場合、そのマスへ進みます。<br>  (消費フレーム " + (Config.Frame.ROBOT_WAIT + Config.Frame.ROBOT_MOVE) + "フレーム)";
  };

  ItemScanMoveInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return ItemScanMoveInstruction;

})(ActionInstruction);

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
    return "ストレートバレットを撃ちます。<br>射程距離:前方方向に距離5<br>(消費フレーム " + Config.Frame.BULLET + "フレーム)";
  };

  ShotInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  ShotInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return ShotInstruction;

})(ActionInstruction);

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

HoldBulletBranchInstruction = (function(_super) {
  __extends(HoldBulletBranchInstruction, _super);

  /*
    Hold Bullet Instruction
  */


  function HoldBulletBranchInstruction(robot) {
    var column, labels;
    this.robot = robot;
    HoldBulletBranchInstruction.__super__.constructor.apply(this, arguments);
    this.tipInfo = new TipInfo(function(labels) {
      return "ストレートバレッドの保有弾数が" + labels[0] + "以上の時青矢印に進みます。<br>" + labels[0] + "未満の時は赤矢印に進みます。";
    });
    column = "保有弾数";
    labels = [0, 1, 2, 3, 4, 5];
    this.sizeParam = new TipParameter(column, 0, 0, 5, 1);
    this.sizeParam.id = "size";
    this.addParameter(this.sizeParam);
    this.tipInfo.addParameter(this.sizeParam.id, column, labels, 0);
    this.icon = new Icon(Game.instance.assets[R.TIP.REST_BULLET], 32, 32);
  }

  HoldBulletBranchInstruction.prototype.action = function() {
    if (this.robot.bulletQueue.size() >= this.sizeParam.value) {
      return true;
    } else {
      return false;
    }
  };

  HoldBulletBranchInstruction.prototype.clone = function() {
    var obj;
    obj = this.copy(new HoldBulletBranchInstruction(this.robot));
    obj.sizeParam.value = this.sizeParam.value;
    return obj;
  };

  HoldBulletBranchInstruction.prototype.onParameterChanged = function(parameter) {
    if (parameter.id === this.sizeParam.id) {
      this.sizeParam = parameter;
    }
    return this.tipInfo.changeLabel(parameter.id, parameter.value);
  };

  HoldBulletBranchInstruction.prototype.mkDescription = function() {
    return this.tipInfo.getDescription();
  };

  HoldBulletBranchInstruction.prototype.mkLabel = function(parameter) {
    return this.tipInfo.getLabel(parameter.id);
  };

  HoldBulletBranchInstruction.prototype.getIcon = function() {
    return this.icon;
  };

  return HoldBulletBranchInstruction;

})(BranchInstruction);
