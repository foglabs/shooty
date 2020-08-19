class Enemy extends Character {
  constructor(base_color){
    let health

    // de mesh
    let geometry
    let dna = Math.random()
    if(dna <= 0.2){
      // cube
      geometry = new THREE.BoxGeometry(0.02,0.02,0.02)
      health = 30
      base_color = [34,100,100]
    } else if(dna > 0.2 && dna <= 0.4){
      // stick
      geometry = new THREE.BoxGeometry(0.02,0.02,0.6)
      health = 10
      base_color = [0,200,120]
    } else if(dna > 0.4 && dna <= 0.6) {
      // circle
      health = 20
      geometry = new THREE.CircleGeometry( 0.315, 32 )
      base_color = [78,78,100]
    } else if(dna > 0.6 && dna <= 0.8) {
      // octa
      health = 10
      geometry = new THREE.OctahedronGeometry( 0.08 )
      base_color = [120,78,200]
    } else {
      // 
      health = 10
      geometry = new THREE.SphereGeometry( 0.09, 32, 32 )
      base_color = [20,78,20]
    }
    
    super(

      new THREE.Mesh(

        geometry,
        new THREE.MeshBasicMaterial( { color: 0x228849 })
      ),

      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.dna = dna
    if(Math.random() > 0.6){
      // sometimes, make one with a weird scale

      // if we're in here, were doing somethin right
      this.scaleFactor = Math.random() * 2
      this.mesh.scale.x = Math.random() * this.scaleFactor
      this.mesh.scale.y = Math.random() * this.scaleFactor
      this.mesh.scale.z = Math.random() * this.scaleFactor
    }

    // base enemy health
    this.health = health

    this.direction = 0
    this.corrupted = false

    this.hitColor = [this.baseColor[0] * 1.3,this.baseColor[1] * 1.3,this.baseColor[2] * 1.3]

    this.directionTimer = new Timer()
    // start this up because were going to add to scene right now anyway
    this.directionTimer.start()
  }

  rotation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.28 * fac
    fac = Math.random() * 0.010
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.18 * fac
  }

  chooseDirection(){
    
    let width = window.innerWidth
    let height = window.innerHeight

    // if we're in teh final 20% closest to edge
    let x = this.mesh.position.x
    let y = this.mesh.position.y

    let edge = 0.8
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
  }

  customMovement(){
    let speed =  Math.random()*0.05

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