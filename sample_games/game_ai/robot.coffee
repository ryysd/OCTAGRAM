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

class BarrierMap extends Object

  constructor: (@robot) ->

  get:(key) ->
    ret = @[key]
    delete @[key]
    @robot.onResetBarrier(key)
    return ret

  isset:(key) ->
    return if @[key]? then true else false

class Robot extends SpriteModel
  @MAX_HP = 4

  DIRECT_FRAME                             = {}
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
  
  constructor: (width, height, @_world) ->
    super width, height
    @name = "robot"
    # @hp = Robot.MAX_HP
    @setup("hp", Robot.MAX_HP)
    @bulletQueue =
      normal : new ItemQueue [], 5
      wide   : new ItemQueue [], 5
      dual   : new ItemQueue [], 5
    @barrierMap = new BarrierMap @
    @plateState = 0

    @_world.addChild @
    plate = Map.instance.getPlate(0,0)
    @prevPlate = @currentPlate = plate
    pos = plate.getAbsolutePos()
    @moveTo pos.x, pos.y

  properties:
    direct:
      get:() -> FRAME_DIRECT[@frame]
      set:(direct) -> @frame = DIRECT_FRAME[direct]

  move: (direct, onComplete) ->
    ret = false
    plate = Map.instance.getTargetPoision(@currentPlate, direct)
    @frame = @directFrame(direct)
    @prevPlate = @currentPlate
    # plate is exists and not locked
    if plate? and plate.lock == false
      pos = plate.getAbsolutePos()
      @tl.moveTo(pos.x, pos.y,
        PlayerRobot.UPDATE_FRAME).then(onComplete)
      @currentPlate = plate
      ret = new Point plate.ix, plate.iy
    else
      ret = false
    return ret

  shot: (bulletType, onComplete) ->
    switch bulletType
      when BulletType.NORMAL
        bltQueue = @bulletQueue.normal
      when BulletType.WIDE
        bltQueue = @bulletQueue.wide
      when BulletType.DUAL
        bltQueue = @bulletQueue.dual

    unless bltQueue.empty()
      for b in bltQueue.dequeue()
        b.shot(@x, @y, @direct)
        @_world.bullets.push b
        # @scene.world.insertBefore b, @
        # b.setOnDestoryEvent(onComplete)
        setTimeout(onComplete, Util.toMillisec(b.maxFrame))
        ret = b
    ret

  pickup: (bulletType, onComplete) ->
    ret = false
    blt = BulletFactory.create(bulletType, @)
    switch bulletType
      when BulletType.NORMAL
        bltQueue = @bulletQueue.normal
        itemClass = NormalBulletItem
      when BulletType.WIDE
        bltQueue = @bulletQueue.wide
        itemClass = WideBulletItem
      when BulletType.DUAL
        bltQueue = @bulletQueue.dual
        itemClass = DualBulletItem
    ret = bltQueue.enqueue(blt) if bltQueue?
    if ret != false
      item = new itemClass(@x, @y)
      @_world.addChild item
      @_world.items.push item
      item.setOnCompleteEvent(onComplete)
      ret = blt
    ret

  turn: (onComplete = () ->) ->
    setTimeout((() =>
      @direct = Direct.next(@direct)
      onComplete(@)),
      Util.toMillisec(15)
    )
  
  onHpReduce: (views) ->

  onKeyInput: (input) ->

  onSetBarrier: (bulletType) ->

  onResetBarrier: (bulletType) ->

  onCmdComplete: (id, ret) ->
    msgbox = @scene.views.msgbox
    switch id
      when RobotInstruction.MOVE
        @prevPlate.onRobotAway(@)
        @currentPlate.onRobotRide(@)
        if ret != false
          msgbox.print R.String.move(@name, ret.x+1, ret.y+1)
          @animated = true
        else
          msgbox.print R.String.CANNOTMOVE
      when RobotInstruction.SHOT
        if ret != false
          msgbox.print R.String.shot(@name)
          @animated = true
        else
          msgbox.print R.String.CANNOTSHOT
      when RobotInstruction.PICKUP
        if ret != false
          msgbox.print R.String.pickup(@name)
          @animated = true
        else
          msgbox.print R.String.CANNOTPICKUP
    
  moveToPlate: (plate) ->
    @prevPlate.onRobotAway(@)
    @pravState = @currentPlate
    @currentPlate = plate
    @currentPlate.onRobotRide(@)
    pos = plate.getAbsolutePos()
    @moveTo pos.x, pos.y

  damege: () ->
    @hp -= 1
    @onHpReduce()

  update: ->
    # Why the @ x @ y does it become a floating-point number?
    @x = Math.round @x
    @y = Math.round @y

    @onKeyInput Game.instance.input
    return true

  directFrame: (direct) ->
    DIRECT_FRAME[direct]

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
    if input.w == true and input.p == true
      #left Up
      @debugCmd.move(4)
    else if input.a == true and input.p == true
      #@cmdQueue.enqueue @cmdPool.moveLeft
      @debugCmd.move(3)
    else if input.x == true and input.p == true
      @debugCmd.move(5)
      #@cmdQueue.enqueue @cmdPool.moveleftDown
    else if input.d == true and input.p == true
      @debugCmd.move(0)
      #@cmdQueue.enqueue @cmdPool.moveRight
    else if input.e == true and input.p == true
      @debugCmd.move(1)
      #@cmdQueue.enqueue @cmdPool.moveRightUp
    else if input.c == true and input.p == true
      @debugCmd.move(2)
      #@cmdQueue.enqueue @cmdPool.moveRightDown
    else if input.q == true and input.m == true
      @debugCmd.pickup(@wideBltQueue,1)
    else if input.q == true and input.n == true
      @debugCmd.pickup(@dualBltQueue,2)
    else if input.q == true and input.l == true
      @debugCmd.pickup(@bltQueue,0)
    else if input.s == true and input.m == true
      @debugCmd.shot(@wideBltQueue)
    else if input.s == true and input.n == true
      @debugCmd.shot(@dualBltQueue)
    else if input.s == true and input.l == true
      @debugCmd.shot(@bltQueue)

  onSetBarrier: (bulletType) ->
    Util.dispatchEvent("setBarrier", {bulletType:bulletType})

  onResetBarrier: (bulletType) ->
    Util.dispatchEvent("resetBarrier", {bulletType:bulletType})

  onCmdComplete: (id, ret) ->
    super id, ret
    switch id
      when RobotInstruction.MOVE
        if Math.floor(Math.random() * (10)) == 1
          i = 1
      when RobotInstruction.SHOT
        if ret != false
          effect = new ShotEffect(@x, @y)
          @scene.addChild effect
          if ret instanceof WideBullet
            Util.dispatchEvent("dequeueBullet", {bulletType:BulletType.WIDE})
          else if ret instanceof NormalBullet
            Util.dispatchEvent("dequeueBullet", {bulletType:BulletType.NORMAL})
          else if ret instanceof DualBullet
            Util.dispatchEvent("dequeueBullet", {bulletType:BulletType.DUAL})
      when RobotInstruction.PICKUP
        if ret != false
          if ret instanceof WideBullet
            Util.dispatchEvent("enqueueBullet", {bulletType:BulletType.WIDE})
          else if ret instanceof NormalBullet
            Util.dispatchEvent("enqueueBullet", {bulletType:BulletType.NORMAL})
          else if ret instanceof DualBullet
            Util.dispatchEvent("enqueueBullet", {bulletType:BulletType.DUAL})


  onHpReduce: (views) ->
    scene = Game.instance.scene
    hpBar = scene.views.playerHpBar
    hpBar.reduce()

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

  onHpReduce: (views) ->
    hpBar = @scene.views.enemyHpBar
    hpBar.reduce()

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
