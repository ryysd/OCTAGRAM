// Generated by CoffeeScript 1.6.3
var GraphSearcher, JsBlock, JsBranchBlock, JsConstant, JsForBlock, JsGenerator, JsPlainBlock, JsText, JsWhileBlock, LoopFinder, arrayEqual, getUniqueArray, intersection, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

getUniqueArray = function(ary) {
  var storage, uniqueArray, value, _i, _len;
  storage = [];
  uniqueArray = [];
  for (_i = 0, _len = ary.length; _i < _len; _i++) {
    value = ary[_i];
    if (!(__indexOf.call(storage, value) >= 0)) {
      storage.push(value);
      uniqueArray.push(value);
      uniqueArray;
    }
  }
  return uniqueArray;
};

arrayEqual = function(a, b) {
  return a.length === b.length && a.every(function(elem, i) {
    return elem === b[i];
  });
};

intersection = function(arrA, arrB) {
  var a, b, exist, _i, _j, _len, _len1, _results;
  exist = {};
  for (_i = 0, _len = arrA.length; _i < _len; _i++) {
    a = arrA[_i];
    exist[a.order] = true;
  }
  _results = [];
  for (_j = 0, _len1 = arrB.length; _j < _len1; _j++) {
    b = arrB[_j];
    if (exist[b.order]) {
      _results.push(b);
    }
  }
  return _results;
};

GraphSearcher = (function() {
  function GraphSearcher() {
    this.visited = [];
    this.predecessors = {};
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

  GraphSearcher.prototype.getChilds = function(node, cpu, expand) {
    var childs, d, dirs, idx;
    if (expand != null) {
      return expand(node);
    } else {
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
    }
  };

  GraphSearcher.prototype.findUnvisitedChild = function(node, cpu, expand) {
    var child, childs, unvisited;
    childs = this.getChilds(node, cpu, expand);
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

  GraphSearcher.prototype.findVisitedChild = function(node, cpu, expand) {
    var child, childs, visited;
    childs = this.getChilds(node, cpu, expand);
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

  GraphSearcher.prototype.getSuccessors = function(node, context) {
    var graph, successors;
    successors = [];
    graph = new GraphSearcher();
    graph.dfs(node, context.cpu, function(obj) {
      if ((context.end != null) && obj.node === context.end) {
        return false;
      } else {
        successors.push(obj.node);
        return true;
      }
    });
    return successors;
  };

  GraphSearcher.prototype.getImmediatePredecessors = function(node, context) {
    var cand, candSucc, cur, dx, dy, inRange, nx, ny, _i, _j;
    if (this.predecessors[node.order] == null) {
      this.predecessors[node.order] = [];
      for (dx = _i = -1; _i <= 1; dx = ++_i) {
        for (dy = _j = -1; _j <= 1; dy = ++_j) {
          cur = node.getIndex();
          nx = cur.x + dx;
          ny = cur.y + dy;
          inRange = function(v) {
            return -1 <= v && v < 8;
          };
          if (inRange(nx) && inRange(ny)) {
            cand = context.cpu.getTip(nx, ny);
            candSucc = this.getChilds(cand, context.cpu);
            if ((candSucc != null) && __indexOf.call(candSucc, node) >= 0) {
              this.predecessors[node.order].push(cand);
            }
          }
        }
      }
    }
    return this.predecessors[node.order];
  };

  GraphSearcher.prototype.calcPredecessors = function(root, context) {
    var _calcPredecessors,
      _this = this;
    _calcPredecessors = function(node) {
      var pre, _i, _len, _ref, _results;
      _ref = _this.predecessors[node.order];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pre = _ref[_i];
        _results.push(_calcPredecessors(pre, context));
      }
      return _results;
    };
    return _calcPredecessors(root);
  };

  GraphSearcher.prototype.getPredecessors = function(root, context) {
    var calced, _getPredecessors,
      _this = this;
    calced = [];
    _getPredecessors = function(node) {
      var p, parents, predecessors, _i, _len;
      if (!(__indexOf.call(calced, node) >= 0)) {
        calced.push(node);
        predecessors = [];
        if (_this.predecessors[node.order] == null) {
          _this.calcPredecessors(node, context);
        }
        parents = _this.predecessors[node.order];
        if (parents.length > 0) {
          for (_i = 0, _len = parents.length; _i < _len; _i++) {
            p = parents[_i];
            predecessors.push(p);
            predecessors = predecessors.concat(_getPredecessors(p));
          }
        }
        return getUniqueArray(predecessors);
      } else {
        return [];
      }
    };
    return _getPredecessors(root);
  };

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

  GraphSearcher.prototype.assignOrder = function(root, context) {
    var graph, order,
      _this = this;
    graph = new GraphSearcher();
    order = 0;
    return graph.dfs(root, context.cpu, function(obj) {
      obj.node.order = order++;
      return true;
    });
  };

  GraphSearcher.prototype.dfs = function(root, cpu, callback, expand) {
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
      child = this.findUnvisitedChild(node, cpu, expand);
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

LoopFinder = (function() {
  function LoopFinder() {}

  LoopFinder.prototype.initDominators = function(root, universal) {
    var dominators, u, _i, _len, _results;
    dominators = {};
    _results = [];
    for (_i = 0, _len = universal.length; _i < _len; _i++) {
      u = universal[_i];
      _results.push(dominators[u.order] = u === root ? [u] : universal.slice(0));
    }
    return _results;
  };

  LoopFinder.prototype.createDominatorTree = function(root, universal, graph, context) {
    var dom, dominators, idom, node, nodes, _i, _j, _len, _len1;
    dominators = this.calcDominators(root, universal, graph, context);
    nodes = universal.slice(0);
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      node.childs = [];
    }
    for (_j = 0, _len1 = nodes.length; _j < _len1; _j++) {
      node = nodes[_j];
      if (!(node !== root)) {
        continue;
      }
      dom = dominators[node.order];
      idom = dom[dom.length - 2];
      idom.childs.push(node);
      node.idom = idom;
    }
    return {
      tree: nodes,
      dominators: dominators
    };
  };

  LoopFinder.prototype.calcDominators = function(root, universal, graph, context) {
    var dominators, isChangeOccurred, p, preDominators, u, _i, _j, _len, _len1, _ref;
    dominators = this.initDominators(root, universal);
    preDominators = [];
    isChangeOccurred = function(pre, cur) {
      var i, _i, _ref;
      if (pre.length !== cur.length) {
        return true;
      }
      for (i = _i = 0, _ref = cur.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (!arrayEqual(pre[i], cur[i])) {
          return true;
        }
      }
      return false;
    };
    while (isChangeOccurred(preDominators, dominators)) {
      preDominators = dominators.slice(0);
      for (_i = 0, _len = universal.length; _i < _len; _i++) {
        u = universal[_i];
        if (!(u !== root)) {
          continue;
        }
        dominators[u.order] = universal.slice(0);
        _ref = graph.getImmediatePredecessors(u, context);
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          p = _ref[_j];
          if (dominators[p.order] != null) {
            dominators[u.order] = intersection(dominators[u.order], dominators[p.order]);
          }
        }
        dominators[u.order] = dominators[u.order].concat([u]);
      }
    }
    return dominators;
  };

  LoopFinder.prototype.findLoopHeaders = function(root, dominators, graph, context) {
    var headers;
    headers = [];
    return grpah.dfs(root, context.cpu, function(obj) {});
  };

  LoopFinder.prototype.findBackEdges = function(root, dominators, graph, context) {
    var backedges;
    backedges = [];
    graph.dfs(root, context.cpu, function(obj) {
      var backedge, dom, s, succ;
      succ = graph.getChilds(obj.node, context.cpu);
      dom = dominators[obj.node.order];
      if (succ != null) {
        backedge = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = succ.length; _i < _len; _i++) {
            s = succ[_i];
            if (__indexOf.call(dom, s) >= 0) {
              _results.push({
                src: obj.node,
                dst: s
              });
            }
          }
          return _results;
        })();
        if (backedge.length > 0) {
          backedges = backedges.concat(backedge);
        }
      }
      return true;
    });
    return backedges;
  };

  LoopFinder.prototype.calcLoop = function(edge, dominators, context) {
    var graph, insert, lp, m, p, stack, _i, _len, _ref;
    graph = new GraphSearcher();
    stack = [];
    lp = [edge.dst];
    insert = function(m) {
      var _ref;
      if (!(__indexOf.call(lp, m) >= 0) && (m.order != null) && (_ref = edge.dst, __indexOf.call(dominators[m.order], _ref) >= 0)) {
        lp.push(m);
        return stack.push(m);
      }
    };
    insert(edge.src);
    while (stack.length > 0) {
      m = stack.pop();
      _ref = graph.getImmediatePredecessors(m, context);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        insert(p);
      }
    }
    return lp;
  };

  LoopFinder.prototype.find = function(cpu) {
    var backedges, context, dom, domTree, dominators, edge, graph, loops, lp, root, universal, _i, _len,
      _this = this;
    root = cpu.getStartTip();
    context = {
      cpu: cpu
    };
    graph = new GraphSearcher();
    graph.assignOrder(root, context);
    universal = [];
    graph.dfs(root, cpu, function(obj) {
      return universal.push(obj.node);
    });
    dom = this.createDominatorTree(root, universal, graph, context);
    domTree = dom.tree;
    dominators = dom.dominators;
    backedges = this.findBackEdges(root, dominators, graph, context);
    loops = [];
    for (_i = 0, _len = backedges.length; _i < _len; _i++) {
      edge = backedges[_i];
      lp = this.calcLoop(edge, dominators, context);
      loops.push(lp);
    }
    return {
      loops: loops,
      backedges: backedges,
      dominators: dom.dominators
    };
  };

  LoopFinder.prototype.verify = function(loopObj, context) {
    var buf, error, graph, h, header, headers, loops, lp, n, p, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref;
    loops = loopObj.loops;
    graph = new GraphSearcher();
    headers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = loops.length; _i < _len; _i++) {
        lp = loops[_i];
        _results.push(lp[0].order);
      }
      return _results;
    })();
    buf = [];
    for (_i = 0, _len = headers.length; _i < _len; _i++) {
      h = headers[_i];
      if (buf[h] != null) {
        return {
          loop: ((function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = loops.length; _j < _len1; _j++) {
              lp = loops[_j];
              if (lp[0].order = h) {
                _results.push(lp[0]);
              }
            }
            return _results;
          })())[0],
          reason: 'duplicateHeader'
        };
      } else {
        buf[h] = true;
      }
    }
    for (_j = 0, _len1 = loops.length; _j < _len1; _j++) {
      lp = loops[_j];
      header = lp[0];
      for (_k = 0, _len2 = lp.length; _k < _len2; _k++) {
        n = lp[_k];
        if (n !== header) {
          _ref = graph.getImmediatePredecessors(n, context);
          for (_l = 0, _len3 = _ref.length; _l < _len3; _l++) {
            p = _ref[_l];
            if ((p.order != null) && !(__indexOf.call(lp, p) >= 0)) {
              return {
                loop: lp,
                reason: 'multiEnterEdge'
              };
            }
          }
        }
      }
    }
    graph = new GraphSearcher();
    loops = [];
    error = null;
    graph.dfs(context.cpu.getStartTip(), context.cpu, function(obj) {
      var bedge, childs, edge, edges, s, succ, _len4, _len5, _m, _n, _ref1;
      childs = graph.getChilds(obj.node, context.cpu);
      if (childs == null) {
        return true;
      }
      succ = (function() {
        var _len4, _m, _results;
        _results = [];
        for (_m = 0, _len4 = childs.length; _m < _len4; _m++) {
          s = childs[_m];
          if (graph.isVisited(s) && __indexOf.call(obj.stack, s) >= 0) {
            _results.push(s);
          }
        }
        return _results;
      })();
      if ((succ == null) || succ.length === 0) {
        return true;
      }
      edges = (function() {
        var _len4, _m, _results;
        _results = [];
        for (_m = 0, _len4 = succ.length; _m < _len4; _m++) {
          s = succ[_m];
          _results.push({
            src: obj.node,
            dst: s
          });
        }
        return _results;
      })();
      for (_m = 0, _len4 = edges.length; _m < _len4; _m++) {
        edge = edges[_m];
        _ref1 = loopObj.backedges;
        for (_n = 0, _len5 = _ref1.length; _n < _len5; _n++) {
          bedge = _ref1[_n];
          if ((edge.src === bedge.src) && (edge.dst === bedge.dst)) {
            return true;
          }
        }
      }
      error = {
        loop: graph.findLoop(obj.node, context.cpu, obj.stack),
        reason: 'nonNaturalLoop'
      };
      return false;
    });
    return error;
  };

  return LoopFinder;

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
      node: (node instanceof Array ? node : [node]),
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
    var code, line, nodes;
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
    nodes = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = this.lines;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        line = _ref1[_i];
        _results.push(line.node[0]);
      }
      return _results;
    }).call(this);
    code.unshift({
      node: nodes,
      text: '{'
    });
    code.push({
      node: nodes,
      text: '}'
    });
    return code;
  };

  JsBlock.prototype.clone = function() {
    var block;
    block = new JsBlock();
    block.lines = this.lines.slice(0);
    return block;
  };

  return JsBlock;

})(JsPlainBlock);

JsWhileBlock = (function(_super) {
  __extends(JsWhileBlock, _super);

  function JsWhileBlock(condition, root) {
    this.condition = condition;
    this.root = root;
    JsWhileBlock.__super__.constructor.call(this);
  }

  JsWhileBlock.prototype.createCondition = function() {
    return this.condition;
  };

  JsWhileBlock.prototype.generateCode = function() {
    var code;
    code = JsWhileBlock.__super__.generateCode.call(this);
    code[0].text = 'while( ' + this.createCondition() + ' ) ' + code[0].text;
    code[0].node.unshift(this.root);
    code[code.length - 1].node.unshift(this.root);
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
  function JsBranchBlock(condition, root) {
    this.condition = condition;
    this.root = root;
    this.ifBlock = new JsBlock();
    this.elseBlock = new JsBlock();
    this.breakBlock = new JsPlainBlock();
    this.headerBlock = new JsPlainBlock();
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

  JsBranchBlock.prototype.removeCommonProcess = function(ifLines, elseLines) {
    var common, i, line, ln, long, short, sn, _i, _ref1;
    long = ifLines.length > elseLines.length ? ifLines : elseLines;
    short = ifLines.length <= elseLines.length ? ifLines : elseLines;
    common = new JsPlainBlock();
    if (long.length > 0 && short.length > 0) {
      for (i = _i = 1, _ref1 = short.length; 1 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 1 <= _ref1 ? ++_i : --_i) {
        ln = long[long.length - 1].node;
        sn = short[short.length - 1].node;
        if (arrayEqual(ln, sn)) {
          line = long.pop();
          short.pop();
          common.insertLine(line.node, line.text);
        } else {
          break;
        }
      }
    }
    common.lines.reverse();
    return common;
  };

  JsBranchBlock.prototype.generateCode = function() {
    var commonBlock, commonCode, elseBlock, elseCode, headerCode, ifBlock, ifCode;
    ifBlock = this.ifBlock.clone();
    elseBlock = this.elseBlock.clone();
    commonBlock = this.removeCommonProcess(ifBlock.lines, elseBlock.lines);
    ifCode = ifBlock.generateCode();
    elseCode = elseBlock.generateCode();
    ifCode[0].text = 'if( ' + this.createCondition() + ' ) ' + ifCode[0].text;
    elseCode[0].text = 'else ' + elseCode[0].text;
    ifCode[0].node.unshift(this.root);
    ifCode[ifCode.length - 1].node.unshift(this.root);
    elseCode[0].node.unshift(this.root);
    elseCode[elseCode.length - 1].node.unshift(this.root);
    commonCode = commonBlock.generateCode();
    headerCode = this.headerBlock.generateCode();
    return headerCode.concat(ifCode.concat(elseCode).concat(commonCode));
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
    var lp, newOrder, node, order, sort, _i, _len, _ref1;
    sort = function(arr) {
      return arr.sort(function(a, b) {
        return a - b;
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
    var finder;
    finder = new LoopFinder();
    return finder.find(context.cpu);
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
    context.end = node;
    ifSuccessors = graph.getSuccessors(nodes.ifNext, context);
    elseSuccessors = graph.getSuccessors(nodes.elseNext, context);
    for (_i = 0, _len = ifSuccessors.length; _i < _len; _i++) {
      s = ifSuccessors[_i];
      if (__indexOf.call(elseSuccessors, s) >= 0) {
        return s;
      }
    }
    return null;
  };

  JsGenerator.prototype.isChildLoopNode = function(node, childLoop) {
    var lp, n, _i, _j, _len, _len1;
    for (_i = 0, _len = childLoop.length; _i < _len; _i++) {
      lp = childLoop[_i];
      for (_j = 0, _len1 = lp.length; _j < _len1; _j++) {
        n = lp[_j];
        if (node === n) {
          return true;
        }
      }
    }
    return false;
  };

  JsGenerator.prototype.generateWhileCode = function(root, context) {
    var block, child;
    block = new JsWhileBlock('true');
    if (this.isSingleTransitionTip(root)) {
      block.insertLine(root, this.getOperationName(root) + '();');
      child = (new GraphSearcher()).getChilds(root, context.cpu);
      if (child != null) {
        block.insertBlock(this.generateCode(child[0], context));
      }
    } else if (this.isBranchTransitionTip(root)) {
      block.insertBlock(this.generateBranchCode(root, context));
    }
    return block;
  };

  JsGenerator.prototype.findBreakNode = function(root, branchNodes, context) {
    var lp, result, _ref1, _ref2;
    result = {
      "if": false,
      "else": false
    };
    lp = this.getCurrentLoop(context);
    if (!(_ref1 = branchNodes.ifNext, __indexOf.call(lp, _ref1) >= 0)) {
      result["if"] = true;
      result["else"] = false;
    } else if (!(_ref2 = branchNodes.elseNext, __indexOf.call(lp, _ref2) >= 0)) {
      result["if"] = false;
      result["else"] = true;
    }
    return result;
  };

  JsGenerator.prototype.generateBranchCode = function(root, context) {
    var block, nodes;
    block = new JsBranchBlock(this.getOperationName(root), root);
    nodes = this.getBranchNodes(root, context);
    block.ifBlock.insertBlock(this.generateCode(nodes.ifNext, context));
    block.elseBlock.insertBlock(this.generateCode(nodes.elseNext, context));
    return block;
  };

  JsGenerator.prototype.isTraversedLoopHeader = function(node, context) {
    var lp, _i, _len, _ref1;
    if (context.loop != null) {
      _ref1 = context.loop;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        lp = _ref1[_i];
        if (lp[0] === node) {
          return true;
        }
      }
    }
    return false;
  };

  JsGenerator.prototype.isChildLoopHeader = function(node, context) {
    var n, _i, _len, _ref1;
    if (context.loop != null) {
      _ref1 = this.loops[this.loops.length - 1];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        n = _ref1[_i];
        if (n === node) {
          return true;
        }
      }
    }
    return false;
  };

  JsGenerator.prototype.isOnLoop = function(node, lp) {
    var n, _i, _len;
    for (_i = 0, _len = lp.length; _i < _len; _i++) {
      n = lp[_i];
      if (node === n) {
        return true;
      }
    }
    return false;
  };

  JsGenerator.prototype.getCurrentLoop = function(context) {
    if ((context.loop != null) && context.loop.length > 0) {
      return context.loop[context.loop.length - 1];
    }
  };

  JsGenerator.prototype.generateCode = function(root, context) {
    var block, currentLoop, graph,
      _this = this;
    graph = new GraphSearcher();
    block = new JsPlainBlock();
    currentLoop = this.getCurrentLoop(context);
    graph.dfs(root, context.cpu, function(obj) {
      var br, lp, node;
      node = obj.node;
      if ((currentLoop != null) && !(__indexOf.call(currentLoop, node) >= 0)) {
        block.insertLine(null, 'break;');
        context["break"] = node;
        return false;
      } else {
        lp = _this.findLoopByEnterNode(node);
        if (lp != null) {
          if (!_this.isTraversedLoopHeader(node, context)) {
            if (context.loop == null) {
              context.loop = [];
            }
            context.loop.push(lp);
            block.insertBlock(_this.generateWhileCode(node, context));
            context.loop.pop();
            if (context["break"] != null) {
              br = context["break"];
              context["break"] = null;
              block.insertBlock(_this.generateCode(br, context));
            }
          }
          return false;
        } else if (_this.isBranchTransitionTip(node)) {
          block.insertBlock(_this.generateBranchCode(node, context));
          return false;
        } else if (_this.isSingleTransitionTip(node)) {
          block.insertLine(node, _this.getOperationName(node) + '();');
          return true;
        }
      }
    });
    return block;
  };

  JsGenerator.prototype.generateErrorCode = function(error) {
    switch (error.reason) {
      case 'duplicateHeader':
        return this.generateDuplicateHeaderErrorCode(error.loop);
      case 'multiEnterEdge':
        return this.generateNonNaturalLoopErrorCode(error.loop);
      case 'nonNaturalLoop':
        return this.generateNonNaturalLoopErrorCode(error.loop);
    }
  };

  JsGenerator.prototype.generateDuplicateHeaderErrorCode = function(errorLoop) {
    var block;
    block = new JsPlainBlock();
    block.insertLine(errorLoop, '//// Error ////');
    block.insertLine(errorLoop, '// ループの入り口は共有できません。');
    return block;
  };

  JsGenerator.prototype.generateNonNaturalLoopErrorCode = function(errorLoop) {
    var block;
    block = new JsPlainBlock();
    block.insertLine(errorLoop, '//// Error ////');
    block.insertLine(errorLoop, '// 不正なループを検出しました。');
    block.insertLine(errorLoop, '// ループに複数の入り口が存在する可能性があります。');
    return block;
  };

  JsGenerator.prototype.generateHeaderCode = function() {
    var block;
    block = new JsPlainBlock();
    block.insertLine(null, '// OCTAGRAMに対応するJavascriptコードです。');
    block.insertLine(null, '// ただし、non-natural loop(複数の入り口があるループなど)を含むプログラムの場合、');
    block.insertLine(null, '// 正しいコードが生成されません。');
    block.insertLine(null, '');
    return block;
  };

  JsGenerator.prototype.finalize = function(cpu) {
    var node, x, y, _i, _results;
    _results = [];
    for (x = _i = -1; _i <= 8; x = ++_i) {
      _results.push((function() {
        var _j, _results1;
        _results1 = [];
        for (y = _j = -1; _j <= 8; y = ++_j) {
          node = cpu.getTip(x, y);
          node.childs = void 0;
          node.idom = void 0;
          _results1.push(node.order = void 0);
        }
        return _results1;
      })());
    }
    return _results;
  };

  JsGenerator.prototype.generate = function(cpu) {
    var block, code, context, error, finder, headerBlock, loopObj, root;
    finder = new LoopFinder();
    root = cpu.getStartTip();
    context = {
      cpu: cpu
    };
    loopObj = this.findAllLoop(root, context);
    error = finder.verify(loopObj, context);
    this.loops = loopObj.loops;
    code = error != null ? this.generateErrorCode(error).generateCode() : (headerBlock = this.generateHeaderCode(), block = this.generateCode(root, context), block.generateCode());
    this.finalize(cpu);
    return code;
  };

  return JsGenerator;

})();
