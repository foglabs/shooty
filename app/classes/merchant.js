class Merchant extends Character {
  constructor(){
    let geometry, material
    geometry = new THREE.ConeGeometry(0.3,0.2,7)
    material = new THREE.MeshBasicMaterial( {color: 0xffff00} )
    super(geometry, new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()), [255,255,255])

    let know = Math.floor( Math.random() * 10) * 50
    let item1 = new Item("#784ec8", 0, ITEMKNOW, know, know)
    let item2 = new Item("#59e85b", 72, ITEMHEAL, 100, 100)
    let item3 = new Item("#ff0000", 144, ITEMCLER, 300)
    let item4 = new Item("#ffff22", 216, ITEMPOWR, 25, 100)
    let item5 = new Item("#38D5F2", 288, ITEMFRND, 500)
    scene.add(item1.mesh)
    scene.add(item2.mesh)
    scene.add(item3.mesh)
    scene.add(item4.mesh)
    scene.add(item5.mesh)

    this.items = [item1,item2,item3,item4,item5]

    this.directionTimer = new Timer()
    this.directionTimer.start()

    this.health = 10000
    this.lightness = 0.001

    this.addBanners(merchantMap, 1.0, null, 0.2, true, 1)
    this.itemRotationTimer = new Timer()
    this.itemRotationTimer.start()

    this.openForBusiness = false 
    this.shopOpenTimer = new Timer()
    this.shopOpenTimer.start()

    this.itemRadius = 0
  }

  openShop(){
    this.openForBusiness = true

    // flag our goods as good for sale
    for(var i=0; i<this.items.length; i++){
      this.items[i].available = true
      this.items[i].addMoneyLabel(this.items[i].moneyLabelColor)
    }

    console.log( 'shops open!')
  }

  closeShop(){
    for(var i=0; i<this.items.length; i++){
      this.items[i].remove()
    }

    // bye bye!
    this.remove()
  }

  handleBuying(){
    if(this.openForBusiness == false){

      // scroll those items out
      if(this.itemRadius < 0.7){
        this.itemRadius += 0.013
      }

      if(this.shopOpenTimer.time() > 3000){
        this.openShop()

        this.itemRadius = 0.7
      }
    }
    
    let item
    for(var i=0; i<this.items.length; i++){
      item = this.items[i]

      if(item.available){
        item.handleMoneyLabel()
        item.positionMoneyLabel()

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

  pickEntryPoint(){
    let playerx = player.position.x
    let playery = player.position.y

    let redMaxx = game.maxX * 0.8
    let redMaxy = game.maxY * 0.8

    if(playerx == undefined && playery == undefined){
      // just random point if player is at origin
      return new THREE.Vector3( Math.random()*redMaxx, Math.random()*redMaxy, 0 )
    } else {
      // otherwise, appear in the middle of the two bigger distances form edges from player

      // if player is in negative x, distance from player to positive x edge will be greater
      let signx = -1 * Math.sign( playerx )
      let signy = -1 * Math.sign( playery )

      let posx,posy,edgex,edgey
      edgex = signx * redMaxx
      edgey = signy * redMaxy
      posx = playerx > edgex ? randomInRange(edgex, playerx) : randomInRange(playerx, edgex)
      posy = playery > edgey ? randomInRange(edgey, playery) : randomInRange(playery, edgey)

      console.log( 'ITSA HER', playerx, signx, edgex, posx )
      return new THREE.Vector3(posx, posy, 0)
    }
  }

  customMovement(){
    let px = player.mesh.position.x
    let py = player.mesh.position.y
    if( distance( px, py, this.mesh.position.x, this.mesh.position.y ) > 2 ){
      // if we're far from player, move towards
      this.moveTowardsPoint( px, py, 0.6 )
    } else {
      // otherwise just relax
      this.wander(0.21)
    }
  }

  moveItem(item){
    // rotate one degree
    item.mesh.rotation.z = item.mesh.rotation.z + 0.01

    // 0.7
    let radius = this.itemRadius
    // position on sword circle lol
    let x = radius * Math.sin( item.mesh.rotation.z ) + this.mesh.position.x
    let y = radius * Math.cos( item.mesh.rotation.z ) + this.mesh.position.y
    item.mesh.position.set( x, y, 0 )
    
    if(item.moneyLabel){
      item.positionMoneyLabel()
    }
  }

  customAnimation(){
    this.mesh.rotation.x += 0.01
    let item

    if(this.itemRotationTimer.time() > 30){
      this.itemRotationTimer.reset()
      for(var i=0; i<this.items.length; i++){
        this.moveItem( this.items[i] )
      }  
    }
  }
}