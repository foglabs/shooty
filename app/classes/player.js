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

    this.bonusDamage = 2
        
    // how heavy is da guy
    this.dragCoefficient = 0.064
    this.defaultLightness = 0.032

    this.moneyCircleEnabled = true

    this.maxAcc = 2.6

    this.defaultPlayerValues()
  }

  defaultPlayerValues(){
    this.dusterGoingUp = true
    
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
    this.defaultSwordSpeed = DEG4
    this.swordSpeed = DEG4

    this.friendsAvailable = 0

    this.casinoEnabled = false

    // build to level up
    this.knowledge = 0
    this.level = 1
    this.health = 100
    
    this.money = 0
    this.lastMoney = 0
    this.addMoneyLabel("#00ff00")

    this.speedItemTimer = new Timer()
    this.speedItemTimer.start()
    this.speedItem = false
    this.lightness = this.defaultLightness

    this.speedAnimationTimer = new Timer()
    this.speedAnimationTimer.start()

    this.idle = false
    this.idleTimer = new Timer()
    this.idleTimer.start()
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

  swordLength(){
    let calc = 0.3 * (1 + (this.level-1) / 2 )
    return Math.min(1.8, calc)
  }

  levelUp(){
    this.knowledge = 0
    this.level += 1
    game.announcement("LEVEL UP (" + this.level + ")" )
    game.changeScore(200 * this.level)

    // game.knowledgeMax = Math.round(game.knowledgeMax * 1.25)
    game.knowledgeMax = Math.round( game.knowledgeMaxDefault + ( 6/2*game.knowledgeMaxDefault * Math.log(this.level - 1) ) )
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
        this.addSword( this.swordLength() )
      }
      // this.swordSpeed = this.defaultSwordSpeed * (1.1 + this.level/6)
      this.swordSpeed = this.defaultSwordSpeed
      
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
    // this.bombsInterval = Math.floor( 1000 - 40 * Math.pow( this.level/4, 2 ) )

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

    this.changeMoney( Math.ceil( this.level * 5 ) )

    // if(this.level % 4 == 0){
      game.announcement("TOP SPEED INCREASE")
      player.maxAcc += 0.05
    // }

    this.bonusDamage = 2*(this.level/2)

    fx_levelupE2.play()
  }

  bombSmokeCost(){
    // console.log( 'cost is ', Math.log( this.level-6 ) - 1)

    // y = (x/2 - 5)^3
    return Math.min(0, Math.floor( Math.pow(this.level/2 - 5, 3) ) )
  }

  dropBomb(){
    if(this.numBombs > 0 && this.power >= 5){
      // less power the higher level you are, cause you have more, and you need more
      let cost = this.bombSmokeCost()
      this.changePower(cost)

      let bomb = new Bomb([50,50,50], this.level)
      bomb.mesh.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z)
      scene.add( bomb.mesh )
      game.bombs.push( bomb )

      this.numBombs = incInRange( this.numBombs, -1, 0, this.numBombsMax )
    }
  }

  dropSmoke(){
    if(this.numSmokes > 0 && this.power >= 5){
      let cost = this.bombSmokeCost()
      if(cost > 0){
        this.changePower(cost)
      }

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
    this.sword = new Sword( this.swordLength(), 0, this )
    this.sword.mesh.visible = false
    scene.add( this.sword.mesh )
  }

  startSword(){
    if(!this.sword){
      this.addSword( this.swordLength() )
    }

    this.sword.active = true
    this.sword.mesh.visible = true
  }

  stopSword(){
    if(this.sword){
      this.sword.active = false
      this.sword.mesh.visible = false  
    }
  }

  drawSword(){

    if(this.sword.rotateTimer.time() > 2){
      this.sword.rotateTimer.reset()
      this.sword.bbox.setFromObject( this.sword.mesh )
      this.sword.bbox.expandByScalar(0.22)
    }
  }

  addFriend(){

    if(this.friendsAvailable > 0){
      let r,g,b
      r = Math.floor(Math.random() * 255)
      g = Math.floor(Math.random() * 255)
      b = Math.floor(Math.random() * 255)
      let friend = new Friend(this.level*10, 20, [r,g,b], this.mesh.position)
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

    if(game.stage == PLAYING && this.idleTimer.time() > 2000){
      this.idleTimer.reset()
      // if no inputs for 2s (tracked in keyhandler), idle
      this.idle = true
    }
  }

  swordCost(){
    // easy peezy
    return -1 * this.level
  }

  // slowDown(acc){
  //   // overload!
  //   if(keyHandler.heldKeys["ArrowLeft"] || keyHandler.heldKeys["ArrowRight"] || keyHandler.heldKeys["ArrowUp"] || keyHandler.heldKeys["ArrowDown"]){
  //     // something else

  //     if(acc > 0){
  //       // whichever way we're currently moving, accelerate towards the opposite direction
  //       acc -= this.dragCoefficient/4
  //       if(acc < 0) {acc = 0}
  //     } else if(acc < 0){
  //       acc += this.dragCoefficient/4
  //       if(acc > 0) {acc = 0}
  //     }

  //   } else {
  //     if(acc > 0){
  //       // whichever way we're currently moving, accelerate towards the opposite direction
  //       acc -= this.dragCoefficient
  //       if(acc < 0) {acc = 0}
  //     } else if(acc < 0){
  //       acc += this.dragCoefficient
  //       if(acc > 0) {acc = 0}
  //     }
  
  //   }
  //   return acc
  // }

  customAnimation(){
    if(this.lifecycle == ALIVE){
      this.rotation()

      this.eatAnimation()
      this.speedAnimation()
      if(this.sword){

        // move the shit around on cirlce around the player
        this.sword.rotateTowardsMovement(this.accx, this.accy)

        if(this.sword.mesh.visible){
          this.drawSword()

          if(this.sword.powerTimer.time() > 100){
            this.sword.powerTimer.reset()
            this.changePower( this.swordCost() )

            // if we ran out of power, kill sword
            if(this.power <= 0){
              this.stopSword()
            }
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

      // console.log( 'tlighty', this.lightness )
      if(this.speedItem){
        // if we buy the speed item, we charge up to speed until we fast

        if(this.speedItemTimer.time() < 20000){

          if(this.lightness <= 0.16){
            this.lightness += 0.0002
          }

          if(this.color != this.tempColor){
            this.fadeColor(this.baseColor, this.tempColor, 60)
          }
        } else {

          this.lightness -= 0.02
          if(this.lightness <= this.defaultLightness){
            this.lightness = this.defaultLightness
            this.speedItem = false
            //back to base color
            this.setColor(this.baseColor[0],this.baseColor[1],this.baseColor[2])
          }
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

  fadeColor(fromColor, toColor, time){
    if(!this.colorTimer.running){
      this.colorTimer.start()
    }

    // one step for each animinterval
    let animinterval = 5
    let numSteps = time / animinterval

    // every 5 ms 
    if(this.colorTimer.time() > 5){
      this.colorTimer.reset()

      let r,g,b
      r = Math.floor( lerp( fromColor[0], toColor[0], this.u ) )
      g = Math.floor( lerp( fromColor[1], toColor[1], this.u ) )
      b = Math.floor( lerp( fromColor[2], toColor[2], this.u ) )

      this.color = [r,g,b]
      this.setColor(r,g,b)

      let step = 1.0/numSteps
      this.u += step

      // done
      if(this.u > 1.0){
        this.u = 0
      }
    }

    if(isWithin(this.color[0], toColor[0], 5) && isWithin(this.color[1], toColor[1], 5) && isWithin(this.color[2], toColor[2], 5)){
      this.setColor( toColor[0], toColor[1], toColor[2] )
    }
  }

  startSpeedItem(){
    // this.setColor(255,0,0)
    this.tempColor = [235,87,255]

    this.speedItem = true
    this.speedItemTimer.reset()
  }

  deathAnimation(){
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

      this.setColor(100,100,200)

    } else {
      this.setColor(this.baseColor[0],this.baseColor[1],this.baseColor[2])
    }
  }


  topSpeed(){
    return isWithin( Math.abs(this.accx), this.maxAcc, 0.4) || isWithin( Math.abs(this.accy), this.maxAcc, 0.4) 
  }

  speedAnimation(){
    // if were within 0.2 of maxacc, show top speed anim


    // if(this.speedAnimationTimer.time() > 8){
    //   this.speedAnimationTimer.reset()
      if( this.topSpeed() ){

        if( !this.duster ){
          this.duster = new Duster(glowMap, 0.8, 1, 0, this.mesh.position, 0.1, true)
        } else {
          // this.duster.particleSystem.rotation.x += 0.06
          // this.duster.particleSystem.rotation.y += 0.06

          if(this.dusterGoingUp){
            this.duster.particleSystem.material.opacity += 0.005
            this.duster.particleSystem.material.size += 0.005
          } else {
            this.duster.particleSystem.material.opacity -= 0.005
            this.duster.particleSystem.material.size -= 0.005
          }

          if(this.duster.particleSystem.material.opacity > 0.15){
            this.dusterGoingUp = false
          } else if(this.duster.particleSystem.material.opacity < 0.1) {
            this.dusterGoingUp = true
          }
        }
      } else {
        if(this.duster) {
          this.duster.remove()
          this.duster = null
        }
      }  
    // }
    
    
  }

}