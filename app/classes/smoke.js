class Smoke {
  constructor(originX, originY){
    this.originX = originX
    this.originY = originY

    let bubble = new SmokeBubble(this.originX, this.originY, 0.1)
    scene.add( bubble.mesh )
    this.bubbles = [bubble]

    // when should I add more bubbs
    this.growTimer = new Timer()
    this.growTimer.start()
  }

  grow(newBubX, newBubY){
    if(this.bubbles.length < 160){
      // console.log( 'i grow' )

      let bubIndex = Math.floor( Math.random() * this.bubbles.length )
      let newBubRadius = Math.max(0.2, Math.random() * 1)

      let newBub = new SmokeBubble(newBubX, newBubY, newBubRadius)
      scene.add( newBub.mesh )
      this.bubbles.push( newBub )
    }
  }

  remove() {
    // one smoke is made of multiple smokebubbles
    for(var i=0; i<this.bubbles.length; i++){
      if(this.bubbles[i]){
        this.bubbles[i].remove()
      }
    }
  }

  animation(){
    let thisGrowTime = 400
    if(this.growTimer.time() > thisGrowTime){
      this.growTimer.reset()
      // console.log( 'grow timer up' )
      // random bubble
      // let bub = this.bubbles[ Math.floor( Math.random() * this.bubbles.length ) ]

      // first living bubble
      if(this.bubbles[0]){
  
        let bub = this.bubbles.find(b => b.lifecycle == ALIVE)
        if(bub){
          // random inside bub circle
          let newBubPos = bub.randomPosition()
          // console.log( 'new bub ops', newBubPos )

          this.grow(newBubPos[0], newBubPos[1])
        }        
      }

    }

    let bubble
    for(var i=0; i<this.bubbles.length; i++){
      bubble = this.bubbles[i]
      if(bubble){
        // smokebubble animation 
        if(bubble.lifecycle == DEAD){
          bubble.remove()
          delete this.bubbles[i]
        } else {
          // alive or dying
          bubble.animation()
        }
      }
    }

    // leave them nils, use that to signal end smoke
    // for(var i=0; i<this.bubbles.length; i++){
    //   if(!this.bubbles[i]){
    //     // strip them niiiils
    //     this.bubbles.splice(i, 1)
    //   }
    // }
  }
}