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

    this.announcements = []
    this.announcementTimer = new Timer()
    this.announcementFadeTimer = new Timer()

    this.numCorrupted = 0
    this.score = null
    this.scoreLightTimer = new Timer()
    this.scoreLightTimer.start()

    // to alternate score scroll + press space msg
    this.attractStage = DEMO
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
  }
  
  calcChanceSlices(){
    // let chanceSlices = [0.2,0.4,0.6,0.8]
    let chanceSlices = [0.2,0.4,0.6,0.75]
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
    }
  }

  nextRound(){
    // ramp up difficulty for next round
    // exponential, but dull it down so we get to about x20 base #enemies by round 12
    let maxBump = 1 + Math.pow(this.roundCount, 2)/25
    // make the max # of enemeis per gen bigger, floor it with 5 so we dont have 3 rounds of 2 enemies
    // let newEnemyMax = this.defaultEnemyMax + Math.round(this.enemyMax * maxBump)
    let newEnemyMax = Math.round(this.defaultEnemyMax * maxBump)
    // make the enemy timer shorter
    // let newEnemyInterval = Math.round(this.enemyInterval * 0.90)
    // let newEnemyInterval = Math.round(this.defaultEnemyInterval * 90 / ( Math.pow((this.roundCount + 12), 2) ) + 13000 )
    let newEnemyInterval = Math.round(this.defaultEnemyInterval * -1 * Math.pow( this.roundCount, 2 )/700 + 36000 )
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


    this.changeScore(this.roundCount * 10)

    this.newRound(newEnemyMax, newEnemyInterval, newCorruptionMax, newCorruptingTime, [r,g,b])
  }

  newRound(enemyMax, enemyInterval, corruptionMax, corruptingTime, roundColor){
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

    // this sure does not work
    // let numCandies = Math.ceil( Math.random() * this.roundCount/2 )
    // let enemy
    // for(var i=0; i<numCandies; i++){
    //   // add a vew extre candies
    //   enemy = this.addEnemy([0,0,0], KNOWLOCTA)
    //   this.enemies[enemy.id] = enemy
    //   scene.add(this.enemies[enemy.id].mesh)
    //   this.enemies[enemy.id].inScene = true
    // }

    this.nowRandomBombing = false
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
          // fx_song2.setVolume(0.0)

          if(!fx_song2.playing()){
            fx_song2.play()
          }

        //   if(!this.musicFadeTimer.running){
        //     this.musicFadeTimer.start()
        //   }

        //   // music fade
        //   if(this.musicFadeTimer.time() > 100){
        //     this.musicFadeTimer.reset()

        //     this.musicVolume = this.musicVolume + 0.01
        //     console.log( 'added musicvolume', this.musicVolume )
        //     fx_song2.setVolume( this.musicVolume )

        //     if(this.musicVolume > 0.6){
        //       // stop changing once we reach the right volume
        //       this.musicTimer.stop()
        //     }
        //   }
        }
      }  
    }
    
  }

// loop for game object
  handleGame(){
    this.handleAnnouncements()
    this.handleMusic()

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

      if(this.stageTimer.time() > this.loadTime ){
        this.cleanGame()
      }
    } else if(this.stage == DEMO){
      this.drawPlaying()


    }

    duster.animation()
  }

  drawFlicker(){
    if(this.flickerTimer.time() > 120){
      this.flickerTimer.reset()
      let roll = Math.random()
      if(roll > 0.9){
        this.setBackgroundColor(143,178,255)

      } else if(roll > 0.8){
        this.setBackgroundColor(140,180,255)
      } else if(roll > 0.3){
        // this.setBackgroundColor(70,90,123)  
        this.setBackgroundColor(138,176,252)

      // } else {
      //   // this.setBackgroundColor(32,40,64)  
      //   this.setBackgroundColor(142,170,250)
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
    this.drawFlicker()

    if( ( game.nameEntry == NONAME) && checkSoundsLoaded() ){

      if(this.attractTimer.time() > 16000){
        this.attractTimer.reset()
        this.attractStage += 1

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
          let selectedDemo = Math.floor( Math.random() * 2 )

          let characters = []
          player.mesh.visible = true

          console.log( 'selecting new demo', selectedDemo )

          if(selectedDemo == 0){
            console.log( 'picked 0' )
            characters.push(player)

            let enemy1 = this.addEnemy(KNOWLOCTA)
            characters.push(enemy1)
            let enemy2 = this.addEnemy(KNOWLOCTA)
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
            characters.push(enemy1)
            let enemy2 = this.addEnemy(KNOWLOCTA)
            characters.push(enemy2)
            let enemy3 = this.addEnemy(SPHERE)
            characters.push(enemy3)
            let enemy4 = this.addEnemy(HEALCUBE)
            characters.push(enemy4)
            let enemy5 = this.addEnemy(CIRCLE)
            characters.push(enemy5)
            let enemy6 = this.addEnemy(KNOWLOCTA)
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

    // fade toward blac
    // this.fadeBackgroundToward(this.roundColor[0], this.roundColor[1], this.roundColor[2], 2)
    this.fadeBackgroundToward()
  }

  randomBombs(){
    if(this.randomBombsTimer.time() > 3000){
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

  // drawCasino(){

  // }

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

    container.appendChild(nameEle)
    container.appendChild(meterEle)
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

      if( this.friends[i] && !document.getElementById("friend"+i) ){
        // check if icon exists for friend, if not create that ho
        let r,g,b
        r = this.friends[i].baseColor[0]
        g = this.friends[i].baseColor[1]
        b = this.friends[i].baseColor[2]
        color = rgbToHex(r,g,b)
        game.addFriendIcon("friend", i, color)
      }

      document.getElementById("friend" + i).value = this.friends[i].power
    }
  }

  drawTimer(time){
    document.getElementById("timer").innerHTML = time
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

  addEnemy(type=null){
    let killer = new Enemy([0,88,255*Math.round(Math.random())], type);

    killer.mesh.position.x = Math.random()*4*this.randomSign()

    killer.mesh.position.y = Math.random()*4*this.randomSign()
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
                friend.changePower(2)
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
      for(var x=0;x<this.friends.length;x++){
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

    // doesnt seem like this should be necessary, but getting some ghost kills on last place sword was out
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

    // LIFE/CORRUPTION
    // only sword/bombs/casino can hurt while corrupting
    if(enemy.lifecycle == ALIVE && !enemy.corrupted){
      let hitresult = enemy.handleHit(player)

      if(player.lifecycle == ALIVE && hitresult){

        if(enemy.healthTimer.time() > 100){
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
        
          if(enemy.healthTimer.time() > 100){
            enemy.healthTimer.reset()

            enemy.takeDamage( player.killingCircleDamage(), KILLINGCIRCLE )
            enemy.setColor(0,0,255)
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
            player.takeDamage( game.godCorruptedDamage, ENEMY )
          } else {
            // this is regular corrupted damage
            player.takeDamage( game.corruptedDamage, ENEMY )
          }

          if(player.lifecycle == ALIVE && player.health <= 0){
            player.lifecycle = DYING
          }
        }

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
                  friend.remove()
                }

              }
            }

          }
          
        }
      }

      if(this.godCorruptionTimer.time() > 2000 && !enemy.godCorrupted && enemy.lifecycle == ALIVE && this.roundCount > 3 ){
          // god killer corruption! more likely with higher power level
          let god = ( 10/ (2*(player.level+7)) + 0.5 )
          let ch = Math.random()
          this.godCorruptionTimer.reset()

        if(ch > god){

          console.log( 'I GODCORRUPTED IT' )
          console.log( 'goddcorrupt chance...', god, ch )

          // godkill corruption wil just happen because were already corrupted
          console.log( 'starting god killer' )
          enemy.startCorrupting()  
        }
        
      }

      this.numCorrupted += 1
    }


   if(enemy.health <= 0){
      // reward your KILLING

      // this removes the mesh right now
      // you can kill while corrupting, make sure they actually die
      if(enemy.lifecycle == ALIVE || enemy.lifecycle == CORRUPTING){

        // only score once
        let score
        if(enemy.corrupted){

          score = 12
        } else {

          // reg enemy
          score = enemy.killScore()
          if(enemy.damagedBy == EAT)
          player.changePower( enemy.nutritionalValue )

          if(enemy.healthValue > 0){
            player.changeHealth( enemy.healthValue )
          }

          // knowledge is for everyone
          if(enemy.knowledgeValue > 0){
            player.changeKnowledge( enemy.knowledgeValue )
          }

        }

        game.changeScore(score)
        enemy.lifecycle = DYING

        // console.log( 'eneemy dying ', enemy.id )
        enemy.killSound()
        enemy.remove()
      }

      if(enemy.lifecycle == DEAD){
        // WAIT to actually delete enemy until we have faded out the sprite
        enemy.removeSprite()
        delete this.enemies[enemyId]
      }
    }
  }

  handleEnemies(){
    let enemy
    this.numCorrupted = 0

    // dont be corrupting so much
    if(!this.corruptionTimer.running){
      this.corruptionTimer.start()
    }

    // console.log('tehre are enemies ', this.enemies.length)

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
      // console.log( 'now player bombs' )

      // round end bombs hurt player *a little*
      player.handleBombs()
    }    

    if(player.lifecycle == DYING){
      if(player.mesh.scale.x >= 1.4){
        // wait to end until sprite go bye bye

        console.log( 'YOU HAVE DIED' )
        player.lifecycle = DEAD
        this.endGame()
      }
    }
    
    // record this after we've added new corrupts, and cleaned up dead enemies
    this.percentCorrupted = this.numCorrupted/enemiesKeys.length

    // only do this if we got no weapons
    if(player.level < 2 && this.percentCorrupted == 1){
      this.nowRandomBombing = true
      this.randomBombs()      
      // add random bombs if we're stuck on all corrupted and dont got bombs yet
    }
  }  
}