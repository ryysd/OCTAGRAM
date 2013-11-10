getCurrentProgram = () -> Game.instance.octagram.getCurrentInstance()

class Frontend 
  constructor: () ->
    @programStorage = new ProgramStorage()
    @playerRunning = false
    @enemyRunning = false

    @currentProgramName = "";
    
  getPlayerProgram : () -> Game.instance.octagram.getInstance(Game.instance.currentScene.world.playerProgramId)
  getEnemyProgram : () -> Game.instance.octagram.getInstance(Game.instance.currentScene.world.enemyProgramId)

  showPlayerProgram : () -> Game.instance.octagram.showProgram(Game.instance.currentScene.world.playerProgramId)
  showEnemyProgram : () -> Game.instance.octagram.showProgram(Game.instance.currentScene.world.enemyProgramId)
  
  resetProgram : (onReset) ->
    @stopProgram()
  
    restart = () -> 
      if (!@playerRunning && !@enemyRunning) 
        Game.instance.currentScene.restart()
        if onReset then onReset()
      else setTimeout(restart, 100)
  
    setTimeout(restart, 100)
  
  restartProgram : () ->
    @resetProgram(() => 
      @executeProgram())
  
  editPlayerProgram : () ->
    $('#edit-player-program').hide()
    $('#edit-enemy-program').show()
    $('#program-container').css('border-color', '#5cb85c')
  
    @showPlayerProgram()
  
  editEnemyProgram : () ->
    $('#edit-player-program').show()
    $('#edit-enemy-program').hide()
    $('#program-container').css('border-color', '#d9534f')
  
    @showEnemyProgram()
  
  saveProgram : (override = false) -> 
    @programStorage.saveProgram(override, @currentProgramName, (data) => 
      @currentProgramName = data.name
    )

  deleteProgram : () ->
    @programStorage.deleteProgram()

  loadProgram : () -> 
    @programStorage.loadProgram((data) => 
      @currentProgramName = data.name
    )

  loadProgramById : (id, callback) -> @programStorage.loadProgramById(id, callback)
  
  getContentWindow : () -> $('iframe')[0].contentWindow
  
  executeProgram : () ->
    @playerRunning = true
    @enemyRunning = true
  
    @getPlayerProgram().execute({onStop: () -> @playerRunning = false})
    @getEnemyProgram().execute({onStop: () -> @enemyRunning = false})
  
  stopProgram : () ->
    @getPlayerProgram().stop()
    @getEnemyProgram().stop()

$ ->
  frontend = new Frontend()

  $('#edit-player-program').click(() =>
    $('#target-label-enemy').hide()
    $('#target-label-player').show()
    $('#save').removeAttr('disabled')
    frontend.editPlayerProgram()
  )
  $('#edit-enemy-program').click(() =>
    $('#target-label-enemy').show()
    $('#target-label-player').hide()
    $('#save').attr('disabled', 'disabled')
    frontend.editEnemyProgram()
  )
  $('#save').click(() => frontend.saveProgram())
  $('#load').click(() => frontend.loadProgram())
  $('#delete').click(() => frontend.deleteProgram())
  $('#run').click(() =>
    frontend.executeProgram()
    $('#run').attr('disabled', 'disabled')
    $('#stop').removeAttr('disabled')
    $('#restart').removeAttr('disabled')
  )
  $('#stop').click(() =>
    frontend.resetProgram()
    $('#run').removeAttr('disabled')
    $('#stop').attr('disabled', 'disabled')
    $('#restart').attr('disabled', 'disabled')
  )
  $('#restart').click(() => frontend.restartProgram())
