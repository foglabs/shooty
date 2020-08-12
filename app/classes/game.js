class Game {
  constructor(){

    this.playing = false
    this.score = 0

    // this gets filled in index
    this.enemies = []
  }

  changeScore(change){
    this.score += change
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

  moveEnemies(){
    for(var i=0;i<this.enemies.length;i++){
      if(this.enemies[i]){
        // protect against this in case we deleted the enemy already
        if(Math.random() > 0.8){
          this.enemies[i].chooseDirection()
        }

        this.enemies[i].handleMovement()
        this.enemies[i].animation()  
      }
      
    }
  }

  handleLife(){

    // check if intersecting
    for(var i=0;i<this.enemies.length;i++){

      // protect this so a second event doesnt try to do this while a first event has already deleted that boy
      if(this.enemies[i]){
        let hitresult = this.enemies[i].handleHit(player)
        if(hitresult){
          this.enemies[i].takeDamage(2)

          // start eating animation, which shuts itself off after timer
          player.eating = true
        }

        if(this.enemies[i].health <= 0){
          // reward your KILLING

          // this removes the mesh right now
          if(this.enemies[i].lifecycle == 'ALIVE'){

            // only score once
            game.changeScore(1)
            player.changePower(5)
            this.enemies[i].lifecycle = 'DYING'
            this.enemies[i].remove()
          }

          if(this.enemies[i].lifecycle == 'DEAD'){
            // WAIT to actually delete enemy until we have faded out the sprite
            delete this.enemies[i]
          }
        }  
      }
    }

    // strip out nulls
    for(var i=0;i<this.enemies.length;i++){
      if(!this.enemies[i]){
        this.enemies.splice(i, 1)
      }
    }

  }

  handleCorruption(){
    for(var i=0;i<this.enemies.length;i++){

      let chance
      let chance_mag
      if(!this.enemies[i].corrupted){

        // up to a max of 3
        // chance = 1 + 2 * 
        // divide by maximum possible value
        chance_mag = Math.random()/2 + (2^(player.power/10))/1024
        console.log('chance mag was ' + chance_mag )

        if( chance_mag > 0.85 ){
          console.log( 'i really should be corrupting' )
          this.enemies[i].corrupt()
        }
      }
    }
  }

}