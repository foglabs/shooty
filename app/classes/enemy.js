LEFT = 0
UP = 1
RIGHT = 2
DOWN = 3

class Enemy extends Character {
  constructor(base_color){
    // de mesh
    let mesh
    let dna = Math.random()
    if(dna > 0.5){
      mesh = new THREE.BoxGeometry(0.02,0.02,0.6)
    } else {
      mesh = new THREE.CircleGeometry( 5, 32 )
    }
    
    super(

      new THREE.Mesh(

        mesh,
        new THREE.MeshBasicMaterial( { color: 0x228849 })
      ),

      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.dna = dna

    if(Math.random() > 0.8){
      // sometimes, make one with a weird scale

      // if we're in here, were doing somethin right
      this.scaleFactor = Math.random() * 5
      this.mesh.scale.x = Math.random() * this.scaleFactor
      this.mesh.scale.y = Math.random() * this.scaleFactor
      this.mesh.scale.z = Math.random() * this.scaleFactor
    }

    this.health = 10
    this.direction = 0
  }

  rotation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.28 * fac
    fac = Math.random() * 0.010
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.18 * fac
  }

  takeDamage(dmg){
    this.health -= dmg
  }

  chooseDirection(){
    this.direction = Math.round(Math.random() * 4)
  }

  customMovement(){
    let speed =  Math.random()*0.1

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