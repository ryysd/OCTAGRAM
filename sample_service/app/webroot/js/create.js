// Generated by CoffeeScript 1.6.3
var executeEnemyProgram, executePlayerProgram, getContentWindow, getEnemyProgram, getPlayerProgram, loadEnemyProgram, loadPlayerProgram, saveEnemyProgram, savePlayerProgram, savePlayerProgramOnServer, savePlayerProgramOnServerWithName, showEnemyProgram, showPlayerProgram;

getPlayerProgram = function() {
  return Game.instance.octagram.getInstance(Game.instance.currentScene.world.playerProgramId);
};

getEnemyProgram = function() {
  return Game.instance.octagram.getInstance(Game.instance.currentScene.world.enemyProgramId);
};

executePlayerProgram = function() {
  return getPlayerProgram().execute();
};

executeEnemyProgram = function() {
  return getEnemyProgram().execute();
};

savePlayerProgram = function() {
  return getPlayerProgram().save("player");
};

saveEnemyProgram = function() {
  return getEnemyProgram().save("enemy");
};

loadPlayerProgram = function() {
  return getPlayerProgram().load("player");
};

loadEnemyProgram = function() {
  return getEnemyProgram().load("enemy");
};

showPlayerProgram = function() {
  return Game.instance.octagram.showProgram(Game.instance.currentScene.world.playerProgramId);
};

showEnemyProgram = function() {
  return Game.instance.octagram.showProgram(Game.instance.currentScene.world.enemyProgramId);
};

getContentWindow = function() {
  return $('iframe')[0].contentWindow;
};

savePlayerProgramOnServer = function(override) {
  var _this = this;
  if (override == null) {
    override = false;
  }
  return bootbox.prompt("Enter Program Name.", function(name) {
    return savePlayerProgramOnServerWithName(name, override);
  });
};

savePlayerProgramOnServerWithName = function(name, override) {
  var playerProgram, program, serializedVal,
    _this = this;
  if (override == null) {
    override = false;
  }
  if (name == null) {
    return console.log("error");
  } else {
    playerProgram = getPlayerProgram();
    serializedVal = playerProgram.serialize();
    program = {
      program: {
        name: name,
        comment: "",
        serialized_data: serializedVal,
        user_id: getUserId()
      },
      override: override
    };
    console.log(program);
    return $.post("add", program, function(data) {
      var response;
      response = JSON.parse(data);
      if (response.success) {
        return bootbox.alert("program has been saved.");
      } else if (response.exists && !response.override) {
        return bootbox.confirm(name + " is already exists. Do you want to override it?", function(result) {
          if (result) {
            return savePlayerProgramOnServerWithName(name, true);
          }
        });
      } else {
        return bootbox.alert(data);
      }
    });
  }
};