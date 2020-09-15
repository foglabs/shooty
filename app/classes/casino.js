class Casino {
  constructor(){
    // amount of power/whajtever wagered
    this.bet = 0

    this.choice = CHO

    this.highlights = {}

    this.result = null
    this.resultPending = true

    this.dice = []

    this.phase = BETTING
    this.phaseTimer = new Timer()
    this.phaseTimer.start()

    this.highlightTimer = new Timer()
    this.highlightTimer.start()

    this.rollTimer = new Timer()
  }

  remove(){
    // remove dice
  }

  increaseBet(amt){
    if(player.power >= amt){
      this.bet += amt
      player.changePower(-1*amt)
    }
  }

  handlePlay(){

    if(this.phase == BETTING){
      this.drawBetting()

      if(this.phaseTimer.time() > 3000){
        // 3s of betting
        this.phase = ROLLING
        this.phaseTimer.reset()
      }

    } else if(this.phase == ROLLING){


      console.log( 'now set highligh' )
      if(this.highlightTimer.time() > 400){
        this.highlightTimer.reset()

        this.removeHighlights()

        let totalNumEnemies = Object.keys(game.enemies).length
        // use size of bet as percentage of enemies to affect
        let numEnemies = Math.ceil( totalNumEnemies * ( this.bet/100 ) )
        console.log( 'percetnt', this.bet/100 )
        console.log( 'taotal enemyes', totalNumEnemies )
        console.log( 'num casino enemies ', numEnemies )
        this.setHighlights( numEnemies )
      }

      this.drawRolling()

      if(this.dice.length < 2){
        // roll 1 die every 800ms uuntiol we have 2
        if(!this.rollTimer.running){
          this.rollTimer.start()
        }

        if(this.rollTimer.time() > 800){
          this.addRoll()
        }
      } else {

        if(this.phaseTimer.time() > 3000){
          this.phase = RESULT
          this.phaseTimer.reset()
        }
      }

    } else if(this.phase == RESULT){
      this.drawResult()

      if(this.phaseTimer.time() > 3000){
        this.phase = PAYOUT
        this.phaseTimer.reset()
      }

    } else if(this.phase == PAYOUT){
      this.drawPayout()

      if(this.resultPending){

        if(this.result == WIN){
          this.win()
        } else if(this.result == LOSE) {
          this.lose()
        }

        // clean up spriites now that we dont need markers to track targets
        this.removeHighlights()

        // flag this out so we dont try to killi stuff whats already dead
        this.resultPending = false
      }

      if(this.phaseTimer.time() > 3000){
        // handled from game, not here
        this.phase = DONE
        this.phaseTimer.reset()
      }
    }
  }

  drawBetting(){
    game.announcement("BET: $" + this.bet * 10)
  }

  drawRolling(){
    let rollStr
    for(var i=0; i<this.dice.length; i++){
      // add dice as they become available
      rollStr += " " + this.dice[i]
    }
    game.announcement("ROLLING: ")
  }

  drawResult(){
    let won = this.getResult()
    let roll = this.rollResult()
    let rollStr = roll % 2 == 0 ? "CHO" : "HAN"

    let resultStr = won ? "WIN" : "LOSE"
    this.result = won ? WIN : LOSE
    game.announcement("ROLLED " + rollStr + " " + (this.dice[0] + this.dice[1]) + " - " + resultStr)
  }

  drawPayout(){
    let msg
    let num = Object.keys(this.highlights).length
    if(this.result == WIN){
      msg = "YOU WIN - KILL " + num
    } else {
      msg = "YOU LOSE - CORRUPT " + num
    }

    game.announcement(msg)
  }

  setHighlights(num){
    let enemyIds = shuffle( Object.keys(game.enemies) )
    for(var i=0; i<num; i++){
      console.log( 'about to pop enemids' )
      this.addHighlight( enemyIds.pop() )
    }
  }

  addHighlight(enemyId){
    let enemy = game.enemies[enemyId]
    if(enemy){
      console.log( 'found enemy' )
      // highlight sprite - scales a guess
      enemy.addSprite(casinohighlightMaterial.clone(), 0.777, true, 0.8)
      this.highlights[enemyId] = true
      // scene.add( this.highlights[enemyId] )
      console.log( 'added highlights' )
    }
  }

  addRoll(){
    this.dice.push( Math.ceil(Math.random() * 6) )
  }

  rollResult(){
    return this.dice[0] + this.dice[1]
  }

  getResult(){
    let roll = this.rollResult()
    // this is just for fun, choices are CHO AND HAN
    // 0 and 1 (odd or even)
    console.log( 'roll 1 ', this.dice[0] )
    console.log( 'roll 2 ', this.dice[1] )
    console.log( 'roll ', roll )
    console.log( 'res ', roll % 2 == this.choice )
    return roll % 2 == this.choice
  }

  win(){
    let enemyIdsToKill = Object.keys(this.highlights)
    let enemy
    for(var i=0; i<enemyIdsToKill.length; i++){
      enemy = game.enemies[ enemyIdsToKill[i] ]
      // regular enemy loop will kill this fool

      if(enemy){
        // kil that sprite now cause it wont get cleaned up
        this.removeHighlight(enemy.id)

        // might be gone already oh well!
        enemy.health = 0
      }
    }

    player.changePower(2*this.bet)
  }

  lose(){
    let enemyIdsToCorrupt = Object.keys(this.highlights)
    for(var i=0; i<enemyIdsToCorrupt.length; i++){

      if(!game.enemies[ enemyIdsToCorrupt[i] ].corrupted){
        game.enemies[ enemyIdsToCorrupt[i] ].startCorrupting()
      }
    }

    player.changePower(-1*this.bet)
  }

  removeHighlights(){
    let highlights = Object.keys(this.highlights)
    for(var i=0; i<highlights.length; i++){
      this.removeHighlight( highlights[i] )
    }
  }

  removeHighlight(enemyId){
    console.log( 'byelight!', enemyId )
    // have to be extra paranoid about enemy being gone because klilling continues as we wait for result
    if(this.highlights[enemyId] && game.enemies[ enemyId ]){
      game.enemies[ enemyId ].removeSprite()
      delete this.highlights[enemyId]
    }

  }

  // animation(){
  //   let enemyKeys = Object.key(this.highlights)
  //   for(var i=0; i<enemyKeys.length; i++){
  //     this.
  //   }
  // }
}