class Game {
  constructor(){

    // the ol square
    // this.maxX = 3
    // this.maxY = 3
    // divide by 2 for +/-, divide by 200 to relate to window dimensions

    let sizingFactor = 5/56 * window.innerWidth - 100/7

    this.maxX = window.innerWidth / 2 / sizingFactor
    this.maxY = window.innerHeight / 2 / sizingFactor
    this.u = 0
    // current color
    this.backgroundColor = [0,0,0]
    // preserve this so we can lerp from from to round - starts as title screen color
    this.lastRoundColor = [140,180,255]
    // destination color for the round, fades during loading
    this.roundColor = [140,180,255]

    this.nameEntry = NONAME
    // what char ar we adding
    this.nameEntryIndex = 0
    this.nameEntryConfirm = false


    this.entryPlane = new EntryPlane(-0.5, 10, 0.785398)

    this.setDefaultGameValues()

    // clean up everything
    document.getElementById("scores").innerHTML = ""
    document.getElementById("scores").classList.remove("score-scroll")
    document.getElementById("fog-logo").classList.add("hidden")
    document.getElementById("fog-logo2").classList.add("hidden")
    this.clearAnnouncements()


    this.entryPlane.mesh.visible = true

    // a little something for you and yours
    // this.backPlanes = []
    // let backPlane
    // for(var i=2; i<8; i++){
    //   let geometry = new THREE.PlaneGeometry( 1, 1 )
    //   console.log('colo! ', randomHexColor(255))
    //   let material = new THREE.MeshStandardMaterial( {transparent: true, color: randomHexColor(255), side: THREE.DoubleSide, opacity: 0.2 } )
    //   backPlane = new THREE.Mesh( geometry, material )
    //   backPlane.position.z = -0.5 - i
    //   backPlane.scale.x = 10/i
    //   backPlane.scale.y = 10/i
    //   backPlane.rotation.z = 0.785398
    //   scene.add( backPlane )
    //   this.backPlanes.push(backPlane)
    // }
      
    this.musicEnabled = true
    this.currentSong = OSTTITLE

    this.stage = false
    this.stageTimer = new Timer()
    this.loadTime = 2000
    this.animTimer = new Timer()

    // wait a bit to start music
    this.musicTimer = new Timer()
    this.musicTimer.start()
    // flag to show msg once
    this.muteMessage = false

    this.announcements = []
    this.announcementTimer = new Timer()
    this.announcementFadeTimer = new Timer()

    this.numCorrupted = 0
    this.score = null
    this.scoreLightTimer = new Timer()
    this.scoreLightTimer.start()

    // to alternate score scroll + press space msg
    this.attractStage = TITLE
    // this.attractStage = DEMO
    this.attractTimer = new Timer()
    this.attractTimer.start()

    this.flickerTimer = new Timer()
    this.flickerTimer.start()

    this.enemyDriftInTimer = new Timer()
    this.enemyDriftInTimer.start()
    
    // this.knowledgeDrainTimer = new Timer()
    // this.knowledgeDrainTimer.start()

    this.demo = null
    this.demoCharacters = []

    this.gamepadConnected = false
    this.gamepadXAxis = null
    this.gamepadYAxis = null

    // total bs
    this.defaultGamepadAxisXMax = 1
    this.defaultGamepadAxisYMax = 1
    
    this.gamepadState = {}
    this.defaultGamepadKeyMap = [
      "z", // 0
      "Spacebar", // 1
      "x", // 2
      "c", // 3
      "v", // 4
      "b", // 5
      "n", // 6
      "m", // 7
      "m", // 8
      // pause
      "Escape", // 9
      "m", // 10
      "m", // 11
      // "ArrowUp", // 12
      // "ArrowDown", // 13
      // "ArrowLeft", // 14
      // "ArrowRight", // 15
    ]

    this.gamepadKeyMap = this.defaultGamepadKeyMap

    // ho boy
    this.remapButtons = false
    this.allGameKeys = ["z","Spacebar","x","c","v","b","n","m","Escape"]
    this.allGameKeyLabels = ["SWORD","KILLING CIRCLE","SMOKE","BOMB","ADD NEW FRIEND","CASINO","SHOW MONEY","MUTE MUSIC","PAUSE"]
    this.newGamepadKeyMap = []
    this.allButtonsReleased = false
    this.remapTimer = new Timer()
    this.remapTimer.start()

    this.calibrateAxis = false
    this.gamepadAxisXMax = null
    this.gamepadAxisYMax = null

    this.startTime = null
    this.endTime = null
    // get and display score board first thing
    setScores()
  }
  
  haveSex(){
    return keyHandler.keyActivity + ":" + (1000000000 - this.score) + ":" + player.level + ":" + this.endTime + ":" + this.startTime
  }

  handleAnnouncements(){
    if(this.announcements.length > 0){
      // draw current announcement
      this.drawAnnouncement()
    }
  }

  clearAnnouncements(){
    this.announcements = []
    document.getElementById('stage-info').innerHTML = ''
  }

  announcement(message){
    this.announcements.push(message)

    // if theres no queued announcements, start the cycle up
    if(!this.announcementTimer.running){

      this.announcementTimer.start()
    }
  }

  drawAnnouncement(){
    if(this.announcementFadeTimer.running){
      if(this.announcementFadeTimer.time() < 800){
      // pause between announcments to wait for css animation, plus a little bit
        return
      } else {
        // switch to actual show timer
        this.announcementFadeTimer.stop()
        this.announcementTimer.start()
      }
    }

    if(this.announcementTimer.running){

      document.getElementById('stage-info').innerHTML = this.announcements[0]
      document.getElementById('stage-info').classList.add("announcement")

      if(this.announcementTimer.time() > 1600){
        // an announcment was added elsewhere, this is just to shut it off
        document.getElementById('stage-info').classList.remove("announcement")
        // we're done with this one, allow the next one to start
        this.announcements.shift()
        this.announcementFadeTimer.start()
        if(this.announcements.length > 0){
          this.announcementTimer.reset()
        } else {

          this.announcementTimer.stop()
        }
      }

    }
  }

  randomSign(){
    return Math.random() > 0.5 ? 1 : -1
  }

  randomPoint(){
    // random point in play field
    let x, y
    x = Math.random() * this.maxX * this.randomSign()
    y = Math.random() * this.maxY * this.randomSign()
    return [x,y]
  }

  randomEnemyId(){
    let keys = k(this.enemies)
    return keys[ Math.floor( Math.random() * keys.length ) ]
  }

  gameRunning(){
    this.stage == LOADING || this.stage == PLAYING
  }

  initGame(){
    // opening animation when we load
    this.stageTimer.start()
  }

  setDefaultGameValues(){
    player.maxHealth = 100
    player.health = player.maxHealth
    player.power = 0
    
    this.u = 0

    this.score = 0

    // this gets filled in index
    this.enemies = {}
    this.percentCorrupted = 0
    // bump this up to get more difficult
    this.corruptionMaxDefault = 0.2
    this.corruptionMax = this.corruptionMaxDefault
    this.corruptionTimer = new Timer()

    // above this means you corruptin
    this.corruptionBaseChance = 0.8

    this.godCorruptionTimer = new Timer()
    this.godCorruptionTimer.start()

    this.corruptedDamageDefault = 4
    this.corruptedDamage = this.corruptedDamageDefault

    this.godCorruptedDamageDefault = 6
    this.godCorruptedDamage = this.godCorruptedDamageDefault

    this.greenCorruptedDamageDefault = 8
    this.greenCorruptedDamage = this.greenCorruptedDamageDefault

    this.hitmanCorruptedDamageDefault = 64
    this.hitmanCorruptedDamage = this.hitmanCorruptedDamageDefault

    this.corruptingTimeDefault = 1800
    this.corruptingTime = this.corruptingTimeDefault

    // max playe rpower
    this.powerMax = 100

    // max knowl to level up
    this.knowledgeMaxDefault = 50
    this.knowledgeMax = this.knowledgeMaxDefault
    this.knowledgeFloor = this.knowledgeMaxDefault
    // countdown to generate enemies every so often
    this.defaultEnemyInterval = 18000
    this.enemyInterval = this.defaultEnemyInterval
    this.defaultEnemyMax = 5
    this.enemyMax = this.defaultEnemyMax
    this.defaultEnemyHealthFactor = 1
    this.enemyHealthFactor = 1

    this.bombs = []
    this.randomBombsTimer = new Timer()
    this.randomBombsTimer.start()

    this.smokes = []

    this.friends = []

    // yeah bitch
    this.casino = null

    this.roundCount = 1

    this.chanceSlices = this.calcChanceSlices()

    this.nowRandomBombing = false

    this.showMoneyLabelState = HIDING
    this.showMoneyLabelTimer = new Timer()
    this.showMoneyLabelTimer.start()

    this.readyToStartGame = true

    this.bonusEnergyTimer = new Timer()
    this.bonusEnergyTimer.start()
    this.bonusMoneyTimer = new Timer()
    this.bonusMoneyTimer.start()

    this.merchant = null
    this.merchantTimer = new Timer()

    // dont repeat it
    this.playedDeathSong = false
  }
  
  // calcChanceSlices(){
  //   let chanceSlices
  //   if(this.roundCount<20){
  //     chanceSlices = [0.2,0.4,0.6,0.75]
  //     for(var i=0; i<4; i++){
  //       // bend the base chances based on round number, kinda weighted by index
  //       chanceSlices[i] = chanceSlices[i] * i + Math.pow( this.roundCount, 2 )/3000
  //     }

  //     // adding these constants puts these shits on the right place for x==1 (level 1)
  //     chanceSlices[0] = chanceSlices[0] + 0.2
  //     chanceSlices[1] = chanceSlices[1]
  //     chanceSlices[2] = chanceSlices[2] - 0.6
  //     // chanceSlices[3] = chanceSlices[3] - 1.6
  //     chanceSlices[3] = chanceSlices[3] - 1.5
  
  //   } else {
  //     // after round 20, get buck
  //     chanceSlices = [0.2,0.4,0.6,0.75]

  //     for(var i=0; i<4; i++){
  //       chanceSlices[i] = chanceSlices[i] * ( Math.pow(this.roundCount, 2) / 4500 ) + chanceSlices[i]
  //     }
  //   }
    
  //   return chanceSlices
  // }

  calcChanceSlices(){
    let chanceSlices = [0.2,0.4,0.6,0.75]

    // STICK
    chanceSlices[0] = 1/400*this.roundCount + 0.2

    // SPHERE
    chanceSlices[1] = 1/500*this.roundCount + 0.4

    // CIRCLE
    chanceSlices[2] = 1/600*this.roundCount + 0.6
    
    // HEALCUBE
    chanceSlices[3] = 1/200*this.roundCount + 0.75
    
    // KNOWLOCTA (above the last one)
    return chanceSlices
  }

  calcEnemyHealthFactor(){
    return this.roundCount < 30 ? Math.max( 0.01, Math.log(this.roundCount/-3 + 12) ) : 1
  }

  newPlayer(){
    player = new Player([0,88,255])
    player.mesh.visible = false
    scene.add( player.mesh )
  }

  newGame(){
    if(!this.gameRunning()){
      document.getElementById("stage-info").classList.remove("static")
      document.getElementById("scores").innerHTML = ""

      this.musicTimer.reset()

      if(player){
        // clean out old player
        player.remove()
        player.removeSprite()
      }
      
      this.scores = false

      this.newPlayer()

      this.setDefaultGameValues()
      this.lastRoundColor = this.roundColor
      // destination color for the round, fades during loading
      this.roundColor = [0,0,0]


      fx_startgameE.play()

      this.entryPlane.setDefaultOpacity()

      this.newRound(this.enemyMax, this.enemyInterval, this.corruptionMax, this.corruptingTime, [0,0,0])

      this.startTime = performance.now()
      // need to wipe this so timer works
      this.attractStage = null

      // block this so that we cant retry before ENDING animation finishes
      this.readyToStartGame = false


      // let lev = 8
      // for(var i=0; i<lev; i++){
      //   player.levelUp()
      // }
      // this.clearAnnouncements()
      // let round = 39
      // for(var i=0; i<round; i++){
      //   // skip all but last round
      //   this.nextRound( i != round)
      // }
    }
  }

  nextRound(skip=false){
    // ramp up difficulty for next round
    // exponential, but dull it down so we get to about x20 base #enemies by round 12

    let maxBump
    if(this.roundCount < 10){
      // steeper enemy max curve until r10
      maxBump = 1 + Math.pow(this.roundCount, 2)/25
    } else {
      maxBump = 5 + Math.pow(this.roundCount, 2)/600
    }

    // make the max # of enemeis per gen bigger, floor it with 5 so we dont have 3 rounds of 2 enemies
    let newEnemyMax = Math.round(this.defaultEnemyMax * maxBump)

    // make the enemy timer shorter
    // min 10s, decrease towards that until round 35
    let newEnemyInterval = Math.max( 5000, Math.round(-200 * this.roundCount ) + this.defaultEnemyInterval )

    // increase maximum % of corurpted by 8%
    // let newCorruptionMax = (this.corruptionMax * 1.08).toFixed(2)
    let newCorruptionMax = (this.corruptionMaxDefault + (this.corruptionMaxDefault * Math.pow(this.roundCount, 2)) / 64 ).toFixed(2)

    // how long does it take to finsih corrupting
    let newCorruptingTime = Math.round(this.corruptingTimeDefault * ( 9/(this.roundCount+8) ) )

    this.roundCount += 1
    // recalc chacnes for each enemy
    this.chanceSlices = this.calcChanceSlices()

    let r,g,b

    if(this.roundCount >= 40){
      r = 255
      g = 255
      b = 255
    } else {
      r = Math.floor(Math.random() * 100)
      g = Math.floor(Math.random() * 100)
      b = Math.floor(Math.random() * 100)
    }
    
    this.corruptionTimer.reset()
    this.corruptedDamage = this.corruptedDamageDefault + Math.floor(this.roundCount * 0.6)
    this.godCorruptedDamage = Math.round( this.godCorruptedDamageDefault + Math.pow(this.roundCount/6, 2) )

    this.greenCorruptedDamage = Math.round( this.greenCorruptedDamageDefault + Math.pow(this.roundCount/4, 2) )

    this.changeScore(this.roundCount * 10)

    if(this.roundCount >= 10){
      this.enemyHealthFactor = this.calcEnemyHealthFactor()
    } else {
      this.enemyHealthFactor = 1
    }

    if(!skip && this.merchant){
      // if theres a merchant out when the round ends, bye bye!
      this.merchant.closeShop()
      this.merchant = null
    }

    this.newRound(newEnemyMax, newEnemyInterval, newCorruptionMax, newCorruptingTime, [r,g,b], skip)
  }

  numEnemies(){
    // add a random # of enemies, ensure at least 50% of max
    return Math.round( this.enemyMax/2 + Math.random() * this.enemyMax/2 )
  }

  newRound(enemyMax, enemyInterval, corruptionMax, corruptingTime, roundColor, skip=false){
    this.entryPlane.flip()
    
    keyHandler.resetHeats()    

    this.enemyMax = enemyMax
    this.enemyInterval = enemyInterval
    this.corruptionMax = corruptionMax
    this.corruptingTime = corruptingTime

    // record for loading lerping
    this.lastRoundColor = this.roundColor
    // to color
    this.roundColor = roundColor

    this.cleanEnemies()
    this.cleanBombs()
    this.cleanSmokes()

    this.stage = LOADING
    this.announcement("ROUND " + this.roundCount +  " LOADING...")

    duster.animTimer.start()
    this.stageTimer.start()

    // reset enemy timer with new
    this.enemyTimer = new Timer(this.enemyInterval)
    this.enemyTimer.start()

    let numEnemies = this.numEnemies()
    this.generateEnemies( numEnemies )
    this.generateEnemies( numEnemies, true )

    if(!skip && (this.roundCount-4) % 5 == 0){
      // LETS SHOP

      this.announcement("ITEM SHOP HAS OPENED")
      this.announcement("VIEW MONEY (N)")
      this.addMerchant()
    }

    if(this.nowRandomBombing && player.level < 2){
      // we won round during bombing, give em a little snac
      this.bonusPurps()
    }
    this.nowRandomBombing = false

    if(this.roundCount == 5){
      spotlight2.color = new THREE.Color("#00ffaa")
    } else if(this.roundCount == 10){
      spotlight2.color = new THREE.Color("#ffaa00")
    } else if(this.roundCount == 15){
      spotlight2.color = new THREE.Color("#aa00ff")
    } else if(this.roundCount == 20){
      // silver
      spotlight2.color = new THREE.Color("#ffffff")
    } else if(this.roundCount == 25){
      // gold
      spotlight2.color = new THREE.Color("#FFD700")
    } else if(this.roundCount == 30){
      // evil
      spotlight2.color = new THREE.Color("#c2191f")
    } else if(this.roundCount == 35){

      spotlight2.color = new THREE.Color("#ff0000")
    } else if(this.roundCount >= 40){
      // red to the death of me
      spotlight2.color = new THREE.Color("#ff0000")
    }

    // change backplane color
    if(this.roundCount >= 40){
      this.entryPlane.setColor("#ffffff")
      this.entryPlane.setDefaultOpacity()
    } else if(this.roundCount > 1){
      this.entryPlane.randomColor()
    }

    // unfade abit each round after 30
    if(this.roundCount >= 30 && this.roundCount < 40){
      if(!this.entryPlane.mesh.visible){
        this.entryPlane.mesh.visible = true
      }
      this.entryPlane.mesh.material.opacity = (this.entryPlane.mesh.material.opacity + 0.4 < 1) ? this.entryPlane.mesh.material.opacity + 0.4 : 1
    }
  }

  endGame(){

    this.endTime = performance.now()

    this.stageTimer.start()
    this.stage = ENDING
    fx_youredeadE.play()
  }

  startCasino(){
    this.casino = new Casino()
  }

  handleMusic(){
    if(this.musicEnabled){
      if(this.stage == TITLE || this.stage == LOADING || this.stage == PLAYING || this.stage == ENDING || this.stage == GAMEOVER){

        // oh forget it!      
        // music start
        if(this.musicTimer.running && this.musicTimer.time() > 2000){

          // if(!this.muteMessage){
          //   this.announcement("MUTE MUSIC (M)")
          //   this.muteMessage = true
          // }

          if(this.stage == TITLE){
            if(!fx_title.playing()){
              
              this.playSong(OSTTITLE)
            }
          } else if(this.stage == ENDING || this.stage == GAMEOVER){
            if(!fx_dye.playing()){
              if(!this.playedDeathSong){
                // only play it once
                this.playedDeathSong = true
                this.playSong(OSTDEAD)  
              }
            }
          } else if(this.merchant){
            if(!fx_merchantamb.playing()){
              this.playSong(MERCHANT)
            }
          } else if(this.roundCount < 10 ){
            if(!fx_ost1.playing()){
              this.playSong(OST1)
            }  
          } else if(this.roundCount <  20 ){
            if(!fx_ost2.playing()){
            // round 10 music
              this.playSong(OST2)
            }
          } else if(this.roundCount < 30 ){
            if(!fx_ost3.playing()){
            // round 20 music
              this.playSong(OST3)
            }
          } else if(this.roundCount < 40 ){
            if(!fx_ost4.playing()){
            // round 30 music
              this.playSong(OST4)
            }
          } else {
            if(!fx_ost5.playing()){
            // round 30 music
              this.playSong(OST5)
            }
          }
        }
      }  
    }
    
  }

stopSongs(){
  if(fx_ost1.playing()){
    fx_ost1.stop()
  } else if(fx_ost2.playing()){
    fx_ost2.stop()
  } else if(fx_ost3.playing()){
    fx_ost3.stop()
  } else if(fx_ost4.playing()){
    fx_ost4.stop()
  } else if(fx_ost5.playing()){
    fx_ost5.stop()
  } else if(fx_merchantamb.playing()){
    fx_merchantamb.stop()
  } else if(fx_title.playing()){
    fx_title.stop()
  } else if(fx_dye.playing()){
    fx_dye.stop()
  }
}

setSongVolume(vol){
  if(this.currentSong === OST1){
    fx_ost1.setVolume(vol)
  } else if(this.currentSong === OST2){
    fx_ost2.setVolume(vol)
  } else if(this.currentSong === OST3){
    fx_ost3.setVolume(vol)
  } else if(this.currentSong === OST4){
    fx_ost4.setVolume(vol)
  } else if(this.currentSong === OST5){
    fx_ost5.setVolume(vol)
  } else if(this.currentSong === MERCHANT){
    fx_merchantamb.setVolume(vol)
  } else if(this.currentSong === OSTTITLE){
    fx_title.setVolume(vol)
  }
}

playSong(song){
  this.currentSong = song
  this.stopSongs()
  if(song === OST1){
    console.log( 'playin 1' )
    fx_ost1.play()
  } else if(song === OST2){
    console.log( 'playin 2' )
    fx_ost2.play()
  } else if(song === OST3){
    console.log( 'playin 3' )
    fx_ost3.play()
  } else if(song === OST4){
    console.log( 'playin 4' )
    fx_ost4.play()
  } else if(song === OST5){
    console.log( 'playin 5' )
    fx_ost5.play()
  } else if(song === MERCHANT){
    console.log( 'playin merchant' )
    fx_merchantamb.play()
  } else if(song === OSTTITLE){
    console.log( 'playin title' )
    fx_title.play()
  } else if(song === OSTDEAD){
    console.log( 'playin dead' )
    fx_dye.play()
  }
}


// loop for game object
  handleGame(){
    this.handleAnnouncements()
    this.handleMusic()
    this.handleMoneyLabels()

    if(this.stage == TITLE){      

      this.drawTitle()
    } else if(this.stage == LOADING){

      player.mesh.visible = true
      
      this.drawLoading()

      if(this.stageTimer.time() > this.loadTime){
        this.stage = PLAYING
        // document.getElementById("stage-info").innerHTML = ""
      }

    } else if(this.stage == PLAYING){

      this.drawPlaying()
    } else if(this.stage == ENDING){
      
      // stop!
      if(this.musicEnabled){
        this.stopSongs()
      }

      this.drawEnding()

      if(this.stageTimer.time() > this.loadTime){
        this.stage = GAMEOVER
        this.announcement("GAME OVER")
        this.stageTimer.reset()

        // grabs name, level, score and posts em        
        postScore()
        this.scores = false
        setScores()
      }

    } else if(this.stage == GAMEOVER) {

      // ended
      // this actually doesnt do anything
      // this.drawGameover()      
  
      // if(this.scores){
      //   // flag this so we dont ask twice
      //   showScores(this.scores)
      // }

      if(this.stageTimer.time() > this.loadTime && !this.readyToStartGame ){

        // use readyTo to flag this so it only happens once
        this.clearAnnouncements()
        this.cleanGame()
      }
    } else if(this.stage == DEMO){
      this.drawPlaying()
    }

    // 'stars'
    duster.animation()
    pduster.animation()
    p2duster.animation()

    // spin that plane baby
    this.entryPlane.animation()
  }

  drawFlicker(){
    if(this.flickerTimer.time() > 120){
      this.flickerTimer.reset()
      let roll = Math.random()
      if(roll > 0.9){
        // this.setBackgroundColor(143,178,255)
        this.setBackgroundColor( Math.floor(this.backgroundColor[0] * 1.02), Math.floor(this.backgroundColor[1] * 1.01), Math.floor(this.backgroundColor[2] * 1.03) )
      } else if(roll > 0.8){
        // this.setBackgroundColor(140,180,255)
        this.setBackgroundColor( this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2] )
      } else if(roll > 0.3){
        // this.setBackgroundColor(138,176,252)
        this.setBackgroundColor( Math.floor(this.backgroundColor[0] * 0.982), Math.floor(this.backgroundColor[1] * 0.981), Math.floor(this.backgroundColor[2] * 0.983) )
      }
    }
  }


  intenseFlicker(){
    if(this.flickerTimer.time() > 120){
      this.flickerTimer.reset()
      let roll = Math.random()
      if(roll > 0.9){
        this.setBackgroundColor(143,170,255)

      } else if(roll > 0.8){
        this.setBackgroundColor(140,180,255)
      } else if(roll > 0.3){
        // this.setBackgroundColor(70,90,123)  
        this.setBackgroundColor(138,166,245)

      } else {
        // this.setBackgroundColor(32,40,64)  
        this.setBackgroundColor(132,160,238)
      }
   
    }
  }

  drawTitle(){
    // if we finished fadhing to a color, stop all that fadin
    if(isWithin(this.backgroundColor[0], this.roundColor[0], 5) && isWithin(this.backgroundColor[1], this.roundColor[1], 5) && isWithin(this.backgroundColor[2], this.roundColor[2], 5)){
      this.lastRoundColor[0] = this.roundColor[0]
      this.lastRoundColor[1] = this.roundColor[1]
      this.lastRoundColor[2] = this.roundColor[2]

      this.setBackgroundColor( this.roundColor[0],this.roundColor[1],this.roundColor[2] )
    } else {
      this.fadeBackgroundToward()
    }


    // waver the actual bg color a bit
    // this.drawFlicker()

    if( ( game.nameEntry == NONAME) && checkSoundsLoaded() ){

      let attractTimeLimit = this.attractStage != READY ? 8000 : 4000
      if(this.attractTimer.time() > attractTimeLimit){
        this.attractTimer.reset()
        this.attractStage += 1

        this.roundColor = [140,180,255]
        this.roundColor = [Math.floor( Math.random() * 255 ), Math.floor( Math.random() * 255 ), Math.floor( Math.random() * 255 )]

        if(this.attractStage > 4){
          this.attractStage = 0
        }
        console.log( 'attarct ', this.attractStage )

        // clean up everything
        this.hideAttract()
      }

       if(this.attractStage == LOGO) {

        document.getElementById("fog-logo").classList.remove("hidden")

      } else if(this.attractStage == SCORES){
        if(this.scores && this.scores.length > 0){
          showScores(this.scores)
        }

        document.getElementById("scores").classList.add("score-scroll")
      } else if(this.attractStage == READY) {
        this.announcement("PRESS SPACEBAR")
      } else if(this.attractStage == LOGO2) {

        document.getElementById("fog-logo2").classList.remove("hidden")
      } else if(this.attractStage == DEMO){

        if(!this.demo){
          let selectedDemo = Math.floor( Math.random() * 10 )
          // selectedDemo = 9
          let characters = []
          player.mesh.visible = true

          console.log( 'selecting new demo', selectedDemo )

          if(selectedDemo == 0){
            console.log( 'picked 0' )
            characters.push(player)

            let enemy1 = this.addEnemy(KNOWLOCTA)
            scene.add(enemy1.mesh)
            characters.push(enemy1)
            let enemy2 = this.addEnemy(KNOWLOCTA)
            scene.add(enemy2.mesh)
            characters.push(enemy2)

            let event = new Event(0, 600, 0.5, 0.5)
            let event2 = new Event(0, 2000, -0.8, 0.8)
            let event3 = new Event(1, 3000, 0, 0)
            let event4 = new Event(2, 6000, 0.1, 0.1)
            let event5 = new Event(0, 4000, -0.8, -0.8)
            let event6 = new Event(0, 6000, 0.8, 0.8)
            let event7 = new Event(1, 7000, -0.1, -0.1)
            let event8 = new Event(2, 7000, 0.6, 0.6)

            this.demo = new Demo(characters, 8000, [event, event2, event3, event4, event5, event6, event7, event8])
            this.enemies = [enemy1, enemy2]
          } else if(selectedDemo == 1){
            characters.push(player)
            let enemy1 = this.addEnemy(STICK)
            scene.add(enemy1.mesh)
            characters.push(enemy1)
            let enemy2 = this.addEnemy(KNOWLOCTA)
            scene.add(enemy2.mesh)
            characters.push(enemy2)
            let enemy3 = this.addEnemy(SPHERE)
            scene.add(enemy3.mesh)
            characters.push(enemy3)
            let enemy4 = this.addEnemy(HEALCUBE)
            scene.add(enemy4.mesh)
            characters.push(enemy4)
            let enemy5 = this.addEnemy(CIRCLE)
            scene.add(enemy5.mesh)
            characters.push(enemy5)
            let enemy6 = this.addEnemy(KNOWLOCTA)
            scene.add(enemy6.mesh)
            characters.push(enemy6)

            let event = new Event(0, 100, 0, 0)

            let event2 = new Event(1, 100, -0.2, 0)
            let event3 = new Event(1, 1000, -0.2, 0.4)
            let event4 = new Event(1, 3000, -0.2, 0.8)
            let event5 = new Event(1, 6000, -0.2, -0.8)
            
            let event6 = new Event(2, 100, -0.4, 0)
            let event7 = new Event(2, 1000, -0.4, 0.4)
            let event8 = new Event(2, 3000, -0.4, 0.2)
            let event9 = new Event(2, 6000, -0.4, -0.2)
            
            let event10 = new Event(3, 100, 0.2, 0)
            let event11 = new Event(3, 1000, 0.2, 0.4)
            let event12 = new Event(3, 3000, 0.2, 0.4)
            let event13 = new Event(3, 6000, 0.2, -0.4)
            
            let event14 = new Event(4, 100, 0.4, 0)
            let event15 = new Event(4, 1000, 0.4, 0.4)
            let event16 = new Event(4, 3000, 0.4, 0.8)
            let event17 = new Event(4, 6000, 0.4, -0.8)
            
            let event18 = new Event(5, 100, 0.6, 0)
            let event19 = new Event(5, 1000, 0.6, 0.4)
            let event20 = new Event(5, 3000, 0.6, 0.6)
            let event21 = new Event(5, 6000, 0.6, -0.2)
            
            let event22 = new Event(6, 100, -0.6, 0)
            let event23 = new Event(6, 1000, -0.6, 0.8)
            let event24 = new Event(6, 3000, -0.6, 0.2)
            let event25 = new Event(6, 6000, -0.6, -0.2)

            let event26 = new Event(0, 7000, 0.5, 0.5)
            let event27 = new Event(0, 8000, 0.5, -0.5)

            let event28 = new Event(0, 3000, 0, 0.5)
            let event29 = new Event(0, 4000, 0.5, -0.5)
            let event30 = new Event(0, 6000, -0.5, 0.5)

            this.demo = new Demo(characters, 8000, [event,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11,event12,event13,event14,event15,event16,event17,event18,event19,event20,event21,event22,event23,event24,event25,event26,event27,event28,event29,event30])
            this.enemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6]
          } else if(selectedDemo == 2) {

            let enemy1 = this.addEnemy(STICK)
            scene.add(enemy1.mesh)
            characters.push(enemy1)
            let enemy2 = this.addEnemy(STICK)
            scene.add(enemy2.mesh)
            characters.push(enemy2)
            let enemy3 = this.addEnemy(STICK)
            scene.add(enemy3.mesh)
            characters.push(enemy3)
            let enemy4 = this.addEnemy(STICK)
            scene.add(enemy4.mesh)
            characters.push(enemy4)

            let event = new Event(0, 100, 0, 0)
            let event1 = new Event(1, 100, 0, 0)
            let event2 = new Event(2, 100, 0, 0)
            let event3 = new Event(3, 100, 0, 0)
            let event4 = new Event(0, 1000, 0.3, 0.6)
            let event5 = new Event(1, 1000, 0.3, 0.6)
            let event6 = new Event(2, 1000, 0.3, 0.6)
            let event7 = new Event(3, 1000, 0.3, 0.6)
            let event8 = new Event(0, 5000, 0.8, -0.6)
            let event9 = new Event(1, 5000, 0.8, -0.6)
            let event10 = new Event(2, 5000, 0.8, -0.6)
            let event11 = new Event(3, 5000, 0.8, -0.6)
            let event12 = new Event(0, 8000, -0.3, 0.2)
            let event13 = new Event(1, 8000, -0.3, 0.2)
            let event14 = new Event(2, 8000, -0.3, 0.2)
            let event15 = new Event(3, 8000, -0.3, 0.2)
            this.demo = new Demo(characters, 8000, [event,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11,event12,event13,event14,event15])
            this.enemies = [enemy1, enemy2, enemy3, enemy4]
          
          } else if(selectedDemo == 3) {
            this.roundColor = [0,0,0]
            this.roundCount = 30

            // temp set this so we can just instantly do our shit
            this.corruptingTime = 100

            let enemy1 = this.addEnemy(STICK, -3, 2)
            scene.add(enemy1.mesh)
            enemy1.inScene = true
            characters.push(enemy1)
            
            let enemy2 = this.addEnemy(SPHERE, -3, 1)
            scene.add(enemy2.mesh)
            enemy2.inScene = true
            characters.push(enemy2)
            
            let enemy3 = this.addEnemy(CIRCLE, -3, 0)
            scene.add(enemy3.mesh)
            enemy3.inScene = true
            characters.push(enemy3)
            
            let enemy4 = this.addEnemy(HEALCUBE, -3, -1)
            scene.add(enemy4.mesh)
            enemy4.inScene = true
            characters.push(enemy4)
            
            let enemy5 = this.addEnemy(KNOWLOCTA, -3, -2)
            scene.add(enemy5.mesh)
            enemy5.inScene = true
            characters.push(enemy5)
            

            // random enemy types for ex corrupt demos
            let enemy6 = this.addEnemy( Math.floor( Math.random() * 5 ) , 3 , 2)
            scene.add(enemy6.mesh)
            enemy6.inScene = true
            characters.push(enemy6)
            
            enemy6.startCorrupting()
            let enemy7 = this.addEnemy( Math.floor( Math.random() * 5 ) , 3 , 1)
            scene.add(enemy7.mesh)
            enemy7.inScene = true
            characters.push(enemy7)
            
            enemy6.startCorrupting()
            enemy7.corrupted = true
            enemy7.godCorrupt()
            let enemy8 = this.addEnemy( Math.floor( Math.random() * 5 ) , 3 , 0)
            scene.add(enemy8.mesh)
            enemy8.inScene = true
            characters.push(enemy8)
            
            enemy6.startCorrupting()
            enemy8.corrupted = true
            enemy8.greenCorrupt()
            let enemy9 = this.addEnemy( Math.floor( Math.random() * 5 ) , 3 , -1)
            scene.add(enemy9.mesh)
            enemy9.inScene = true
            characters.push(enemy9)
            
            enemy6.startCorrupting()
            enemy9.corrupted = true
            enemy9.hitmanCorrupt()
            // let enemy10 = this.addEnemy(KNOWLOCTA)
            // scene.add(enemy10.mesh)
            // characters.push(enemy10)
            // enemy10.corrupted = true
            // enemy10.corrupt()

            let event00 = new Event(9, 0, 0, -1)
            let event01 = new Event(9, 2000, -1, -2.8)
            let event02 = new Event(9, 4000, 1, -2.8)
            let event03 = new Event(9, 8000, -1, -2.8)

            let event0 = new Event(0, 6000, 0, 0)
            let event1 = new Event(1, 6000, 1, 0)
            let event2 = new Event(2, 6000, 2, 0)
            let event3 = new Event(3, 6000, 3, 0)
            let event4 = new Event(4, 6000, 4, 0)
            let event5 = new Event(5, 6000, -1, 0)
            let event6 = new Event(6, 6000, -2, 0)
            let event7 = new Event(7, 6000, -3, 0)
            let event8 = new Event(8, 6000, -4, 0)

            let event9 = new Event(0, 8000, -3, 3)
            let event10 = new Event(1, 8000, -3, 2)
            let event11 = new Event(2, 8000, -3, 1)
            let event12 = new Event(3, 8000, -3, 0)
            let event13 = new Event(4, 8000, -3, -1)
            let event14 = new Event(5, 8000, 3, 0)
            let event15 = new Event(6, 8000, 3, 1)
            let event16 = new Event(7, 8000, 3, 2)
            let event17 = new Event(8, 8000, 3, 3)

            characters.push(player)
            player.mesh.visible = true

            this.demo = new Demo(characters, 8000, [event00,event01,event02,event03, event0,event1,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11,event12,event13,event14,event15,event16,event17])
            this.enemies = [enemy1,enemy2,enemy3,enemy4,enemy5,enemy6,enemy7,enemy8,enemy9]
          } else if(selectedDemo == 4){
            // STICK DEMO

            this.roundColor = [255,255,255]

            // temp set this so we can just instantly do our shit
            this.corruptingTime = 100

            let enemy1 = this.addEnemy(STICK, -3, 0)
            scene.add(enemy1.mesh)
            enemy1.inScene = true
            characters.push(enemy1)
            
            player.mesh.position.set(3,0,0)
            characters.push(player)
            player.mesh.visible = true

            let event00 = new Event(1, 0, 0, 0, "EAT STICKS TO INCREASE MONEY")
            let event02 = new Event(1, 4000, -3, 0)

            this.demo = new Demo(characters, 8000, [event00,event02])
            this.enemies = [enemy1] 
          } else if(selectedDemo == 5){
            // knowlocta DEMO
            this.roundColor = [255,255,255]

            // temp set this so we can just instantly do our shit
            // this.corruptingTime = 100

            let enemy1 = this.addEnemy(KNOWLOCTA, -3, 0)
            scene.add(enemy1.mesh)
            enemy1.inScene = true
            characters.push(enemy1)

            let enemy2 = this.addEnemy(KNOWLOCTA, -3, 0)
            scene.add(enemy2.mesh)
            enemy2.inScene = true
            characters.push(enemy2)
            
            let enemy3 = this.addEnemy(KNOWLOCTA, -3, 0)
            scene.add(enemy3.mesh)
            enemy3.inScene = true
            characters.push(enemy3)
            
            let enemy4 = this.addEnemy(KNOWLOCTA, -3, 0)
            scene.add(enemy4.mesh)
            enemy4.inScene = true
            characters.push(enemy4)
            
            let enemy5 = this.addEnemy(KNOWLOCTA, -3, 0)
            scene.add(enemy5.mesh)
            enemy5.inScene = true
            characters.push(enemy5)

            player.mesh.position.set(3,0,0)
            characters.push(player)
            player.mesh.visible = true

            let event00 = new Event(1, 0, 0, 0, "EAT PURPLES TO GAIN KNOWLEDGE")
            let event01 = new Event(0, 4000, 3, 0, "KNOWLEDGE INCREASES LEVEL")
            let event02 = new Event(1, 5000, 3, 0)
            let event03 = new Event(2, 5000, 3, 0)
            let event04 = new Event(3, 6000, 3, 0)
            let event05 = new Event(4, 6000, 3, 0)
            // player
            let event06 = new Event(5, 3000, 2, 0)

            this.demo = new Demo(characters, 8000, [event00,event01,event02,event03,event04,event05,event06])
            this.enemies = [enemy1,enemy2,enemy3,enemy4,enemy5] 
          } else if(selectedDemo == 6){
            // healing DEMO
            this.roundColor = [255,255,255]

            // temp set this so we can just instantly do our shit
            // this.corruptingTime = 100

            let enemy1 = this.addEnemy(HEALCUBE, -3, 2)
            scene.add(enemy1.mesh)
            enemy1.inScene = true
            characters.push(enemy1)

            let enemy2 = this.addEnemy(SPHERE, -3, -2)
            scene.add(enemy2.mesh)
            enemy2.inScene = true
            characters.push(enemy2)

            player.mesh.position.set(3,0,0)
            characters.push(player)
            player.mesh.visible = true
            player.health = 20

            let event00 = new Event(2, 0, 2, 0, "EAT SPHERES TO GAIN HEALTH")
            let event01 = new Event(2, 4000, -3, -2)
            let event02 = new Event(2, 5000, -3, 2, "EAT BLUE CUBES TO REFILL HEALTH")

            this.demo = new Demo(characters, 8000, [event00,event01,event02])
            this.enemies = [enemy1,enemy2] 
          } else if(selectedDemo == 7){
            // eating DEMO
            this.roundColor = [255,255,255]

            // temp set this so we can just instantly do our shit
            // this.corruptingTime = 100

            let enemy1 = this.addEnemy(STICK, -4, 2)
            scene.add(enemy1.mesh)
            enemy1.inScene = true
            characters.push(enemy1)
            let enemy2 = this.addEnemy(CIRCLE, -4, 1)
            scene.add(enemy2.mesh)
            enemy2.inScene = true
            characters.push(enemy2)
            let enemy3 = this.addEnemy(HEALCUBE, -4, 0)
            scene.add(enemy3.mesh)
            enemy3.inScene = true
            characters.push(enemy3)
            let enemy4 = this.addEnemy(SPHERE, -4, -1)
            scene.add(enemy4.mesh)
            enemy4.inScene = true
            characters.push(enemy4)


            let enemy5 = this.addEnemy(STICK, 4, 2)
            scene.add(enemy5.mesh)
            enemy5.inScene = true
            characters.push(enemy5)
            let enemy6 = this.addEnemy(CIRCLE, 4, 1)
            scene.add(enemy6.mesh)
            enemy6.inScene = true
            characters.push(enemy6)
            let enemy7 = this.addEnemy(HEALCUBE, 4, 0)
            scene.add(enemy7.mesh)
            enemy7.inScene = true
            characters.push(enemy7)
            let enemy8 = this.addEnemy(SPHERE, 4, -1)
            scene.add(enemy8.mesh)
            enemy8.inScene = true
            characters.push(enemy8)


            player.mesh.position.set(0,0,0)
            characters.push(player)
            player.mesh.visible = true
            player.power = 0

            let event00 = new Event(8, 0, 0, 0, "EAT SHAPES TO GAIN ENERGY")
            let event01 = new Event(8, 2000, -4, 2)
            let event02 = new Event(8, 4000, -4, -2)

            let event03 = new Event(8, 5000, 4, -2, "USE ENERGY TO ACTIVATE POWERS")
            let event04 = new Event(8, 7000, 4, 2)

            this.demo = new Demo(characters, 8000, [event00,event01,event02,event03,event04])
            this.enemies = [enemy1,enemy2,enemy3,enemy4,enemy5,enemy6,enemy7,enemy8,] 
          } else if(selectedDemo == 8){
            // sword DEMO
            this.roundColor = [255,255,255]

            // temp set this so we can just instantly do our shit
            this.corruptingTime = 100

            let enemy1 = this.addEnemy(HEALCUBE, -3, 0)
            scene.add(enemy1.mesh)
            enemy1.inScene = true
            characters.push(enemy1)
            let enemy2 = this.addEnemy(HEALCUBE, -1, 0)
            scene.add(enemy2.mesh)
            enemy2.inScene = true
            characters.push(enemy2)
            let enemy3 = this.addEnemy(HEALCUBE, 1, 0)
            scene.add(enemy3.mesh)
            enemy3.inScene = true
            characters.push(enemy3)
            
            enemy2.startCorrupting()
            enemy1.startCorrupting()
            enemy1.corrupted = true
            enemy1.godCorrupt()

            player.mesh.position.set(0,3,0)
            characters.push(player)
            player.mesh.visible = true
            player.power = 100

            // quiet
            player.levelUp(true)

            let event00 = new Event(3, 0, 3, 0, "AVOID CORRUPTED SHAPES TO SURVIVE")
            let event01 = new Event(3, 2000, 1, 0)
            let event02 = new Event(3, 4000, -1, 0, false, DEMOSWORD, true)

            let event03 = new Event(3, 6000, -3, 0, "USE POWERS TO KILL CORRUPTED SHAPES")
            let event04 = new Event(3, 7000, 0, 0, false, DEMOSWORD, false)

            this.demo = new Demo(characters, 8000, [event00,event01,event02,event03,event04])
            this.enemies = [enemy1,enemy2,enemy3] 
          } else if(selectedDemo == 9){
            // circle DEMO
            this.roundColor = [255,255,255]

            // temp set this so we can just instantly do our shit
            // this.corruptingTime = 100
            
            // so enemies are strong enough
            // game.roundCount = 100
            // game.enemyHealthFactor = game.calcEnemyHealthFactor()


            let enemy1 = this.addEnemy(CIRCLE, -3, 3)
            scene.add(enemy1.mesh)
            enemy1.inScene = true
            characters.push(enemy1)
            let enemy2 = this.addEnemy(STICK, -3, -3)
            scene.add(enemy2.mesh)
            enemy2.inScene = true
            characters.push(enemy2)
            let enemy3 = this.addEnemy(HEALCUBE, 3, 3)
            scene.add(enemy3.mesh)
            enemy3.inScene = true
            characters.push(enemy3)
            let enemy4 = this.addEnemy(KNOWLOCTA, 3, -3)
            scene.add(enemy4.mesh)
            enemy4.inScene = true
            characters.push(enemy4)
            
            enemy1.startCorrupting()
            enemy2.startCorrupting()
            enemy3.startCorrupting()
            enemy4.startCorrupting()

            player.mesh.position.set(0,0,0)
            characters.push(player)
            player.mesh.visible = true
            player.power = 100

            // quiet
            player.levelUp(true)
            player.levelUp(true)
            player.levelUp(true)

            let event00 = new Event(4, 0, 0, 0, "ACTIVATE KILLING CIRCLE TO PROTECT")
            let event01 = new Event(4, 2000, -3, 0, false, DEMOCIRCLE, true)
            let event02 = new Event(4, 3000, -3, 0, false, DEMOCIRCLE, false)
            let event03 = new Event(4, 4000, 3, 0)
            let event04 = new Event(4, 6000, 2, 0)
            let event05 = new Event(4, 7000, 0, 0, false, DEMOCIRCLE, true)

            this.demo = new Demo(characters, 8000, [event00,event01,event02,event03,event04,event05])
            this.enemies = [enemy1,enemy2,enemy3,enemy4] 
          }
        }

        this.demo.handleDemo()

        // handle enemys and whatnot
        this.drawPlaying()

      }
    }
  }

  hideAttract(){
    document.getElementById("scores").classList.remove("score-scroll")
    document.getElementById("scores").innerHTML = ""
    document.getElementById("fog-logo").classList.add("hidden")
    document.getElementById("fog-logo2").classList.add("hidden")
    this.clearAnnouncements()
    if(this.demo){
      this.demo.cleanDemo()
      this.demo = null
    }
  }

  drawLoading(){
    // this.announcement("ROUND " + this.roundCount +  " LOADING...")
    duster.loadingAnimation()
    pduster.loadingAnimation()
    p2duster.loadingAnimation()

    // fade toward blac
    // this.fadeBackgroundToward(this.roundColor[0], this.roundColor[1], this.roundColor[2], 2)
    this.fadeBackgroundToward()
  }

  randomBombs(){
    if(this.randomBombsTimer.time() > 3000){
      // flag so we know when we won round during atb
      this.randomBombing = true

      this.announcement("ENJOY THE BOMBS")
      this.randomBombsTimer.reset()

      let numBombs = Math.floor(Math.random() * 8 * this.roundCount)
      // minimum num of bombs is roundcount
      numBombs = Math.max(numBombs, this.roundCount)
      let x,y
      let bomb
      for(var i=0; i<numBombs; i++){
        // hurts player too
        bomb = new Bomb([randomInRange(0,255),randomInRange(0,255),randomInRange(0,255)], 3, true)
        x = Math.random() * 6 - 3
        y = Math.random() * 6 - 3

        bomb.mesh.position.set(x, y, 0)
        scene.add( bomb.mesh )
        this.bombs.push( bomb )
      }
      
    }
  }

  bonusPurps(){
    let num = 2 + Math.floor( Math.random() * 2)

    let enemy
    for(var i=0; i<num; i++){
      enemy = this.addEnemy(KNOWLOCTA)
      this.enemies[enemy.id] = enemy
      scene.add(this.enemies[enemy.id].mesh)
      this.enemies[enemy.id].inScene = true
    } 
  }

  drawPlaying(){

    if(this.roundCount >= 40){
      this.drawFlicker()
    }


    if(this.casino){
      // game phases are handled internally
      this.casino.handlePlay()

      if(this.casino.phase == DONE){
        this.casino = null
      }
    }

    if(this.bombs.length > 0){
      this.handleBombs()
    }

    if(this.friends.length > 0){
      this.handleFriends()
    }
    
    if(this.smokes.length > 0){
      this.handleSmokes()
    }

    if(player.bombsTimer.time() > player.bombsInterval){
      player.bombsTimer.reset()
      player.numBombs = incInRange(player.numBombs, 1, 0, player.numBombsMax)
    }

    if(player.smokesTimer.time() > player.smokesInterval){
      player.smokesTimer.reset()
      player.numSmokes = incInRange(player.numSmokes, 1, 0, player.numSmokesMax)
    }

    this.handleEnemies()

    if(this.merchant){
      this.handleMerchant()
    }

    if(this.attractStage == DEMO){
      // demoo
      player.handleMovement()
    } else {
      // regular round

      if(!this.enemyTimer.running){
        this.enemyTimer.start()
      }

      let remaining = this.enemyTimer.time()
      this.drawTimer(remaining)

      this.drawRound(this.roundCount)

      // if enemy timer finishesa, add-a more-a enemies, wa-haaaa!
      if(remaining == 0 ){
        this.enemyTimer.reset()

        // console.log( 'ene max is', this.enemyMax )
        // console.log( 'generating ene ', numEnemies )

        // console.log( 'wowww', this.actualNumEnemies(), this.enemies[0] )
        if(this.actualNumEnemies() < this.enemyMax*4){
          // dont add more enemies if we have 4x the roundmax already out
          this.generateEnemies( this.numEnemies(), true )
          document.getElementById("timer").classList.remove("invis")
        } else {
          document.getElementById("timer").classList.add("invis")
        }
      }

      if(game.stage == PLAYING && player.lifecycle == ALIVE){
        // stop moving if we DEAD
        player.handleMovement()
      }

      //  if everybody's dead...
      if( this.everybodyDead() ){
        this.cleanEnemies()
        this.nextRound()
      }
    }

    player.animation()
    this.drawUI()
  }

  drawEnding(){
    duster.loadingAnimation()
    if(!this.animTimer.running){
      this.animTimer.start()
    }

    if(this.animTimer.time() > 20){
      this.animTimer.reset()
      // fade to red
      // this.backgroundColor[0] = 
      if(this.backgroundColor[0] < 255){
        this.setBackgroundColor(this.backgroundColor[0] + 2,this.backgroundColor[1],this.backgroundColor[2])
      }
    }
  }

  // drawGameover(){

  // }

  cleanGame(){
    console.log( 'cleaning game' )
    this.cleanEnemies()
    this.cleanBombs()
    this.cleanSmokes()
    this.cleanFriends()
    this.setDefaultGameValues()

    player.removeNow()
    player = new Player([0,88,255])


    // player.deadSprite.remove()
    // player.lifecyle = ALIVE
    // player.defaultPlayerValues()

  }

  cleanEnemies(){
    let enemyId
    let enemiesKeys = k(this.enemies)
    for(var i=0; i<enemiesKeys.length; i++){

      enemyId = enemiesKeys[i]
      if(this.enemies[enemyId]){
        // do this so we dont make a sprite
        this.enemies[enemyId].lifecycle = ALIVE
        this.enemies[enemyId].removeSprite()
        this.enemies[enemyId].remove()
        delete this.enemies[enemyId]
      }

      if(this.merchant){
        // bye bye!
        this.merchant.closeShop()
      }

      if(this.friends.length > 0){
        for(var x=0; x<this.friends.length; x++){
          if(this.friends[x].health <= 0){
            this.friends[x].remove()
          }
        }

      }
    }
  }

  cleanBombs(){
    for(var i=0; i<this.bombs.length; i++){
      if(this.bombs[i]){
        // do this so we dont make a sprite
        this.bombs[i].remove()
        delete this.bombs[i]
      }
    }
    
    this.bombs = []
  }

  cleanSmokes(){
    for(var i=0; i<this.smokes.length; i++){
      if(this.smokes[i]){
        // do this so we dont make a sprite
        this.smokes[i].remove()
        delete this.smokes[i]
      }
    }

    this.smokes = []
  }

  cleanFriends(){
    for(var i=0; i<this.friends.length; i++){
      if(this.friends[i]){
        // do this so we dont make a sprite
        this.friends[i].remove()
        delete this.friends[i]
      }

      // get rid of ui element
      this.removeFriendIcon(i)
    }

    this.friends = []
  }

  changeScore(change){

    this.scoreLight = true
    this.scoreLightTimer.reset()
    document.getElementById("score").classList.add("light")

    this.score += change
  }

  changePowerMax(newpower){
    // this is for the player
    this.powerMax = newpower
    this.powerMaxMag = Math.pow( 2, newpower/10 )
     document.getElementById("power").max = newpower
  }

  drawUI(){
    this.drawFriendIcons()
    this.drawScore()
    this.drawLevel()
    this.drawPower()
    this.drawHealth()
    this.drawKnowledge()
    this.drawBombs()
    this.drawSmokes()

    this.handleScoreLight()
  }

  addFriendIcon(name, index, color){
    let container = document.createElement("div")
    container.classList.add("bar-icon")
    container.style.backgroundColor = color

    let nameEle = document.createElement("div")
    nameEle.classList.add("friend-name")
    let meterEle = document.createElement("div")
    meterEle.classList.add("friend-meter")
    let meter = document.createElement("progress")
    meter.id = "friend" + index
    meterEle.appendChild(meter)
    let healthEle = document.createElement("div")
    healthEle.classList.add("friend-health")
    let health = document.createElement("progress")
    health.classList.add("friend-health")
    health.max = 50
    health.id = "friend-health" + index
    healthEle.appendChild(health)

    container.appendChild(nameEle)
    container.appendChild(meterEle)
    container.appendChild(healthEle)
    document.getElementById("friend-info").appendChild(container)
  }

  removeFriendIcon(index){
    let friendContainer = document.getElementById("friend"+index).parentNode.parentNode
    friendContainer.parentNode.removeChild( friendContainer )
  }

  changeFriendIconPowerMax(index, max){
    document.getElementById("friend"+index).max = max
  }

  drawFriendIcons(){
    let color
    for(var i=0; i<this.friends.length; i++){

      if( this.friends[i] ){
        if( !document.getElementById("friend"+i) ){
          // check if icon exists for friend, if not create that ho
          let r,g,b
          r = this.friends[i].baseColor[0]
          g = this.friends[i].baseColor[1]
          b = this.friends[i].baseColor[2]
          color = rgbToHex(r,g,b)
          game.addFriendIcon("friend", i, color)
        }

        document.getElementById("friend" + i).value = this.friends[i].power  
        document.getElementById("friend-health" + i).value = this.friends[i].health
      }
      
    }
  }

  drawTimer(time){
    document.getElementById("timer").innerHTML = time
  }

  drawRound(roundCount){
    document.getElementById("roundCount").innerHTML = roundCount
  }

  drawScore(){
    document.getElementById("score").innerHTML = this.score
  }

  drawLevel(){
    document.getElementById("level").innerHTML = player.level
  }

  drawPower(){
    document.getElementById("power").value = player.power
  }

  drawHealth(){
    document.getElementById("health").value = player.health
  }

  drawKnowledge(){
    document.getElementById("knowledge").value = player.knowledge
  }

  drawBombs(){
    document.getElementById("bombs").innerHTML = "O".repeat( player.numBombs )
  }

  drawSmokes(){
    document.getElementById("smokes").innerHTML = "~".repeat( player.numSmokes )
  }

  drawFriendsAvailble(){
    document.getElementById("friends-available").innerHTML = "F".repeat( player.friendsAvailable )
  }

  handleScoreLight(){
    if(this.scoreLight && this.scoreLightTimer.time() > 300){
      this.scoreLight = false
      document.getElementById("score").classList.remove("light")
    }
  }

  setBackgroundColor(r,g,b){
    // this.mesh.material.color.setRGB(r,g,b)
    this.backgroundColor[0] = r
    this.backgroundColor[1] = g
    this.backgroundColor[2] = b
    let hex = rgbToHex(r,g,b)
    scene.background = new THREE.Color( hex )
  }

  fadeBackgroundToward(){
    if(!this.animTimer.running){
      this.animTimer.start()
    }

    // one step for each animinterval
    let animinterval = 5
    let numSteps = this.loadTime / animinterval / 3.361344

    // every 5 ms 
    if(this.animTimer.time() > 5){
      this.animTimer.reset()

      let r,g,b
      r = Math.floor( lerp( this.lastRoundColor[0], this.roundColor[0], this.u ) )
      g = Math.floor( lerp( this.lastRoundColor[1], this.roundColor[1], this.u ) )
      b = Math.floor( lerp( this.lastRoundColor[2], this.roundColor[2], this.u ) )
      this.setBackgroundColor(r,g,b)

      let step = 1.0/numSteps
      this.u += step


      // done
      if(this.u > 1.0){
        this.u = 0
      }
    }
  }

  knowledgeSound(){
    [fx_eatpurple1, fx_eatpurple2, fx_eatpurple3][ Math.floor( Math.random() * 3 ) ].play()
  }

  moneySound(){
    // [fx_money41, fx_money42][ Math.floor( Math.random() * 2 ) ].play()
    fx_money.play()
  }

  eatSound(){
    [fx_eat1, fx_eat2, fx_eat3][ Math.floor( Math.random() * 3 ) ].play()
  }

  bossGrowSound(){
    [fx_bossgrow1, fx_bossgrow2, fx_bossgrow3][ Math.floor( Math.random() * 3 ) ].play()
  }

  // faddenemy
  addEnemy(type=null, posx=null, posy=null){
    let killer = new Enemy([0,88,255*Math.round(Math.random())], type);

    if( isVal(posx) ){
      killer.mesh.position.x = posx
    } else {
      killer.mesh.position.x = Math.random()*4*this.randomSign()
    }

    if( isVal(posy) ){
      killer.mesh.position.y = posy
    } else {
      killer.mesh.position.y = Math.random()*4*this.randomSign()
    }

    return killer
  }

  generateEnemies(num, back=false){
    for(var i=0;i<num; i++){
      let enemy = this.addEnemy()
      if(back){
        // enemies start far away
        enemy.mesh.position.z = -20
      }
      
      this.enemies[enemy.id] = enemy
    }

    if(this.roundCount >= 40){
      let numBosses = (this.roundCount - 39) * 2

      for(var i=0; i<numBosses; i++){ 
        // add a boss for each round above 40
        console.log( 'adding boss ' )
        let enemy = this.addEnemy(BOSS)

        if(back){
          enemy.mesh.position.z = -3
        }

        this.enemies[ enemy.id ] = enemy
        fx_bossenter.play()
      }
    }

    let enemiesKeys = k(this.enemies)
    let enemyId
    for(var i=0; i<enemiesKeys.length; i++){
      // run through and actually add new meshes
      enemyId = enemiesKeys[i]
      if(this.enemies[enemyId] && !this.enemies[enemyId].inScene){
        scene.add(this.enemies[enemyId].mesh)
        this.enemies[enemyId].inScene = true
        
        // no swords until 10, after round 256, every enemy has a sword
        if(this.roundCount >= 10 && Math.random() > this.roundCount/-256 + 1 ){
          // enemy sword wow!
          this.enemies[enemyId].addSword(0.2 * (1 + (this.roundCount-1) / 8 ) )
          this.enemies[enemyId].startSword()
        }
      }
    }

  }

  handleBombs(){
    let bomb
    let deletedSomeone
    for(var i=0; i<this.bombs.length; i++){
      bomb = this.bombs[i]
      if(bomb){
        bomb.animation()

        if(bomb.lifecycle == ALIVE ){
          // blowin up
          bomb.handleExplode()

        } else if(bomb.lifecycle == DYING){
          // you fadin out

          bomb.fadeOut()
        } else {
          // you dead
          bomb.remove()
          delete this.bombs[i]
          deletedSomeone = true
        }

      }
    }

    // strip nulls out once were done monkeying around above

    if(deletedSomeone){
      for(var i=0;i<this.bombs.length;i++){
        if(!this.bombs[i]){
          this.bombs.splice(i, 1)
        }
      }
    }
  }

  handleFriends(){
    let friend
    let deletedSomeone = false

    for(var i=0; i<this.friends.length; i++){
      friend = this.friends[i]
      if(friend){
        friend.animation()

        if(friend.lifecycle == ALIVE){
          friend.handleMovement()

          if(player.killingCircle && player.killingCircle.visible){
            // if a friend is in the killing circle, give a lil powe3r!
            let hit = friend.handleHit( player.killingCircleArea )
            if(hit){
              if(friend.rechargeTimer.time() > 60){
                friend.rechargeTimer.reset()
                // little bitta both
                friend.changePower(2)
                friend.changeHealth(2)
                // console.log( 'chare him to ', friend.power )

              }
            }
          }

        } else if(friend.lifecycle == DEAD){
          delete this.friends[i]
          deletedSomeone = true
        }
      }
    }

    if(deletedSomeone){
      // only if we did it :)
      for(var x=(this.friends.length-1);x>=0;x--){
        if(!this.friends[x]){
          this.removeFriendIcon(x)
          this.friends.splice(x, 1)
        }
      }
    }
  }

  handleSmokes(){
    let smoke, deletedSmoke
    for(var i=0; i<this.smokes.length; i++){
      smoke = this.smokes[i]
      if(smoke){

        if(smoke.bubbles.every( (bubble) => !bubble ) ){
          // if all bubs are done, kill it
          this.smokes[i] = null
          deletedSmoke = true
        } else {

          smoke.animation()
        }

      }
    }

    if(deletedSmoke){
      for(var i=0; i<this.smokes.length; i++){
        if(!this.smokes[i]){
          this.smokes.splice(i, 1)
        }
      }
    }
  }

  everybodyDead(){
    // need to flag rounds getting enemies so rounds dont just end instantly
    return k(this.enemies).every((enemyId) => this.enemies[enemyId].lifecycle == DEAD || this.enemies[enemyId].lifecycle == DYING)
  }

  showMoneyLabels(){
    this.showMoneyLabelState = SHOWING
  }

  hideMoneyLabels(){
    this.showMoneyLabelState = HIDING
  }

  handleMoneyLabels(){
    if(this.showMoneyLabelTimer.time() > 100){
      this.showMoneyLabelTimer.reset()
    
      if(this.showMoneyLabelState == SHOWING || this.showMoneyLabelState == HIDING){

        let enemy, eKeys
        eKeys = k(this.enemies)
        for(var i=0; i<eKeys.length; i++){
          enemy = this.enemies[ eKeys[i] ]
          if(enemy.moneyLabel){

            if(this.showMoneyLabelState == SHOWING && enemy.moneyLabel.material.opacity < 1){
              enemy.moneyLabel.material.opacity += 0.1
            } else if(this.showMoneyLabelState == HIDING && enemy.moneyLabel.material.opacity > 0){
              enemy.moneyLabel.material.opacity -= 0.1
            }
          }
        }

        if(player.moneyLabel){

          if(this.showMoneyLabelState == SHOWING && player.moneyLabel.material.opacity < 1){
            player.moneyLabel.material.opacity += 0.1
          } else if(this.showMoneyLabelState == HIDING && player.moneyLabel.material.opacity > 0){
            player.moneyLabel.material.opacity -= 0.1
          }
        }
      }
    }
  }

  handleEnemy(enemy){
    // MOVEMENT
    let enemyId = enemy.directionalLength

    // handle movement
    enemy.handleMovement()
    // draw other crap thats changing
    enemy.animation()

    if(this.bombs.length > 0){
      // if theres bombs, hannel em
      enemy.handleBombs()
    }

    // keep, getting some ghost kills on last place sword was out
    if(player.sword && player.sword.active && player.sword.mesh.visible){
      // if the swords out, get stabt
      enemy.handleSword()
    }

    if(this.smokes.length > 0){
      enemy.handleSmokes()
    }
    
    if(game.friends.length > 0){
      // if the friends out, get murdered
      enemy.handleFriends()
    }

    // enemy can hav sword    
    if(enemy.sword && enemy.sword.active && enemy.sword.mesh.visible){
      // if the swords out, stabt 2 you
      enemy.handleEnemySword()
    }

    if(enemy.contract){
      enemy.handleContract()
    }

    // LIFE/CORRUPTION
    // only sword/bombs/casino can hurt while corrupting
    if(enemy.lifecycle == ALIVE && !enemy.corrupted){

      let hitresult = enemy.handleHit(player)

      if(player.lifecycle == ALIVE && hitresult){

        if(enemy.healthTimer.time() > 60){
          // console.log( 'eneymy hit' )
          enemy.healthTimer.reset()

          if(player.topSpeed()){
            enemy.takeDamage(4+player.bonusDamage, EAT)
          } else {
            enemy.takeDamage(4, EAT)
          }

          // // // did dmg, slow playe ra bit
          // if(player.accx != 0){
          //   player.accx = player.accx+( -0.4*Math.sign(player.accx) )
          // }
          // if(player.accy != 0){
          //   player.accy = player.accy+( -0.4*Math.sign(player.accy) )
          // }
        }

        // start eating animation, which shuts itself off after timer
        player.eating = true
      }

      if(this.roundCount > 2 && enemy.lifecycle == ALIVE && this.corruptionTimer.time() > 1000) {
        // only need to handleCorruption if we're not dying
        this.corruptionTimer.reset()

        // multiply by this teeny tiny so we (mostly) get back something within the realm of 0-1
        // let corruption_chance = Math.random() + ( 0.00002 * Math.pow(player.power, 2) )
        let corruption_chance = Math.random()

        // if(this.percentCorrupted < this.corruptionMax && corruption_chance >= 0.7 ){
        // if(this.percentCorrupted < this.corruptionMax && corruption_chance >= 0.5 ){
        if(this.percentCorrupted < this.corruptionMax && corruption_chance >= this.corruptionThreshold() && enemy.enemyType != BOSS && !enemy.hypnotizedById ){
          // console.log( 'i really *should* be corrupting ' )
          enemy.startCorrupting()

          if( enemy.passedEntryPlane() ){
            // only count if new corrupted is in play
            this.numCorrupted += 1
          }
        }
      }  
    } else if(enemy.corrupted) {

      // already done corrupting

      if(player.killingCircle && player.killingCircle.visible){
        // killing circle damage dealing

        let hit = enemy.handleHit( player.killingCircleArea )

        if(hit){
          // killing circle is out and hitting this enemy
        
          if(enemy.healthTimer.time() > 100){
            enemy.healthTimer.reset()

            enemy.takeDamage( player.killingCircleDamage(), KILLINGCIRCLE )
            // enemy.setColor(0,0,255)
          }  
        }
      }

      if(enemy.hitmanCorrupted && player.moneyCircle && player.moneyCircle.visible){
        // if a friend is in the killing circle, give a lil powe3r!
        let hit = enemy.handleHit( player.moneyCircleArea )
        if(hit){

          // hitman is touched by money cirlce area
          let playerMoney = player.money

          if(enemy.contract && enemy.contract.type == ONPLAYER){
            // try to spend  your way outta it

            let playerMoney = player.money
             player.changeMoney( -1 * playerMoney )

            if(playerMoney >= enemy.money){
              // if we have more money than hitman, add ours in and turn thables
              enemy.changeMoney( playerMoney )
              enemy.endContract()

              let keyz = k(this.enemies)
              let randomTargetId = keyz[Math.floor( Math.random() * keyz.length )]
              enemy.addEnemyContract( enemy.money, randomTargetId )
            } else {
              // if we have less than hitman, pay em off to shorten the contract
              enemy.changeMoney(-1 * playerMoney)
            }

          } if(enemy.contract && enemy.contract.type == ONENEMY) {
            // if we alraedy hafev hitman hired, add to the contract pot
            
            player.changeMoney( -1 * playerMoney )
            enemy.changeMoney(playerMoney)
          } else {
            // regular buy conract if no contract
            if(player.money >= 50){
              let cost = player.money
              let keyz = k(this.enemies)
              let randomTargetId = keyz[Math.floor( Math.random() * keyz.length )]
              enemy.addEnemyContract( cost, randomTargetId )
            }

          }
        }
      }


      if(enemy.lifecycle == ALIVE){

        // this is enemy hitting the player
        let corrupthit = enemy.handleHit(player)
        if(player.lifecycle == ALIVE && corrupthit){


          if(player.healthTimer.time() > 500 ){
            // how often can the player *take* damage
            player.healthTimer.reset()
            // need to gate this so 10 corrupteds dont just saw your head off before you can react

            if(enemy.godCorrupted){
              enemy.attackSound()
              player.takeDamage( game.godCorruptedDamage, ENEMY )
            } else if(enemy.greenCorrupted){
              if(enemy.birthTimer.time() > 3000){
                console.log( 'done!!  setting opac' )
                enemy.mesh.material.opacity = 1
                enemy.attackSound()
                player.takeDamage( game.greenCorruptedDamage, ENEMY )  
              }
              
            } else if(enemy.hitmanCorrupted){

              if(enemy.contract && enemy.contract.type == ONPLAYER){
                // will fuck you up

                enemy.attackSound()
                player.takeDamage( game.hitmanCorruptedDamage, ENEMY )

              } else if(!enemy.contract){
                // if no contract, check for player contract
                if(player.money >= 50){
                  let cost = player.money
                  let keyz = k(this.enemies)
                  let randomTargetId = keyz[Math.floor( Math.random() * keyz.length )]

                  let playerMoney = player.money
                  player.changeMoney( -1 * playerMoney )
                  enemy.changeMoney( playerMoney )
                  enemy.addEnemyContract( cost, randomTargetId )
                }

              }

            } else {
              // this is regular corrupted damage
              player.takeDamage( game.corruptedDamage, ENEMY )
            }
          }
        }
        
        if(enemy.enemyType == BOSS){
          var newHypnoId

          if(enemy.bossEatTimer.time() > 1000){
            enemy.bossEatTimer.reset()


            let enemyIds = k(this.enemies)
            for(var i=0; i<enemyIds.length; i++){
              let eId = enemyIds[i]
              if(this.enemies[ eId ] && this.enemies[ eId ].lifecycle == ALIVE && this.enemies[ eId ].enemyType != BOSS ){

                if(!newHypnoId && this.enemies[ eId ] && this.enemies[ eId ].passedEntryPlane() && !this.enemies[ eId ].hypnotizedById ){
                  // pick one enemy to be hypnoed below
                  newHypnoId = eId
                }

                if(enemy.handleHit( this.enemies[ eId ] )){

                  // non-boss enemy is alive and touching alive boss
                  
                  // eaten enemy gets hurt
                  this.enemies[ eId ].takeDamage(500, BOSSDAMAGE)
                  // boss gets more powerful
                  enemy.health += 2
                  enemy.bossDamage += 2
                  enemy.mesh.scale.x += 0.1
                  enemy.mesh.scale.y += 0.1
                  enemy.mesh.scale.z += 0.1

                  // sound it
                  this.bossGrowSound()

                  // redden
                  let r = enemy.color[0] < 255 ? enemy.color[0] + 5 : enemy.color[0]

                  enemy.setColor( r, 0, 0 )  
                }
                
              }

            }
          }

          // if(enemy.bossHypnotimer.time() > 800){
          //   enemy.bossHypnotimer.reset()
            if( this.enemies[newHypnoId] ){
              console.log( 'get hypnoed bitch' )
              this.enemies[ newHypnoId ].hypnotize( enemy.id )
            }
          // }
          
        }
  
      }
      
      // if we're dead for any old reason, die 
      if(this.stage != TITLE && player.lifecycle == ALIVE && player.health <= 0){
        player.lifecycle = DYING
        this.cleanBombs()
        this.cleanSmokes()
      }

      let friend
      if(this.friends.length > 0){
        for(var x=0; x<this.friends.length; x++){
          friend = this.friends[x]

          if(friend.lifecycle == ALIVE){

            let hit = enemy.handleHit( friend )
            if( hit ){
              if(friend.healthTimer.time() > 100){
                friend.healthTimer.reset()
                friend.takeDamage(2, ENEMY)
                // console.log( 'ixx have hurt your friend for 2', friend.health )

                if(friend.health <= 0){
                  // might as well do this here since its the moment health went to death
                  friend.lifecycle = DYING
                  friend.addDeadSprite()
                  friend.killSound()
                  friend.remove()
                }

              }
            }

          }
          
        }
      }

      if(this.godCorruptionTimer.time() > 2000 && !enemy.godCorrupted && !enemy.greenCorrupted && !enemy.hitmanCorrupted && enemy.lifecycle == ALIVE && this.roundCount > 3 && enemy.enemyType != BOSS ){
          // god killer corruption! more likely with higher round
          let god = ( 10/ (2*(this.roundCount+7)) + 0.5 )
          let ch = Math.random()
          this.godCorruptionTimer.reset()

        if(ch > god){

          // godkill corruption wil just happen because were already corrupted
          enemy.startCorrupting()
        }
        
      }

      if(enemy.hitmanCorrupted && !enemy.contract){
        // if we're a big hitt and not already on a contract, check all living enemies for money, then touch

        let en, eK
        eK = k(this.enemies)
        for(var i=0;i<eK.length;i++){
          en = this.enemies[ eK[i] ]
          if(!en.hitmanCorrupted && en.lifecycle == ALIVE && en.money >= 50){
            
            if( enemy.handleHit( en ) ){
              // if en is not hitman, and touch and money, start contract

              let cost = en.money
              en.changeMoney( -1 * cost )
              enemy.addPlayerContract(cost, en.mesh.id)
            }
          }
        }
      }

      if(enemy.passedEntryPlane() && enemy.lifecycle == ALIVE){
        // only count if theyre in play
        this.numCorrupted += 1
      }
    }

    if(enemy.health <= 0){
      // reward your KILLING

      // this removes the mesh right now
      // you can kill while corrupting, make sure they actually die
      if( enemy.lifecycle == ALIVE || enemy.lifecycle == CORRUPTING ){

        let blockKillSound = false

        // only score once
        let score
        if(enemy.corrupted){

          score = 12
        } else {

          // reg enemy
          score = enemy.killScore()
            
            // only health and power by eating
          if(enemy.damagedBy == EAT){
            player.changePower( enemy.nutritionalValue )

            if(enemy.healthValue > 0){
              player.changeHealth( enemy.healthValue )
            }
          }

          if(enemy.damagedBy == BOSSDAMAGE){
            // && this.knowledgeDrainTimer.time() > 600
            // this.knowledgeDrainTimer.reset()
            console.log( 'boss dammy baby!' )
            player.changeKnowledge(-1)
          }

          if(enemy.damagedBy == EAT || enemy.damagedBy == SWORD){

            blockKillSound = true

            // knowledge is for everyone
            if(enemy.knowledgeValue > 0){
              this.knowledgeSound()
              player.changeKnowledge( enemy.knowledgeValue )
            } else if(enemy.moneyValue > 0){
              this.moneySound()
              player.changeMoney( enemy.moneyValue )
            } else {
              this.eatSound()
            }
          }

        }

        game.changeScore(score)
        enemy.lifecycle = DYING
        // remove banners etc for during fadeout
        enemy.removeExtras()

        if(!blockKillSound){
          // block kill sound if we play the knowledge sound
          enemy.killSound()
        }

        // og spot
        // enemy.remove()
        enemy.addDeadSprite()
      }

      if(enemy.lifecycle == DEAD){
        // WAIT to actually delete enemy until we have faded out the sprite
        enemy.removeSprite()
        enemy.remove()
        delete this.enemies[enemyId]
      }
    }
  }

  corruptionThreshold(){
    return Math.pow(this.roundCount, 1.2)/-75 + this.corruptionBaseChance
  }

  addMerchant(){
    this.merchant = new Merchant()
    let entryPoint = this.merchant.pickEntryPoint()
    this.merchant.mesh.position.set( entryPoint.x, entryPoint.y, entryPoint.z )
    scene.add( this.merchant.mesh )

    this.merchantTimer.start()
  }

  removeMerchant(){
    this.merchant.closeShop()
  }

  handleMerchant(){
    this.merchant.handleMovement()
    this.merchant.handleBuying()
    this.merchant.animation()

    if(this.merchantTimer.time() > 16000){
      this.announcement("ITEM SHOP HAS CLOSED")
      this.merchant.closeShop()
      this.merchant = null
    }
  }

  actualNumEnemies(){
    let count = 0
    k(this.enemies).forEach((key) => {
      if(this.enemies[key].lifecycle == ALIVE){
        count++
      }
    })
    return count
  }

  handleEnemies(){
    let enemy
    this.numCorrupted = 0

    // dont be corrupting so much
    if(!this.corruptionTimer.running){
      this.corruptionTimer.start()
    }

    // toggle this off because it'll get turned back on during loop if we're still eating
    player.eating = false

    let enemiesKeys = k(this.enemies)
    var numEnemies = 0
    let enemyId

    for(var i=0, e_len=enemiesKeys.length; i<e_len; i++){
      enemyId = enemiesKeys[i]
      enemy = this.enemies[enemyId]
      if(enemy){

        this.handleEnemy(enemy)

        // if(enemy.enemyType == BOSS){
        //   // -1 or 1
        //   enemy.mesh.position.z += enemy.zDirection * 0.004
        //   if(enemy.zDirection == 1 && enemy.mesh.position.z >= 0.2){
        //     enemy.zDirection = -1
        //     console.log( 'switch to -1' )
        //   } else if(enemy.zDirection == -1 && enemy.mesh.position.z <= -0.2) {
        //     enemy.zDirection = 1
        //     console.log( 'switch to 1' )
        //   }
        
        // scroll in new enemies

        if(enemy.mesh.position.z < 0){
          // if enemy not in round yet, move em in
          enemy.mesh.position.z += 0.016 + this.roundCount / 1000.0
          if(enemy.mesh.position.z > 0){
            enemy.mesh.position.z = 0
          }
        }  

        if(enemy.passedEntryPlane() && enemy.lifecycle == ALIVE || enemy.lifecycle == CORRUPTING){
          // only rael alive ones
          numEnemies += 1
        }
        
      }
    }

    // check for player bombs if there are bombs
    if(this.nowRandomBombing && this.bombs.length > 0){

      // round end bombs hurt player *a little*
      player.handleBombs()
    }    

    if(player.lifecycle == DYING){
      if(player.mesh.scale.x >= 1.4){
        // wait to end until sprite go bye bye

        console.log( 'YOU HAVE DIED' )
        player.lifecycle = DEAD

        // if(this.stage == TITLE){
        //   // dying on a demo
        //   this.demo.cleanDemo()
        //   this.demo = null
        //   this.hideAttract()
        //   this.attractStage = LOGO2
        // } else {
        // }
        
        this.endGame()
        // real play

      }
    }

    if(numEnemies == 0){
      // if we didnt have anyone in front of plane this loop, end round
      this.cleanEnemies()
      // for(var i=0, e_len=enemiesKeys.length; i<e_len; i++){
      //   // so no sprite
      //   if(this.enemies[ enemiesKeys[i] ]){
      //     this.enemies[ enemiesKeys[i] ].lifecycle = ALIVE
      //     this.enemies[ enemiesKeys[i] ].removeNow()
      //     delete this.enemies[ enemiesKeys[i] ]  
      //   }
      // }
    }

    
    // record this after we've added new corrupts, and cleaned up dead enemies
    // because of flying in, we have to count num enemies manually
    this.percentCorrupted = this.numCorrupted/numEnemies

    if(this.percentCorrupted == 1){

      if(player.power <= 10 && this.bonusEnergyTimer.time() > 600){
        this.bonusEnergyTimer.reset()
        player.changePower(1)
      }

      // only do this if we got no weapons
      if(player.level < 2){
        this.nowRandomBombing = true
        this.randomBombs()      
        // add random bombs if we're stuck on all corrupted and dont got bombs yet
      }  
    }
    
  }  
}