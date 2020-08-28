class KeyHandler {
  constructor(){

    this.keyHeats = {}
    this.keyHeats["ArrowLeft"] = 0
    this.keyHeats["ArrowUp"] = 0
    this.keyHeats["ArrowRight"] = 0
    this.keyHeats["ArrowDown"] = 0

    this.heldKeys = {}

    this.tempTimer = new Timer()
    this.tempTimer.start()
  }

  calcAccChange(heat){
    // us eheat to give dee acc
    // return 0.5
    // return 1/6 * Math.pow( heat, 2 )
    return 1/3 * Math.log( 10 * (heat + 0.1) )
  }

  heatKey(keyName){

    this.keyHeats[ keyName ] += 0.015

  }

  coolKey(keyName){

     
    this.keyHeats[ keyName ] -= 0.09
    if(this.keyHeats[ keyName ] < 0){
      this.keyHeats[ keyName ] = 0
    }

      // console.log( 'cooled ', keyName, ' to ', this.keyHeats[ keyName ] )
  }

  handleKeyTemp(){

    // 10 ms response time on heating cooling
    if( this.tempTimer.time() > 10 ){
      this.tempTimer.reset()
      let keys = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"]

      for(var i=0; i<4; i++){
        let thisKey = keys[i]
        
        // if its held down, heat it and move it
        if( this.heldKeys[ thisKey ] ){
          // console.log( 'i heat it', thisKey )
          // heat it
          this.heatKey( thisKey )

          // cheese it
          let accChange = this.calcAccChange( this.keyHeats[ thisKey ] )

          if (thisKey == "ArrowLeft"){
            // console.log("left")
            player.accx -= accChange
          } else if (thisKey == "ArrowUp"){
            // console.log("up")
            player.accy += accChange
          } else if (thisKey == "ArrowRight"){
            // console.log("right")
            player.accx += accChange
          } else if (thisKey == "ArrowDown"){
            // console.log("down")
            player.accy -= accChange
          }        

        } else {
          // console.log( 'i cool it', thisKey )
          // its not held, cool it
          this.coolKey( thisKey )
        }

        // console.log( 'current key temp is', thisKey, this.keyHeats[ thisKey ] )
      }

    }
  }
}
