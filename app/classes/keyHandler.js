class KeyHandler {
  constructor(){

    this.keyHeats = {}
    this.keyHeats["ArrowLeft"] = 0
    this.keyHeats["ArrowUp"] = 0
    this.keyHeats["ArrowRight"] = 0
    this.keyHeats["ArrowDown"] = 0

    this.heldKeys = {}

    this.heatTimer = new Timer()
    this.heatTimer.start()
    this.coolTimer = new Timer()
    this.coolTimer.start()
  }

  calcAccChange(heat){
    // us eheat to give dee acc
    // return 0.5
    return 1/6 * Math.pow( heat, 2 )
  }

  heatKey(keyName){
    if(this.heatTimer.time() > 30){

      // add heat every 30
      this.heatTimer.reset()
      this.keyHeats[ keyName ] += 0.015
    }
  }

  coolKey(keyName){

    if( this.coolTimer.time() > 30 ){
      this.coolTimer.reset()
     
      this.keyHeats[ keyName ] -= 0.03
      if(this.keyHeats[ keyName ] < 0){
        this.keyHeats[ keyName ] = 0
      }
      // console.log( 'cooling ', keyName, this.keyHeats[keyName] )

      let coolAmount = 0.03

      if (keyName == "ArrowLeft"){
        // console.log("left")
        player.accx += coolAmount
        if(player.accx > 0){
          player.accx = 0
        }      
      } else if (keyName == "ArrowUp"){
        // console.log("up")
        player.accy -= coolAmount
        if(player.accy < 0){
          player.accy = 0
        }      
      } else if (keyName == "ArrowRight"){
        // console.log("right")
        player.accx -= coolAmount
        if(player.accx < 0){
          player.accx = 0
        }
      } else if (keyName == "ArrowDown"){
        // console.log("down")
        player.accy += coolAmount
        if(player.accy > 0){
          player.accy = 0
        }
      }       



    }
  }

  handleKeyTemp(){
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
    }
  }
}
