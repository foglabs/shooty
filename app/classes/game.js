class Game {
  constructor(){

    this.playing = false
    this.score = 0

    // this gets filled in index
    this.enemies = []
    this.percentCorrupted = 0
    // bump this up to get more difficult
    this.corruptionMax = 0.8
    this.corruptionTimer = new Timer()
    
    // max playe rpower
    this.powerMax = 100
    this.stage = false
    this.stageTimer = new Timer()
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

      this.cleanEnemies()

      player.health = 100
      player.power = 0

      this.stage = LOADING
      this.stageTimer.start()
    }
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
      
      this.drawLoading()

      if(this.stageTimer.time() > 5000){
        this.stage = PLAYING
        document.getElementById("stage-info").innerHTML = ""
      }

    } else if(this.stage == PLAYING){
      this.drawPlaying()
    } else if(this.stage == ENDING){

      this.drawEnding()

      if(this.stageTimer.time() > 5000){
        this.stage = GAMEOVER
      }
    } else if(this.stage == GAMEOVER) {
      // ended
      console.log("GAME OVA")
    }

    duster.animation()
  }

  drawTitle(){
    // gridHelper.rotation.x = 80
    if(this.stageTimer.time() > 20){
      gridHelper.rotation.x  -= 0.4
    }

  }

  drawLoading(){
    document.getElementById("stage-info").innerHTML = "LOADING"
  }

  drawPlaying(){
    if(!enemyTimer.running){
      enemyTimer.start()
    }

    let remaining = enemyTimer.time()
    this.drawTimer(remaining)

    if(remaining == 0 ){

      this.generateEnemies( Math.round(Math.random() * 48 ) )

      enemyTimer.reset()
    }

    if(player.lifecycle == ALIVE){
      // stop moving if we DEAD
      player.handleMovement()
    }

    this.handleEnemies()

    player.animation()

    this.drawScore()
    this.drawPower()
    this.drawHealth()
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

    for(var i=0, e_len=this.enemies.length; i<e_len; i++){

      enemy = this.enemies[i]
      if(enemy){

        // MOVEMENT
        chance = Math.random()
        if(chance > 0.8 && enemy.directionTimer.time() > 200){
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

            // let power_mag = Math.pow(2, (player.power/10) )
            // let max_power_mag = Math.pow(2, player.powerMax/10)

            // get a 1.something factor to bump up the chance roll
            // square that ho so it ramps up

            // multiply by this teeny tiny so we (mostly) get back something within the realm of 0-1
            let corruption_chance = Math.random() + ( 0.00002 * Math.pow(player.power, 2) )

            // console.log( 'corr chance ' + corruption_chance )
            // console.log( 'adjusted by ' + ( 0.00003 * Math.pow(player.power, 2)) )
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
              player.changePower(5)
            }
            game.changeScore(score)
            enemy.lifecycle = DYING
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