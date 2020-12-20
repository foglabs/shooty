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

    this.setDefaultGameValues()

    // clean up everything
    document.getElementById("scores").innerHTML = ""
    document.getElementById("scores").classList.remove("score-scroll")
    document.getElementById("fog-logo").classList.add("hidden")
    document.getElementById("fog-logo2").classList.add("hidden")
    this.clearAnnouncements()

    this.musicEnabled = true

    this.stage = false
    this.stageTimer = new Timer()
    this.loadTime = 2000
    this.animTimer = new Timer()

    // wait a bit to start music
    this.musicTimer = new Timer()
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
    this.attractStage = SCORES
    this.attractTimer = new Timer()
    this.attractTimer.start()

    this.flickerTimer = new Timer()
    this.flickerTimer.start()

    this.demo = null
    this.demoCharacters = []

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
      if(this.announcementFadeTimer.time() < 1000){
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
    player.health = 100
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

    this.godCorruptionTimer = new Timer()
    this.godCorruptionTimer.start()

    this.corruptedDamageDefault = 4
    this.corruptedDamage = 4

    this.godCorruptedDamageDefault = 16
    this.godCorruptedDamage = 16

    this.greenCorruptedDamageDefault = 32
    this.greenCorruptedDamage = 32

    this.hitmanCorruptedDamageDefault = 64
    this.hitmanCorruptedDamage = 64

    this.corruptingTimeDefault = 1800
    this.corruptingTime = this.corruptingTimeDefault

    // max playe rpower
    this.powerMax = 100

    // max knowl to level up
    this.knowledgeMaxDefault = 50
    this.knowledgeMax = this.knowledgeMaxDefault

    // countdown to generate enemies every so often
    this.defaultEnemyInterval = 36000
    this.enemyInterval = 36000
    this.defaultEnemyMax = 5
    this.enemyMax = 5
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
  }
  
  calcChanceSlices(){
    let chanceSlices
    if(this.roundCount<20){
      chanceSlices = [0.2,0.4,0.6,0.75]
      for(var i=0; i<4; i++){
        // bend the base chances based on round number, kinda weighted by index
        chanceSlices[i] = chanceSlices[i] * i + Math.pow( this.roundCount, 2 )/3000
      }

      // adding these constants puts these shits on the right place for x==1 (level 1)
      chanceSlices[0] = chanceSlices[0] + 0.2
      chanceSlices[1] = chanceSlices[1]
      chanceSlices[2] = chanceSlices[2] - 0.6
      // chanceSlices[3] = chanceSlices[3] - 1.6
      chanceSlices[3] = chanceSlices[3] - 1.5
  
    } else {
      // after round 20, get buck
      chanceSlices = [0.2,0.4,0.6,0.75]

      for(var i=0; i<4; i++){
        chanceSlices[i] = chanceSlices[i] * ( Math.pow(this.roundCount, 2) / 4500 ) + chanceSlices[i]
      }
    }
    
    return chanceSlices
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
      this.musicTimer.start()

      this.newRound(this.enemyMax, this.enemyInterval, this.corruptionMax, this.corruptingTime, [0,0,0])

      this.startTime = performance.now()
      // need to wipe this so timer works
      this.attractStage = null

      // block this so that we cant retry before ENDING animation finishes
      this.readyToStartGame = false

      // for(var i=0; i<10; i++){
      //   player.levelUp()
      // }
      // for(var i=0; i<39; i++){
      //   // skip all but last round
      //   game.nextRound( i != 38)
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
      maxBump = 4 + Math.pow(this.roundCount, 2)/100
    }

    // make the max # of enemeis per gen bigger, floor it with 5 so we dont have 3 rounds of 2 enemies
    let newEnemyMax = Math.round(this.defaultEnemyMax * maxBump)

    // make the enemy timer shorter
    // min 10s, decrease towards that until round 35
    let newEnemyInterval = Math.max( 10000, Math.round(this.defaultEnemyInterval * -1 * Math.pow( this.roundCount, 2 )/1700 + 36000 ) )

    // increase maximum % of corurpted by 8%
    // let newCorruptionMax = (this.corruptionMax * 1.08).toFixed(2)
    let newCorruptionMax = (this.corruptionMaxDefault + (this.corruptionMaxDefault * Math.pow(this.roundCount, 2)) / 64 ).toFixed(2)

    // how long does it take to finsih corrupting
    let newCorruptingTime = Math.round(this.corruptingTimeDefault * ( 9/(this.roundCount+8) ) )

    this.roundCount += 1
    // recalc chacnes for each enemy
    this.chanceSlices = this.calcChanceSlices()

    let r,g,b
    r = Math.floor(Math.random() * 100)
    g = Math.floor(Math.random() * 100)
    b = Math.floor(Math.random() * 100)

    this.corruptionTimer.reset()
    this.corruptedDamage = Math.round( this.corruptedDamageDefault + Math.pow( (this.roundCount/5), 2 ) )
    this.godCorruptedDamage = Math.round( this.godCorruptedDamageDefault + 2 * Math.pow(this.roundCount/2, 2) )

    this.greenCorruptedDamage = Math.round( this.greenCorruptedDamageDefault + 2 * Math.pow(this.roundCount/2, 2) )

    this.changeScore(this.roundCount * 10)

    if(this.roundCount >= 20){
      this.enemyHealthFactor = Math.max( 0.01, Math.log(this.roundCount/-3 + 12) )
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

  newRound(enemyMax, enemyInterval, corruptionMax, corruptingTime, roundColor, skip=false){
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

    this.stage = LOADING
    this.announcement("ROUND " + this.roundCount +  " LOADING...")

    duster.animTimer.start()
    this.stageTimer.start()

    this.enemyTimer = new Timer(this.enemyInterval)
    this.enemyTimer.start()

    let numEnemies = Math.round( this.enemyMax/2 + Math.random() * this.enemyMax/2 )
    this.generateEnemies( numEnemies )

    if(!skip && this.roundCount % 5 == 0){
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
      // purple to the death of me
      spotlight2.color = new THREE.Color("#ff00ff")
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
      if(this.stage == TITLE || this.stage == LOADING || this.stage == PLAYING){

        // oh forget it!      
        // music start
        if(this.musicTimer.running && this.musicTimer.time() > 4000){

          if(!this.muteMessage && this.musicTimer.time() > 4000){
            this.announcement("MUTE MUSIC (M)")
            this.muteMessage = true
          }


          if(this.merchant){
            if( !fx_merchantamb.playing() ){
              fx_merchantamb.play()
  
              if( fx_song2.playing() ){
                fx_song2.stop()
              }
            }

          } else {
            if( !fx_song2.playing() ){
              fx_song2.play()

              if( fx_merchantamb.playing() ){
                fx_merchantamb.stop()
              }
            }
          }
        }
      }  
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
        fx_song2.stop()
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
        this.cleanGame()
      }
    } else if(this.stage == DEMO){
      this.drawPlaying()
    }

    // 'stars'
    duster.animation()
    pduster.animation()
    p2duster.animation()
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
    this.drawFlicker()

    if( ( game.nameEntry == NONAME) && checkSoundsLoaded() ){

      if(this.attractTimer.time() > 16000){
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
          let selectedDemo = Math.floor( Math.random() * 3 )
          selectedDemo = 3
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
            let event6 = new Event(0, 8000, 0.8, 0.8)
            let event7 = new Event(1, 11000, -0.1, -0.1)
            let event8 = new Event(2, 11000, 0.6, 0.6)

            this.demo = new Demo(characters, 15000, [event, event2, event3, event4, event5, event6, event7, event8])
            this.enemies = [enemy1, enemy2]
          } else if(selectedDemo == 1){
            console.log( 'picked 1s' )
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

            let event26 = new Event(0, 9000, 0.5, 0.5)
            let event27 = new Event(0, 13000, 0.5, -0.5)

            let event28 = new Event(0, 3000, 0, 0.5)
            let event29 = new Event(0, 4000, 0.5, -0.5)
            let event30 = new Event(0, 6000, -0.5, 0.5)

            this.demo = new Demo(characters, 15000, [event,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11,event12,event13,event14,event15,event16,event17,event18,event19,event20,event21,event22,event23,event24,event25,event26,event27,event28,event29,event30])
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
            this.demo = new Demo(characters, 15000, [event,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11,event12,event13,event14,event15])
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

            let event9 = new Event(0, 12000, -3, 3)
            let event10 = new Event(1, 12000, -3, 2)
            let event11 = new Event(2, 12000, -3, 1)
            let event12 = new Event(3, 12000, -3, 0)
            let event13 = new Event(4, 12000, -3, -1)
            let event14 = new Event(5, 12000, 3, 0)
            let event15 = new Event(6, 12000, 3, 1)
            let event16 = new Event(7, 12000, 3, 2)
            let event17 = new Event(8, 12000, 3, 3)

            characters.push(player)
            player.mesh.visible = true

            this.demo = new Demo(characters, 15000, [event00,event01,event02,event03, event0,event1,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11,event12,event13,event14,event15,event16,event17])
            this.enemies = [enemy1,enemy2,enemy3,enemy4,enemy5,enemy6,enemy7,enemy8,enemy9]
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

      this.announcement("AVOID THE BOMBS")
      this.randomBombsTimer.reset()

      let numBombs = Math.floor(Math.random() * 4 * this.roundCount)
      // minimum num of bombs is roundcount
      numBombs = Math.max(numBombs, this.roundCount)
      let x,y
      let bomb
      for(var i=0; i<numBombs; i++){
        // hurts player too
        bomb = new Bomb([100,150,50], 3, true)
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

      // if enemy timer finishesa, add more enemies
      if(remaining == 0 ){

        // add a random # of enemies, ensure at least 50% of max
        let numEnemies = Math.round( this.enemyMax/2 + Math.random() * this.enemyMax/2 )
        // console.log( 'ene max is', this.enemyMax )
        // console.log( 'generating ene ', numEnemies )
        this.generateEnemies( numEnemies )

        this.enemyTimer.reset()
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
    this.setDefaultGameValues()

    player.deadSprite.remove()
    player.lifecyle = ALIVE
    player.defaultPlayerValues()
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
        this.removeMerchant()
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
        this.bombs[i].lifecycle = ALIVE
        this.bombs[i].remove()
        delete this.bombs[i]
      }
    }
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

  addEnemy(type=null, posx=null, posy=null){
    let killer = new Enemy([0,88,255*Math.round(Math.random())], type);

    if(posx){
      killer.mesh.position.x = posx
    } else {
      killer.mesh.position.x = Math.random()*4*this.randomSign()
    }

    if(posy){
      killer.mesh.position.y = posy
    } else {
      killer.mesh.position.y = Math.random()*4*this.randomSign()
    }
    return killer
  }

  generateEnemies(num){
    for(var i=0;i<num; i++){
      let enemy = this.addEnemy()
      this.enemies[enemy.id] = enemy
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
    let enemyId = enemy.id
    
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
          enemy.takeDamage(4, EAT)
        }

        // start eating animation, which shuts itself off after timer
        player.eating = true
      }

      if(enemy.lifecycle == ALIVE && this.corruptionTimer.time() > 1000) {
        // only need to handleCorruption if we're not dying
        this.corruptionTimer.reset()

        // multiply by this teeny tiny so we (mostly) get back something within the realm of 0-1
        let corruption_chance = Math.random() + ( 0.00002 * Math.pow(player.power, 2) )
        if(this.percentCorrupted < this.corruptionMax && corruption_chance > 0.80 ){
          // console.log( 'i really *should* be corrupting ' )
          enemy.startCorrupting()
          this.numCorrupted += 1
        }
      }  
    } else if(enemy.corrupted) {

      if(player.killingCircle && player.killingCircle.visible){
        let hit = enemy.handleHit( player.killingCircleArea )

        if(hit){
          // killing circle is out and hitting this enemy
        
          if(enemy.healthTimer.time() > 100){
            enemy.healthTimer.reset()

            enemy.takeDamage( player.killingCircleDamage(), KILLINGCIRCLE )
            enemy.setColor(0,0,255)
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

      // is this enemy hitting the player
      let corrupthit = enemy.handleHit(player)
      if(player.lifecycle == ALIVE && enemy.lifecycle == ALIVE && corrupthit){


        if(player.healthTimer.time() > 100){
          // how often can the player *take* damage
          player.healthTimer.reset()
          // need to gate this so 10 corrupteds dont just saw your head off before you can react

          if(enemy.godCorrupted){
            enemy.attackSound()
            player.takeDamage( game.godCorruptedDamage, ENEMY )
          } else if(enemy.greenCorrupted){
            console.log( 'gree corr damg' )

            enemy.attackSound()
            player.takeDamage( game.greenCorruptedDamage, ENEMY )
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

      // if we're dead for any old reason, die 
      if(this.stage != TITLE && player.lifecycle == ALIVE && player.health <= 0){
        player.lifecycle = DYING
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
                  friend.killSound()
                  friend.remove()
                }

              }
            }

          }
          
        }
      }

      if(this.godCorruptionTimer.time() > 2000 && !enemy.godCorrupted && !enemy.greenCorrupted && !enemy.hitmanCorrupted && enemy.lifecycle == ALIVE && this.roundCount > 3 ){
          // god killer corruption! more likely with higher power level
          let god = ( 10/ (2*(player.level+7)) + 0.5 )
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

      this.numCorrupted += 1
    }

    if(enemy.health <= 0){
      // reward your KILLING

      // this removes the mesh right now
      // you can kill while corrupting, make sure they actually die
      if( enemy.lifecycle == ALIVE || enemy.lifecycle == CORRUPTING ){

        let gainedKnowledge = false

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

          if(enemy.damagedBy == EAT || enemy.damagedBy == SWORD){ 

            // knowledge is for everyone
            if(enemy.knowledgeValue > 0){
              this.knowledgeSound()
              gainedKnowledge = true
              player.changeKnowledge( enemy.knowledgeValue )
            }  

            // knowledge is for everyone
            if(enemy.moneyValue > 0){
              this.moneySound()
              player.changeMoney( enemy.moneyValue )
            }  
          }
        }

        game.changeScore(score)
        enemy.lifecycle = DYING

        if(!gainedKnowledge){
          // block kill sound if we play the knowledge sound
          enemy.killSound()
        }
        enemy.remove()
      }

      if(enemy.lifecycle == DEAD){
        // WAIT to actually delete enemy until we have faded out the sprite
        enemy.removeSprite()
        delete this.enemies[enemyId]
      }
    }
  }

  addMerchant(){
    this.merchant = new Merchant()
    let entryPoint = this.merchant.pickEntryPoint()
    this.merchant.mesh.position.set( entryPoint.x, entryPoint.y, entryPoint.z )
    scene.add( this.merchant.mesh )

    this.merchantTimer.start()
  }

  removeMerchant(){
    this.merchant.remove()
    scene.remove( this.merchant.mesh )
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

  handleEnemies(){
    let enemy
    this.numCorrupted = 0

    // dont be corrupting so much
    if(!this.corruptionTimer.running){
      this.corruptionTimer.start()
    }

    let enemiesKeys = k(this.enemies)
    let enemyId
    for(var i=0, e_len=enemiesKeys.length; i<e_len; i++){
      enemyId = enemiesKeys[i]
      enemy = this.enemies[enemyId]
      if(enemy){

        this.handleEnemy(enemy)
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
    
    // record this after we've added new corrupts, and cleaned up dead enemies
    this.percentCorrupted = this.numCorrupted/enemiesKeys.length
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