class Duster {
  constructor(map, size, particleCount, distance, position=null, opacity=null){
    // position is a vector3
    this.particleCount = particleCount
    let geometry = new THREE.Geometry()

    this.map = map
    this.size = size
    this.position = position
    this.opacity = opacity || 0.24

    this.distance = distance
    
    let pointMat = new THREE.PointsMaterial({color: 0xffffff,
      size: this.size,
      map: map,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: this.opacity
    })
      

    let p,x,y,z
    // create particles
    for(var i=0; i<this.particleCount; i++){
      x = Math.random() * (this.distance*2) - this.distance
      y = Math.random() * (this.distance*2) - this.distance
      z = Math.random() * (this.distance*2) - this.distance

      // assign rando positions to particle
      p = new THREE.Vector3( x,y,z )
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
      this.particleSystem.position.set( this.position )
    }

    scene.add( this.particleSystem )
  }

  remove(){
    this.particleSystem.geometry.dispose()
    this.particleSystem.material.dispose()
    scene.remove(this.particleSystem)    
  }

  animation(){

    this.particleSystem.rotation.y += 0.000
    this.particleSystem.rotation.x += 0.0002
  }
}