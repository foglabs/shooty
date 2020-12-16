class Item {
  constructor(color, rotation, type){
    let geometry = new THREE.BoxGeometry(0.1,0.1,0.1)
    let material = new THREE.MeshBasicMaterial( {color: color} )
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.z = radian(rotation)
    scene.add(this.mesh)

    this.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())

    this.type = type
    this.available = true
    this.cost = 100
    this.amount = 100
  }

  buy(){
    if(player.money >= this.cost){
      console.log( 'hey there' )
      player.changeMoney(this.cost)
      if(this.type == ITEMKNOW){
        player.changeKnowledge( this.amount )
      } else if(this.type == ITEMHEAL){
        player.changeHealth( this.amount )
      } else {
        for(var i=0; i<game.enemies.length;i++){
          game.enemies[i].changeHealth(-1000)
        }
      }
    }
    
  }
}