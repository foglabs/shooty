class Item {
  constructor(color, rotation, type){
    let geometry = new THREE.BoxGeometry(0.1,0.1,0.1)
    let material = new THREE.MeshBasicMaterial( {color: color} )
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.z = radian(rotation)
    scene.add(this.mesh)

    this.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())

    this.type = type
    this.cost = 100
    this.amount = 100

    // block until we get positioned properly
    this.available = false

    this.moneyLabel = null
    this.moneyLabelColor = "#ff0000"
    this.addMoneyLabel()
  }

  buy(){
    if(player.money >= this.cost){
      console.log( 'hey there' )

      this.mesh.visible = false
      this.available = false
      player.changeMoney(this.cost)
      
      if(this.type == ITEMKNOW){
        player.changeKnowledge( this.amount )
      } else if(this.type == ITEMHEAL){
        player.changeHealth( this.amount )
      } else {
        let eKey
        let eKeys = k(game.enemies)
        for(var i=0; i<eKeys.length;i++){
          eKey = eKeys[i]
          game.enemies[eKey].changeHealth(-1000)
        }

        game.merchant.closeShop()  
      }
    }   
  }

  addMoneyLabel(colorStr){
    // create a canvas element
    let moneyText = "$" + this.cost
    let mat = this.createTextMat(moneyText, colorStr, 1)
    this.moneyLabel = new THREE.Sprite( mat )
    this.moneyLabel.center.set( 0.5, 0.5 )
    this.moneyLabel.scale.set( 1, 0.2, 1 )
    scene.add( this.moneyLabel )
  }

  removeMoneyLabel(){
    this.moneyLabel.material.dispose()
    scene.remove(this.moneyLabel)
  }

  handleMoneyLabel(){
    let colorChange
    if(this.moneyLabelColor == "#ff0000" && this.cost <= player.money){
      colorChange = "#00ff00"
    }

    if(this.moneyLabelColor == "#00ff00" && this.cost > player.money){
      colorChange = "#ff0000"
    }

    if(colorChange){
      this.removeMoneyLabel()
      this.addMoneyLabel(colorChange)
    }
  }

  createTextMat(text, colorStr, opacity){
    let canvas1 = document.createElement('canvas')
    canvas1.width = 300
    canvas1.height = 60
    let context1 = canvas1.getContext('2d')
    context1.font = "Bold 24px vcr"
    // context1.fillStyle = "rgba(0,255,0,1)"
    context1.fillStyle = colorStr
    context1.textBaseLine = "middle"
    context1.fillText( text, 0, 50)

    // canvas contents will be used for a texture
    let texture1 = new THREE.CanvasTexture(canvas1) 
    texture1.needsUpdate = true

    let material1 = new THREE.MeshBasicMaterial( { map: texture1, side: THREE.DoubleSide, opacity: opacity, needsUpdate: true } )
    material1.transparent = true

    return material1
  }

  remove(){
    if(this.moneyLabel){
      this.removeMoneyLabel()
    }

    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    scene.remove(this.mesh)
  }
}