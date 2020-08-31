class Music extends Sound {
  constructor(soundFile, volume){
    super(soundFile, volume)
    this.soundFile.setLoop(true)
  }
}