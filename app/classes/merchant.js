class Merchant extends Character {
  constructor(){
    let geometry, material
    geometry = new THREE.ConeGeometry(0.2,0.4,32)
    material = new THREE.MeshBasicMaterial( {color: 0xffff00} )
    super(geometry, new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()), [255,255,255])

    let item1 = new Item("#ff0000", 0, ITEMKNOW)
    let item2 = new Item("#00ff00", 120, ITEMHEAL)
    let item3 = new Item("#0000ff", 240, ITEMCLR)

    this.items = [item1,item2,item3]

    this.directionTimer = new Timer()
    this.directionTimer.start()

    this.health = 10000
    this.lightness = 0.001

    this.addBanners(merchantMap, 1.22, null, 0.3, true)
    this.itemRotationTimer = new Timer()
    this.itemRotationTimer.start()
  }

  handleBuying(){
    let item
    for(var i=0; i<this.items.length; i++){
      item = this.items[i]
      if(item.available){

        item.bbox.setFromObject( item.mesh )

        if(item.bbox.intersectsBox( player.bbox )){
          item.buy()
        }
      }
    }
  }

  wander(accChange){
    if(this.directionTimer.time() > 800){
      this.directionTimer.reset()
      this.chooseDirection()
      // console.log( 'FRIEND I CHOOSE DIREC', this.accx, this.accy )      
    }
    // wander
    let speed =  Math.random()*accChange

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

  rotateTo(item, rad){
    item.mesh.rotation.z = rad
  }

  customMovement(){
    // ?
    this.wander(0.81)
  }

  customAnimation(){
    this.mesh.rotation.x += 0.01
    let item

    if(this.itemRotationTimer.time() > 30){
      this.itemRotationTimer.reset()

      for(var i=0; i<this.items.length; i++){
        item = this.items[i]
        // item.position.set( this.mesh.position.x + item.offx, this.mesh.position.y + item.offy, this.mesh.position.z )

        // rotate one degree
        this.rotateTo(item, item.mesh.rotation.z + 0.01 )

        let radius = 0.4
        // position on sword circle lol
        let x = radius * Math.sin( item.mesh.rotation.z ) + this.mesh.position.x
        let y = radius * Math.cos( item.mesh.rotation.z ) + this.mesh.position.y
        item.mesh.position.set( x, y, 0 )
      }  
    }
    
  }
}