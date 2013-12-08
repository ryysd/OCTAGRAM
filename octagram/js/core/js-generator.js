// Generated by CoffeeScript 1.6.3
var GraphSearcher, JsBlock, JsBranchBlock, JsConstant, JsForBlock, JsGenerator, JsPlainBlock, JsText, JsWhileBlock, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

GraphSearcher = (function() {
  function GraphSearcher() {
    this.visited = [];
  }

  GraphSearcher.prototype.visit = function(node) {
    return this.visited.push(node);
  };

  GraphSearcher.prototype.isVisited = function(node) {
    return __indexOf.call(this.visited, node) >= 0;
  };

  GraphSearcher.prototype.init = function() {
    return this.visited = [];
  };

  GraphSearcher.prototype.getChilds = function(node, cpu) {
    var childs, d, dirs, idx;
    dirs = node.getNextDir != null ? [node.getNextDir()] : node.getConseqDir != null ? [node.getConseqDir(), node.getAlterDir()] : null;
    if (dirs != null) {
      idx = node.getIndex();
      return childs = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = dirs.length; _i < _len; _i++) {
          d = dirs[_i];
          _results.push(cpu.getTip(d.x + idx.x, d.y + idx.y));
        }
        return _results;
      })();
    }
  };

  GraphSearcher.prototype.findUnvisitedChild = function(node, cpu) {
    var child, childs, unvisited;
    childs = this.getChilds(node, cpu);
    if (childs != null) {
      unvisited = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = childs.length; _i < _len; _i++) {
          child = childs[_i];
          if (!this.isVisited(child)) {
            _results.push(child);
          }
        }
        return _results;
      }).call(this);
      if (unvisited != null) {
        return unvisited[0];
      } else {
        return null;
      }
    }
  };

  GraphSearcher.prototype.findVisitedChild = function(node, cpu) {
    var child, childs, visited;
    childs = this.getChilds(node, cpu);
    if (childs != null) {
      visited = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = childs.length; _i < _len; _i++) {
          child = childs[_i];
          if (this.isVisited(child)) {
            _results.push(child);
          }
        }
        return _results;
      }).call(this);
      if (visited != null) {
        return visited[0];
      } else {
        return null;
      }
    }
  };

  GraphSearcher.prototype.findLoop = function(node, cpu, stack) {
    var child, i, idx, _i, _ref, _results;
    child = this.findVisitedChild(node, cpu);
    if (child != null) {
      idx = stack.indexOf(child);
      _results = [];
      for (i = _i = idx, _ref = stack.length; idx <= _ref ? _i < _ref : _i > _ref; i = idx <= _ref ? ++_i : --_i) {
        _results.push(stack[i]);
      }
      return _results;
    }
  };

  GraphSearcher.prototype.getSuccessors = function(node, cpu) {
    var graph, successors;
    successors = [];
    graph = new GraphSearcher();
    graph.dfs(node, cpu, function(obj) {
      successors.push(obj.node);
      return true;
    });
    return successors;
  };

  GraphSearcher.prototype.getPredecessors = function(root, context) {};

  GraphSearcher.prototype.findRoute = function(start, end, cpu) {
    var graph, route;
    route = [];
    graph = new GraphSearcher();
    graph.dfs(start, cpu, function(obj) {
      if (obj.node === end) {
        route = obj.stack;
        return false;
      } else {
        return true;
      }
    });
    return route;
  };

  GraphSearcher.prototype.dfs = function(root, cpu, callback) {
    var child, end, node, stack, _results, _visit,
      _this = this;
    this.init();
    end = false;
    stack = [];
    _visit = function(node) {
      stack.push(node);
      _this.visit(node);
      return callback({
        stack: stack,
        node: node,
        backtrack: false
      });
    };
    end = !_visit(root);
    _results = [];
    while (stack.length > 0 && !end) {
      node = stack[stack.length - 1];
      child = this.findUnvisitedChild(node, cpu);
      if (child != null) {
        _results.push(end = !_visit(child));
      } else {
        _results.push(stack.pop());
      }
    }
    return _results;
  };

  return GraphSearcher;

})();

JsConstant = (function() {
  function JsConstant() {}

  JsConstant.indent = '  ';

  return JsConstant;

})();

JsText = (function() {
  function JsText() {
    this.lines = [];
  }

  JsText.prototype.insertLine = function(node, text) {
    return this.lines.push({
      node: node,
      text: text
    });
  };

  JsText.prototype.insertBlock = function(block) {
    return this.insertArray(block.generateCode());
  };

  JsText.prototype.insertArray = function(array) {
    return this.lines = this.lines.concat(array);
  };

  JsText.prototype.clean = function() {
    return this.lines = [];
  };

  JsText.prototype.generateCode = function() {
    return this.lines;
  };

  return JsText;

})();

JsPlainBlock = (function(_super) {
  __extends(JsPlainBlock, _super);

  function JsPlainBlock() {
    JsPlainBlock.__super__.constructor.call(this);
    this.childs = [];
  }

  JsPlainBlock.prototype.addChild = function(child) {
    this.childs.push(child);
    return child.parent = this;
  };

  return JsPlainBlock;

})(JsText);

JsBlock = (function(_super) {
  __extends(JsBlock, _super);

  function JsBlock() {
    _ref = JsBlock.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  JsBlock.prototype.generateCode = function() {
    var code, line;
    code = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = this.lines;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        line = _ref1[_i];
        _results.push({
          node: line.node,
          text: JsConstant.indent + line.text
        });
      }
      return _results;
    }).call(this);
    code.unshift({
      text: '{'
    });
    code.push({
      text: '}'
    });
    return code;
  };

  return JsBlock;

})(JsPlainBlock);

JsWhileBlock = (function(_super) {
  __extends(JsWhileBlock, _super);

  function JsWhileBlock(condition) {
    this.condition = condition;
    JsWhileBlock.__super__.constructor.call(this);
  }

  JsWhileBlock.prototype.createCondition = function() {
    return this.condition;
  };

  JsWhileBlock.prototype.generateCode = function() {
    var code;
    code = JsWhileBlock.__super__.generateCode.call(this);
    code[0].text = 'while( ' + this.createCondition() + ' ) ' + code[0].text;
    return code;
  };

  return JsWhileBlock;

})(JsBlock);

JsForBlock = (function(_super) {
  __extends(JsForBlock, _super);

  function JsForBlock(condition) {
    this.condition = condition;
    JsForBlock.__super__.constructor.call(this);
  }

  JsForBlock.prototype.createCondition = function() {
    return this.condition;
  };

  JsForBlock.prototype.generateCode = function() {
    var code;
    code = JsForBlock.__super__.generateCode.call(this);
    code[0].text = 'for( ' + this.createCondition() + ' ) ' + code[0].text;
    return code;
  };

  return JsForBlock;

})(JsBlock);

JsBranchBlock = (function() {
  function JsBranchBlock(condition) {
    this.condition = condition;
    this.ifBlock = new JsBlock();
    this.elseBlock = new JsBlock();
  }

  JsBranchBlock.prototype.getIfBlock = function() {
    return this.ifBlock;
  };

  JsBranchBlock.prototype.getElseBlock = function() {
    return this.elseBlock;
  };

  JsBranchBlock.prototype.createCondition = function() {
    return this.condition;
  };

  JsBranchBlock.prototype.generateCode = function() {
    var elseCode, ifCode;
    ifCode = this.ifBlock.generateCode();
    elseCode = this.elseBlock.generateCode();
    ifCode[0].text = 'if( ' + this.createCondition() + ' ) ' + ifCode[0].text;
    elseCode[0].text = 'else ' + elseCode[0].text;
    ifCode[0].node = this.condition;
    return ifCode.concat(elseCode);
  };

  return JsBranchBlock;

})();

JsGenerator = (function() {
  function JsGenerator() {
    this.currentBlock = new JsPlainBlock();
    this.blockStack = [];
    this.loops = [];
  }

  JsGenerator.prototype.isBranchTransitionTip = function(node) {
    return (node.getConseqDir != null) && (node.getAlterDir != null);
  };

  JsGenerator.prototype.isSingleTransitionTip = function(node) {
    return node.getNextDir != null;
  };

  JsGenerator.prototype.getOperationName = function(node) {
    if (node.code.instruction != null) {
      return node.code.instruction.constructor.name;
    } else {
      return node.code.constructor.name;
    }
  };

  JsGenerator.prototype.insertToCurrentBlock = function(node) {
    return this.currentBlock.insertLine(node, this.getOperationName(node) + '();');
  };

  JsGenerator.prototype.registerLoop = function(newLp) {
    var arrayEqual, lp, newOrder, node, order, sort, _i, _len, _ref1;
    sort = function(arr) {
      return arr.sort(function(a, b) {
        return a - b;
      });
    };
    arrayEqual = function(a, b) {
      return a.length === b.length && a.every(function(elem, i) {
        return elem === b[i];
      });
    };
    newOrder = sort((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = newLp.length; _i < _len; _i++) {
        node = newLp[_i];
        _results.push(node.order);
      }
      return _results;
    })());
    _ref1 = this.loops;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      lp = _ref1[_i];
      order = sort((function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = lp.length; _j < _len1; _j++) {
          node = lp[_j];
          _results.push(node.order);
        }
        return _results;
      })());
      if (arrayEqual(order, newOrder)) {
        return false;
      }
    }
    return this.loops.push(newLp.slice(0));
  };

  JsGenerator.prototype.findAllLoop = function(root, context) {
    var graph, loops;
    ({
      findLoop: function(root, context) {}
    });
    graph = new GraphSearcher();
    loops = [];
    graph.dfs(root, context.cpu, function(obj) {
      var lp;
      lp = graph.findLoop(obj.node, context.cpu, obj.stack);
      if (lp != null) {
        loops.push(lp);
      }
      return true;
    });
    return loops;
  };

  JsGenerator.prototype.findLoopByEnterNode = function(node) {
    var lp, _i, _len, _ref1;
    _ref1 = this.loops;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      lp = _ref1[_i];
      if (node === lp[0]) {
        return lp;
      }
    }
    return null;
  };

  JsGenerator.prototype.getBranchNodes = function(node, context) {
    var cur, elseDir, elseNext, ifDir, ifNext;
    ifDir = node.getConseqDir();
    elseDir = node.getAlterDir();
    cur = node.getIndex();
    ifNext = context.cpu.getTip(cur.x + ifDir.x, cur.y + ifDir.y);
    elseNext = context.cpu.getTip(cur.x + elseDir.x, cur.y + elseDir.y);
    return {
      ifNext: ifNext,
      elseNext: elseNext
    };
  };

  JsGenerator.prototype.getMergeNode = function(node, context) {
    var elseSuccessors, graph, ifSuccessors, nodes, s, _i, _len;
    graph = new GraphSearcher();
    nodes = this.getBranchNodes(node, context);
    ifSuccessors = graph.getSuccessors(nodes.ifNext);
    elseSuccessors = graph.getSuccessors(nodes.elseNext);
    for (_i = 0, _len = ifSuccessors.length; _i < _len; _i++) {
      s = ifSuccessors[_i];
      if (__indexOf.call(elseSuccessors, s) >= 0) {
        return s;
      }
    }
    return null;
  };

  JsGenerator.prototype.generateWhileCode = function(root, context) {
    var block, node, _i, _len, _ref1;
    block = new JsWhileBlock('true');
    _ref1 = context.loop;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      node = _ref1[_i];
      if (this.isBranchTransitionTip(node)) {
        block.insertBlock(this.generateBranchCode(node, context));
        break;
      } else if (this.isSingleTransitionTip(node)) {
        block.insertLine(node, this.getOperationName(node) + '();');
      }
    }
    return block;
  };

  JsGenerator.prototype.generateBranchCode = function(root, context) {
    var block, nodes;
    block = new JsBranchBlock(this.getOperationName(root));
    nodes = this.getBranchNodes(root, context);
    block.ifBlock.insertBlock(this.generateCode(nodes.ifNext, context));
    block.elseBlock.insertBlock(this.generateCode(nodes.elseNext, context));
    return block;
  };

  JsGenerator.prototype.generateCode = function(root, context) {
    var block, graph,
      _this = this;
    graph = new GraphSearcher();
    block = new JsPlainBlock();
    graph.dfs(root, context.cpu, function(obj) {
      var lp, node;
      node = obj.node;
      lp = _this.findLoopByEnterNode(node);
      if (lp != null) {
        if ((context.loop == null) || context.loop[0] !== node) {
          context.loop = lp;
          block.insertBlock(_this.generateWhileCode(node, context));
        }
        return false;
      } else if (_this.isBranchTransitionTip(node)) {
        block.insertBlock(_this.generateBranchCode(node, context));
        return false;
      } else if (_this.isSingleTransitionTip(node)) {
        block.insertLine(node, _this.getOperationName(node) + '();');
        return true;
      }
    });
    return block;
  };

  JsGenerator.prototype.assignOrder = function(root, context) {
    var graph, order,
      _this = this;
    graph = new GraphSearcher();
    order = 0;
    return graph.dfs(root, context.cpu, function(obj) {
      obj.node.order = order++;
      return true;
    });
  };

  JsGenerator.prototype.generate = function(cpu) {
    var block, context, root;
    root = cpu.getStartTip();
    context = {
      cpu: cpu
    };
    this.loops = this.findAllLoop(root, context);
    block = this.generateCode(root, context);
    return block.generateCode();
  };

  return JsGenerator;

})();
