
class Player extends Character {
  constructor(base_color){
    let geometry = new THREE.BoxGeometry(0.2,0.2,0.3)
    super(
      // de geo
      geometry,
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.mesh.material.needsUpdate = true
    this.playerHealthSounds = [fx_phealth1, fx_phealth2, fx_phealth3]
    this.hitColor = [193,29,209]
    this.color = this.baseColor
    this.isPlayer = true
    
    // how heavy is da guy
    this.lightness = 0.06
    this.dragCoefficient = 0.02

    this.defaultPlayerValues()
  }

  defaultPlayerValues(){
    
    // flag for animation etc
    this.eating = false

    this.animTimer = new Timer()
    this.eatingTimer = new Timer()

    // this builds up the more you EAT
    this.power = 0
    // so we can limit power-related drawing
    this.lastPower = 0
    this.killingCircle = null
    this.killingCircleArea = {}
    this.killingCircleArea.mesh = null
    this.killingCircleArea.bbox = null
    this.killingCircleActive = false
    this.killingCircleTimer = new Timer()
    this.killingCircleEnabled = false

    this.numBombs = 0
    this.numBombsMax = 0
    this.bombsTimer = new Timer()
    this.bombsTimer.start()
    this.bombsInterval = 1000

    this.smokeEnabled = true
    this.numSmokes = 0
    this.numSmokesMax = 0
    this.smokesTimer = new Timer()
    this.smokesTimer.start()
    this.smokesInterval = 1000

    this.swordEnabled = false
    this.defaultSwordSpeed = DEG1
    this.swordSpeed = DEG1

    this.friendsAvailable = 0

    this.casinoEnabled = false

    // build to level up
    this.knowledge = 0
    this.level = 1
    this.health = 100
  }
  
  rotation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.08 * fac
    fac = Math.random() * 0.003
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.08 * fac
  }

  takeDamageSound(){
    if(this.damageSoundTimer.time() > 30){
      this.damageSoundTimer.reset()

      if(this.health >= 66){
        fx_phealth1.play()
      } else if(this.health >= 33){
        fx_phealth2.play()
      } else if(this.health > 0){
        fx_phealth2.play()
      }  
    }
    
  }

  changePower(powChange){
    this.lastPower = this.power
    // this.power += pow

    // lock em in 
    this.power = incInRange( this.power, powChange, 0, game.powerMax )
  }

  changeKnowledge(knowChange){

    // lock em in 
    this.knowledge = incInRange( this.knowledge, knowChange, 0, game.knowledgeMax )
    if(this.knowledge >= game.knowledgeMax){
      console.log( 'I WANT LEVEL UP NOW', this.knowledge, game.knowledgeMax, this.level )
      this.levelUp()
    }
  }

  levelUp(){
    this.knowledge = 0
    this.level += 1
    game.announcement("LEVEL UP (" + this.level + ")" )
    game.changeScore(50 + Math.pow(2, this.level))

    // game.knowledgeMax = Math.round(game.knowledgeMax * 1.25)
    game.knowledgeMax = Math.round( game.knowledgeMaxDefault + ( 3/2*game.knowledgeMaxDefault * Math.log(this.level - 1) ) )
    // console.log( 'KNOW AMX', game.knowledgeMax )
    document.getElementById("knowledge").max = game.knowledgeMax
    
    if(this.level == 2){
      this.swordEnabled = true
      game.announcement("SWORD UNLOCKED (Z)")
    }

    if(this.swordEnabled){
      if(this.sword){
        // remove and add so that we get new length
        this.sword.remove()
        this.addSword()
      }
      this.swordSpeed = this.defaultSwordSpeed * (1.1 + this.level/3)
      
      if(this.level != 2){
        game.announcement("SWORD LENGTH INCREASE")
      }
    }

    if(this.level == 4){
      game.announcement("KILLING CIRCLE UNLOCKED (SPACEBAR)")
      this.killingCircleEnabled = true
    }

    // smokes recharge faster with higher level
    this.smokesInterval = Math.floor( 1000 - 40 * Math.pow( this.level/4, 2 ) )

    // start bombs at level 8
    this.numBombsMax = Math.max(0, Math.floor(-3 + this.level/2))
    if(this.level == 8){
      game.announcement("BOMBS UNLOCKED (C)")
    } else if(this.numBombsMax > 1) {
      game.announcement("EXTRA BOMB UNLOCKED (C)")
    }

    // bombs recharge faster with higher level
    this.bombsInterval = Math.floor( 1000 - 40 * Math.pow( this.level/4, 2 ) )

    // start smokes at level 6
    this.numSmokesMax = Math.max(0, Math.floor(-2 + this.level/2))
    if(this.level == 6){
      game.announcement("SMOKE UNLOCKED (X)")
    } else if(this.numSmokesMax > 1) {
      game.announcement("EXTRA SMOKE UNLOCKED (X)")
    }

    // start at level 10, and every even lvl after
    if(this.level >= 10 && this.level % 2 == 0){
      this.friendsAvailable += 1
      game.announcement("NEW FRIEND UNLOCKED (V)")
    }

    if(game.friends.length > 0){
      let friend
      for(var i=0; i<game.friends.length; i++){
        friend = game.friends[i]
        friend.changePowerMax( (this.level + 2) * 25 )
      }
    }

    if(this.level == 12){
      // you now can bet
      game.announcement("CASINO UNLOCKED (B)")
      this.casinoEnabled = true
    }

    fx_levelupE2.play()
  }

  dropBomb(){
    // console.log( 'bmobms', this.numBombs, this.numBombsMax )
    if(this.numBombs > 0){
      let bomb = new Bomb([50,50,50], this.level)
      bomb.mesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z)
      scene.add( bomb.mesh )
      game.bombs.push( bomb )

      this.numBombs = incInRange( this.numBombs, -1, 0, this.numBombsMax )
    }
  }

  dropSmoke(){
    // console.log( 'bmobms', this.numBombs, this.numBombsMax )
    if(this.numSmokes > 0){

      let x = this.mesh.position.x
      let y = this.mesh.position.y
      let smoke = new Smoke(x,y)
      // bomb.mesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z)
      game.smokes.push( smoke )
      this.numSmokes = incInRange( this.numSmokes, -1, 0, this.numSmokesMax )
    }
  }

  addKillingCircle(){
    // bigger power, bigger circle
    let geometry = new THREE.Geometry()
    this.killingCircle = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xFFFFFF }))
    this.killingCircle.geometry.verticesNeedUpdate = true
    // console.log( 'we addin that damn cirlce bitch  ' )
    

    // toprad, bottomrad, height, segments
    this.killingCircleArea.mesh = new THREE.Mesh( new THREE.CylinderGeometry(1, 1, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0xffdd22, transparent: true  }) )
    // about face on to camera
    this.killingCircleArea.mesh.rotation.x = 1.57
    this.killingCircleArea.mesh.material.opacity = 0.1


    this.drawKillingCircle()
    scene.add(this.killingCircle, this.killingCircleArea.mesh)
  }

  removeKillingCircle(){
    this.killingCircle.geometry.dispose()
    this.killingCircle.material.dispose()
    scene.remove(this.killingCircle)
    this.killingCircle = null

    this.killingCircleArea.mesh.geometry.dispose()
    this.killingCircleArea.mesh.material.dispose()
    scene.remove(this.killingCircleArea.mesh)
    this.killingCircleArea.mesh = null
    this.killingCircleArea = {}

  }

  drawKillingCircle(){

    let segmentCount = 32
    let radius
    // radius = this.power/game.powerMax*2
    // need more beeg
    radius = this.power/game.powerMax*3

    this.killingCircle.geometry.vertices = []
    var theta
    for (var i = 0; i <= segmentCount; i++) {
      theta = (i / segmentCount) * Math.PI * 2
      this.killingCircle.geometry.vertices.push( new THREE.Vector3( Math.cos(theta) * radius, Math.sin(theta) * radius, 0 ) )
    }

    // update
    this.killingCircleArea.mesh.scale.set( radius*1.1, radius*1.1, radius*1.1 )
  }

  startKillingCircle(){
    if(!this.killingCircle){
      this.addKillingCircle()
    }

    this.killingCircle.visible = true
    this.killingCircleArea.mesh.visible = true

    if(!this.killingCircleTimer.running){
      // console.log( 'bgegin circ timer' )
      this.killingCircleTimer.start()
    }
  }

  stopKillingCircle(){
    if(this.killingCircle && this.killingCircle.visible){
      // console.log( 'stop that circle' )
      this.killingCircle.visible = false
      this.killingCircleArea.mesh.visible = false
    }
  }

  killingCircleDamage(){
    return 8 + 7 * Math.pow(this.level / 4, 2)
  }

  // sword
  addSword(){
    this.sword = new Sword(0.5 * (1 + (this.level-1) / 5 ))
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
    this.sword.active = true
    this.sword.mesh.visible = false
  }

  drawSword(){

    if(this.sword.rotateTimer.time() > 2){
      this.sword.rotateTimer.reset()

      this.sword.bbox.setFromObject( this.sword.mesh )
    }
  }

  addFriend(){

    if(this.friendsAvailable > 0){
      let r,g,b
      r = Math.floor(Math.random() * 255)
      g = Math.floor(Math.random() * 255)
      b = Math.floor(Math.random() * 255)
      let friend = new Friend(this.level*20, 20, [r,g,b], this.mesh.position)
      scene.add( friend.mesh )

      game.friends.push( friend )
      this.friendsAvailable -= 1
      // console.log( 'firend created', this.friendsAvailable, ' left' )
    }
  }

  customMovement(){
    if(this.killingCircle && this.killingCircle.visible){
      // console.log( 'move tha tcircle' )
      this.killingCircle.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
      this.killingCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    }
  }

  customAnimation(){
    if(this.lifecycle == ALIVE){
      this.rotation()

      // this.eatAnimation()
      if(this.sword){

        // move the shit around on cirlce around the player
        this.sword.rotateTowardsMovement(this.accx, this.accy)

        if(this.sword.mesh.visible){
          this.drawSword()

          if(this.sword.powerTimer.time() > 100){
            this.sword.powerTimer.reset()
            this.changePower(-3)
          }
        }
      }

      if(this.killingCircle && this.killingCircle.visible){
          
        if(this.killingCircleTimer.time() > 100){
          this.killingCircleTimer.reset()
          // console.log( 'time to draw bitch' )
          this.removeKillingCircle()
          this.addKillingCircle()
          this.killingCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)


          // spend power to have killing circle open
          this.changePower(-4)
        }

        this.drawKillingCircle()
        this.killingCircle.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
        this.killingCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)

        if(this.killingCircleArea && this.killingCircleArea.mesh){
          this.killingCircleArea.bbox = new THREE.Box3().setFromObject( this.killingCircleArea.mesh )
        }

      }
    } else if(this.lifecycle == DYING){
      this.deathAnimation()

      // console.log( 'help i am dying!' )

      if(!this.deadSprite){
        // only do it once
        this.addSprite(pbloodspriteMaterial.clone(), 0.3)
      }
    }
  }

  deathAnimation(){
    // console.log( 'I try!' )
    if(!this.animTimer.running){
      this.animTimer.start()
    }

    if(this.animTimer.time() > 20){
      // console.log( 'anim loop running' )
      this.animTimer.reset()

      this.mesh.rotation.y += 0.08

      let x,y,z
      x = this.mesh.scale.x * 1.009
      y = this.mesh.scale.y * 1.004
      z = this.mesh.scale.z * 1.009
      this.mesh.scale.set(x,y,z)

      // this.mesh.material.opacity -= 0.01
    }

  }

  eatAnimation(){
    if(this.eating){
      if(!this.eatingTimer.running){
        this.eatingTimer.start()
      }
    }

    if(this.eating || this.scaleFactor > 1 || this.scaleFactor < 1){
      // console.log( 'scaleFactor ' + this.scaleFactor )
      if(!this.animTimer.running){
        this.animTimer.start()
      } 

      // how often should we actually change mesh
      if(this.animTimer.time() > 30){
        // 20ms
        this.animTimer.reset()
        
        if(this.eating){
          // console.log( 'turn hit on' )
          this.isHit = true

          // if we eatin, scale that badboy up
          if(this.scaleFactor < 3){

            this.scaleFactor += 0.05
            // console.log( 'going up' )
          }

        } else {

          // console.log( 'turn hit off' )
          this.isHit = false

          if(this.scaleFactor > 1) {

            // if we're full, but still big, shrink on down
            this.scaleFactor -= 0.05

            // console.log( 'reduced to ' + this.scaleFactor )

            if(this.scaleFactor < 1.0){
              // console.log( 'reset going down' )
              this.scaleFactor = 1.0
            }
          }
        
        }
      }

      // if we're in here, were doing somethin right
      this.mesh.scale.x = this.scaleFactor
      this.mesh.scale.y = this.scaleFactor
      this.mesh.scale.z = this.scaleFactor
    }

    if(this.eatingTimer.time() > 200){
      this.eating = false
      this.eatingTimer.stop()
      // console.log( 'stop eating' )
    }

  }

}