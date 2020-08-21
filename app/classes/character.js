class Character {
  constructor(mesh, bbox, base_color){
    
    this.maxX = 3
    this.maxY = 3

    this.accx = 0
    this.accy = 0

    this.mesh = mesh
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

    this.colorTimer = new Timer()
    this.healthTimer = new Timer()

    this.lifecycle = ALIVE

    this.spriteOpacity = 1
    this.opacityTimer = new Timer()

    this.duster = null
    this.dusterTimer = new Timer()
  }

  remove(){
    // add sprite, then start fading it out - has to come before removing mesh to get position!
    if(this.lifecycle == DYING){
      this.addSprite()
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
    this.deadSprite.material.dispose()
    scene.remove(this.deadSprite)
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
    this.mesh.material.color.setRGB(r,g,b)
  }

  calcMovement(speed, acc) {
    return speed * acc;
  }

  slowDown(acc){
    if(acc > 0){
      // whichever way we're currently moving, accellerate towards the opposite direction
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

      if(!this.corrupted){
        this.health -= 1
      }

    } else {

      this.isHit = false
    }

    return this.isHit
  }

  addParticles(){
    // little blod splats
    this.duster = new Duster(bloodspriteMap, 0.0422, 28, 0.32, this.mesh.position, 1)
  }

  takeDamage(dmg){
    // console.log( 'take damage ', dmg )
    this.health -= dmg

    if(!this.duster){
      this.addParticles()
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

    if(this.lifecycle == ALIVE && this.isHit || this.color != this.baseColor){

      if(!this.colorTimer.running){
        this.colorTimer.start()
      }

      let tocolor
      let fromcolor
      if(this.isHit){
        tocolor = this.hitColor
        fromcolor = this.baseColor
      } else {
        tocolor = this.baseColor
        fromcolor = this.hitColor
      }

      if(this.colorTimer.time() > 200){
        this.colorTimer.reset()

        var steps = 200
        var step_u = 1.0 / steps;

        let to_r = tocolor[0]
        let to_g = tocolor[1]
        let to_b = tocolor[2]


        let from_r = fromcolor[0]
        let from_g = fromcolor[1]
        let from_b = fromcolor[2]

        let r = Math.round(this.lerp(from_r, to_r, this.u))
        let g = Math.round(this.lerp(from_g, to_g, this.u))
        let b = Math.round(this.lerp(from_b, to_b, this.u))

        this.u += step_u
        // console.log("u is " + this.u)


        // console.log('fading')
        // console.log(r,g,b)

        // record this so we can compare above
        this.color = [r,g,b]
        this.mesh.material.color.setRGB(r,g,b)

        // console.log( 'red is '+r )
        // console.log( 'green is '+g )
        // console.log( 'blue is '+b )

      }
    }





    // // if hit just changed
    // if(this.isHit != this.lastIsHit){
    //   if(this.isHit){
    //     // console.log('just got hit, set hit color')

    //     let r = this.hitColor[0]
    //     let g = this.hitColor[1]
    //     let b = this.hitColor[2]
    //     this.mesh.material.color.setRGB(r,g,b)
    //   } else if(!this.isHit){
    //     // console.log('start hit timer')
    //     this.colorTimer.start()
    //   }
    // }

    // if(!this.isHit && this.colorTimer.running){
    //   // console.log( 'timer running' )
    //   if(this.colorTimer.time() > 5){
    //     // if we're not currently hit, and timer is up, stop and go back to base color
    //     this.colorTimer.stop()

    //     let r = this.baseColor[0]
    //     let g = this.baseColor[1]
    //     let b = this.baseColor[2]
    //     // console.log( 'basecolor is ' )
    //     // console.log( r,g,b )
    //     this.mesh.material.color.setRGB(r,g,b)
    //   } else {
    //     // otherwise fade towards basecolor

    //     var steps = 200
    //     var step_u = 1.0 / steps;

    //     let base_r = this.baseColor[0]
    //     let base_g = this.baseColor[1]
    //     let base_b = this.baseColor[2]


    //     let hit_r = this.hitColor[0]
    //     let hit_g = this.hitColor[1]
    //     let hit_b = this.hitColor[2]

    //     let r = Math.round(this.lerp(hit_r, base_r, this.u))
    //     let g = Math.round(this.lerp(hit_g, base_g, this.u))
    //     let b = Math.round(this.lerp(hit_b, base_b, this.u))

    //     this.u += step_u
    //     // console.log("u is " + this.u)
    //     if(this.u >= 1.0){
    //       this.colorTimer.stop()
    //     }

    //     // console.log('fading')
    //     // console.log(r,g,b)
    //     this.mesh.material.color.setRGB(r,g,b)
    //   }

    // }

  }
  
  lerp(a, b, u) {
    // start val, dest val, interval
    return (1 - u) * a + u * b;
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
