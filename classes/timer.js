class Timer {
  constructor(){
    this.currentTime = new Date().getSeconds()
    this.endTime = this.endTime
    this.running = false
  }

  start(){
    this.running = true
    this.currentTime = new Date().getSeconds()
  }

  stop(){
    this.running = false
    this.endTime = new Date().getSeconds()
  }

  reset(){
    this.currentTime = new Date().getSeconds
  }

  time(){
    if(this.running){
      // # of seconds since start time
      return new Date().getSeconds() - this.currentTime
    } else {
      return 0
    }
  }
}