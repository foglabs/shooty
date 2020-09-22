class SmokeBubble extends Character {
  constructor(x, y, radius){
    let geometry = new THREE.SphereGeometry( radius, 32, 32 )
    let bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
    // it gray
    let color = [150,150,150]
    super(geometry, bbox, color)

    this.x = x
    this.y = y
    this.radius = radius

    this.mesh.position.set(x, y, player.mesh.position.z)

    this.animTimer = new Timer()
    this.animTimer.start()

    this.damage = 1
  }

  attack(enemy){
    enemy.takeDamage( this.damage )
  }

  randomPosition(){
    // generate random point inside ME
    let r = Math.sqrt( Math.random() )
    let theta = 2*Math.PI*Math.random()
    let rx = this.x + r*this.radius*Math.cos(theta)
    let ry = this.y + r*this.radius*Math.sin(theta)
    return [rx,ry]
  }

  customAnimation(){
    // grow
    if(this.animTimer.time() > 60){
      this.animTimer.reset()

      if(this.lifecycle == ALIVE){

        // growing
        this.scaleFactor += 0.1
        let x,y,z
        x = this.mesh.scale.x
        y = this.mesh.scale.y
        z = this.mesh.scale.z
        this.mesh.scale.set( x,y,z )

        if(this.mesh.scale.x > 0.4){
          // console.log( 'bublb die' )
          this.lifecycle = DYING
        }
      } else if(this.lifecycle == DYING){
        // start fading out
        this.mesh.material.opacity -= 0.04

        if(this.mesh.material.opacity <= 0){
          // console.log( 'bubble dead' )
          this.lifecycle = DEAD
        }
      }
    }
  }
}