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
    this.hitColor = [255,0,0]

    // so far just for enemy
    this.isHit = false
    this.lastIsHit = false

    this.hitTimer = new Timer()
  }

  die(){
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    scene.remove(this.mesh)
  }
  
  setColor(color){
    this.mesh.material.color.setHex(color)
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

  // placholder
  customMovement(){}

  handleMovement(){
    // decide accelaration
    this.customMovement()

    let posx = this.mesh.position.x + this.calcMovement(0.04, this.accx)
    let posy = this.mesh.position.y + this.calcMovement(0.04, this.accy)
    
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

    // whoa there
    this.accx = this.slowDown(this.accx)
    this.accy = this.slowDown(this.accy)
  }


  // right now this only happens to enemies
  handleHit(other_char){
    // record last hitstate
    this.lastIsHit = this.isHit
    // 
    if(this.bbox.intersectsBox(other_char.bbox)){

      // hittin it
      this.isHit = true
      this.health -= 1
    } else {
      this.isHit = false
    }

    return this.isHit
  }

  colorCycle(){
    // if hit just changed
    if(this.isHit != this.lastIsHit){
      if(this.isHit){
        // console.log('just got hit, set hit color')

        let r = this.hitColor[0]
        let g = this.hitColor[1]
        let b = this.hitColor[2]
        this.mesh.material.color.setRGB(r,g,b)
      } else if(!this.isHit){
        // console.log('start hit timer')
        this.hitTimer.start()
      }
    }

    if(!this.isHit && this.hitTimer.running){
      // console.log( 'timer running' )
      if(this.hitTimer.time() > 5){
        // if we're not currently hit, and timer is up, stop and go back to base color
        this.hitTimer.stop()

        let r = this.baseColor[0]
        let g = this.baseColor[1]
        let b = this.baseColor[2]
        // console.log( 'basecolor is ' )
        // console.log( r,g,b )
        this.mesh.material.color.setRGB(r,g,b)
      } else {
        // otherwise fade towards basecolor

        var steps = 200
        var step_u = 1.0 / steps;

        let base_r = this.baseColor[0]
        let base_g = this.baseColor[1]
        let base_b = this.baseColor[2]


        let hit_r = this.hitColor[0]
        let hit_g = this.hitColor[1]
        let hit_b = this.hitColor[2]

        let r = Math.round(this.lerp(hit_r, base_r, this.u))
        let g = Math.round(this.lerp(hit_g, base_g, this.u))
        let b = Math.round(this.lerp(hit_b, base_b, this.u))

        this.u += step_u
        // console.log("u is " + this.u)
        if(this.u >= 1.0){
          this.hitTimer.stop()
        }

        // console.log('fading')
        // console.log(r,g,b)
        this.mesh.material.color.setRGB(r,g,b)
      }

    }

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
    this.rotation()
    // set bounding box from mesh baby
    this.bbox.setFromObject(this.mesh)

    this.colorCycle()
  }
}