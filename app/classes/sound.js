class Sound {
  constructor(soundFilePath, volume=3.0){

    this.soundFilePath = soundFilePath
    this.soundFile = new THREE.Audio(listener)
    this.volume = volume

    this.loadSound(this.soundFile, this.volume, () => {
      this.loaded = true
      // console.log( 'oh boy im done' )
    })

    this.loaded = false
  }

  loadSound(soundFile, volume, imDone){
    let loaded = false
    audioLoader.load(this.soundFilePath, function(buff) {
      soundFile.setBuffer( buff )
      soundFile.setVolume( volume )

      imDone()
    })
  }

  setVolume(vol){
    this.volume = vol
    this.soundFile.setVolume( vol )
  }

  playing(){
    return this.soundFile.isPlaying
  }

  play(interupt=true){
    if(interupt){
      if(this.soundFile.isPlaying){
        this.soundFile.stop()
      }

      this.soundFile.play()
    }
  }

  stop(){
    this.soundFile.stop()
  }
}



