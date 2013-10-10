R = Config.R

###
  store bullet objects
###
class ItemQueue
  constructor: (@collection = [], @max = -1) ->

  enqueue: (item) ->
    if @max != -1 and @max <= @collection.length
      return false
    else
      @collection.push item
      return true

  dequeue: (count=1) ->
    ret = []
    for i in [0...count]
      ret.push @collection.shift()
    return ret

  empty: () ->
    @collection.length == 0

  index: (i) ->
    @collection[i]

  size: () ->
    @collection.length

class Robot extends SpriteModel
  @MAX_HP = 6

  DIRECT_FRAME                             = {}
  DIRECT_FRAME[Direct.NONE]                = 0
  DIRECT_FRAME[Direct.RIGHT]               = 0
  DIRECT_FRAME[Direct.RIGHT | Direct.DOWN] = 5
  DIRECT_FRAME[Direct.LEFT | Direct.DOWN]  = 7
  DIRECT_FRAME[Direct.LEFT]                = 2
  DIRECT_FRAME[Direct.LEFT | Direct.UP]    = 6
  DIRECT_FRAME[Direct.RIGHT | Direct.UP]   = 4

  FRAME_DIRECT    = {}
  FRAME_DIRECT[0] = Direct.RIGHT
  FRAME_DIRECT[5] = Direct.RIGHT | Direct.DOWN
  FRAME_DIRECT[7] = Direct.LEFT | Direct.DOWN
  FRAME_DIRECT[2] = Direct.LEFT
  FRAME_DIRECT[6] = Direct.LEFT | Direct.UP
  FRAME_DIRECT[4] = Direct.RIGHT | Direct.UP
  
  constructor: (width, height) ->
    super width, height
    @name = "robot"
    # @hp = Robot.MAX_HP
    @setup("hp", Robot.MAX_HP)
    @_bulletQueue = new ItemQueue [], 5
    @plateState = 0

    RobotWorld.instance.addChild @
    plate = Map.instance.getPlate(0,0)
    @prevPlate = @currentPlate = plate
    pos = plate.getAbsolutePos()
    @moveTo pos.x, pos.y
    @_animated = false

  properties:
    direct:
      get:() ->
        if FRAME_DIRECT[@frame]? then FRAME_DIRECT[@frame] else FRAME_DIRECT[Direct.RIGHT]
      set:(direct) ->
        @frame = DIRECT_FRAME[direct] if DIRECT_FRAME[direct]?
    animated:
      get:() -> @_animated
      set:(value) -> @_animated = value
    pos:
      get: () -> @currentPlate.pos
    bulletQueue:
      get: () -> @_bulletQueue

  directFrame: (direct) ->
    DIRECT_FRAME[direct]

  move: (direct, onComplete = () ->) ->
    plate = Map.instance.getTargetPoision(@currentPlate, direct)
    @direct = direct
    ret = @_move plate, () =>
      pos = plate.getAbsolutePos()
      @prevPlate.dispatchEvent(new RobotEvent('away', robot:@))
      @currentPlate.dispatchEvent(new RobotEvent('ride', robot:@))
      @tl.moveTo(pos.x, pos.y,
        Config.Frame.ROBOT_MOVE).then () =>
          @dispatchEvent(new RobotEvent('move', ret))
          onComplete()
    ret

  moveDirect: (plate) ->
    ret = @_move plate, () =>
      pos = plate.getAbsolutePos()
      @moveTo pos.x, pos.y
      @prevPlate.dispatchEvent(new RobotEvent('away', robot:@))
      @currentPlate.dispatchEvent(new RobotEvent('ride', robot:@))
    ret

  _move: (plate, closure) ->
    ret = false
    @prevPlate = @currentPlate
    # plate is exists and not locked
    if plate? and plate.lock == false
      pos = plate.getAbsolutePos()
      @currentPlate = plate
      closure()
      ret = new Point plate.ix, plate.iy
    else
      ret = false
    ret

  shot: (onComplete = () ->) ->
    ret = false
    unless @bulletQueue.empty()
      for b in @bulletQueue.dequeue()
        b.shot(@x, @y, @direct)
        setTimeout(onComplete, Util.toMillisec(b.maxFrame))
        ret = type:BulletType.NORMAL
    @dispatchEvent(new RobotEvent('shot', ret))
    ret

  pickup: (onComplete = () ->) ->
    ret = false
    blt = BulletFactory.create(BulletType.NORMAL, @)
    ret = @bulletQueue.enqueue(blt) if @bulletQueue?
    if ret != false
      item = new NormalBulletItem(@x, @y)
      item.setOnCompleteEvent(onComplete)
      ret = type:BulletType.NORMAL
    @dispatchEvent(new RobotEvent('pickup', ret))
    ret

  turn: (onComplete = () ->) ->
    setTimeout((() =>
      @direct = Direct.next(@direct)
      onComplete(@)
      @dispatchEvent(new RobotEvent('turn', {}))),
      Util.toMillisec(Config.Frame.ROBOT_TURN)
    )

  damege: () ->
    @hp -= 1

  update: ->
    # Why the @x @y does it become a floating-point number?
    @x = Math.round @x
    @y = Math.round @y

    @onKeyInput Game.instance.input
    return true

  onKeyInput: (input) ->

class PlayerRobot extends Robot
  @WIDTH = 64
  @HEIGHT = 74
  @UPDATE_FRAME = 10
  constructor: (parentNode) ->
    super PlayerRobot.WIDTH, PlayerRobot.HEIGHT, parentNode
    @name = R.String.PLAYER
    @image = Game.instance.assets[R.CHAR.PLAYER]
    @plateState = Plate.STATE_PLAYER
    @debugCmd = new DebugCommand(@)

  onKeyInput: (input) ->
    if @animated == true
      return

    ret = true
    if input.w == true and input.p == true
      @animated = true
      #left Up
      ret = @move(Direct.LEFT | Direct.UP, @onDebugComplete)
    else if input.a == true and input.p == true
      @animated = true
      #moveLeft
      ret = @move(Direct.LEFT, @onDebugComplete)
    else if input.x == true and input.p == true
      @animated = true
      #@cmdQueue.enqueue @cmdPool.moveleftDown
      ret = @move(Direct.LEFT | Direct.DOWN, @onDebugComplete)
    else if input.d == true and input.p == true
      @animated = true
      ret = @move(Direct.RIGHT, @onDebugComplete)
      #@cmdQueue.enqueue @cmdPool.moveRight
    else if input.e == true and input.p == true
      @animated = true
      ret = @move(Direct.RIGHT | Direct.UP, @onDebugComplete)
      #@cmdQueue.enqueue @cmdPool.moveRightUp
    else if input.c == true and input.p == true
      @animated = true
      ret = @move(Direct.RIGHT | Direct.DOWN, @onDebugComplete)
      #@cmdQueue.enqueue @cmdPool.moveRightDown
    else if input.q == true and input.m == true
      @animated = true
      ret = @pickup(@onDebugComplete)
    else if input.q == true and input.n == true
      @animated = true
      @animated = true
      ret = @shot(@onDebugComplete)

    if ret == false
      @onDebugComplete()

  onDebugComplete: () =>
    @animated = false

class EnemyRobot extends Robot
  @WIDTH = 64
  @HEIGHT = 74
  @UPDATE_FRAME = 10
  constructor: (parentNode) ->
    super EnemyRobot.WIDTH, EnemyRobot.HEIGHT, parentNode
    @name = R.String.ENEMY
    @image = Game.instance.assets[R.CHAR.ENEMY]
    @plateState = Plate.STATE_ENEMY
    @debugCmd = new DebugCommand(@)

  onKeyInput: (input) ->
    if @animated == true
      return
    if input.w == true and input.o == true
      #left Up
      @debugCmd.move(4)
    else if input.a == true and input.o == true
      #@cmdQueue.enqueue @cmdPool.moveLeft
      @debugCmd.move(3)
    else if input.x == true and input.o == true
      @debugCmd.move(5)
      #@cmdQueue.enqueue @cmdPool.moveleftDown
    else if input.d == true and input.o == true
      @debugCmd.move(0)
      #@cmdQueue.enqueue @cmdPool.moveRight
    else if input.e == true and input.o == true
      @debugCmd.move(1)
      #@cmdQueue.enqueue @cmdPool.moveRightUp
    else if input.c == true and input.o == true
      @debugCmd.move(2)
      #@cmdQueue.enqueue @cmdPool.moveRightDown