class Timer {
  constructor(countdownTime=null){

    this.startTime = performance.now()
    this.endTime = this.startTime
    this.running = false

    this.countdownTime = countdownTime
  }

  start(){
    this.running = true
    this.startTime = performance.now()
  }

  stop(){
    this.running = false
    this.endTime = performance.now()
  }

  reset(){
    // console.log("I reset!")
    let now = performance.now()
    this.startTime = now

    this.running = true

    if(!this.countdownTime){
      this.endTime = now
    }
  }

  time(){
    if(this.running){
      // better to use millis... some kind of precision error or something from using getseconds?

      let now = performance.now()
      let msecs = now - this.startTime

      // console.log( 'msecs'+msecs )
      if(this.countdownTime){
        // flip it for countdown
        let remain = this.countdownTime - msecs

        // console.log( 'remain' +  remain )

        if(remain <= 0){

          this.running = false
          return 0
        } else {
          
          // divide so we can display in seconds
          return Math.floor(remain / 1000)
        }

      } else {
        return msecs
      }
      // # of seconds since start time
      
    } else {
      return 0
    }
  }
}