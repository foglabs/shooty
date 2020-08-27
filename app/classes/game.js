class Game {
  constructor(){

    this.u = 0
    // current color
    this.backgroundColor = [0,0,0]
    // preserve this so we can lerp from from to round - starts as title screen color
    this.lastRoundColor = [140,180,255]
    // destination color for the round, fades during loading
    this.roundColor = [140,180,255]

    this.ping = false
    this.score = 0

    // this gets filled in index
    this.enemies = []
    this.percentCorrupted = 0
    // bump this up to get more difficult
    this.corruptionMax = 0.2
    this.corruptionTimer = new Timer()
    
    // max playe rpower
    this.powerMax = 100
    this.stage = false
    this.stageTimer = new Timer()
    this.loadTime = 2000
    this.animTimer = new Timer()

    // countdown to generate enemies every so often
    this.enemyInterval = 30000
    this.enemyMax = 5

    this.roundCount = 1
  }

  gameRunning(){
    this.stage == LOADING || this.stage == PLAYING
  }

  initGame(){
    // opening animation when we load
    this.stageTimer.start()
  }

  newGame(){
    if(!this.gameRunning()){
      this.newRound(this.enemyMax, this.enemyInterval, this.corruptionMax, [0,0,0])
    }
  }

  nextRound(){
    // ramp up difficulty for next round
    // exponential, but dull it down so we get to about x20 base #enemies by round 8
    let maxBump = 0.3 * Math.pow(this.roundCount, 2)
    // make the max # of enemeis per gen bigger
    let newEnemyMax = Math.round(this.enemyMax * maxBump)
    // make the enemy timer shorter
    let newEnemyInterval = Math.round(this.enemyInterval * 0.8)
    // increase maximum % of corurpted by 8%
    let newCorruptionMax = (this.corruptionMax * 1.08).toFixed(2)

    this.roundCount += 1
    let r,g,b
    r = Math.floor(Math.random() * 180)
    g = Math.floor(Math.random() * 180)
    b = Math.floor(Math.random() * 180)
    this.newRound(newEnemyMax, newEnemyInterval, newCorruptionMax, [r,g,b])
  }

  newRound(enemyMax, enemyInterval, corruptionMax, roundColor){
    this.enemyMax = enemyMax
    this.enemyInterval = enemyInterval
    this.corruptionMax = corruptionMax

    console.log( 'roundcolo', roundColor, this.roundColor, this.lastRoundColor )

    // record for loading lerping
    this.lastRoundColor = this.roundColor
    // to color
    this.roundColor = roundColor

    this.cleanEnemies()

    player.health = 100
    player.power = 0

    this.stage = LOADING
    duster.animTimer.start()
    this.stageTimer.start()

    this.enemyTimer = new Timer(this.enemyInterval)

    let numEnemies = Math.round( this.enemyMax/2 +  Math.random() * this.enemyMax/2 )
    this.generateEnemies( numEnemies )
  }

  endGame(){
    this.stageTimer.start()
    this.stage = ENDING    
  }

  handleGame(){

    if(this.stage == TITLE){      
      this.drawTitle()
    } else if(this.stage == LOADING){

      player.mesh.visible = true
      
      console.log( 'stage time is ', this.stageTimer.time() )

      this.drawLoading()

      if(this.stageTimer.time() > this.loadTime){
        this.stage = PLAYING
        document.getElementById("stage-info").innerHTML = ""
      }

    } else if(this.stage == PLAYING){

      this.drawPlaying()
    } else if(this.stage == ENDING){

      this.drawEnding()

      if(this.stageTimer.time() > this.loadTime){
        this.stage = GAMEOVER
      }
    } else if(this.stage == GAMEOVER) {
      // ended
      this.drawGameover()
      console.log("GAME OVA")
    }

    duster.animation()
  }

  drawTitle(){
    this.setBackgroundColor(140,180,255)
  }

  drawLoading(){
    document.getElementById("stage-info").innerHTML = "ROUND " + this.roundCount +  " LOADING..."
    duster.loadingAnimation()

    // fade toward blac
    // this.fadeBackgroundToward(this.roundColor[0], this.roundColor[1], this.roundColor[2], 2)
    this.fadeBackgroundToward()
  }

  drawPlaying(){
    if(!this.enemyTimer.running){
      this.enemyTimer.start()
    }

    let remaining = this.enemyTimer.time()
    this.drawTimer(remaining)

    // if enemy timer finishesa, add more enemies
    if(remaining == 0 ){

      // add a random # of enemies
      this.generateEnemies( Math.round(Math.random() * this.enemyMax ) )

      this.enemyTimer.reset()
    }

    if(player.lifecycle == ALIVE){
      // stop moving if we DEAD
      player.handleMovement()
    }

    //  if everybody's dead... 
    if(this.enemies.length == 0){
      this.nextRound()
    }

    this.handleEnemies()

    player.animation()

    this.drawScore()
    this.drawPower()
    this.drawHealth()
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

  drawGameover(){
    document.getElementById("stage-info").innerHTML = "GAME OVER"
  }

  cleanEnemies(){
    for(var i=0; i<this.enemies.length; i++){
      if(this.enemies[i]){
        // do this so we dont make a sprite
        this.enemies[i].lifecycle = ALIVE
        this.enemies[i].remove()
        delete this.enemies[i]
      }
    }
  }

  changeScore(change){
    this.score += change
  }

  changePowerMax(newpower){
    // this is for the player
    this.powerMax = newpower
    this.powerMaxMag = Math.pow( 2, newpower/10 )
     document.getElementById("power").max = newpower
  }

  drawTimer(time){
    document.getElementById("timer").innerHTML = time;
  }

  drawScore(){
    document.getElementById("score").innerHTML = this.score;
  }

  drawPower(){
    document.getElementById("power").value = player.power;
  }

  drawHealth(){
    document.getElementById("health").value = player.health;
  }

  rgbToHex(r,g,b){
    return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b)
  }

  componentToHex(c) {
    c = c < 255 ? c : 255 
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
  }

  setBackgroundColor(r,g,b){
    // this.mesh.material.color.setRGB(r,g,b)
    this.backgroundColor[0] = r
    this.backgroundColor[1] = g
    this.backgroundColor[2] = b
    let hex = this.rgbToHex(r,g,b)
    scene.background = new THREE.Color( hex )
  }

  lerp(a, b, u) {
    // start val, dest val, interval
    return (1 - u) * a + u * b;
  }

  fadeBackgroundToward(){
    // if(!this.animTimer.running){
    //   this.animTimer.start()
    // }
    // if(this.animTimer.time() > 5){
    //   this.animTimer.reset()

    //   let r,g,b
    //   r = this.fadeComponent( this.backgroundColor[0], destR, increment )
    //   g = this.fadeComponent( this.backgroundColor[1], destG, increment )
    //   b = this.fadeComponent( this.backgroundColor[2], destB, increment )
    //   console.log( 'back col ',r,g,b )
    //   this.setBackgroundColor(r,g,b)
    // }

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
      r = Math.floor( this.lerp( this.lastRoundColor[0], this.roundColor[0], this.u ) )
      g = Math.floor( this.lerp( this.lastRoundColor[1], this.roundColor[1], this.u ) )
      b = Math.floor( this.lerp( this.lastRoundColor[2], this.roundColor[2], this.u ) )
      this.setBackgroundColor(r,g,b)

      // console.log( 'rgb', r,g,b )

      if(r ==0 && g == 0 && b == 0){
        console.log("it iwas ", this.u)
      }
      // console.log( 'u is ', this.u )

      let step = 1.0/numSteps
      this.u += step

      console.log( 'step is', this.u )

      // done
      if(this.u > 1.0){
        this.u = 0
      }
    }
  }

  fadeComponent(val, dest, increment){
    // step towards dest until the last step, when we lock to dest
    return this.constrainComponent( val - increment > dest ? val - increment : ( val + increment < dest ? val + increment : dest ) )
  }

  constrainComponent(val){
    return val > 255 ? 255 : (val < 0 ? 0 : val)
  }

  addEnemy(){
    let killer = new Enemy([0,88,255*Math.round(Math.random())]);

    let sign = Math.random() > 0.5 ? -1 : 1
    killer.mesh.position.x = sign * Math.random()*4

    sign = Math.random() > 0.5 ? -1 : 1
    killer.mesh.position.y = sign * Math.random()*4
    return killer
  }

  generateEnemies(num){
    let initial_num_enemies = this.enemies.length;
    for(var i=0;i<num; i++){

      let enemy = this.addEnemy()
      this.enemies.push(enemy)
      scene.add(this.enemies[initial_num_enemies+i].mesh)
    }
  }

  handleEnemies(){
    let enemy
    let chance
    let numCorrupted = 0

    // dont be corrupting so much
    if(!this.corruptionTimer.running){
      this.corruptionTimer.start()
    }

    console.log('tehre are enemies ', this.enemies.length)

    for(var i=0, e_len=this.enemies.length; i<e_len; i++){

      enemy = this.enemies[i]
      if(enemy){

        // MOVEMENT
        chance = Math.random()
        if(chance > 0.3 && enemy.directionTimer.time() > 200){
          enemy.directionTimer.reset()
          enemy.chooseDirection()
        }

        // handle movement
        enemy.handleMovement()
        // draw other crap thats changing
        enemy.animation()

        // LIFE
        if(!enemy.corrupted){
          let hitresult = enemy.handleHit(player)
          if(player.lifecycle == ALIVE && hitresult){
            if(!enemy.healthTimer.running){
              enemy.healthTimer.start()
            }

            if(enemy.healthTimer.time() > 400){
              enemy.healthTimer.reset()
              enemy.takeDamage(2)
            }

            // start eating animation, which shuts itself off after timer
            player.eating = true
          }

          if(this.corruptionTimer.time() > 200) {
            // only need to handleCorruption if we're not dying
            this.corruptionTimer.reset()

            // multiply by this teeny tiny so we (mostly) get back something within the realm of 0-1
            let corruption_chance = Math.random() + ( 0.00002 * Math.pow(player.power, 2) )

            if( this.percentCorrupted < this.corruptionMax && corruption_chance > 0.80 ){
              // console.log( 'i really *should* be corrupting ' + chance_mag )
              enemy.corrupt()
              numCorrupted += 1
            }
          }  
        } else {
          // this is els if corrupted
          // console.log( player.killingCircleArea.geometry )
          if(player.killingCircle && player.killingCircle.visible){

            let hit = enemy.handleHit( player.killingCircleArea )

            if(hit){
              if(!enemy.healthTimer.running){
                enemy.healthTimer.start()
              }

              if(enemy.healthTimer.time() > 400){
                enemy.healthTimer.reset()

                enemy.takeDamage(6)
                enemy.setColor(0,0,255)
              }  
            }
          }

          let corrupthit = enemy.handleHit(player)
          if(player.lifecycle == ALIVE && corrupthit){

            if(!enemy.healthTimer.running){
              enemy.healthTimer.start()
            }

            if(enemy.healthTimer.time() > 500){
              enemy.healthTimer.reset()
  
              player.takeDamage(4)
  
              if(player.lifecycle == ALIVE && player.health <= 0){
                player.addSprite()
                player.lifecycle = DYING
                this.endGame()
              }

            }


          }

          numCorrupted += 1
        }

       if(enemy.health <= 0){
          // reward your KILLING

          // this removes the mesh right now
          if(enemy.lifecycle == ALIVE){

            // only score once

            let score
            if(enemy.corrupted){
              score = 12
            } else {

              // reg enemy
              score = 1
              player.changePower( enemy.nutritionalValue )
            }
            game.changeScore(score)
            enemy.lifecycle = DYING
            enemy.killSound()
            enemy.remove()
          }

          if(enemy.lifecycle == DEAD){
            // WAIT to actually delete enemy until we have faded out the sprite
            delete this.enemies[i]
          }
        }

      }
    }

    // strip nulls out once were done monkeying around above
    for(var i=0;i<this.enemies.length;i++){
      if(!this.enemies[i]){
        this.enemies.splice(i, 1)
      }
    }

    // record this after we've added new corrupts, and cleaned up dead enemies
    this.percentCorrupted = numCorrupted/this.enemies.length
  }  
}