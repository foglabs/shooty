class Event {
  constructor(characterIndex, startTime, destinationX, destinationY, announcementText=null, power=null, turnOnPower=null){
    this.characterIndex = characterIndex
    this.startTime = startTime
    this.destinationX = destinationX
    this.destinationY = destinationY
    this.running = false

    this.announcementText = announcementText
    this.power = power
    this.turnOnPower = turnOnPower

  }

  activatePower(power){
    if(power == DEMOSWORD){
      // sword
      player.startSword()
    } else if(power == DEMOCIRCLE){
      player.startKillingCircle()
    }
  }

  deactivatePower(power){
    if(power == DEMOSWORD){
      // sword
      player.stopSword()
    } else if(power == DEMOCIRCLE){
      player.stopKillingCircle()
    }
  }
}