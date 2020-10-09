class Demo {
  constructor(characters, length, events){

    this.characters = characters
    // player moves

    this.events = events
    // whent o cut demo
    this.length = length
    this.lengthTimer = new Timer()
    this.lengthTimer.start()
    this.running = true
  }

  handleDemo(){
    let event


    console.log( 'im handlin it' )
    if(this.lengthTimer.time() < this.length){
      for(var i=0; i<this.events.length; i++){
        if( this.events[i] ){

          // is it time to run this event yet
          event = this.events[i]
          console.log( 'heres an event', event )
          if(this.lengthTimer.time() > event.startTime){
            event.running = true
          }

          if(event.running){
            this.characters[ event.characterIndex ].moveTowardsPoint(event.destinationX, event.destinationY, 1.5)

            if(isWithin(this.characters[event.characterIndex].mesh.position.x, event.destinationX, 0.05) && isWithin(this.characters[event.characterIndex].mesh.position.y, event.destinationY, 0.05) ){

              // kill it
              this.events[i] = null
            }
          }

        }  
      
      }

    } else {
      this.events = null
      let char
      for(var i=0; i<this.characters.length; i++){

        if(this.characters[i]){

          // clean it up!
          this.characters[i].remove()
        }
      }


      this.running = false
    }

  }

}