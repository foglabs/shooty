class Player extends Character {
  constructor(base_color){
    super(
      // de mesh
      new THREE.Mesh(
        new THREE.BoxGeometry(0.2,0.2,0.3),
        new THREE.MeshBasicMaterial( { color: 0xdf8849 } )
      ),
      
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.health = 100
    
    // flag for animation etc
    this.eating = false

    this.animTimer = new Timer()
    this.eatingTimer = new Timer()
  }
  
  rotation(){
    let fac = Math.random()
    // let sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.x += 0.08 * fac
    fac = Math.random() * 0.003
    // sign = Math.random() > 0.5 ? 1 : -1
    this.mesh.rotation.y += 0.08 * fac
  }

  takeDamage(dmg){
    this.health -= dmg
  }

  customAnimation(){
    this.eatAnimation()    
  }


  eatAnimation(){
    if(this.eating){
      if(!this.eatingTimer.running){
        this.eatingTimer.start()
      }
    }

    if(this.eating || this.scaleFactor > 1 || this.scaleFactor < 1){

      // console.log( 'scaleFactor ' + this.scaleFactor )
      if(!this.animTimer.running){
        this.animTimer.start()
      } 

      // how often should we actually change mesh
      if(this.animTimer.time() > 100){
        // 20ms
        this.animTimer.reset()
        
        if(this.eating){
          // if we eatin, scale that badboy up
          if(this.scaleFactor < 3){

            let red = this.red()
            let blue = this.blue()
            red = red < 180 ? red + 1 : 180
            blue = blue > 40 ? blue - 40 : 40
            this.setColor(red, this.green(), blue )

            this.scaleFactor += 0.005
            console.log( 'going up' )
          }

        } else {

          if(this.scaleFactor > 1) {

            // if we're full, but still big, shrink on down
            this.scaleFactor -= 0.005

            let red = this.red()
            let blue = this.blue()
            blue = blue < 180 ? blue + 1 : 180
            red = red > 40 ? red - 2 : 40
            this.setColor(red, this.green(), blue )

            // console.log( 'reduced to ' + this.scaleFactor )

            if(this.scaleFactor < 1.0){
              // console.log( 'reset going down' )
              this.scaleFactor = 1.0
            }
          }
        
        }
      }

      // if we're in here, were doing somethin right
      this.mesh.scale.x = this.scaleFactor
      this.mesh.scale.y = this.scaleFactor
      this.mesh.scale.z = this.scaleFactor
    }

    if(this.eatingTimer.time() > 200){
      this.eating = false
      this.eatingTimer.stop()
      // console.log( 'stop eating' )
    }

  }

}