// Generated by CoffeeScript 1.6.3
var ProgramSelector, ProgramStorage;

ProgramSelector = (function() {
  function ProgramSelector() {}

  ProgramSelector.prototype.modal = function(options) {
    var $body, $head, $modal, $modalBody, $modalHeader, $table, title;
    $table = $('<table></table>').attr('class', 'table table-striped table-hover');
    $body = $('<tbody></tbody>');
    $head = $('<thead></thead>').append($('<tr></tr>').append($('<th></th>').text("")).append($('<th></th>').text("")));
    $.get(getRequestURL('programs', 'owned_list'), {
      user_id: getUserId()
    }, function(data) {
      var $btns, $label, $title, $tr, button, callback, idx, program, programs, _i, _j, _len, _len1, _ref, _results;
      programs = JSON.parse(data);
      _results = [];
      for (_i = 0, _len = programs.length; _i < _len; _i++) {
        program = programs[_i];
        $tr = $('<tr></tr>');
        $title = $('<td></td>').attr({
          "class": 'selector-title'
        }).text(program.name);
        if (program.is_preset) {
          $label = $('<span style="margin-left: 10px"></span>').attr({
            "class": 'label label-info'
          }).text("preset");
          $title.append($label);
        }
        $btns = $('<td></td>').attr({
          "class": 'selector-btn'
        });
        callback = (function() {
          var _j, _len1, _ref, _results1;
          _ref = options.buttons;
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            button = _ref[_j];
            _results1.push(button.handler);
          }
          return _results1;
        })();
        _ref = options.buttons;
        for (idx = _j = 0, _len1 = _ref.length; _j < _len1; idx = ++_j) {
          button = _ref[idx];
          $btns.append($('<button style="margin-left:10px"></button>').attr({
            "class": "btn btn-" + button.type,
            'program-id': program.id,
            'btn-id': idx
          }).text(button.text).click(function() {
            callback[$(this).attr('btn-id')]($(this).attr('program-id'));
            return $modal.modal('hide');
          }));
        }
        $tr.append($title);
        $tr.append($btns);
        _results.push($body.append($tr));
      }
      return _results;
    });
    $table.append($head);
    $table.append($body);
    $modalBody = $('<div></div>').attr('class', 'modal-body').append($table);
    title = "Select Program";
    $modalHeader = $('<div></div>').attr('class', 'modal-header').append($('<button></button>').attr({
      type: 'button',
      "class": 'close',
      'data-dismiss': 'modal'
    }).text('×')).append($('<h4></h4>').attr('class', 'modal-title').text(title));
    $modal = $('<div></div>').attr({
      "class": 'modal fade',
      tabIndex: '-1',
      role: 'dialog'
    }).append($('<div></div>').attr('class', 'modal-dialog').append($('<div></div>').attr('class', 'modal-content').append($modalHeader).append($modalBody)));
    return $modal.modal({
      keyboard: true,
      show: true
    });
  };

  return ProgramSelector;

})();

ProgramStorage = (function() {
  function ProgramStorage() {
    this.selector = new ProgramSelector();
  }

  ProgramStorage.prototype.loadProgram = function() {
    return this.selector.modal({
      buttons: [
        {
          type: 'success',
          text: 'Load',
          handler: this.loadProgramById
        }, {
          type: 'danger',
          text: 'Delete',
          handler: this.deleteProgramById
        }
      ]
    });
  };

  ProgramStorage.prototype.saveProgram = function(override) {
    var _this = this;
    if (override == null) {
      override = false;
    }
    return bootbox.prompt("Enter Program Name.", function(name) {
      if (name) {
        return _this.saveProgramByName(name, override);
      }
    });
  };

  ProgramStorage.prototype.saveProgramByName = function(name, override) {
    var program, serializedVal,
      _this = this;
    if (override == null) {
      override = false;
    }
    if (name == null) {
      return console.log("error");
    } else {
      serializedVal = getCurrentProgram().serialize();
      program = {
        program: {
          name: name,
          comment: "",
          serialized_data: serializedVal,
          user_id: getUserId()
        },
        override: override
      };
      return $.post(getRequestURL('programs', 'add'), program, function(data) {
        var response;
        response = JSON.parse(data);
        if (response.success) {
          return Flash.showSuccess("program has been saved.");
        } else if (response.exists && !response.override) {
          return bootbox.confirm(name + " is already exists. Do you want to override it?", function(result) {
            if (result) {
              return _this.saveProgramByName(name, true);
            }
          });
        } else {
          return bootbox.alert(data);
        }
      });
    }
  };

  ProgramStorage.prototype.loadProgramById = function(id, callback) {
    return $.get(getRequestURL('programs', 'load_data'), {
      id: id
    }, function(data) {
      getCurrentProgram().deserialize(JSON.parse(data));
      Flash.showSuccess("program has been loaded.");
      if (callback) {
        return callback();
      }
    });
  };

  ProgramStorage.prototype.deleteProgramById = function(id, callback) {
    return $.post(getRequestURL('programs', 'delete'), {
      id: id
    }, function(data) {
      Flash.showSuccess("program has been deleted.");
      if (callback) {
        return callback();
      }
    });
  };

  return ProgramStorage;

})();
