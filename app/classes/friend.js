class Friend extends Character {
  constructor(health, power, baseColor, position){
    let geo = new THREE.TetrahedronGeometry(0.2)

    let basestr = rgbToHex(baseColor)
    let mat = new THREE.MeshPhysicalMaterial( { color: basestr, transparent: true, reflectivity: 1, roughness: 0, clearcoat: 1.0, clearcoatRoughness: 0.1 })
    super(geo, new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()), baseColor, mat)

    this.health = health
    this.power = power

    this.directionTimer = new Timer()
    this.directionTimer.start()  
    
    this.rechargeTimer = new Timer()
    this.rechargeTimer.start()

    this.dna = Math.random()

    this.lightness = 0.08
    this.powerMax = 75

    if(this.dna <= 0.33){
      // console.log( 'creating WANDER' )
      this.type = WANDER
    } else if(this.dna > 0.33 && this.dna <= 0.66){
      // console.log( 'creating CHASER' )
      this.type = CHASER
    } else if(this.dna > 0.66){
      // console.log( 'creating FOLLOWER' )
      this.type = FOLLOWER
    }

    this.bornSounds = [fx_newfriend1,fx_newfriend2,fx_newfriend3]
    this.doDamageSounds = [fx_newfrienddmg1,fx_newfrienddmg2,fx_newfrienddmg3]
    this.killSounds = [fx_newfriendkill1,fx_newfriendkill2,fx_newfriendkill3]

    this.position = position
    this.mesh.position.x = this.position.x
    this.mesh.position.y = this.position.y
    this.mesh.position.z = this.position.z

    this.targetLock = null

    this.intention = WANDER
    this.intentionTimer = new Timer()
    this.intentionTimer.start()

    // how often should I waste away
    this.starveTimer = new Timer()
    this.starveTimer.start()

    this.doDamageSoundTimer = new Timer()
    this.doDamageSoundTimer.start()

    this.bornSound()
  }

  changePower(pwr){
    this.power = incInRange(this.power, pwr, 0, this.powerMax)
  }

  attack(other_char){
    let health = other_char.health
    
    // damage -> by level 10, MURDER IS INEVITABLE
    let pwr = Math.ceil( health * Math.log( Math.pow( (player.level+2), 2) )/4 )

    // reduce cost to attack with player level
    let cost = Math.ceil( pwr * 2.8 / (player.level + 2.8) )

    if(cost <= this.power){
        // console.log( 'hateful attack', health)
        // console.log( 'hateful level', player.level)
        // console.log( 'hateful cpst', cost )
        // console.log( 'hateful pwr', pwr )

      // console.log( 'he kill for ', pwr )
      // do % damage to other aguy
      if(cost != 0 && pwr > 0){
        other_char.takeDamage(pwr, FRIEND)

        this.doDamageSound()

        // spend some power to kill
        this.changePower(-1 * cost)
        // get some helf back fam
        this.changeHealth(Math.ceil(cost/4))
        
        // give the player a lil power from.. symbiosis
        player.changePower(1)        

        // we got a bite, so don worry
        // this.changeHealth(50)
        this.starveTimer.reset()
      }
    }
  }

  doDamageSound(){
    // pick a random one from this array
    if(this.doDamageSoundTimer.time() > 2000){
      this.doDamageSoundTimer.reset()
      
      let roll = Math.floor( Math.random() * this.doDamageSounds.length )
      this.doDamageSounds[ roll ].play()  
    }
  }

  bornSound(){
    let roll = Math.floor(Math.random() * this.bornSounds.length)
    this.bornSounds[ roll ].play()
  }

  killSound(){
    let roll = Math.floor(Math.random() * this.killSounds.length)
    this.killSounds[ roll ].play()
  }

  changePowerMax(max){
    // min 75, but you probably get friend later anyway
    this.powerMax = max
  }

  customAnimation(){
    if(this.lifecycle == DYING){

      // if a sprite exists, start fading it out
      if(!this.opacityTimer.running){
        this.opacityTimer.start()
      }

      // more or less copied from enemy customanim
      if(this.opacityTimer.time() > 200){
        this.opacityTimer.reset()

        this.spriteOpacity = this.spriteOpacity - 0.1
        this.deadSprite.material.opacity = this.spriteOpacity

        if(this.spriteOpacity <= 0){
          // if we hit 0 opacity, remove sprite from scene
          this.removeSprite()
          console.log( 'YOUR FRIEND IS DEAD' )
          this.lifecycle = DEAD
        }
      }

    }
  }

  wander(accChange){
    if(this.directionTimer.time() > 800){
      this.directionTimer.reset()
      this.chooseDirection()
      // console.log( 'FRIEND I CHOOSE DIREC', this.accx, this.accy )      
    }
    // wander
    let speed =  Math.random()*accChange

    if(this.direction == LEFT){
      this.accx -= speed
    } else if(this.direction == UP){
      this.accy += speed
    } else if(this.direction == RIGHT){
      this.accx += speed
    } else if(this.direction == DOWN) {
      this.accy -= speed
    }
  }

  pursue(enemyId){
    if(game.enemies[enemyId]){
      let x,y
      x = game.enemies[enemyId].mesh.position.x
      y = game.enemies[enemyId].mesh.position.y
      this.moveTowardsPoint(x,y)
    } else {

      // idle for a bit if my enemy disappeared
      this.intention = IDLING
    }
  }

  idle(){
    this.wander(0.01)
  }

  followPlayer(){
    let x,y
    x = player.mesh.position.x
    y = player.mesh.position.y
    this.moveTowardsPoint(x,y)
  }

  customMovement(){

    if(this.starveTimer.time() > 1000){
      this.starveTimer.reset()
      // drop 10% health, or 1, every second
      this.changeHealth( -1 * (1 + Math.floor(this.health * 0.1)) )
    }

    // decide what to do every 1s
    if(this.intentionTimer.time() > 1000){
      this.intentionTimer.reset()
  
      if(this.type == CHASER){

        // mill around...
        if(Math.random() > 0.6){

          this.intention = CHASER
          this.targetLock = game.randomEnemyId()
        } else {

          this.intention = WANDER
        }

        // then ATTACK
      } else if(this.type == WANDER) {
        // nothin to do!
      } else if(this.type == FOLLOWER){
        this.intention = FOLLOWING
      }
    }

    if(this.intention == CHASER){

      this.pursue( this.targetLock )
    } else if(this.intention == WANDER){
      
      this.wander(0.03)
    } else if(this.intention == IDLING){
      this.idle()
    } else if(this.intention == FOLLOWING){
      this.followPlayer()
    }

    // console.log( 'accs are ', this.accx, this.accy )
  }
} 