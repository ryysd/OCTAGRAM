class Mathing 
  constructor: (@playerId, @enemyId) ->

  start : () ->
    @disableInput()

    @frontend = new Frontend()
    
    @frontend.editPlayerProgram()
    @frontend.loadProgramById(@playerId, () =>
      @frontend.editEnemyProgram()
      @frontend.loadProgramById(@enemyId, () =>
        @frontend.executeProgram()
        @frontend.editPlayerProgram()
      )
    )

  end : (result) ->
    target = getRequestURL('battle_logs', 'save')
    isPlayerWin = result.win instanceof PlayerRobot 
    player = if isPlayerWin then result.win else result.lose
    enemy  = if !isPlayerWin then result.win else result.lose

    playerResult = {
      opponent_id: enemyId,
      is_winner: +isPlayerWin,
      program_id: @playerId,
      remaining_hp: player.hp,
      consumed_energy: player.consumptionEnergy
    }

    enemyResult = {
      opponent_id: playerId,
      is_winner: +!isPlayerWin,
      program_id: @enemyId,
      remaining_hp: enemy.hp,
      consumed_energy: enemy.consumptionEnergy
    }

    data = {
      challenger: playerResult,
      defender: enemyResult
    }

    playerResult.programName = playerProgram['name']
    enemyResult.programName = enemyProgram['name']
    $.post(target, data, (response) => 
      Flash.showSuccess("result has been saved.") 
      scores = $.parseJSON(response)
      playerResult.score = scores.playerScore
      enemyResult.score = scores.enemyScore
      @showResult(playerResult, enemyResult)
    )

  createResultView : (playerData, enemyData) ->
    $result = $('<div></div>').attr('id', 'battle-result')
    $playerResult = $('<div></div>').attr('id', 'player-result')
    $enemyResult = $('<div></div>').attr('id', 'enemy-result')

    _createResultView = ($parent, data) ->
      textClass = if data.is_winner then 'text-success' else 'text-danger'
      $programName = $('<div></div>').attr('class', 'program-name ' + textClass).text(data.programName)
      $hp = $('<div></div>').attr('class', 'result-text remaining-hp ' + textClass).text(data.remaining_hp)
      $energy = $('<div></div>').attr('class', 'result-text comsumed-energy ' + textClass).text(data.consumed_energy)
      $score = $('<div></div>').attr('class', 'result-text score ' + textClass).text(data.score)

      $parent.append($programName)
      $parent.append($hp)
      $parent.append($energy)
      $parent.append($score)

    $label = $('<div></div>').attr('class', 'result-label')
    $labelProgramName = $('<div></div>').attr('class', 'result-text result-label-pname').text('')
    $labelHp = $('<div></div>').attr('class', 'result-text result-label-hp').text('残りHP')
    $labelEnergy = $('<div></div>').attr('class', 'result-text result-label-energy').text('消費エネルギー')
    $labelScore = $('<div></div>').attr('class', 'result-text result-label-score').text('スコア')
    $label.append($labelProgramName)
    $label.append($labelHp)
    $label.append($labelEnergy)
    $label.append($labelScore)

    _createResultView($playerResult, playerData)
    _createResultView($enemyResult, enemyData)

    $result.append($playerResult);
    $result.append($label);
    $result.append($enemyResult);

    $result.append(@createResultButton())

    $result

  retry: () =>
    $('#battle-result').fadeOut('fast', () =>
      $('#battle-result').remove()
      $('#enchant-stage').fadeIn('fast', () =>
        @frontend.restartProgram()
      )
    )

  createResultButton : () ->
    $retryButton = $('<div></div>').attr({id: 'retry-btn', class: 'btn btn-lg btn-success result-btn'}).text('Retry').click(@retry)
    $backButton = $('<a></a>').attr({id: 'back-btn', class: 'btn btn-lg btn-danger result-btn'}).attr('href', getRequestURL('fronts', 'home')).text('Back')

    $buttons = $('<div></div>').attr('class', 'result-btns')

    $buttons.append($retryButton)
    $buttons.append($backButton)

    $buttons

  showResult : (playerResult, enemyResult) ->
    $result = @createResultView(playerResult, enemyResult)
    $('#enchant-stage').fadeOut('fast', () => 
      $(@).remove()
      $('#program-container').append($result)
    )

  disableInput : () ->
    $filter = $('<div></div>').attr('id', 'filter')
    $('#program-container').append($filter)

  ###
  calcScore : (data) ->
    hpScore = data.remaining_hp * 1000
    energyScore = (6000 - data.consumed_energy)
    energyScore = 0 if energyScore < 0
    rate = if data.is_winner then 1.3 else 1

    (hpScore + energyScore) * rate
  ###

$ ->
  mathing = new Mathing(playerId, enemyId)

  Config.Frame.setGameSpeed(4)
  options = { 
    onload:  ()->mathing.start()
    onend: (result) -> mathing.end(result)
  }

  runGame(options);
