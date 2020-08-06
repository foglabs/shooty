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

  addEnemy(){
    let killer = new Enemy([0,88,255*Math.round(Math.random())]);

    let sign = Math.random() > 0.5 ? -1 : 1
    killer.mesh.position.x = sign * Math.random()*4

    sign = Math.random() > 0.5 ? -1 : 1
    killer.mesh.position.y = sign * Math.random()*4
    return killer
  }

  generateEnemies(num){
    let initial_num_enemies = game.enemies.length;
    for(var i=0;i<num; i++){

      let enemy = this.addEnemy()
      this.enemies.push(enemy)
      scene.add(game.enemies[initial_num_enemies+i].mesh)
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
          game.changeScore(1)

          this.enemies[i].remove()
          delete this.enemies[i]
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
}