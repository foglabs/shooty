class Sword {
  constructor(){
    this.length = 0.5
    this.active = false

    this.rotation = 0
    this.rotateTimer = new Timer()
    this.rotateTimer.start()
    this.powerTimer = new Timer()
    this.powerTimer.start()
    this.damageTimer = new Timer()
    this.damageTimer.start()

    let geo = new THREE.ConeGeometry( 0.01, this.length, 32 )
    let bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
    this.bbox = bbox
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial( { color: "#ffffff", transparent: true, blending: THREE.AdditiveBlending }))

    this.mesh.rotation.z = 0
  }

  rotate(){
    this.rotation += 0.01
    if(this.rotation > 360){
      this.rotation = 0
    }

    this.rotateTo(this.rotation)
  }

  rotateTo(deg){
    let radius = 0.3
    let x = radius * Math.sin( this.rotation ) + player.mesh.position.x
    let y = radius * Math.cos( this.rotation ) + player.mesh.position.y

    this.mesh.rotation.z = -1 * this.rotation
    this.mesh.position.set( x, y, 0 )
  }


}