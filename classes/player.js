class Player extends Character {
  constructor(base_color){
    super(
      // de mesh
      new THREE.Mesh(
        new THREE.BoxGeometry(0.2,0.2,0.3),
        new THREE.MeshBasicMaterial( { color: 0xdf8849 } )
      ),
      
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.health = 100
  }
  
  rotation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.08 * fac
    fac = Math.random() * 0.003
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.08 * fac
  }

  takeDamage(dmg){
    this.health -= dmg
  }


}