class Bomb extends Character {
  constructor(base_color, strength){
    let geometry = new THREE.SphereGeometry( 0.06, 32, 32 )
    super(
      // de geo
      geometry,
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.strength = strength

    this.explodeTimer = new Timer()
    this.explodeTimer.start()

    this.explodeTime = 1000
    this.disappearTime = 3000

    this.boomColor = [255,191,103]
    this.timeToBoomColor = 1000
    this.u = 0

    this.animTimer = new Timer()
  }

  handleExplode(){
    if(this.explodeTimer.time() > this.explodeTime){
      this.explode()
    }
  }

  explode(){
    console.log( 'you as plode' )
    if(!this.animTimer.running){
      this.animTimer.start()
    }

    if(this.animTimer.time() > 5){
      this.animTimer.reset()

      if(this.color != this.boomColor){
        this.fadeColor()
      }
      
      if(this.mesh.scale.x < 5){
        this.mesh.scale.x += 0.04 * this.strength 
      }
      if(this.mesh.scale.y < 5){
        this.mesh.scale.y += 0.04 * this.strength
      }
      if(this.mesh.scale.y < 5){
        this.mesh.scale.z += 0.04 * this.strength 
      }  
    }
  }

  fadeOut(){

    if(this.animTimer.time() > 5){
      this.animTimer.reset()
      this.mesh.material.opacity -= 0.04
    }
  }

  fadeColor(){
    // one step for each animinterval
    let animinterval = 5
    let numSteps = this.timeToBoomColor / animinterval

    // every 5 ms 

    let r,g,b
    r = Math.floor( lerp( this.baseColor[0], this.boomColor[0], this.u ) )
    g = Math.floor( lerp( this.baseColor[1], this.boomColor[1], this.u ) )
    b = Math.floor( lerp( this.baseColor[2], this.boomColor[2], this.u ) )

    this.color = [r,g,b]
    this.setColor(r,g,b)

    let step = 1.0/numSteps
    this.u += step

    // done
    if(this.u >= 1.0){
      this.color = this.boomColor
      this.u = 0
    }
  }

}