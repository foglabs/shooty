class Bomb extends Character {
  constructor(base_color, playerLevel, hurtsPlayer=false){
    let geometry = new THREE.SphereGeometry( 0.06, 32, 32 )
    let basestr = rgbToHex(base_color[0], base_color[1], base_color[2])
    super(
      // de geo
      geometry,
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color,
      new THREE.MeshToonMaterial( { color: basestr })
    )

    this.strength = playerLevel * 5

    this.exploded = false
    this.explodeTimer = new Timer()
    this.explodeTimer.start()

    // when will it start exploding
    this.explodeTime = 800
    // when will it begin to fade out, lvl 1 is 1800ms
    this.disappearTime = 800 * Math.log( 10 * player.level )

    // this.boomColor = [255,191,103]
    this.boomColor = [153,115,62]
    this.timeToBoomColor = 300
    this.u = 0

    this.hotstepper = 0

    this.animTimer = new Timer()
  }

  handleExplode(){
    if(this.explodeTimer.time() > this.disappearTime){
      // start fadeout
      this.lifecycle = DYING
    } else if(this.explodeTimer.time() > this.explodeTime){
      this.explode()
      this.exploded = true
    }
  }

  maxSize(){
    return 4 * Math.log(this.strength/2)
  }

  explode(){
    if(!this.animTimer.running){
      this.animTimer.start()
    }

    if(this.animTimer.time() > 5){
      this.animTimer.reset()

      if(this.color != this.boomColor){
        this.fadeColor()
      }

      // strength is when to stop growing aka max size
      if(this.mesh.scale.x < this.maxSize()){
        this.mesh.scale.x += 0.18
      }
      if(this.mesh.scale.y < this.maxSize()){
        this.mesh.scale.y += 0.18
      }
      if(this.mesh.scale.z < this.maxSize()){
        this.mesh.scale.z += 0.18
      }  
    }
  }

  fadeOut(){
    if(this.animTimer.time() > 5){
      this.animTimer.reset()
      this.mesh.material.opacity -= 0.04

      if(this.mesh.material.opacity <= 0){
        // mark for DELETION
        this.lifecycle = DEAD
      }
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