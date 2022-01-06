class KeyHandler {
  constructor(){
    this.keyHeats = {}
    this.resetHeats()

    this.heldKeys = {}

    this.heatingElement = 0.00646
    // reduces heat
    this.coolingElement = -0.276
    this.maxHeat = 0.1

    this.tempTimer = new Timer()
    this.tempTimer.start()

    this.bumpTimer = new Timer()
    this.bumpTimer.start()
    this.bumpValue = 0.25

    this.keyActivity = 0
  }

  resetHeats(){
    this.keyHeats["ArrowLeft"] = 0
    this.keyHeats["ArrowUp"] = 0
    this.keyHeats["ArrowRight"] = 0
    this.keyHeats["ArrowDown"] = 0
  }

  calcAccChange(heat){
    // us eheat to give dee acc
    return 7/16 * Math.log(10 * (heat + 0.1) )
  }

  bumpKey(keyName){
    this.bumpTimer.reset()

    if (keyName == "ArrowLeft"){
      player.accx -= this.bumpValue
    } else if (keyName == "ArrowUp"){
      player.accy += this.bumpValue
    } else if (keyName == "ArrowRight"){
      player.accx += this.bumpValue
    } else if (keyName == "ArrowDown"){
      player.accy -= this.bumpValue
    }
  }

  heatKey(keyName){

    // this.keyHeats[ keyName ] += this.heatingElement
    this.keyHeats[ keyName ] = incInRange( this.keyHeats[ keyName ], this.heatingElement, 0, this.maxHeat )    
    // this.keyHeats[ keyName ] += 0.015


    // cool the opposing key so we keep our fake sense of momentum
    if (keyName == "ArrowLeft"){
      this.coolKey("ArrowRight", 2)
    } else if (keyName == "ArrowUp"){
      this.coolKey("ArrowDown", 2)
    } else if (keyName == "ArrowRight"){
      this.coolKey("ArrowLeft", 2)
    } else if (keyName == "ArrowDown"){
      this.coolKey("ArrowUp", 2)
    }
    // let coolers = ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"]
    // coolers = coolers.splice( 1, coolers.indexOf(keyName) )
    // for(var i=0; i<coolers.length; i++){
    //   this.coolKey(coolers[i], 0.005)
    // }
  }

  coolKey(keyName, mag=1){
    this.keyHeats[ keyName ] = incInRange( this.keyHeats[ keyName ], this.coolingElement*mag, 0, this.maxHeat )    

    // this.keyHeats[ keyName ] -= 0.09
    if(this.keyHeats[ keyName ] < 0){
      this.keyHeats[ keyName ] = 0
    }
  }

  handleKeyTemp(){

    // 10 ms response time on heating cooling
      this.tempTimer.reset()
      let keys = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"]

      for(var i=0; i<4; i++){
        let keyName = keys[i]
        
        // if its held down, heat it and move it
        if( this.heldKeys[ keyName ] ){
          // console.log( 'i heat it', keyName )
          // heat it
          this.heatKey( keyName )

          // cheese it
          let accChange = this.calcAccChange( this.keyHeats[ keyName ] )

          if (keyName == "ArrowLeft"){
            // console.log("left")
            // player.accx -= accChange
            player.accx = incInRange(player.accx, -1*accChange, -1*player.maxAcc, player.maxAcc)
          } else if (keyName == "ArrowUp"){
            // console.log("up")
            // player.accy += accChange
            player.accy = incInRange(player.accy, accChange, -1*player.maxAcc, player.maxAcc)
          } else if (keyName == "ArrowRight"){
            // console.log("right")
            // player.accx += accChange
            player.accx = incInRange(player.accx, accChange, -1*player.maxAcc, player.maxAcc)
          } else if (keyName == "ArrowDown"){
            // console.log("down")
            // player.accy -= accChange
            player.accy = incInRange(player.accy, -1*accChange, -1*player.maxAcc, player.maxAcc)
          }

        } else {
          // console.log( 'i cool it', keyName )
          // its not held, cool it
          this.coolKey( keyName )
        }

        // console.log( 'current key temp is', keyName, this.keyHeats[ keyName ] )
      }

    }
}
