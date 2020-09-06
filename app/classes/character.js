class Character {
  constructor(geo, bbox, base_color){
    
    this.maxX = 3
    this.maxY = 3

    this.accx = 0
    this.accy = 0

    let basestr = rgbToHex(base_color[0], base_color[1], base_color[2])
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial( { color: basestr, transparent: true }))

    this.bbox = bbox

    // this.colorfadetime = 10
    this.u = 0.0
    this.baseColor = base_color
    this.hitColor = this.hitColor || [255,0,0]
    this.color = base_color
    this.scaleFactor = 1.0

    this.dna = Math.random()

    // so far just for enemy
    this.isHit = false
    this.lastIsHit = false

    this.fading = false
    this.colorTimer = new Timer()
    this.healthTimer = new Timer()
    this.healthTimer.start()

    this.damageSounds = null
    this.damageSoundTimer = new Timer()
    // get this running because ima about to do some dmg
    this.damageSoundTimer.start()

    this.damageTimer = new Timer()
    this.damageTimer.start()

    this.lifecycle = ALIVE

    this.spriteOpacity = 1
    this.opacityTimer = new Timer()

    this.duster = null
    this.dusterTimer = new Timer()
  }

  moveTowardsPoint(destx, desty){
    let startx = this.mesh.position.x
    let starty = this.mesh.position.y


    let xdiff = Math.abs(startx - destx)
    let ydiff = Math.abs(starty - desty)
    // shoutout to pythagoras
    // let dist = Math.sqrt(ydiff * ydiff + xdiff * xdiff)

    if(startx < destx){
      this.accx += 0.04
    } else {
      this.accx -= 0.04
    }

    if(starty < desty){
      this.accy += 0.04
    } else {
      this.accy -= 0.04
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

  remove(){
    // add sprite, then start fading it out - has to come before removing mesh to get position!
    if(this.lifecycle == DYING){
      this.addSprite()

      // clean up on aisle akuma
      if(this.banners){
        this.banners.remove()
      }
    }

    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    scene.remove(this.mesh)
  }

  addSprite(){
    let mat
    let scale
    // if yous a enemy
    if(this.corrupted){
      mat = corruptorMaterial.clone()
      scale = 0.688
    } else if(this.isPlayer){
      mat = pbloodspriteMaterial.clone()
      scale = 0.388
    } else {
      mat = bloodspriteMaterial.clone()
      scale = 0.388
    }
    this.deadSprite = new THREE.Sprite( mat )

    // center rotation anchor
    this.deadSprite.center.set( 0.5, 0.5 )
    this.deadSprite.scale.set( scale, scale, scale )
    // random radian baby
    this.deadSprite.material.rotation = Math.random() * 2 * Math.PI
    this.deadSprite.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    scene.add(this.deadSprite)
  }

  removeSprite(){
    if(this.deadSprite){
      this.deadSprite.material.dispose()
      scene.remove(this.deadSprite)
    }
  }

  red(){
    this.color[0]
  }
  
  green(){
    this.color[1]
  }

  blue(){
    this.color[2]
  }
  
  setColor(r,g,b){
    // this.mesh.material.color.setRGB(r,g,b)
    let hex = rgbToHex(r,g,b)
    this.mesh.material.color.set( hex )
  }

  calcMovement(speed, acc) {
    return speed * acc;
  }

  // use this instead of inc in range, because we dont actually want to constrain between range of values, we jus twant to move towards 0
  slowDown(acc){
    if(acc > 0){
      // whichever way we're currently moving, accelerate towards the opposite direction
      acc -= 0.009;
      if(acc < 0) {acc = 0};
    } else if(acc < 0){
      acc += 0.009;
      if(acc > 0) {acc = 0};
    }

    return acc;
  }

  // this gets redefined in subclasses to contain other every-loop movement logic specific to the class
  customMovement(){}
  customAnimation(){}

  // this is momentum for anything that moves
  handleMovement(){
    // decide accelaration
    this.customMovement()

    let posx = this.mesh.position.x + this.calcMovement(0.08, this.accx)
    let posy = this.mesh.position.y + this.calcMovement(0.08, this.accy)
    
    if(Math.abs(posx) >= this.maxX){
      // stop it if it hits the edge
      this.accx = 0
      posx = Math.sign(posx) * this.maxX
    }

    if(Math.abs(posy) >= this.maxY){
      // stop it if it hits the edge
      this.accy = 0
      posy = Math.sign(posy) * this.maxY
    }

    this.mesh.position.x = posx
    this.mesh.position.y = posy

    // stop moving duster once were dying
    if(this.lifecycle == ALIVE && this.duster){
      // console.log( 'move my particles baby' )
      this.duster.particleSystem.position.set( this.mesh.position.x, this.mesh.position.y, this.mesh.position.z )
    }

    if(this.lifecycle == ALIVE && this.banners){
      // console.log( 'move my particles baby' )
      this.banners.particleSystem.position.set( this.mesh.position.x, this.mesh.position.y, this.mesh.position.z )
    }

    // this will be for sprites attached to living moving things
    // this.sprite.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)

    // whoa there
    this.accx = this.slowDown(this.accx)
    this.accy = this.slowDown(this.accy)
  }

  // right now this only happens to enemies
  handleHit(other_char){
    // record last hitstate
    this.lastIsHit = this.isHit

    // make sure there is something to intersect right now
    if(other_char.bbox && this.bbox.intersectsBox(other_char.bbox)){

      // hittin it
      this.isHit = true

      // if(!this.corrupted){
      //   this.health -= 1
      // }

    } else {

      this.isHit = false
    }

    return this.isHit
  }

  dmgSpriteMap(){
    return this.isPlayer ? pbloodspriteMap : bloodspriteMap
  }

  addParticles(map){
    // little blod splats
    this.duster = new Duster(map, 0.0422, 28, 0.32, this.mesh.position, 1)
  }

  addBanners(map){
    // little blod splats
    console.log( 'I love banners!' )
    this.banners = new Duster(map, 0.18, 16, 0.18, this.mesh.position, 1)
  }

  killSound(){}

  // you already know
  takeDamageSound(){}

  takeDamage(dmg){
    this.takeDamageSound()

    // console.log( 'take damage ', dmg )
    // this.health -= dmg
    this.health = incInRange( this.health, -1*dmg, 0, 1000 ) 

    if(!this.duster){
      this.addParticles( this.dmgSpriteMap() )
      this.dusterTimer.start()
    }
  }

  // lineToTarget(target){
  //   var targetPosition = new THREE.Vector3(x,y,z);
  //   var objectToMove;
  //   var group = new THREE.Group();
  //   group.add(objectToMove);
  //   var targetNormalizedVector = new THREE.Vector3(0,0,0);
  //   targetNormalizedVector.x = targetPosition.x - group.position.x;
  //   targetNormalizedVector.y = targetPosition.y - group.position.y;
  //   targetNormalizedVector.z = targetPosition.z - group.position.z;
  //   targetNormalizedVector.normalize()
  // }

  colorCycle(){

    if(this.isHit){
      this.fading = true
    }

    if(this.fading){

      if(!this.colorTimer.running){
        // console.log( 'start ctimer' )
        this.colorTimer.start()
      }

      let tocolor
      let fromcolor
      if(this.isHit){
        // console.log( 'to hit c, from base c' )
        tocolor = this.hitColor
        fromcolor = this.baseColor
      } else {
        // console.log( 'to base c, from hit c' )
        tocolor = this.baseColor
        fromcolor = this.hitColor
      }

      if(this.colorTimer.time() > 2){
        this.colorTimer.reset()

        var steps = 50
        var step_u = 1.0 / steps

        let to_r = tocolor[0]
        let to_g = tocolor[1]
        let to_b = tocolor[2]

        let from_r = fromcolor[0]
        let from_g = fromcolor[1]
        let from_b = fromcolor[2]

        let r = Math.round(lerp(from_r, to_r, this.u))
        let g = Math.round(lerp(from_g, to_g, this.u))
        let b = Math.round(lerp(from_b, to_b, this.u))

        this.u += step_u
        if(this.u >= 1.0){
          // done with this fade
          this.u = 0.0
          this.fading = false
        }
        // console.log("u is " + this.u)
        // console.log('fading')
        // console.log( 'setting thiso ', r,g,b )

        // record this so we can compare above
        this.color = [r,g,b]
        // this.mesh.material.color.setRGB(r,g,b)
        this.setColor(r,g,b)
      }
    }

    if(this.color == this.baseColor || this.color == this.hitColor){
      this.fading = false
    }

  }

  position(){
    this.mesh.rotation.x -= 0.02
    this.mesh.rotation.y -= 0.02 
  }

  animation(){
      // override dis in your subclass to do extra stuff in addition to the reggies here
    this.customAnimation()

    // set bounding box from mesh baby
    this.bbox.setFromObject(this.mesh)

    this.colorCycle()

    if(this.banners){
      console.log( 'bannermate!' )
      this.banners.animation()
    }

    if(this.duster){
      // run dis
      this.duster.animation()
      if(this.dusterTimer.time() > 20){
        this.dusterTimer.reset()

         this.duster.particleSystem.material.opacity -= 0.1
         // console.log( 'reduce', this.duster.particleSystem.material.opacity )
        if(this.duster.particleSystem.material.opacity <= 0){

          // console.log( 'bye!' )
          this.duster.remove()
          this.duster = null
        }
      }
      
    }


  }
}
