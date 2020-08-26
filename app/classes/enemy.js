class Enemy extends Character {
  constructor(base_color){
    let health
    let nutritionalValue

    // de mesh
    let geometry
    let dna = Math.random()
    if(dna <= 0.2){
      // cube
      geometry = new THREE.BoxGeometry(0.2,0.2,0.2)
      health = 30
      nutritionalValue = 40
      base_color = [189,52,147]
    } else if(dna > 0.2 && dna <= 0.4){
      // stick
      geometry = new THREE.BoxGeometry(0.02,0.02,0.6)
      health = 2
      nutritionalValue = 5
      base_color = [72,201,46]
    } else if(dna > 0.4 && dna <= 0.6) {
      // circle
      health = 12
      nutritionalValue = 10
      geometry = new THREE.CircleGeometry( 0.240, 32 )
      base_color = [214,189,58]
    } else if(dna > 0.6 && dna <= 0.8) {
      // octa
      health = 12
      nutritionalValue = 18
      geometry = new THREE.OctahedronGeometry( 0.08 )
      base_color = [120,78,200]
    } else {
      // 
      health = 10
      nutritionalValue = 18
      geometry = new THREE.SphereGeometry( 0.09, 32, 32 )
      base_color = [114,194,189]
    }

    
    super(
      // de ge
      geometry,
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.dna = dna

    // cube
    if(this.dna <= 0.2){
      this.addParticles(healthenemyMap)
    }

    if(Math.random() > 0.6){
      // sometimes, make one with a weird scale

      // if we're in here, were doing somethin right

      if(this.dna > 0.4 && this.dna <= 0.6){
        // circle
        this.scaleFactor = 1 + Math.random() * 0.4
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

    this.killSounds = [fx_ekill1, fx_ekill2, fx_ekill3, fx_ekill4, fx_ekill5, fx_ekill6]

    this.direction = 0
    this.corrupted = false

    let hitr = this.calcHitColor(this.baseColor[0])
    let hitg = this.calcHitColor(this.baseColor[1])
    let hitb = this.calcHitColor(this.baseColor[2])
    this.hitColor = [hitr, hitg, hitb]

    console.log( 'hitcolor is ', this.hitColor )

    this.directionTimer = new Timer()
    // start this up because were going to add to scene right now anyway
    this.directionTimer.start()

    this.color = this.baseColor
    this.nutritionalValue = nutritionalValue
  }

  calcHitColor(val){
    // the higher val is, the smaller the increase
    // subtract 8 to push line down to keep unde 255
    return val + Math.floor(val * 2000/ ( Math.pow(val, 2) ) - 8)
  }

  rotation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.28 * fac
    fac = Math.random() * 0.010
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.18 * fac
  }

  takeDamageSound(){
    // pick a random one from this array
    if(this.damageSoundTimer.time() > 30){
      this.damageSoundTimer.reset()
      
      let roll = Math.floor( Math.random() * this.damageSounds.length )
      this.damageSounds[ roll ].play()  
    }
    
  }

  chooseDirection(){
    
    let width = window.innerWidth
    let height = window.innerHeight

    // if we're in teh final 20% closest to edge
    let x = this.mesh.position.x
    let y = this.mesh.position.y

    let edge = 0.6
    let awidth = Math.abs(width)
    let aheight = Math.abs(height)

    let locked

    // do a coin flip to decide which direction to check
    if( Math.random() > 0.5 ){
      if( Math.abs(x) > awidth*edge ){
        
        // if we're within 20% of edge, just start going the other way
        this.direction = Math.sign(x) == 1 ? LEFT : RIGHT
        locked = true
      }
    } else {
      if( Math.abs(y) > aheight*edge ){
        // yes, lock in direction
        this.direction = Math.sign(x) == 1 ? DOWN : UP
        locked = true
      }
    }

    if(!locked){
      // if not altered above, just prandom
      this.direction = Math.round(Math.random() * 4)  
    }
  }

  corrupt(){
    this.health = 24
    this.corrupted = true
    // this.baseColor = 0xff0000
    this.mesh.material.color.setRGB(0xff0000)

    // remove health guy glows if necessary
    if(this.duster){
      this.duster.remove()
    }

    // same proportions as a before, diff sounds
    this.killSounds = [fx_ckill1, fx_ckill2, fx_ckill3]
  }

  killSound(){
    let roll = Math.floor(Math.random() * this.killSounds.length)
    this.killSounds[ roll ].play()
  }

  customAnimation(){

    // dont do it, if yA DEAD
    if(this.lifecycle == ALIVE){
      this.rotation()

      if(this.dna <= 0.2){
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

      if(this.opacityTimer.time() > 200){
        this.opacityTimer.reset()

        let sx, sy, sz
        sx = this.mesh.scale.x + 0.4
        sy = this.mesh.scale.y + 0.4
        sz = this.mesh.scale.z + 0.4

        this.mesh.scale.set(sx,sy,sz)

        this.spriteOpacity = this.spriteOpacity - 0.1
        // console.log( 'reduced spriteopac '+ this.spriteOpacity )
        this.deadSprite.material.opacity = this.spriteOpacity

        if(this.spriteOpacity <= 0){
          // if we hit 0 opacity, remove sprite from scene
          this.removeSprite()

          // this will allow the enemy maintenance loop in game to actually dispose of the CORPSE
          this.lifecycle = DEAD
        }

      }

    }
  }

  customMovement(){
    let speed =  Math.random()*0.03

    if(game.percentCorrupted == 1){
      this.moveTowardsPoint(player.mesh.position.x, player.mesh.position.y)
    } else {

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

  }
}