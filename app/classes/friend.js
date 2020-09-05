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

    if(this.dna <= 0.33){
      this.type = WANDER
    } else if(this.dna > 0.33 && this.dna <= 0.66){
      this.type = CHASER
    } else if(this.dna > 0.66){
      this.type = WANDER
    }
  }

  changePower(pwr){
    this.power = incInRange(this.power, pwr, 0, this.powerMax())
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
      other_char.takeDamage(pwr)
      console.log( 'hateful attack for ', pwr )
      // console.log( 'pwr is ', pwr )
      // spend that much power

      // do this to avoid -0? what a language
      if(cost != 0){
        this.changePower(-1 * cost)
      }
    }
  }

  powerMax(){
    // min 75, but you probably get friend later anyway
    return (player.level + 2) * 25
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

  customMovement(){
    if(this.directionTimer.time() > 800){
      this.directionTimer.reset()
      this.chooseDirection()
      // console.log( 'I CHOOSE DIREC' )      
    }

    // wander
    let speed =  Math.random()*0.03

    // if(game.percentCorrupted == 1){
    //   this.moveTowardsPoint(player.mesh.position.x, player.mesh.position.y)
    // } else {
    if(this.type == CHASER){

      // mill around...
      // then ATTACK
    } else {

      // console.log( 'direc', this.direction )
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

    // console.log( 'accs are ', this.accx, this.accy )
  }
} 