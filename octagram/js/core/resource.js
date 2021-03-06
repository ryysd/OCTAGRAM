// Generated by CoffeeScript 1.6.3
var Resources, TextResource;

Resources = (function() {
  function Resources() {}

  Resources.base = "./";

  Resources.resources = {
    "emptyTip": "empty_tip_48x48.png",
    "returnTip": "return_tip_48x48.png",
    "startTip": "start_tip_48x48.png",
    "actionTip": "action_tip_48x48.png",
    "stopTip": "stop_tip_48x48.png",
    "branchTip": "branch_tip_48x48.png",
    "thinkTip": "think_tip_48x48.png",
    "wallTip": "wall_tip_48x48.png",
    "selectedEffect": "select_effect_48x48.png",
    "execEffect": "exec_effect_48x48.png",
    "mapTip": "map_tip_58x58.png",
    "mapBorder": "map_border_12x58.png",
    "mapBorder2": "map_border_58x12.png",
    "mapEdge": "map_edge_12x12.png",
    "transition": "transition_24x24.png",
    "alterTransition": "alter_transition_24x24.png",
    "panel": "panel_640x496.png",
    "miniPanel": "panel_548x320.png",
    "frame": "frame_640x640.png",
    "frameLeft": "frame_left.png",
    "frameRight": "frame_right.png",
    "frameTop": "frame_top.png",
    "frameBottom": "frame_bottom.png",
    "helpPanel": "help_panel_144x640.png",
    "closeButton": "close_btn_64x32.png",
    "arrow": "arrow_128x64.png",
    "filter": "filter_960x960.png",
    "okButton": "ok_button_308x56.png",
    "testObject": "test_obj_48x48.png",
    "iconUp": "icon_up_32x32.png",
    "iconDown": "icon_down_32x32.png",
    "iconRandom": "icon_random_32x32.png",
    "iconNop": "icon_nop_32x32.png",
    "sidebar": "sidebar_160x496.png",
    "slider": "slider_256x32.png",
    "sliderKnob": "slider_knob_64x32.png",
    "touchEffect": "touch_effect_64x64.png",
    "selector": "selector_96x48.png",
    "selectorAlter": "selector_alter_96x48.png",
    "dummy": "dummy_1x1.png"
  };

  Resources.load = function(game) {
    var k, v, _ref, _results;
    _ref = Resources.resources;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push(game.preload(Resources.base + v));
    }
    return _results;
  };

  Resources.get = function(assetName) {
    return Game.instance.assets[Resources.base + Resources.resources[assetName]];
  };

  return Resources;

})();

TextResource = (function() {
  function TextResource() {}

  TextResource.msg = {
    "empty": "チップがセットされていません。",
    "stop": "プログラムを停止します。",
    "branch": "条件に応じて進行方向を分岐します。",
    "return": "プログラムの開始地点に戻ります。",
    "wall": "プログラムの開始地点に戻ります。",
    "start": "プログラムの開始地点です。",
    "action": "アクションを実行します。",
    "nop": "何も実行しないで次へ進みます。",
    title: {
      "selector": "挿入するチップを選択して下さい。",
      "configurator": "パラメータ編集"
    }
  };

  return TextResource;

})();

octagram.Resources = Resources;

octagram.TextResource = TextResource;
