class Enemy extends Character {
  constructor(base_color, enemyType=null){
    let id = Math.random().toString(36).slice(2)

    // enemy's health
    let health
    // how much power the player gets 
    let nutritionalValue
    // how much knowl player gets
    let knowledgeValue = 0
    let lightness

    // de mesh
    let geometry
    let dna

    // adding these constants puts these shits on the right place for x==1 (level 1)
    let chanceSlices = game.chanceSlices
    let stickChance = chanceSlices[0]
    let sphereChance = chanceSlices[1]
    let circleChance = chanceSlices[2]
    let healcubeChance = chanceSlices[3]
    // this is just above the highest traunch, so no need
    // let octaChance = chanceSlices[]
    // console.log( 'high chance', octaChance )

    // console.log( 'dna is ', dna )
    // console.log( 'slices are', stickChance,sphereChance,circleChance,octaChance )
    if(enemyType){
      // this is kind of stupid, but if we want dna to be used elsewhere, per enemy, necessary
      dna = this.dnaByEnemyType(enemyType)
    } else {

      dna = Math.random()
      if(dna <= stickChance){
        enemyType = STICK
      } else if(dna <= sphereChance){
        enemyType = SPHERE
      } else if(dna <= circleChance) {
        enemyType = CIRCLE
      } else if(dna <= healcubeChance) {
        enemyType = HEALCUBE
      } else {
        enemyType = KNOWLOCTA
      }
    }
    
    if(enemyType == STICK){
      // stick
      geometry = new THREE.BoxGeometry(0.02,0.02,0.6)
      health = 2
      nutritionalValue = 16
      base_color = [72,201,46]
      lightness = 0.1
    } else if(enemyType == SPHERE){
      // sphere
      health = 8
      nutritionalValue = 26
      geometry = new THREE.SphereGeometry( 0.09, 32, 32 )
      base_color = [114,194,189]
      lightness = 0.03
    } else if(enemyType == CIRCLE) {
      // circle
      health = 0.04
      nutritionalValue = 22
      geometry = new THREE.CircleGeometry( 0.240, 32 )
      base_color = [214,189,58]
      lightness = 0.4
    } else if(enemyType == HEALCUBE){
      // heal cube
      geometry = new THREE.BoxGeometry(0.2,0.2,0.2)
      health = 18
      nutritionalValue = 50
      base_color = [189,52,147]
      lightness = 0.02
    } else if(enemyType == KNOWLOCTA) {
      // knowledge octa
      health = 12
      nutritionalValue = 26
      geometry = new THREE.OctahedronGeometry( 0.08 )
      base_color = [120,78,200]
      knowledgeValue = 25
      lightness = 0.09
    }

    
    super(
      // de ge
      geometry,
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.id = id
    this.dna = dna
    this.healthValue = 0
    this.enemyType = enemyType
    this.lightness = lightness

    // cube
    if(this.enemyType == HEALCUBE){
      this.addParticles(healthenemyMap)
      this.healthValue = 20

      let dist = 0.18 * this.scaleFactor
      let size = 0.48 * this.scaleFactor
      this.addBanners(healthspriteMap, size, 2, dist, true)
    } else if(this.enemyType == SPHERE){
      this.healthValue = 10
    } else if(this.enemyType == CIRCLE){
      let dist = 0.1 * this.scaleFactor
      let size = 0.46 * this.scaleFactor
      this.addBanners(lightweightMap, size, 2, dist, true)
    } else if(this.enemyType == KNOWLOCTA){
      let dist = 0.1 * this.scaleFactor
      let size = 0.46 * this.scaleFactor
      this.addBanners(candyspriteMap, size, 2, dist, true)
    }

    if(Math.random() > 0.6){
      // sometimes, make one with a weird scale

      // if we're in here, were doing somethin right

      // size it
      if(this.enemyType == CIRCLE){
        // circle
        this.scaleFactor = 1 + Math.random() * 0.4
      } else if(this.enemyType == SPHERE){
        
        this.scaleFactor = 1 + Math.random() * 2.1
        this.mesh.scale.x = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.y = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.z = 1 + Math.random() * this.scaleFactor        
      } else {
        this.scaleFactor = 1 + Math.random() * 1.3
        this.mesh.scale.x = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.y = 1 + Math.random() * this.scaleFactor
        this.mesh.scale.z = 1 + Math.random() * this.scaleFactor        
      }
    }

    // base enemy health
    this.health = health
    this.damageSounds = [fx_edmg1, fx_edmg2, fx_edmg3]

    this.killSounds = [fx_ekill1, fx_ekill2, fx_ekill3, fx_ekill4, fx_ekill5, fx_ekill6]

    this.direction = 0
    this.corrupted = false
    // super
    this.godCorrupted = false

    let hitr = this.calcHitColor(this.baseColor[0])
    let hitg = this.calcHitColor(this.baseColor[1])
    let hitb = this.calcHitColor(this.baseColor[2])
    this.hitColor = [hitr, hitg, hitb]

    // console.log( 'hitcolor is ', this.hitColor )
    this.directionTimer = new Timer()
    // start this up because were going to add to scene right now anyway
    this.directionTimer.start()

    // countdown to actually being corrupted
    this.corruptingTimer = new Timer()
    this.corrOpacityUp = true
    this.corrOpacityUpTimer = new Timer()
    this.corrOpacityUpTimer.start()

    this.color = this.baseColor
    this.nutritionalValue = nutritionalValue
    this.knowledgeValue = knowledgeValue

    this.inScene = false
  }

  dnaByEnemyType(enemyType){
    let min, max
    if(enemyType == STICK){
      min = 0
      max = game.chanceSlices[0]
    } else if(enemyType == SPHERE){
      min = game.chanceSlices[0]
      max = game.chanceSlices[1]
    } else if(enemyType == CIRCLE) {
      min = game.chanceSlices[1]
      max = game.chanceSlices[2]
    } else if(enemyType == HEALCUBE){
      min = game.chanceSlices[2]
      max = game.chanceSlices[3]
    } else if(enemyType == KNOWLOCTA) {
      min = game.chanceSlices[3]
      max = 1
    }

    return Math.random() * (max-min) + min
  }

  calcHitColor(val){
    // the higher val is, the smaller the increase
    // subtract 8 to push line down to keep unde 255
    return val + Math.floor(val * 800/ ( Math.pow(val, 2) ) - 3)
  }

  rotation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.28 * fac
    fac = Math.random() * 0.010
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.18 * fac
  }

  killScore(){
    let score
    if(this.damagedBy == EAT) {
      score = 1
    } else if(this.damagedBy == SWORD) {
      score = 12
    } else if(this.damagedBy == KILLINGCIRCLE) {
      score = 4
    } else if(this.damagedBy == SMOKE) {
      score = 10
    } else if(this.damagedBy == BOMB) {
      score = 8
    } else if(this.damagedBy == FRIEND) {
      score = 2
    } else if(this.damagedBy == CASINO) {
      score = 32
    }

    // beef that up if they real bad with it
    if(this.corrupted){
      score = score * 4
    } else if(this.godCorrupted){
      score = score * 16
    }

    return score
  }

  takeDamageSound(){
    // pick a random one from this array
    if(this.damageSoundTimer.time() > 30){
      this.damageSoundTimer.reset()
      
      let roll = Math.floor( Math.random() * this.damageSounds.length )
      this.damageSounds[ roll ].play()  
    }
  }

  startCorrupting(){

    // remove health guy glows if necessary
    if(this.duster){
      this.duster.remove()
    }

    if(this.banners){
      this.banners.remove()
      this.banners = null
    }

    this.lifecycle = CORRUPTING
    let dist = 0.21 * this.scaleFactor
    let size = 0.68 * this.scaleFactor
    // this.addBanners(candyspriteMap, size, 2, dist, true)
    // let size = 0.33 * this.scaleFactor
    this.addBanners(nowcorruptingspriteMap, size, 0, dist, true, 0.3)
    this.banners.setPosition( this.mesh.position )
    this.corruptingTimer.start()
  }

  startGodCorrupting(){

    if(this.banners){
      this.banners.remove()
      this.banners = null
    }

    this.lifecycle = CORRUPTING
    let dist = 0.21 * this.scaleFactor
    let size = 0.68 * this.scaleFactor
    // this.addBanners(candyspriteMap, size, 2, dist, true)
    // let size = 0.33 * this.scaleFactor
    this.addBanners(nowcorruptingspriteMap, size, 0, dist, true, 0.3)
    this.banners.setPosition( this.mesh.position )
    this.corruptingTimer.start()
  }

  killSound(){
    let roll = Math.floor(Math.random() * this.killSounds.length)
    this.killSounds[ roll ].play()
  }

  handleSword(){
    // sword follows the same pattern as character
    let hit = this.handleHit( player.sword )
    if(hit && this.healthTimer.time() > 200){
      this.healthTimer.reset()
      this.takeDamage( 12 * player.level, SWORD )
    }
  }

  handleFriends(){
    let hit
    let friend
    for(var i=0; i<game.friends.length; i++){
      friend = game.friends[i]
      if(friend){
        hit = this.handleHit( friend )
        if(hit && this.healthTimer.time() > 60){
          this.healthTimer.reset()
          friend.attack( this )        
        }
      }
    }
  }

  handleSmokes(){
    let smoke
    for(var i=0; i<game.smokes.length; i++){
      smoke = game.smokes[i]
      if(smoke){
        let bub
        let hit
        if(smoke.bubbles.length > 0){
          for(var x=0; x<smoke.bubbles.length; x++){
            bub = smoke.bubbles[x]
            if(bub && this.healthTimer.time() > 100){
              this.healthTimer.reset()
              // are you in the smoke?!
              hit = this.handleHit( bub )
              if(hit){
                // yes
                // console.log( 'smoking that loud', hit, this.health )
                bub.attack( this )
              }
            }
          }
        }
      }
    }
  }

  customAnimation(){
    // dont do it, if yA DEAD
    if(this.lifecycle == ALIVE){
      this.rotation()

      if(this.enemyType == HEALCUBE && this.duster){
        // need to check for duster because its gone during corrupting

        // health cube
        this.duster.particleSystem.rotation.x += 0.01
      }

    } else if(this.lifecycle == DYING){
      // start this, will fade down in animation (for health cube)
      if(!this.dusterTimer.running){
        this.dusterTimer.start()
      }

      // if a sprite exists, start fading it out
      if(!this.opacityTimer.running){
        this.opacityTimer.start()
      }

      if(this.opacityTimer.time() > 200){
        this.opacityTimer.reset()

        let sx, sy, sz
        sx = this.mesh.scale.x + 0.4
        sy = this.mesh.scale.y + 0.4
        sz = this.mesh.scale.z + 0.4

        this.mesh.scale.set(sx,sy,sz)

        this.spriteOpacity = this.spriteOpacity - 0.1
        // console.log( 'reduced spriteopac '+ this.spriteOpacity )
        this.deadSprite.material.opacity = this.spriteOpacity

        if(this.spriteOpacity <= 0){
          // if we hit 0 opacity, remove sprite from scene
          this.removeSprite()

          // this will allow the enemy maintenance loop in game to actually dispose of the CORPSE
          // console.log( 'i hereby pronounce you, fucking dead ', this.id )
          this.lifecycle = DEAD
        }
      }
    } else if(this.lifecycle == CORRUPTING){

      // fade corrupting sprite
      if(this.corrOpacityUpTimer.time() > 10){
        this.corrOpacityUpTimer.reset()
  
        if(this.corrOpacityUp){
          // console.log( 'went up' )
          this.banners.particleSystem.material.opacity += 0.02
        } else {
          // console.log( 'went down' )
          this.banners.particleSystem.material.opacity -= 0.02
        }

        if(this.banners.particleSystem.material.opacity <= 0.3){
          // console.log( 'going up now' )
          this.corrOpacityUp = true
        } else if(this.banners.particleSystem.material.opacity >= 1) {
          // console.log( 'going down now' )
          this.corrOpacityUp = false
        }
      }
      
      if(this.corruptingTimer.time() > game.corruptingTime){
        this.lifecycle = ALIVE

        // console.log( 'I CORRUPT NOW...', this.id )


        if(this.corrupted){
          // god corruption
          this.godCorrupted = true

          // move slowly
          this.lightness = 0.03
          // big helf
          this.health = 100
          this.baseColor = [139,60,240]
          this.setColor(this.baseColor[0],this.baseColor[1],this.baseColor[2])

          // douse the flames
          this.banners.remove()

          this.addBanners(corruptdustMap, 0.18, 16, 0.18)

          // add the unthinkable script
          let dist = 0.1 * this.scaleFactor
          let size = 0.666 * this.scaleFactor
          this.addGodBanners(godkillerMap, size, dist, 0.8)
          this.hitColor = [255,255,255]
          
          // same proportions as a before, diff sounds
          this.killSounds = [fx_ckill1, fx_ckill2, fx_ckill3]

        } else {
          // regular corruption

          this.health = 24
          this.corrupted = true
          this.baseColor = [255,0,0]
          this.mesh.material.color.setRGB(0xff0000)

          // douse the flames
          this.banners.remove()
          // add the evil script
          this.addBanners(corruptdustMap, 0.18, 16, 0.18)
          this.hitColor = [255,0,0]
          // same proportions as a before, diff sounds
          this.killSounds = [fx_ckill1, fx_ckill2, fx_ckill3]
        }
        
      }
    }
  }

  customMovement(){

    //STOP RIGHT THERE - its time to corrupt
    if(this.lifecycle != CORRUPTING){
      let speed =  Math.random()*0.03

      if(game.percentCorrupted == 1){
        // chase the player like a demon from hell if theres only corrupteds left
        this.moveTowardsPoint(player.mesh.position.x, player.mesh.position.y)

      } else if(this.godCorrupted){

        this.moveTowardsPoint(player.mesh.position.x, player.mesh.position.y, 0.4)

      } else {

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

      
    }
    
  }
}