class Character {
  constructor(geo, bbox, base_color, mat=false){
    this.accx = 0
    this.accy = 0

    let basestr = rgbToHex(base_color[0], base_color[1], base_color[2])
    if(!mat){
      // deefault
      mat = new THREE.MeshPhongMaterial( { color: basestr, reflectivity: 0.2, shininess: 40 })
      // mat = new THREE.MeshLambertMaterial( { color: basestr })
      // mat = new THREE.MeshPhysicalMaterial( { color: basestr, transparent: true, reflectivity: 1, roughness: 0, clearcoat: 1.0, clearcoatRoughness: 0.1 })
      // mat = new THREE.MeshToonMaterial( { color: basestr })
    }

    this.mesh = new THREE.Mesh(geo, mat)

    this.bbox = bbox

    // this.colorfadetime = 10
    this.u = 0.0
    this.baseColor = base_color
    this.hitColor = this.hitColor || [255,0,0]
    this.color = base_color
    this.scaleFactor = 1.0

    this.dna = Math.random()

    // so far just for enemy
    this.isHit = false
    this.lastIsHit = false

    this.fading = false
    this.colorTimer = new Timer()
    this.healthTimer = new Timer()
    this.healthTimer.start()

    this.damageSounds = null
    this.damageSoundTimer = new Timer()
    // get this running because ima about to do some dmg
    this.damageSoundTimer.start()

    this.attackSounds = null
    this.attackSoundTimer = new Timer()
    // get this running because ima about to do some dmg
    this.attackSoundTimer.start()

    this.lifecycle = ALIVE

    this.spriteOpacity = 1
    this.opacityTimer = new Timer()

    this.duster = null
    this.dusterTimer = new Timer()

    this.bloodDuster = null
    this.bloodDusterTimer = new Timer()

    this.damagedBy = null

    this.dragCoefficient = 0.009

    this.casinoHighlight = false
    // set money label in subclasses so it doesnt get put on bombs and stuff
    this.moneyCircle = null
    this.moneyCircleArea = {}
    this.moneyCircleArea.mesh = null
    this.moneyCircleArea.bbox = null
    this.moneyCircleActive = false
    this.moneyCircleTimer = new Timer()
    this.moneyCircleSpendTimer = new Timer()
    this.moneyCircleSpendTimer.start()
    this.moneyCircleEnabled = false
  }

  drawMoney(){
    // draw money over chars head... when they spennin
  }

  changeMoney(amt){
    this.lastMoney = this.money
    this.money += amt
  }

  moveTowardsPoint(destx, desty, speedFactor=1){
    let startx = this.mesh.position.x
    let starty = this.mesh.position.y

    let xdiff = Math.abs(startx - destx)
    let ydiff = Math.abs(starty - desty)
    // shoutout to pythagoras
    // let dist = Math.sqrt(ydiff * ydiff + xdiff * xdiff)

    let speed = 0.04 * speedFactor

    if(startx < destx){
      this.accx += speed
    } else {
      this.accx -= speed
    }

    if(starty < desty){
      this.accy += speed
    } else {
      this.accy -= speed
    }
  }
  
  chooseDirection(){
    
    let width = window.innerWidth
    let height = window.innerHeight

    // if we're in teh final 20% closest to edge
    let x = this.mesh.position.x
    let y = this.mesh.position.y

    let edge = 0.6
    let awidth = Math.abs(width)
    let aheight = Math.abs(height)

    let locked

    // do a coin flip to decide which direction to check
    if( Math.random() > 0.5 ){
      if( Math.abs(x) > awidth*edge ){
        
        // if we're within 20% of edge, just start going the other way
        this.direction = Math.sign(x) == 1 ? LEFT : RIGHT
        locked = true
      }
    } else {
      if( Math.abs(y) > aheight*edge ){
        // yes, lock in direction
        this.direction = Math.sign(x) == 1 ? DOWN : UP
        locked = true
      }
    }

    if(!locked){
      // if not altered above, just prandom
      this.direction = Math.round(Math.random() * 4)  
    }
  }

  removeLaserSight(){
    // only for hitman corrupted
    this.laserSight.material.dispose()
    scene.remove( this.laserSight )  
  }

  // MONEY cirlce - spend mone yto extend shrinking hitman-contract-buying circle
  addMoneyCircle(){
    // bigger power, bigger circle
    let geometry = new THREE.Geometry()
    let monCol = this.money >= 50 ? "#00ff00" : "#ff0000" 
    this.moneyCircle = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: monCol }))
    this.moneyCircle.geometry.verticesNeedUpdate = true
    // console.log( 'we addin that damn cirlce bitch  ' )

    // toprad, bottomrad, height, segments
    this.moneyCircleArea.mesh = new THREE.Mesh( new THREE.CylinderGeometry(1, 1, 0.2, 32), new THREE.MeshBasicMaterial({ color: monCol, transparent: true  }) )
    // about face on to camera
    this.moneyCircleArea.mesh.rotation.x = 1.57
    this.moneyCircleArea.mesh.material.opacity = 0.05
    this.drawMoneyCircle()
    scene.add(this.moneyCircle, this.moneyCircleArea.mesh)
  }

  removeMoneyCircle(){
    this.moneyCircle.geometry.dispose()
    this.moneyCircle.material.dispose()
    scene.remove(this.moneyCircle)
    this.moneyCircle = null

    this.moneyCircleArea.mesh.geometry.dispose()
    this.moneyCircleArea.mesh.material.dispose()
    scene.remove(this.moneyCircleArea.mesh)
    this.moneyCircleArea.mesh = null
    this.moneyCircleArea = {}
  }

  drawMoneyCircle(){

    let segmentCount = 32
    let radius
    // radius = this.power/game.powerMax*2
    // need more beeg
    radius = this.money / 300

    this.moneyCircle.geometry.vertices = []
    var theta
    for (var i = 0; i <= segmentCount; i++) {
      theta = (i / segmentCount) * Math.PI * 2
      this.moneyCircle.geometry.vertices.push( new THREE.Vector3( Math.cos(theta) * radius, Math.sin(theta) * radius, 0 ) )
    }

    // update
    this.moneyCircleArea.mesh.scale.set( radius*1.1, radius*1.1, radius*1.1 )
  }

  startMoneyCircle(){
    if(!this.moneyCircle){
      this.addMoneyCircle()
    }

    this.moneyCircle.visible = true
    this.moneyCircleArea.mesh.visible = true

    if(!this.moneyCircleTimer.running){
      // console.log( 'bgegin circ timer' )
      this.moneyCircleTimer.start()
    }
  }

  stopMoneyCircle(){
    if(this.moneyCircle && this.moneyCircle.visible){
      // console.log( 'stop that circle' )
      this.moneyCircle.visible = false
      this.moneyCircleArea.mesh.visible = false
    }
  }

  remove(){
    // add sprite, then start fading it out - has to come before removing mesh to get position!
    if(this.lifecycle == DYING){

      if(this.corrupted){
        // corrupted kill
        this.addSprite(corruptorMaterial.clone(), 0.688)
      } else {
        this.addSprite(bloodspriteMaterial.clone(), 0.388)
      }
    }

    if(this.moneyLabel){
      this.removeMoneyLabel()
    }

    if(this.sword){
      this.sword.remove()
      this.sword = null
    }

    // clean up on aisle healthglo
    if(this.duster){
      this.duster.remove()
    }

    // clean up on aisle akuma
    if(this.banners){
      this.banners.remove()
    }
 
    // clean up on aisle godkiller
    if(this.godBanners){
      this.godBanners.remove()
    }

    // clean that blood up
    if(this.bloodDuster){
      this.bloodDuster.remove()
    }

    // if we're doing some extra-casino kiling
    if(game.casino && game.casino.highlights[this.id]){
      game.casino.removeHighlight(this.id)
    }


    if(this.hitmanCorrupted){
      if(this.laserSight){
        this.removeLaserSight()
      }
    }

    if(this.casinoHighlight && this.deadSprite){
      // casino highlight
      this.removeSprite()
    }

    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    scene.remove(this.mesh)
  }

  removeNow(){
    this.remove()
    this.removeSprite()
  }

  addSprite(mat, scale, moves=false, opacity=false){
    this.deadSprite = new THREE.Sprite( mat )

    // center rotation anchor
    this.deadSprite.center.set( 0.5, 0.5 )
    this.deadSprite.scale.set( scale, scale, scale )
    // random radian baby
    this.deadSprite.material.rotation = Math.random() * 2 * Math.PI
    this.deadSprite.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)

    let col = rgbToHex( Math.floor( Math.random() * 100 + 155 ), Math.floor( Math.random() * 100 + 155 ), Math.floor( Math.random() * 100 + 155 ) )
    this.deadSprite.material.color = new THREE.Color(col)

    if(moves){
      // udpate in animation
      this.deadSpriteMoves = true
    }

    if(opacity){
      this.deadSprite.material.opacity = opacity
    }

    scene.add(this.deadSprite)
  }

  removeSprite(){
    if(this.deadSprite){
      this.deadSprite.material.dispose()
      scene.remove(this.deadSprite)
    }
  }

  removeMoneyLabel(){
    this.moneyLabel.material.dispose()
    scene.remove(this.moneyLabel)
  }

  red(){
    this.color[0]
  }
  
  green(){
    this.color[1]
  }

  blue(){
    this.color[2]
  }
  
  setColor(r,g,b){
    // this.mesh.material.color.setRGB(r,g,b)
    let hex = rgbToHex(r,g,b)
    this.mesh.material.color.set( hex )
  }

  calcMovement(lightness, acc) {
    // higher means faster
    return lightness * acc;
  }

  // use this instead of inc in range, because we dont actually want to constrain between range of values, we jus twant to move towards 0
  slowDown(acc){
    if(acc > 0){
      // whichever way we're currently moving, accelerate towards the opposite direction
      acc -= this.dragCoefficient;
      if(acc < 0) {acc = 0};
    } else if(acc < 0){
      acc += this.dragCoefficient;
      if(acc > 0) {acc = 0};
    }

    return acc;
  }

  handleBombs(){
    let damageVal = 20

    if(this.isPlayer){
      // less damage for player
      damageVal = 5
    }

    let bomb
    for(var i=0; i<game.bombs.length; i++){
      bomb = game.bombs[i]

      // handle round-end player bomb situation
      if( bomb && bomb.exploded && this.healthTimer.time() > 100 && this.handleHit(bomb) && (!this.isPlayer || bomb.hurtsPlayer) ){
        this.healthTimer.reset()
        this.takeDamage( damageVal, BOMB )
      }
    }
  }

  handleMoneyLabel(){
    if(this.money !== this.lastMoney){
      this.lastMoney = this.money
      this.removeMoneyLabel()

      let colorStr = "#ff0000"

      // if(this.money >= 25 && this.money < 50){
      //   colorStr = "#ffff00"
      // } else if(this.money > 50){
      //   colorStr = "#ff0000"
      // }
      if(this.money > 50){
        colorStr = "#00ff00"
      }

      this.addMoneyLabel(colorStr)
    }
  }

  // this gets redefined in subclasses to contain other every-loop movement logic specific to the class
  customMovement(){}
  customAnimation(){}

  // this is momentum for anything that moves
  handleMovement(){
    // decide accelaration
    this.customMovement()

    let posx = this.mesh.position.x + this.calcMovement(this.lightness, this.accx)
    let posy = this.mesh.position.y + this.calcMovement(this.lightness, this.accy)
    
    if(Math.abs(posx) >= game.maxX){
      // stop it if it hits the edge
      this.accx = 0
      posx = Math.sign(posx) * game.maxX
    }

    if(Math.abs(posy) >= game.maxY){
      // stop it if it hits the edge
      this.accy = 0
      posy = Math.sign(posy) * game.maxY
    }

    this.mesh.position.x = posx
    this.mesh.position.y = posy

    // stop moving duster once were dying
    if(this.lifecycle == ALIVE && this.duster){
      this.duster.particleSystem.position.set( this.mesh.position.x, this.mesh.position.y, this.mesh.position.z )
    }

    if(this.lifecycle == ALIVE && this.bloodDuster){
      this.bloodDuster.particleSystem.position.set( this.mesh.position.x, this.mesh.position.y, this.mesh.position.z )
    }

    if(this.lifecycle == ALIVE && this.moneyCircle && this.moneyCircle.visible){
      // console.log( 'move tha tcircle' )
      this.moneyCircle.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
      this.moneyCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    }

    if(this.lifecycle == ALIVE || this.lifecycle == CORRUPTING){
      if(this.banners){
        this.banners.particleSystem.position.set( this.mesh.position.x, this.mesh.position.y, this.mesh.position.z )
      }
      if(this.godBanners){
        this.godBanners.particleSystem.position.set( this.mesh.position.x, this.mesh.position.y, this.mesh.position.z )
      }

      if(this.moneyLabel){
        this.moneyLabel.position.set( this.mesh.position.x+0.5, this.mesh.position.y+0.3, this.mesh.position.z )
      }
    }

    // this will be for sprites attached to living moving things
    // this.sprite.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)

    // whoa there
    this.accx = this.slowDown(this.accx)
    this.accy = this.slowDown(this.accy)
  }

  // right now this only happens to enemies
  handleHit(other_char){
    // record last hitstate
    this.lastIsHit = this.isHit

    // make sure there is something to intersect right now
    if(other_char.bbox && this.bbox.intersectsBox(other_char.bbox)){

      // hittin it
      this.isHit = true
    } else {

      this.isHit = false
    }

    return this.isHit
  }

  dmgSpriteMap(){
    return this.isPlayer ? pbloodspriteMap : bloodspriteMap
  }

  addParticles(map, blood=false){
    // little blod splats
    if(blood){
      this.bloodDuster = new Duster(map, 0.0422, 28, 0.32, this.mesh.position, 1)
    } else {
      this.duster = new Duster(map, 0.0422, 28, 0.32, this.mesh.position, 1)
    }
  }

  addBanners(map, size, num, dist, badge=false, opacity=1){
    // ignores distance and num if badge == true
    this.banners = new Duster(map, size, num, dist, this.mesh.position, opacity, badge)
  }

  addGodBanners(map, size, dist, opacity=1){
    this.godBanners = new Duster(map, size, 1, dist, this.mesh.position, opacity, true)
  }

  addMoneyLabel(colorStr){
    // create a canvas element
    let moneyText = "$" + this.money
    let mat = this.createTextMat(moneyText, colorStr, 0)
    this.moneyLabel = new THREE.Sprite( mat )
    this.moneyLabel.center.set( 0.5, 0.5 )
    this.moneyLabel.scale.set( 1, 0.2, 1 )
    scene.add( this.moneyLabel )
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

    let material1 = new THREE.MeshBasicMaterial( { map: texture1, side: THREE.DoubleSide, opacity: opacity } )
    material1.transparent = true

    return material1
  }


  changeHealth(healthChange){
    // this is for healing, dont want to use v similar takeDamage because it makes sounds
    this.health = incInRange( this.health, healthChange, 0, 100 )
  }

  killSound(){}

  // you already know
  takeDamageSound(){}

  takeDamage(dmg, damageSource){
    this.takeDamageSound()

    // record the last thing we were damaged byd
    this.damagedBy = damageSource

    // this.health -= dmg
    this.health = incInRange( this.health, -1*dmg, 0, 1000 ) 

    if(!this.bloodDuster){
      this.addParticles( this.dmgSpriteMap(), true )
      this.bloodDusterTimer.start()
    }
  }

  // lineToTarget(target){
  //   var targetPosition = new THREE.Vector3(x,y,z);
  //   var objectToMove;
  //   var group = new THREE.Group();
  //   group.add(objectToMove);
  //   var targetNormalizedVector = new THREE.Vector3(0,0,0);
  //   targetNormalizedVector.x = targetPosition.x - group.position.x;
  //   targetNormalizedVector.y = targetPosition.y - group.position.y;
  //   targetNormalizedVector.z = targetPosition.z - group.position.z;
  //   targetNormalizedVector.normalize()
  // }

  colorCycle(){

    if(this.isHit){
      this.fading = true
    }

    if(this.fading){

      if(!this.colorTimer.running){
        this.colorTimer.start()
      }

      let tocolor
      let fromcolor
      if(this.isHit){
        tocolor = this.hitColor
        fromcolor = this.baseColor
      } else {
        tocolor = this.baseColor
        fromcolor = this.hitColor
      }

      if(this.colorTimer.time() > 2){
        this.colorTimer.reset()

        var steps = 50
        var step_u = 1.0 / steps

        let to_r = tocolor[0]
        let to_g = tocolor[1]
        let to_b = tocolor[2]

        let from_r = fromcolor[0]
        let from_g = fromcolor[1]
        let from_b = fromcolor[2]

        let r = Math.round(lerp(from_r, to_r, this.u))
        let g = Math.round(lerp(from_g, to_g, this.u))
        let b = Math.round(lerp(from_b, to_b, this.u))

        this.u += step_u
        if(this.u >= 1.0){
          // done with this fade
          this.u = 0.0
          this.fading = false
        }

        // record this so we can compare above
        this.color = [r,g,b]
        // this.mesh.material.color.setRGB(r,g,b)
        this.setColor(r,g,b)
      }
    }

    if(this.color == this.baseColor || this.color == this.hitColor){
      this.fading = false
    }

  }

  position(){
    this.mesh.rotation.x -= 0.02
    this.mesh.rotation.y -= 0.02 
  }

  animation(){
      // override dis in your subclass to do extra stuff in addition to the reggies here
    this.customAnimation()

    // set bounding box from mesh baby
    this.bbox.setFromObject(this.mesh)

    this.colorCycle()

    if(this.money >= 0){
      this.handleMoneyLabel()
    }

    if(this.deadSprite && this.deadSpriteMoves){
      this.deadSprite.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    }

    if(this.banners){
      this.banners.animation()
    }

    if(this.godBanners){
      this.godBanners.animation()
    }

    if(this.duster){
      // run dis
      this.duster.animation()
      if(this.dusterTimer.time() > 20){
        this.dusterTimer.reset()

         this.duster.particleSystem.material.opacity -= 0.1
        if(this.duster.particleSystem.material.opacity <= 0){

          this.duster.remove()
          this.duster = null
        }
      }
    }

    if(this.bloodDuster){
      // run dis
      this.bloodDuster.animation()
      if(this.bloodDusterTimer.time() > 20){
        this.bloodDusterTimer.reset()

         this.bloodDuster.particleSystem.material.opacity -= 0.1
        if(this.bloodDuster.particleSystem.material.opacity <= 0){

          this.bloodDuster.remove()
          this.bloodDuster = null
        }
      }
    }

    if(this.moneyCircle && this.moneyCircle.visible){
        
      if(this.moneyCircleTimer.time() > 100){
        this.moneyCircleTimer.reset()
        // console.log( 'time to draw bitch' )
        this.removeMoneyCircle()
        this.addMoneyCircle()
        this.moneyCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)


        // spend power to have killing circle open
        this.changePower(-4)
      }

      this.drawMoneyCircle()
      this.moneyCircle.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
      this.moneyCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)

      if(this.moneyCircleArea && this.moneyCircleArea.mesh){
        this.moneyCircleArea.bbox = new THREE.Box3().setFromObject( this.moneyCircleArea.mesh )
      }

      if(this.moneyCircleSpendTimer.time() > 5000){
        this.moneyCircleSpendTimer.reset()
        // spend racks to have money circle open
        this.changeMoney(-1)
      }


    }
  
  }
}
