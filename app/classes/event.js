class Event {
  constructor(characterIndex, startTime, destinationX, destinationY){
    this.characterIndex = characterIndex
    this.startTime = startTime
    this.destinationX = destinationX
    this.destinationY = destinationY
    this.running = false
  }
}