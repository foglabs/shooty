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

    // this builds up the more you EAT
    this.power = 0
    this.killingCircle = null
    this.killingCircleTimer = new Timer()
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

  changePower(pow){
    this.power += pow
    // lock em in 
    if(this.power < 0){
      this.power = 0
    } else if(this.power > game.powerMax){
      this.power = game.powerMax
    }
  }

  addKillingCircle(){
    // bigger power, bigger circle
    let geometry = new THREE.Geometry()
    this.killingCircle = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xFFFFFF }))
    scene.add(this.killingCircle)
  }

  drawKillingCircle(){
    let segmentCount = 32
    let radius
    // why doesnt this work
    radius = this.power/game.powerMax*2
    console.log(  radius )
    // this works
    radius = 2
    this.killingCircle.geometry.vertices = []
    for (var i = 0; i <= segmentCount; i++) {
      var theta = (i / segmentCount) * Math.PI * 2
      this.killingCircle.geometry.vertices.push( new THREE.Vector3( Math.cos(theta) * radius, Math.sin(theta) * radius, 0 ) )
    }
  }

  useKillingCircle(){
    if(!this.killingCircle){
      this.addKillingCircle()
      this.drawKillingCircle()
    } else {
      this.killingCircle.visible = true
    }

    if(!this.killingCircleTimer.running){
      this.killingCircleTimer.start()
    }

    if(this.killingCircleTimer.time() > 60){
      this.drawKillingCircle()
    }
  }

  stopKillingCircle(){
    if(this.killingCircle){
      this.killingCircle.visible = false
    }
  }

  customMovement(){
    if(this.killingCircle){
      this.killingCircle.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    }
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
            // console.log( 'going up' )
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