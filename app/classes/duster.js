class Duster {
  constructor(map, size, particleCount, distance, position=null, opacity=null, badge=false, matColor="#ffffff"){
    // position is a vector3
    this.particleCount = particleCount
    let geometry = new THREE.Geometry()

    this.map = map
    this.size = size
    this.position = position
    this.opacity = opacity || 0.24
    this.badge = badge
    this.distance = distance
    
    let pointMat = new THREE.PointsMaterial({
      color: matColor,
      size: this.size,
      map: map,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: this.opacity
    })

    let p,x,y,z
    // create particles

    if(!badge){
      for(var i=0; i<this.particleCount; i++){
        x = Math.random() * (this.distance*2) - this.distance
        y = Math.random() * (this.distance*2) - this.distance
        z = Math.random() * (this.distance*2) - this.distance

        // assign rando positions to particle
        p = new THREE.Vector3( x,y,z )
        geometry.vertices.push(p)
      }
  
    } else {
      // badge gives you one thing, right on top
      // p = new THREE.Vector3( this.position.x,this.position.y,this.position.z+0.2,)

      // let z = this.position.z * 1.00005
      // p = new THREE.Vector3( this.position.x,this.position.y,z)


      p = new THREE.Vector3( 0,0, this.distance )

      geometry.vertices.push(p)
    }
    
    let pointMatCopy = pointMat.clone()
    this.particleSystem = new THREE.Points(
      geometry,
      pointMatCopy
    )

    // this.particleSystem.material.rotation.y = Math.random() * 2 * Math.PI
    this.particleSystem.sortParticles = true

    if(this.position){
      // console.log( 'tryignt o set position', this.position )
      this.setPosition(this.position)
    }

    this.animTimer = new Timer()

    scene.add( this.particleSystem )
  }

  randomizeRotation(){
    // initialize different rotation
    this.particleSystem.rotation.y = Math.random() * 2*Math.PI
    this.particleSystem.rotation.x = Math.random() * 2*Math.PI
  }

  setPosition(pos){
    this.position = pos
    this.particleSystem.position.set( this.position )
  }

  remove(){
    this.particleSystem.geometry.dispose()
    this.particleSystem.material.dispose()
    scene.remove(this.particleSystem)    
  }

  loadingAnimation(){
    if(duster.animTimer.time() > 20){
      duster.particleSystem.rotation.y += 0.01
    }
  }

  animation(){
    this.particleSystem.rotation.y += 0.00006
    this.particleSystem.rotation.x += 0.0002
  }
}