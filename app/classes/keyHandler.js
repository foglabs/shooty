class KeyHandler {
  constructor(){

    this.keyHeats = {}
    this.keyHeats["ArrowLeft"] = 0
    this.keyHeats["ArrowUp"] = 0
    this.keyHeats["ArrowRight"] = 0
    this.keyHeats["ArrowDown"] = 0

    this.heldKeys = {}

    this.heatingElement = 0.015
    this.coolingFactor = 2.2
    this.maxHeat = 0.1

    this.tempTimer = new Timer()
    this.tempTimer.start()
  }

  calcAccChange(heat){
    // us eheat to give dee acc
    // return 0.5
    // return 1/6 * Math.pow( heat, 2 )
    return 1/4 * Math.log( 10 * (heat + 0.1) )
  }

  heatKey(keyName){

    // this.keyHeats[ keyName ] += this.heatingElement
    this.keyHeats[ keyName ] = incInRange( this.keyHeats[ keyName ], this.heatingElement, 0, this.maxHeat )    
    // this.keyHeats[ keyName ] += 0.015

    // cool the opposing key so we keep our fake sense of momentum
    if (keyName == "ArrowLeft"){
      this.coolKey("ArrowRight")
    } else if (keyName == "ArrowUp"){
      this.coolKey("ArrowDown")
    } else if (keyName == "ArrowRight"){
      this.coolKey("ArrowLeft")
    } else if (keyName == "ArrowDown"){
      this.coolKey("ArrowUp")
    }        
  }

  coolKey(keyName){
    // this.keyHeats[ keyName ] -= 0.34
    // this.keyHeats[ keyName ] -= this.heatingElement*this.coolingFactor
    this.keyHeats[ keyName ] = incInRange( this.keyHeats[ keyName ], this.heatingElement*this.coolingFactor, 0, this.maxHeat )    

    // this.keyHeats[ keyName ] -= 0.09
    if(this.keyHeats[ keyName ] < 0){
      this.keyHeats[ keyName ] = 0
    }
  }

  handleKeyTemp(){

    // 10 ms response time on heating cooling
    if( this.tempTimer.time() > 40 ){
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
            player.accx -= accChange
          } else if (keyName == "ArrowUp"){
            // console.log("up")
            player.accy += accChange
          } else if (keyName == "ArrowRight"){
            // console.log("right")
            player.accx += accChange
          } else if (keyName == "ArrowDown"){
            // console.log("down")
            player.accy -= accChange
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
}
