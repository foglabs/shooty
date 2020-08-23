class Sound {
  constructor(soundFile, type=FX){
    this.soundFile = soundFile
    this.type = type
  }

  play(interupt=true){
    if(interupt){
      if(this.soundFile.isPlaying){
        this.soundFile.stop()
      }

      this.soundFile.play()
    }
  }
}



