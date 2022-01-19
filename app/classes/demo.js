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

    // console.log( 'im handlin it' )
    if(this.lengthTimer.time() < this.length){
      for(var i=0; i<this.events.length; i++){
        if( this.events[i] ){

          // is it time to run this event yet
          event = this.events[i]
          // console.log( 'heres an event', event )
          if(this.lengthTimer.time() > event.startTime){


            if(!event.running && event.announcementText){
              game.announcement(event.announcementText)
            }

            event.running = true

          }

          if(event.running){
            this.characters[ event.characterIndex ].moveTowardsPoint(event.destinationX, event.destinationY)

            if(isWithin(this.characters[event.characterIndex].mesh.position.x, event.destinationX, 0.2) && isWithin(this.characters[event.characterIndex].mesh.position.y, event.destinationY, 0.2) ){

              // console.log( 'arrived at ', event.destinationX, event.destinationY )

              this.characters[ event.characterIndex ].accx = this.characters[ event.characterIndex ].accx / 2
              this.characters[ event.characterIndex ].accy = this.characters[ event.characterIndex ].accx / 2

              // kill it
              this.events[i] = null
            }
          }
        }  
      }

    } else {
      this.cleanDemo()
    }

  }

  cleanDemo(){
    this.events = null
    let char
    for(var i=0; i<this.characters.length; i++){

      if(this.characters[i]){

        // clean it up!
        this.characters[i].removeNow()
      }
    }

    player.removeNow()

    this.running = false
    this.characters = []
  }

}