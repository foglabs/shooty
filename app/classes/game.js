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
        if(chance > 0.8){
          enemy.chooseDirection()
        }

        // handle movement
        enemy.handleMovement()
        // draw other crap thats changing
        enemy.animation()

        // LIFE
        if(!enemy.corrupted){
          let hitresult = enemy.handleHit(player)
          if(hitresult){
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

          if(this.corruptionTimer.time() > 1000) {
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

                enemy.takeDamage(1)
                enemy.setColor(0,0,255)
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
              score = 5
            } else {

              // reg enemy
              score = 1
              player.changePower(1)
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