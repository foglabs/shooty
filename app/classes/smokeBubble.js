class SmokeBubble extends Character {
  constructor(x, y, radius){
    let geometry = new THREE.SphereGeometry( radius, 32, 32 )
    let bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
    // it gray
    let color = [90,90,90]
    let basestr = rgbToHex(color[0], color[1], color[2])
    let mat = new THREE.MeshToonMaterial( { color: basestr, transparent: true })
    super(geometry, bbox, color, mat)

    this.x = x
    this.y = y
    this.radius = radius


    this.hitColor = [200,200,200]

    this.scaleFactor = 1

    this.mesh.position.set(x, y, player.mesh.position.z)
    this.mesh.material.opacity = 0.5

    this.animTimer = new Timer()
    this.animTimer.start()

    this.growSpeed = 0.003 * Math.max(0.5, Math.random())

    this.damage = 5
  }

  attack(enemy){
    enemy.takeDamage( this.damage, SMOKE )
  }

  randomPosition(){
    // generate random point inside ME
    let r = Math.sqrt( Math.random() )
    let theta = 2*Math.PI*Math.random()

    // actually use a slightly bigger circle so we probably spread smoke further
    let rad = this.radius*1.6
    let rx = this.x + r*rad*Math.cos(theta)
    let ry = this.y + r*rad*Math.sin(theta)
    return [rx,ry]
  }

  customAnimation(){
    // grow
    if(this.animTimer.time() > 30){
      this.animTimer.reset()

      if(this.lifecycle == ALIVE){

        // growing
        this.scaleFactor += this.growSpeed
        let x,y,z
        x = this.mesh.scale.x * this.scaleFactor
        y = this.mesh.scale.y * this.scaleFactor
        z = this.mesh.scale.z * this.scaleFactor
        this.mesh.scale.set( x,y,z )

        if(this.mesh.scale.x > 1.6){
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