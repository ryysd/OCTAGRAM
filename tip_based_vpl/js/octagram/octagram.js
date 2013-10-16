// Generated by CoffeeScript 1.6.3
var OctagramContent, OctagramContentSet, TipSet,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TipSet = (function() {
  function TipSet() {
    this.tips = [];
  }

  TipSet.prototype.clear = function() {
    return this.tips = [];
  };

  TipSet.prototype.addTip = function(tip) {
    return this.tips.push(tip);
  };

  TipSet.prototype.addInstruction = function(inst) {
    var tip;
    tip = TipFactory.createInstructionTip(inst);
    return this.addTip(tip);
  };

  TipSet.prototype.findByInst = function(instName) {
    var tip;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.tips;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tip = _ref[_i];
        if ((tip.code.instruction != null) && tip.code.instruction.constructor.name === instName) {
          _results.push(tip);
        }
      }
      return _results;
    }).call(this))[0];
  };

  TipSet.prototype.findByCode = function(codeName) {
    var tip;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = this.tips;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tip = _ref[_i];
        if (tip.code.constructor.name === codeName) {
          _results.push(tip);
        }
      }
      return _results;
    }).call(this))[0];
  };

  return TipSet;

})();

OctagramContentSet = (function() {
  function OctagramContentSet(x, y, xnum, ynum) {
    this.x = x;
    this.y = y;
    this.xnum = xnum;
    this.ynum = ynum;
    this.octagrams = {};
    this.currentInstance = null;
  }

  OctagramContentSet.prototype.createInstance = function() {
    var instance;
    instance = new OctagramContent(this.x, this.y, this.xnum, this.ynum);
    this.octagrams[instance.id] = instance;
    return instance;
  };

  OctagramContentSet.prototype.removeInstance = function(id) {};

  OctagramContentSet.prototype.getInstance = function(id) {
    return this.octagrams[id];
  };

  OctagramContentSet.prototype.show = function(id) {
    if (this.currentInstance) {
      this.currentInstance.hide();
    }
    this.currentInstance = this.octagrams[id];
    return this.currentInstance.show();
  };

  return OctagramContentSet;

})();

OctagramContent = (function(_super) {
  __extends(OctagramContent, _super);

  function OctagramContent(x, y, xnum, ynum) {
    var back, selector;
    OctagramContent.__super__.constructor.call(this);
    this.id = uniqueID();
    this.tipSet = new TipSet();
    this.userInstructions = [];
    this.cpu = new Cpu(x + 12, y + 12, xnum, ynum, Environment.startX, this);
    this.executer = new Executer(this.cpu);
    back = new TipBackground(x, y, xnum, ynum);
    this.ui = {};
    this.ui.frame = new Frame(0, 0);
    this.ui.help = new HelpPanel(0, Environment.EditorHeight + y, Environment.ScreenWidth, Environment.ScreenWidth - Environment.EditorWidth - x, "");
    selector = new ParameterConfigPanel(Environment.EditorWidth + x / 2, 0);
    this.ui.side = new SideTipSelector(Environment.EditorWidth + x / 2, 0);
    this.ui.configPanel = new UIPanel(selector);
    this.ui.configPanel.setTitle(TextResource.msg.title["configurator"]);
    selector.parent = this.ui.configPanel;
    this.addChild(back);
    this.addChild(this.cpu);
    this.addChild(this.ui.frame);
    this.addChild(this.ui.side);
    this.addChild(this.ui.help);
    this.addPresetInstructions();
  }

  OctagramContent.prototype.addInstruction = function(instruction) {
    this.tipSet.addInstruction(instruction);
    return this.userInstructions.push(instruction);
  };

  OctagramContent.prototype.addUserInstructions = function() {
    var instruction, _i, _len, _ref, _results;
    _ref = this.userInstructions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instruction = _ref[_i];
      _results.push(this.tipSet.addInstruction(instruction));
    }
    return _results;
  };

  OctagramContent.prototype.addPresetInstructions = function() {
    var counters, i, inst, nopTip, returnTip, stack, stopTip, _i;
    stack = new StackMachine();
    counters = [];
    for (i = _i = 0; _i < 100; i = ++_i) {
      counters[i] = new Counter();
    }
    returnTip = TipFactory.createReturnTip(Environment.startX, Environment.startY);
    stopTip = TipFactory.createStopTip();
    nopTip = TipFactory.createNopTip();
    inst = new RandomBranchInstruction();
    this.tipSet.addInstruction(inst, Resources.get("iconRandom"));
    this.tipSet.addTip(returnTip);
    this.tipSet.addTip(stopTip);
    this.tipSet.addTip(nopTip, Resources.get("iconNop"));
    this.tipSet.addInstruction(new CounterIncrementInstruction(counters), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new CounterDecrementInstruction(counters), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new CounterBranchInstruction(counters), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new CounterPushInstruction(counters, stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new CounterPopInstruction(counters, stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackAddInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackSubInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackMulInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackDivInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackModInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackXorInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackGrtInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackSwpInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackNotInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackDupInstruction(stack), Resources.get("iconRandom"));
    this.tipSet.addInstruction(new StackRotInstruction(stack), Resources.get("iconRandom"));
    return this.tipSet.addInstruction(new StackBnzInstruction(stack), Resources.get("iconRandom"));
  };

  OctagramContent.prototype.clearInstructions = function() {
    return this.tipSet.clear();
  };

  OctagramContent.prototype.load = function(filename) {
    return this.cpu.load(filename);
  };

  OctagramContent.prototype.save = function(filename) {
    return this.cpu.save(filename);
  };

  OctagramContent.prototype.execute = function() {
    return this.executer.execute();
  };

  OctagramContent.prototype.stop = function() {
    return this.executer.stop();
  };

  OctagramContent.prototype.setTipToBar = function() {
    var tip, _i, _len, _ref, _results;
    this.clearInstructions();
    this.ui.side.clearTip();
    this.addUserInstructions();
    this.addPresetInstructions();
    _ref = this.tipSet.tips;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tip = _ref[_i];
      _results.push(this.ui.side.addTip(tip));
    }
    return _results;
  };

  OctagramContent.prototype.show = function() {
    this.setTipToBar();
    return Game.instance.currentScene.addChild(this);
  };

  OctagramContent.prototype.hide = function() {
    return Game.instance.currentScene.removeChild(this);
  };

  return OctagramContent;

})(Group);
