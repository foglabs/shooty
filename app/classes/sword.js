class Sword {
  constructor(length, rotation, wielder=player){
    this.length = length
    this.active = false

    this.rotation = 0
    this.rotateTimer = new Timer()
    this.rotateTimer.start()
    this.powerTimer = new Timer()
    this.powerTimer.start()

    // deafult player
    this.wielder = wielder

    let geo = new THREE.ConeGeometry( 0.01, this.length, 32 )
    let bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
    this.bbox = bbox
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial( { color: "#ffffff", transparent: true, blending: THREE.AdditiveBlending }))

    this.mesh.rotation.z = 0
  }

  remove(){
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    scene.remove(this.mesh)
  }

  // just revolve like a dummy
  rotate(){
    // this.rotation += 0.01
    // if(this.rotation > DEG360){
    //   this.rotation = 0
    // }

    this.rotateTo(this.rotation + 0.01)
  }

  rotateTowardsMovement(accx, accy){
    let signx = Math.sign(accx)
    let signy = Math.sign(accy)

    let rad = this.rotation
    // figure out where on circle we WANT to go, then figure out shortest path, then get resulting rad based on increment
    if(signx == 0 && signy == 1 && !isWithin(rad, 0, 1) ){
      // 0
      rad = rotateToward(this.rotation, 0, this.wielder.swordSpeed)
    } else if(signx == 1 && signy == 1 ){
      // 45
      rad = rotateToward(this.rotation, DEG45, this.wielder.swordSpeed)
    } else if(signx == 1 && signy == 0 ){
      // 90
      rad = rotateToward(this.rotation, DEG90, this.wielder.swordSpeed) 
    } else if(signx == 1 && signy == -1 ){
      // 135
      rad = rotateToward(this.rotation, DEG135, this.wielder.swordSpeed) 
    } else if(signx == 0 && signy == -1 ){
      // 180
      rad = rotateToward(this.rotation, DEG180, this.wielder.swordSpeed) 
    } else if(signx == -1 && signy == -1 ){
      // 225
      rad = rotateToward(this.rotation, DEG225, this.wielder.swordSpeed) 
    } else if(signx == -1 && signy == 0 ){
      // 270
      rad = rotateToward(this.rotation, DEG270, this.wielder.swordSpeed) 
    } else if(signx == -1 && signy == 1 ){
      // 315
      rad = rotateToward(this.rotation, DEG315, this.wielder.swordSpeed) 
    }

    if( !isWithin(rad, this.rotation, DEG1) ){
      // chill if we're close enough to destination alraedy 
      this.rotateTo(rad)
    }

    let radius = 0.3
    // position on sword circle lol
    let x = radius * Math.sin( this.rotation ) + this.wielder.mesh.position.x
    let y = radius * Math.cos( this.rotation ) + this.wielder.mesh.position.y
    this.mesh.position.set( x, y, 0 )
  }

  rotateTo(rad){
    this.rotation = rad

    // this.mesh.rotation.z = -1 * this.rotation
    this.mesh.rotation.z = -1 * rad
  }





}