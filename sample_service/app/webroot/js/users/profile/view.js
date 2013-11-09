// Generated by CoffeeScript 1.6.3
var ProgramView, UserProfileRouter,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ProgramView = (function(_super) {
  __extends(ProgramView, _super);

  ProgramView.prototype.el = "div#program";

  ProgramView.prototype.template = _.template($('#program-tpl').html());

  function ProgramView(options) {
    if (options == null) {
      options = {};
    }
    this.render = __bind(this.render, this);
    ProgramView.__super__.constructor.call(this, options);
  }

  ProgramView.prototype.initialize = function() {
    return this.model.on('change:name', this.render);
  };

  ProgramView.prototype.render = function() {
    this.ids = (this.model.attributes.battle_log.map(function(item) {
      return item.id;
    })).reverse();
    this.values = (this.model.attributes.battle_log.map(function(item) {
      return parseInt(item.rate);
    })).reverse();
    this.$el.html(this.template(this.model.attributes));
    $('#graph-container').highcharts({
      title: {
        text: 'レートの変動値',
        x: -20
      },
      xAxis: {
        categories: this.ids
      },
      yAxis: {
        title: {
          text: 'レート'
        },
        plotLines: [
          {
            value: 0,
            width: 1,
            color: '#808080'
          }
        ]
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },
      series: [
        {
          name: 'レート',
          data: this.values
        }
      ]
    });
    return this;
  };

  return ProgramView;

})(Backbone.View);

UserProfileRouter = (function(_super) {
  __extends(UserProfileRouter, _super);

  UserProfileRouter.prototype.routes = {
    "program/:query": "program"
  };

  function UserProfileRouter(options) {
    if (options == null) {
      options = {};
    }
    UserProfileRouter.__super__.constructor.call(this, options);
  }

  UserProfileRouter.prototype.initialize = function() {
    this.program = new Program();
    return this.programsView = new ProgramView({
      model: this.program
    });
  };

  UserProfileRouter.prototype.program = function(query) {
    if (!Program.Cache[query]) {
      this.program.set("id", query);
      return this.program.fetch({
        success: function(res) {}
      });
    }
  };

  return UserProfileRouter;

})(Backbone.Router);

$(function() {
  window.router = new UserProfileRouter();
  return Backbone.history.start();
});
