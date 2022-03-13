class Enemy extends Character {
  constructor(base_color, enemyType=null){
    let id = Math.random().toString(36).slice(2)

    // enemy's health
    let health
    // how much power the player gets 
    let nutritionalValue
    // how much knowl player gets
    let knowledgeValue = 0
    let lightness

    // de mesh
    let geometry
    let dna

    // adding these constants puts these shits on the right place for x==1 (level 1)
    let chanceSlices = game.chanceSlices
    let stickChance = chanceSlices[0]
    let sphereChance = chanceSlices[1]
    let circleChance = chanceSlices[2]
    let healcubeChance = chanceSlices[3]
    // this is just above the highest traunch, so no need to specify
    // let octaChance = chanceSlices[]

    if( isVal(enemyType) ){
      // this is kind of stupid, but if we want dna to be used elsewhere, per enemy, necessary
      
      // make a suitable random dna in the range for an enemytype
      let min, max
      if(enemyType == STICK){
        min = 0
        max = game.chanceSlices[0]
      } else if(enemyType == SPHERE){
        min = game.chanceSlices[0]
        max = game.chanceSlices[1]
      } else if(enemyType == CIRCLE) {
        min = game.chanceSlices[1]
        max = game.chanceSlices[2]
      } else if(enemyType == HEALCUBE){
        min = game.chanceSlices[2]
        max = game.chanceSlices[3]
      } else if(enemyType == KNOWLOCTA) {
        min = game.chanceSlices[3]
        max = 1
      } else if(enemyType == BOSS){
        min = 1
        max = 1
      }

      dna = Math.random() * (max-min) + min
    } else {

      dna = Math.random()
      if(dna <= stickChance){
        enemyType = STICK
      } else if(dna <= sphereChance){
        enemyType = SPHERE
      } else if(dna <= circleChance) {
        enemyType = CIRCLE
      } else if(dna <= healcubeChance) {
        enemyType = HEALCUBE
      } else {
        enemyType = KNOWLOCTA
      }
    }
  
    let intention    
    let allowedToPattern
    let moneyValue
    if(enemyType == STICK){
      // console.log( '0 trime' )
      // stick
      geometry = new THREE.BoxGeometry(0.02,0.02,0.6)
      health = Math.ceil(1 * game.enemyHealthFactor)
      nutritionalValue = 16
      base_color = [72,201,46]
      lightness = 0.1
      allowedToPattern = true
      intention = PATTERNMOVE

      // 5-100
      moneyValue = 5 + 5 * Math.floor( Math.random() * 10 )
    } else if(enemyType == SPHERE){
      // console.log( '1 trime' )
      // sphere
      health = Math.ceil(4 * game.enemyHealthFactor)
      nutritionalValue = 26
      geometry = new THREE.SphereGeometry( 0.09, 32, 32 )
      base_color = [8,194,137]
      lightness = 0.03
      allowedToPattern = true
      intention = PATTERNMOVE
    } else if(enemyType == CIRCLE) {
      // console.log( '2 trime' )
      // circle
      health = Math.ceil(0.02 * game.enemyHealthFactor)
      nutritionalValue = 22
      geometry = new THREE.CircleGeometry( 0.240, 32 )
      base_color = [214,189,58]
      lightness = 0.1
      allowedToPattern = true
      intention = PATTERNMOVE
    } else if(enemyType == HEALCUBE){
      // console.log( '3 trime' )
      // heal cube
      geometry = new THREE.BoxGeometry(0.2,0.2,0.2)
      health = Math.ceil(9 * game.enemyHealthFactor)
      nutritionalValue = 50
      base_color = [57,23,194]
      lightness = 0.02
      intention = WANDER
      allowedToPattern = false
    } else if(enemyType == KNOWLOCTA) {
      // console.log( '4 trime' )
      // knowledge octa
      health = Math.ceil(6 * game.enemyHealthFactor)
      // no energy from knowlocta
      nutritionalValue = 0
      geometry = new THREE.OctahedronGeometry( 0.08 )
      base_color = [120,78,200]
      knowledgeValue = 25
      lightness = 0.01
      allowedToPattern = true
      intention = PATTERNMOVE
    } else if(enemyType == BOSS){
      health = 400
      nutritionalValue = 0
      geometry = new THREE.TorusGeometry( 0.4, 0.18, 6, 36 )
      base_color = [0,0,0]
      knowledgeValue = 500
      lightness = 0.05
      
      allowedToPattern = true
      // ?
      intention = WANDER
    }
    
    super(
      // de ge
      geometry,
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.id = id
    this.dna = dna
    this.healthValue = 0
    this.enemyType = enemyType
    this.lightness = lightness
    this.intention = intention
    this.allowedToPattern = allowedToPattern

    // cube
    if(this.enemyType == HEALCUBE){
      this.addParticles(healthenemyMap)
      this.healthValue = 20

      let dist = 0.18 * this.scaleFactor
      let size = 0.48 * this.scaleFactor
      this.addBanners(healthspriteMap, size, 2, dist, true)
    } else if(this.enemyType == SPHERE){
      this.healthValue = 10
    } else if(this.enemyType == CIRCLE){
      let dist = 0.1 * this.scaleFactor
      let size = 0.46 * this.scaleFactor
      this.addBanners(lightweightMap, size, 2, dist, true)
    } else if(this.enemyType == KNOWLOCTA){
      let dist = 0.1 * this.scaleFactor
      let size = 0.46 * this.scaleFactor
      this.addBanners(candyspriteMap, size, 2, dist, true)
    } else if(this.enemyType == BOSS){
      // // placeholder...
      // let dist = 0.1 * this.scaleFactor
      // let size = 0.8 * this.scaleFactor
      // this.addBanners(candyspriteMap, size, 2, dist, true)
      this.bossOutline = null
    }

    if(Math.random() > 0.6){
      // sometimes, make one with a weird scale

      // if we're in here, were doing somethin right

      // size it
      if(this.enemyType == CIRCLE){
        // circle
        this.scaleFactor = 1 + Math.random() * 0.4
      } else if(this.enemyType == SPHERE){
        
        this.scaleFactor = 1 + Math.random() * 2.1
        this.mesh.scale.x = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.y = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.z = 1 + Math.random() * this.scaleFactor
      } else if(this.enemyType == BOSS){
        // bosses one size
        this.scaleFactor = 1

        this.mesh.material.needsUpdate = true
      } else {
        this.scaleFactor = 1 + Math.random() * 1.3
        this.mesh.scale.x = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.y = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.z = 1 + Math.random() * this.scaleFactor        
      }
    }

    // base enemy health
    this.health = health
    this.damageSounds = [fx_edmg1, fx_edmg2, fx_edmg3]
    this.attackSounds = null


    this.killSounds = [fx_ekill1]

    this.direction = 0

    if(this.enemyType == BOSS){
      this.corrupted = true

      this.bossEatTimer = new Timer()
      this.bossEatTimer.start()

      this.bossHypnotimer = new Timer()
      this.bossHypnotimer.start()

      this.bossDamage = 20

      this.mesh.material = new THREE.MeshPhysicalMaterial( { color: rgbToHex(this.baseColor[0],this.baseColor[1],this.baseColor[2]), reflectivity: 0.877, clearcoat: 0.6, roughness: 0})

      this.killSounds = [fx_bossdie1,fx_bossdie2,fx_bossdie3]

      // bosses move back and forth z
      // this.zDirection = 1

    } else {
      this.corrupted = false
    }

    // super
    this.godCorrupted = false

    let hitr = this.calcHitColor(this.baseColor[0])
    let hitg = this.calcHitColor(this.baseColor[1])
    let hitb = this.calcHitColor(this.baseColor[2])
    this.hitColor = [hitr, hitg, hitb]

    // console.log( 'hitcolor is ', this.hitColor )
    this.directionTimer = new Timer()
    // start this up because were going to add to scene right now anyway
    this.directionTimer.start()

    // countdown to actually being corrupted
    this.corruptingTimer = new Timer()
    this.corrOpacityUp = true
    this.corrOpacityUpTimer = new Timer()
    this.corrOpacityUpTimer.start()

    this.color = this.baseColor
    this.nutritionalValue = nutritionalValue
    this.knowledgeValue = knowledgeValue
    this.moneyValue = moneyValue

    this.inScene = false

    this.intentionTimer = new Timer()
    this.intentionTimer.start()

    this.patternMoveStage = PLOTTING
    this.routePoints = []
    this.currentRouteIndex = 0
    this.laps = 0
    this.patternWaitTimer = new Timer()
    this.patternWaitTimer.start()


    // copied from player
    this.swordEnabled = false
    this.defaultSwordSpeed = DEG1
    this.swordSpeed = DEG1

    // MONEY
    this.moneyTimer = new Timer()
    this.moneyTimer.start()

    // if you are a hitman, on a contract, you gradually spend that breado
    this.contractSpendTimer = new Timer()
    this.contractSpendTimer.start()

    this.money = 0
    this.lastMoney = 0
    this.addMoneyLabel("#00ff00")

    this.birthTimer = new Timer()
  }

  hypnotize(bossId){
    this.hypnotizedById = bossId
    this.setColor(100,100,100)

    this.lightness = 0.77

    // this.corrupted = false
    // this.godCorrupted = false
    // this.greenCorrupted = false
    // this.hitmanCorrupted = false

    this.removeExtras()
  }

  // sword
  addSword(length){
    this.sword = new Sword(length, 0, this)
    this.sword.mesh.visible = false
    scene.add( this.sword.mesh )
  }

  startSword(){
    if(!this.sword){
      this.addSword()
    }

    this.sword.active = true
    this.sword.mesh.visible = true
  }

  stopSword(){
    if(this.sword){
      this.sword.active = true
      this.sword.mesh.visible = false  
    }
  }

  drawSword(){

    if(this.sword.rotateTimer.time() > 2){
      this.sword.rotateTimer.reset()

      this.sword.bbox.setFromObject( this.sword.mesh )
    }
  }


  calcHitColor(val){
    // the higher val is, the smaller the increase
    // subtract 8 to push line down to keep unde 255
    return val + Math.floor(val * 800/ ( Math.pow(val, 2) ) - 3)
  }

  rotation(){

    if(this.enemyType == BOSS || this.hypnotizedById){
      this.mesh.rotation.z += 0.001
    } else {
      let fac = Math.random()
      // let sign = Math.random() > 0.5 ? 1 : -1
      this.mesh.rotation.x += 0.28 * fac
      fac = Math.random() * 0.010
      // sign = Math.random() > 0.5 ? 1 : -1
      this.mesh.rotation.y += 0.18 * fac  
    }
    
  }

  killScore(){
    let score = 1
    if(this.damagedBy == EAT) {
      score = 1
    } else if(this.damagedBy == SWORD) {
      score = 12
    } else if(this.damagedBy == KILLINGCIRCLE) {
      score = 4
    } else if(this.damagedBy == SMOKE) {
      score = 10
    } else if(this.damagedBy == BOMB) {
      score = 8
    } else if(this.damagedBy == FRIEND) {
      score = 2
    } else if(this.damagedBy == CASINO) {
      score = 32
    }

    // beef that up if they real bad with it
    if(this.corrupted){
      score = score * 4
    } else if(this.godCorrupted){
      score = score * 16
    } else if(this.greenCorrupted){
      score = score * 100
    } else if(this.hitmanCorrupted){
      score = score * 1000 
    }

    return score
  }

  takeDamageSound(){
    // pick a random one from this array
    if(this.damageSoundTimer.time() > 30){
      this.damageSoundTimer.reset()
      
      let roll = Math.floor( Math.random() * this.damageSounds.length )
      this.damageSounds[ roll ].play()  
    }
  }

  attackSound(){
    // pick a random one from this array
    if(this.attackSoundTimer.time() > 30){
      this.attackSoundTimer.reset()
      
      let roll = Math.floor( Math.random() * this.attackSounds.length )
      this.attackSounds[ roll ].play()  
    }
  }

  startCorrupting(){

    // remove health guy glows if necessary
    if(this.duster){
      this.duster.remove()
    }

    if(this.banners){
      this.banners.remove()
      this.banners = null
    }

    this.lifecycle = CORRUPTING
    let dist = 0.21 * this.scaleFactor
    let size = 0.68 * this.scaleFactor
    // this.addBanners(candyspriteMap, size, 2, dist, true)
    // let size = 0.33 * this.scaleFactor
    this.addBanners(nowcorruptingspriteMap, size, 0, dist, true, 0.3)
    this.banners.setPosition( this.mesh.position )
    this.corruptingTimer.start()
  }

  startGodCorrupting(){

    if(this.banners){
      this.banners.remove()
      this.banners = null
    }

    this.lifecycle = CORRUPTING
    let dist = 0.21 * this.scaleFactor
    let size = 0.68 * this.scaleFactor
    // this.addBanners(candyspriteMap, size, 2, dist, true)
    // let size = 0.33 * this.scaleFactor
    this.addBanners(nowcorruptingspriteMap, size, 0, dist, true, 0.3)
    this.banners.setPosition( this.mesh.position )
    this.corruptingTimer.start()
  }

  killSound(){
    let roll = Math.floor(Math.random() * this.killSounds.length)
    this.killSounds[ roll ].play()
  }

  handleEnemySword(){
    // sword follows the same pattern as character
    let hit = player.handleHit( this.sword )
    if(hit && player.healthTimer.time() > 100){
      player.healthTimer.reset()
      // console.log( 'uum hellow', player.health )

      // e sword damage goes up slowly with roundcount
      player.changeHealth( -1 * Math.ceil(game.roundCount / 3) )
      player.takeDamageSound()
    }
  }

  handleSword(){
    // sword follows the same pattern as character
    let hit = this.handleHit( player.sword )
    if(hit && this.healthTimer.time() > 200){
      this.healthTimer.reset()
      this.takeDamage( 12 * player.level, SWORD )
    }
  }

  handleFriends(){
    let hit
    let friend
    for(var i=0; i<game.friends.length; i++){
      friend = game.friends[i]
      if(friend){
        hit = this.handleHit( friend )
        if(hit && this.healthTimer.time() > 60){
          this.healthTimer.reset()
          friend.attack( this )        
        }
      }
    }
  }

  handleSmokes(){
    let smoke
    for(var i=0; i<game.smokes.length; i++){
      smoke = game.smokes[i]
      if(smoke){
        let bub
        let hit
        if(smoke.bubbles.length > 0){
          for(var x=0; x<smoke.bubbles.length; x++){
            bub = smoke.bubbles[x]
            if(bub && this.healthTimer.time() > 100){
              this.healthTimer.reset()
              // are you in the smoke?!
              hit = this.handleHit( bub )
              if(hit){
                // yes
                // console.log( 'smoking that loud', hit, this.health )
                bub.attack( this )
              }
            }
          }
        }
      }
    }
  }

  // corruption stuff
  godCorrupt(){
    // god corruption
    this.godCorrupted = true

    // move slowly
    this.lightness = 0.03
    // big helf
    this.health = 100
    this.baseColor = [139,60,240]
    this.setColor(this.baseColor[0],this.baseColor[1],this.baseColor[2])

    // douse the flames
    if(this.banners){
      // this if is only necessary because we want to instantly corrupt during demo - otherwise, this enemy would always have corurpt banners
      this.banners.remove()
    }

    this.addBanners(corruptdustMap, 0.18, 16, 0.18)

    // add the unthinkable script
    let dist = 0.1 * this.scaleFactor
    let size = 0.666 * this.scaleFactor
    this.addGodBanners(godkillerMap, size, dist, 0.8)
    this.hitColor = [255,255,255]

    // same proportions as a before, diff sounds
    this.killSounds = [fx_godcorruptkill1, fx_godcorruptkill2, fx_godcorruptkill3]
    this.attackSounds = [fx_godcorrupt1, fx_godcorrupt2, fx_godcorrupt3]
  }

  greenCorrupt(){

    if(!this.greenCorrupted){
      this.health = 200
    } else {
      this.health = Math.ceil( this.health * 1.3 )
    }
    
    // hes abig green motherfucker
    this.lightness = 0.003
    this.baseColor = [0,255,0]
    this.setColor(this.baseColor[0],this.baseColor[1],this.baseColor[2])
    this.hitColor = [0,255,100]

    // this can happen mulitple times, getting bigger
    this.greenCorrupted = true

    // up to ?x scale
    this.mesh.scale.x = this.mesh.scale.x * ( 1 + Math.random() * 1.1)
    this.mesh.scale.y = this.mesh.scale.y * ( 1 + Math.random() * 1.1)
    this.mesh.scale.z = this.mesh.scale.z * ( 1 + Math.random() * 1.1)

    // douse the flames
    if(this.banners){
      this.banners.remove()
    }
    if(this.godBanners){
      // if we're already green but growing we have these
      this.godBanners.remove()
    }

    let dist = 0.1 * this.scaleFactor
    let size = 0.5 * this.scaleFactor
    this.addGodBanners(biggreenspriteMap, size, dist, 0.8)

    // when I die
    this.killSounds = [fx_greenkill1, fx_greenkill2, fx_greenkill3]
    // when I maim
    this.attackSounds = [fx_green1, fx_green2, fx_green3]

    // withhold damage for a bit
    this.birthTimer.start()
    if(this.mesh){
      this.mesh.material.opacity = 0.2
    }
  }

  hitmanCorrupt(){
    this.hitmanCorrupted = true

    // console.log( 'corrupt your bitch ass' )
    // hes abig hitman motherfucker
    this.lightness = 0.01
    this.health = 180
    this.baseColor = [40,40,40]
    this.setColor(this.baseColor[0],this.baseColor[1],this.baseColor[2])
    this.hitColor = [80,80,80]

    // douse the flames
    if(this.banners){
      this.banners.remove()
    }
    this.killSounds = [fx_hitmankill1, fx_hitmankill2, fx_hitmankill3] 
    this.attackSounds = [fx_hitman1, fx_hitman2, fx_hitman3]
  }

  handleContract(){
    if(this.money > 0){

      if(this.contract.type == ONPLAYER){
        // console.log( 'moving p con' )
        this.moveTowardsPoint( player.mesh.position.x, player.mesh.position.y, 3 )
      } else if(this.contract.type == ONENEMY){

        // kill em
        // purseu enemy

        // console.log( 'id', this.contract.targetId )
        // console.log( 'enem', game.enemies[this.contract.targetId] )
        // if(game.enemies[this.contract.targetId]){
        //   console.log( 'life', game.enemies[this.contract.targetId].lifecycle )
        // }

        if(game.enemies[this.contract.targetId] && game.enemies[this.contract.targetId].lifecycle == ALIVE){

          // console.log( 'pursing con-e ', this.contract.targetId  )
          // if target is still alive, KILL EM
          this.moveTowardsPoint( game.enemies[ this.contract.targetId ].mesh.position.x, game.enemies[ this.contract.targetId ].mesh.position.y, 3 )

        } else {
          // if targets dead, pick a new one as long as we still got de dough
          let randomTargetId = Math.floor( Math.random() * k(game.enemies).length )
          this.contract.newTarget( randomTargetId )
          // console.log( 'chose new con-target ', randomTargetId )
          // game.enemies[ this.contract.targetId ]
        }
      }

      if(this.contractSpendTimer.time() > 1000){
        this.contractSpendTimer.reset()
        // if we're on any kind of contract, spend 10 bones a sex
        this.changeMoney(-10)
        // console.log( 'money is now', this.money )
      }
    } else {

      this.endContract()
    }

  }

  addPlayerContract(cost, clientId){
    this.contract = new Contract(ONPLAYER, cost, null, clientId)
    console.log( 'add p contract', cost, clientId )
    this.attackSound()
  }

  addEnemyContract(cost, targetId){
    // charge player
    player.changeMoney(cost)
    this.contract = new Contract(ONENEMY, cost, targetId)
    console.log( 'add e contract', cost, targetId )
    this.attackSound()
  }

  endContract(){
    // temp
    // if(this.contract.type == ONPLAYER){
    //   console.log( 'end contract' )
    //   if(game.enemies[ this.contract.clientId ]){
    //     game.enemies[ this.contract.clientId ].base_color = [0,255,255]
    //     game.enemies[ this.contract.clientId ].setColor(this.baseColor[0],this.baseColor[1],this.baseColor[2])    
    //   }

    // }

    if(this.laserSight){
      // thats enough
      this.removeLaserSight()
    }
    
    this.contract = null
  }

  addPoint(x,y){
    // can use this to snap coordinates to game area edges
    // console.log( 'input ', x,y )
    x = incInRange(x, 0, game.maxX*-1, game.maxX)
    y = incInRange(y, 0, game.maxY*-1, game.maxY)
    // console.log( 'output ', x,y )

    // add this pair to end of coordinate queue
    this.routePoints.push([x,y])
  }

  arrivedAtPoint(){
    return isWithin(this.mesh.position.x, this.routePoints[0][0], 0.05) && isWithin(this.mesh.position.y, this.routePoints[0][1], 0.05)
  }

  plotCourse(){
    this.routePoints = []

    if(this.enemyType == KNOWLOCTA || this.enemyType == SPHERE || this.enemyType == BOSS){

      // let triangleSide = Math.random() * somethign
      // probaly too big
      let triangleSide = 0.2

      // move in a triangle
      let startPoint = game.randomPoint()
      this.addPoint(startPoint[0], startPoint[1])

      // top point
      // x+half of side length, y+rt3*1/2sidelength
      let secondPointX = startPoint[0]+0.5
      let secondPointY = startPoint[1]+( Math.sqrt(3) * 0.5 )
      this.addPoint( secondPointX, secondPointY )

      // just slide over sidelength from startpoint
      let thirdPointX = startPoint[0]+1
      let thirdPointY = startPoint[1] 
      this.addPoint( thirdPointX, thirdPointY )

    } else if(this.enemyType == CIRCLE){
      // horizontal  lines

      let point = game.randomPoint()
      point[0] = -1*game.maxX*0.8

        // left point
      this.addPoint(point[0], point[1])

      let xSign = -1
      let ySign = -1

      for(var i=0; i<12; i++){
        // right point
        point[0] = xSign * game.maxX*0.8
        this.addPoint(point[0], point[1])
        // flip every time to go to eithe rright or left edge
        xSign = xSign*-1

        // vert point
        point[1] += ySign * 0.5
        this.addPoint(point[0], point[1])

        // if weve 'gone' over the edge, flip the y sign to go the other way
        if(Math.abs(point[1]) > game.maxY || point[1] < 0){
          ySign = ySign*-1
        }
      }

    } else if(this.enemyType == STICK){
      // vertical lines

      let point = game.randomPoint()
      point[1] = -1*game.maxY*0.8

        // left point
      this.addPoint(point[0], point[1])

      let xSign = -1
      let ySign = -1

      for(var i=0; i<12; i++){

        // right point
        point[1] = ySign * game.maxY*0.8
        this.addPoint(point)
        // flip every time to go to eithe top or bottom edge
        ySign = ySign*-1

        // vert point
        point[0] += xSign * 0.5
        this.addPoint(point)

        // if weve 'gone' over the edge, flip the x sign to go the other way
        if(Math.abs(point[0]) > game.maxY || point[0] < 0){
          xSign = xSign*-1
        }
      }
    }

    // lets move 
    this.patternMoveStage = MOVING
  }

  passedEntryPlane(){
    // if we made it into play were locked at 0
    return this.mesh.position.z == 0
  }

  customAnimation(){
    // dont do it, if yA DEAD
    if(this.lifecycle == ALIVE){
      this.rotation()

      if(this.casinoHighlight){
        this.deadSprite.material.rotation += 0.033
      }

      if(this.greenCorrupted && this.mesh){
        if(this.mesh.material.opacity < 1){
          this.mesh.material.opacity += 0.004
        }
      }


      if(!this.hitmanCorrupted && this.moneyTimer.time() > 1000){
        this.moneyTimer.reset()
        this.changeMoney(10)
      } else if(this.hitmanCorrupted && this.contract){
        // only laser when hitman is working

        if(this.moneyTimer.time() > 80){
          this.moneyTimer.reset()
          if(this.laserSight){
            // get rid of old one
            this.removeLaserSight()
          }
          
          let edges = new THREE.EdgesGeometry( this.mesh.geometry, 90 )
          let col

          if(this.contract.type == ONPLAYER){
            // red sights for onp contracts
            col = rgbToHex( Math.floor( Math.random() * 200 + 55 ), 0, 0 )

          } else {
            // blue for player contracts
          col = rgbToHex( 0, 0, Math.floor(Math.random() * 200 + 55 ) )

          }
          this.laserSight = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: col } ) )
          this.laserSight.position.set( this.mesh.position.x,this.mesh.position.y,this.mesh.position.z )
          this.laserSight.setRotationFromEuler( this.mesh.rotation )

          scene.add( this.laserSight )  
        }
        
      } else if(this.hypnotizedById){

        // boss trail line for hypnoed enemy

        if(this.bossOutline){
          // remove old boss outline
          this.bossOutline.material.dispose()
          scene.remove( this.bossOutline )  
          this.bossOutline = null
        } 


        if( game.enemies[ this.hypnotizedById ] && game.enemies[ this.hypnotizedById ].lifecycle == ALIVE ){
          // if the boss is still alive
          
          let points = []
          // us, hypnoed enemy
          points.push( new THREE.Vector3( this.mesh.position.x,this.mesh.position.y,this.mesh.position.z ) )
          // them, da boss
          points.push( new THREE.Vector3( game.enemies[ this.hypnotizedById ].mesh.position.x,game.enemies[ this.hypnotizedById ].mesh.position.y,game.enemies[ this.hypnotizedById ].mesh.position.z ) )
          let geometry = new THREE.BufferGeometry().setFromPoints( points )
          this.bossOutline = new THREE.LineSegments( geometry, new THREE.LineBasicMaterial( { color: "#880088" } ) )

          // let edges = new THREE.EdgesGeometry( this.mesh.geometry, 90 )
          // edges.scale(1.3,1.3,1.3)
          // this.bossOutline = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: "#ffffff" } ) )

          // this.bossOutline.position.set( this.mesh.position.x,this.mesh.position.y,this.mesh.position.z )
          // this.bossOutline.setRotationFromEuler( this.mesh.rotation )
          scene.add( this.bossOutline )  
        }
        
      }


      if(this.sword){

        // move the shit around on cirlce around the player
        this.sword.rotateTowardsMovement(this.accx, this.accy)

        if(this.sword.mesh.visible){
          this.drawSword()
        }
      }

      if(this.enemyType == HEALCUBE && this.duster){
        // need to check for duster because its gone during corrupting

        // health cube
        this.duster.particleSystem.rotation.x += 0.01
      }

    } else if(this.lifecycle == DYING){
      // start this, will fade down in animation (for health cube)
      if(!this.dusterTimer.running){
        this.dusterTimer.start()
      }

      // if a sprite exists, start fading it out
      if(!this.opacityTimer.running){
        this.opacityTimer.start()
      }

      if(this.opacityTimer.time() > 4){
        this.opacityTimer.reset()

        // let sx, sy, sz
        // sx = this.mesh.scale.x + 0.4
        // sy = this.mesh.scale.y + 0.4
        // sz = this.mesh.scale.z + 0.4
        // this.mesh.scale.set(sx,sy,sz)

        this.spriteOpacity = this.spriteOpacity - 0.022
        // console.log( 'reduced spriteopac '+ this.spriteOpacity )
        this.deadSprite.material.opacity = this.spriteOpacity
        // also fade out mesh
        this.mesh.material.opacity = this.spriteOpacity

        if(this.spriteOpacity <= 0){
          // if we hit 0 opacity, remove sprite from scene
          this.removeSprite()

          // this will allow the enemy maintenance loop in game to actually dispose of the CORPSE
          // console.log( 'i hereby pronounce you, fucking dead ', this.id )
          this.lifecycle = DEAD
        }
      }
    } else if(this.lifecycle == CORRUPTING){
      // fade corrupting sprite
      if(this.corrOpacityUpTimer.time() > 10){
        this.corrOpacityUpTimer.reset()
  
        if(this.corrOpacityUp){
          // console.log( 'went up' )
          this.banners.particleSystem.material.opacity += 0.02
        } else {
          // console.log( 'went down' )
          this.banners.particleSystem.material.opacity -= 0.02
        }

        if(this.banners.particleSystem.material.opacity <= 0.3){
          // console.log( 'going up now' )
          this.corrOpacityUp = true
        } else if(this.banners.particleSystem.material.opacity >= 1) {
          // console.log( 'going down now' )
          this.corrOpacityUp = false
        }
      }
      
      if(this.corruptingTimer.time() > game.corruptingTime){
        this.lifecycle = ALIVE

        // console.log( 'I CORRUPT NOW...', this.id )
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        if(this.corrupted){

          // only go once, as cool as the changing is...
          if(!this.godCorrupted && !this.greenCorrupted && !this.hitmanCorrupted){

            if(game.roundCount < 20){
              this.godCorrupt()
            } else if(game.roundCount < 30) {
              if(Math.random() > 0.5){
                this.godCorrupt()
              } else {
                this.greenCorrupt()
              }
            } else {
              let roll = Math.random()
              if(roll > 0.66){
                this.godCorrupt()
              } else if(roll > 0.33) {
                this.greenCorrupt()
              } else {
                this.hitmanCorrupt()
              }
            }

          } else if(this.greenCorrupted){
            // green corrupt can keep growin bigger
            this.greenCorrupt()
            // wait another corrTime to do again
            this.corruptingTimer.reset()
            
          }
          
        } else {

          // regular corruption
          this.health = 24
          this.corrupted = true
          this.intention = WANDER
          this.baseColor = [255,0,0]
          this.mesh.material.color.setRGB(0xff0000)

          // douse the flames
          this.banners.remove()
          // add the evil script
          this.addBanners(corruptdustMap, 0.18, 16, 0.18)
          this.hitColor = [255,0,0]
          // same proportions as a before, diff sounds
          this.killSounds = [fx_ckill1, fx_ckill2, fx_ckill3]
          
          // this.hitmanCorrupt()

        }
        
      }
    }
  }

  customMovement(){

    // if were allowed to, switch up the fuckkin pattern someTIMES
    if(this.allowedToPattern && this.intentionTimer.time() > 800){
      this.intentionTimer.reset()

      // put this in here so we flip coin 1 time/2s, not framerate times per s, after 2s
      if(Math.random() > 0.5){

        if(this.intention == WANDER){
          this.intention = PATTERNMOVE
          this.patternMoveStage = PLOTTING
        } else if(this.intention == PATTERNMOVE){
          this.intention = WANDER
        }
      }
      
    }

    //STOP RIGHT THERE - its time to corrupt
    if(this.lifecycle != CORRUPTING){

      if(this.hypnotizedById && game.enemies[ this.hypnotizedById ] && game.enemies[ this.hypnotizedById ].lifecycle == ALIVE ) {
        // if boss hypnotized enemy, move slowly towards boss
        this.moveTowardsPoint(game.enemies[this.hypnotizedById].mesh.position.x, game.enemies[this.hypnotizedById].mesh.position.y, 0.6)
      } else if(this.godCorrupted){
        // if godcorrupted, always chase player
        this.moveTowardsPoint(player.mesh.position.x, player.mesh.position.y, 0.4)
      } else if(this.corrupted && (game.percentCorrupted == 1 || game.roundCount >= 20) && this.enemyType != BOSS ){
        // chase the player like a demon from hell if theres only corrupteds left
        this.moveTowardsPoint(player.mesh.position.x, player.mesh.position.y)

      } else if(this.enemyType == BOSS){
        // uh this doesnt hapennnnnnn
        this.moveTowardsPoint(player.mesh.position.x, player.mesh.position.y, 0.6)
      } else {

        if(this.intention == WANDER){
          let chance = Math.random()
          if(chance > 0.3 && this.directionTimer.time() > 200){
            this.directionTimer.reset()
            this.chooseDirection()
          }
          
          let speed =  Math.random()*0.03

          if(this.direction == LEFT){
            this.accx -= speed
          } else if(this.direction == UP){
            this.accy += speed
          } else if(this.direction == RIGHT){
            this.accx += speed
          } else if(this.direction == DOWN) {
            this.accy -= speed
          }      
        } else if(this.intention == PATTERNMOVE){
          if(this.patternMoveStage == PLOTTING){
            // plot a course
            this.plotCourse()
          } else if(this.patternMoveStage == MOVING) {
            // weve got our orders sir

            this.moveTowardsPoint( this.routePoints[0][0], this.routePoints[0][1], 0.6 )

            if( this.arrivedAtPoint() ){
              // this.routePoints.shift()
              this.currentRouteIndex += 1

              // if we finished the route, we finished a lap
              if(this.currentRouteIndex == this.routePoints.length){
                this.laps += 1
                this.currentRouteIndex = 0
              }

              this.patternMoveStage = WAITING
              this.patternWaitTimer.reset()

              if(this.laps > 3){
                // if we finished our laps, empty out, we get new route below on next loop
                this.routePoints = []
              }
              
            }
            
          } else if(this.patternMoveStage == WAITING){

            // pause at point, then move again
            if(this.patternWaitTimer.time() > 800){

              if(!this.routePoints[0]){
                // we arrive, new course plz
                this.patternMoveStage = PLOTTING
              } else {
                this.patternMoveStage = MOVING
              }
            }
          }

        }
      }
    }
    
  }
}