class Friend extends Character {
  constructor(health, power, baseColor){
    let geo = new THREE.TetrahedronGeometry(0.2)
    super(geo, new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()), baseColor)

    this.health = health
    this.power = power

    this.directionTimer = new Timer()
    this.directionTimer.start()  
    
    this.rechargeTimer = new Timer()
    this.rechargeTimer.start()

    this.dna = Math.random()

    this.powerMax = 75

    if(this.dna <= 0.33){
      console.log( 'creating WANDER' )
      this.type = WANDER
    } else if(this.dna > 0.33 && this.dna <= 0.66){
      console.log( 'creating CHASER' )
      this.type = CHASER
    } else if(this.dna > 0.66){
      console.log( 'creating FOLLOWER' )
      this.type = FOLLOWER
    }

    this.targetLock = null

    this.intention = WANDER
    this.intentionTimer = new Timer()
    this.intentionTimer.start()
  }

  changePower(pwr){
    this.power = incInRange(this.power, pwr, 0, this.powerMax)
  }

  attack(other_char){
    let health = other_char.health
    // let pwr = Math.round( health * ( Math.pow(player.level, 2)/300 - 1/20*player.level + 0.1  ) )
    
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
        other_char.takeDamage(pwr)
        this.changePower(-1 * cost)
        this.changeHealth(Math.ceil(cost/4))
      }
      
      // console.log( 'hateful attack for ', pwr )
    }
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