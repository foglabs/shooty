class Character {
  constructor(mesh, bbox, base_color){
    this.accx = 0;
    this.accy = 0;

    this.mesh = mesh
    this.bbox = bbox

    // this.colorfadetime = 10
    this.u = 0.0
    this.baseColor = base_color
    this.hitColor = 0xff0000

    // so far just for enemy
    this.isHit = false
    this.lastIsHit = false
    
    this.hitTimer = new Timer()
  }
  
  gotHit(){
    // dont repeat if were already hitting
    this.isHit = true
    console.log("got hit")
    this.hitTimer.start()
  }

  setColor(color){
    this.mesh.material.color.setHex(color)
  }

  calcPos(speed, acc) {
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

  handleMovement(){
    this.mesh.position.x += this.calcPos(0.04, this.accx)
    this.mesh.position.y += this.calcPos(0.04, this.accy)
    this.accx = this.slowDown(this.accx)
    this.accy = this.slowDown(this.accy)
  }

  handleHit(other_char){

    // record last hitstate
    this.lastIsHit = this.isHit

    // 
    if(this.bbox.intersectsBox(other_char.bbox)){
      // save last hit
      this.isHit = true
    } else {
      this.isHit = false
    }
  }

  colorCycle(){
    // if hit changed
    if(this.isHit != this.lastIsHit){
      if(this.isHit){
        console.log('just got hit, set hit color')
        this.mesh.material.color.setHex(this.hitColor)
      } else if(!this.isHit){
        console.log('start hit timer')
        this.hitTimer.start()
      }
    }

    if(!this.isHit && this.hitTimer.running){

      if(this.hitTimer.time() > 5){
        // if we're not currently hit, and timer is up, stop and go back to base color
        this.hitTimer.stop()
        console.log( 'back to base' )
        this.mesh.material.color.setHex(this.baseColor)
      } else {
        // otherwise fade towards basecolor

        var steps = 20
        var step_u = 1.0 / steps;

        let basecol = this.baseColor.toString()
        let base_r = parseInt(basecol.substr(0,2), 16)
        let base_g = parseInt(basecol.substr(2,2), 16)
        let base_b = parseInt(basecol.substr(4,2), 16)

        // console.log(base_r)

        let hitcol = this.hitColor.toString()
        let hit_r = parseInt(hitcol.substr(0,2), 16)
        let hit_g = parseInt(hitcol.substr(2,2), 16)
        let hit_b = parseInt(hitcol.substr(4,2), 16)

        // console.log(hit_b)

        let r = Math.round(this.lerp(hit_r, base_r, this.u)) / 255.0
        let g = Math.round(this.lerp(hit_g, base_g, this.u)) / 255.0
        let b = Math.round(this.lerp(hit_b, base_b, this.u)) / 255.0

        this.u += step_u
        // console.log("u is " + this.u)
        if(this.u >= 1.0){
          this.hitCooldown = false
        }

        console.log('fading')
        console.log(r,g,b)
        this.mesh.material.color.setRGB(r,g,b)
      }

    }

  }
  
  lerp(a, b, u) {
    // start val, dest val, interval
    return (1 - u) * a + u * b;
  }


  animation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.08 * fac
    fac = Math.random() * 0.003
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.08 * fac

    // set bounding box from mesh baby
    this.bbox.setFromObject(this.mesh)

    this.colorCycle()
  }
}