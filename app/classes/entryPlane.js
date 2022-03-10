class EntryPlane {
  constructor(zPos, scale, startRotation){

    // haha!
    const geometry = new THREE.PlaneGeometry( 1, 1 )
    const material = new THREE.MeshStandardMaterial( {transparent: true, color: "#000000", side: THREE.DoubleSide, opacity: 0.9, needsUpdate: true} )
    this.mesh = new THREE.Mesh( geometry, material )
    this.mesh.position.z = zPos
    this.mesh.scale.x = scale
    this.mesh.scale.y = scale
    this.mesh.rotation.z = startRotation
    scene.add( this.mesh )
    // this.entryPlane.visible = false
    this.entryPlaneTimer = new Timer()
    this.entryPlaneTimer.start()
    this.goingUp = true
    
    this.roundAnim = DONE
  }




  randomColor(){
    let r,g,b
    r = Math.round( randomInRange(150*(game.roundCount/150), 150) )
    g = Math.round( randomInRange(150*(game.roundCount/150), 150) )
    b = Math.round( randomInRange(150*(game.roundCount/150), 255) )
    this.setColor( rgbToHex( r,g,b ) )
  }

  setColor(newColor){
    this.mesh.material.color.set( newColor )
  }

  flip(){
    this.roundAnim = 0
  }

  opacityByRound(){
    return 0.9 - (game.roundCount - 30 / 5)
  }

  animation(){

    if(this.entryPlaneTimer.time() > 30){
      this.entryPlaneTimer.reset()
      this.mesh.rotation.z += 0.001

      if(this.roundAnim == 0){
        if(this.mesh.position.z > -0.4 ){
          this.mesh.position.z -= 0.01 * game.roundCount/5
        } else {
          // 
          this.roundAnim = 1
        }
      } else if(this.roundAnim == 1){
        if(this.mesh.position.z < 0 ){
          this.mesh.position.z += 0.01 * game.roundCount/5
        } else {
          this.mesh.position.z = 0
          this.roundAnim = 2
        }
      }

      if( game.roundCount >= 30 && this.mesh.material.opacity > this.opacityByRound() ){
        // fade down backplane after 30
        this.mesh.material.opacity -= 0.001
        if(this.mesh.material.opacity < 0.1){
          this.mesh.visible = false
        }
      }
     
      if(game.roundCount >= 10){
        let amount = game.roundCount / 6000.0
        let limit = game.roundCount / -48
        let vertIndex = Math.floor( Math.random() * this.mesh.geometry.vertices.length )
        if(this.goingUp){
          this.mesh.geometry.vertices[vertIndex].z += (amount)
        } else {
          this.mesh.geometry.vertices[vertIndex].z -= (amount)
        }
        if(this.mesh.geometry.vertices[vertIndex].z < limit){
          this.mesh.geometry.vertices[vertIndex].z = limit
          this.goingUp = true
        }
        if(this.mesh.geometry.vertices[vertIndex].z > 0){
          this.mesh.geometry.vertices[vertIndex].z = 0
          this.goingUp = false
        }
        this.mesh.geometry.verticesNeedUpdate = true
      } 
        



      // let xChange, yChange, zChange
      // // xChange = Math.random() * 0.04 - 0.02
      // // yChange = Math.random() * 0.04 - 0.02
      // zChange = Math.random() * 0.004 - 0.002
      // // this.mesh.geometry.vertices[vertIndex].x = this.mesh.geometry.vertices[vertIndex].x + xChange
      // // this.mesh.geometry.vertices[vertIndex].y = this.mesh.geometry.vertices[vertIndex].y + yChange
      // if(this.mesh.material.opacity > 1){
      //   this.epoGoingUp = false
      // } else if(this.mesh.material.opacity <= 0) {
      //   this.epoGoingUp = true
      // }
      // if(this.epoGoingUp){
      //   this.mesh.material.opacity += 0.03
      // } else {
      //   this.mesh.material.opacity -= 0.03
      // }

      // this.backPlanes.forEach((bp,i) => {
      //   bp.rotation.z += 0.001*(i+1)
      // })
    }
  }
}