class Player extends Character {
  constructor(base_color){
    super(
      // de mesh
      new THREE.Mesh(
        new THREE.BoxGeometry(0.2,0.2,0.3),
        new THREE.MeshBasicMaterial( { color: 0xdf8849, transparent: true } )
      ),
      
      // de box
      new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()),
      base_color
    )

    this.health = 10
    
    // flag for animation etc
    this.eating = false

    this.animTimer = new Timer()
    this.eatingTimer = new Timer()

    // this builds up the more you EAT
    this.power = 0
    // so we can limit power-related drawing
    this.lastPower = 0
    this.killingCircle = null
    this.killingCircleArea = {}
    this.killingCircleArea.mesh = null
    this.killingCircleArea.bbox = null
    this.killingCircleActive = false

    this.killingCircleTimer = new Timer()

    this.mesh.material.needsUpdate = true
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
    this.lastPower = this.power
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
    this.killingCircle.geometry.verticesNeedUpdate = true
    // console.log( 'we addin that damn cirlce bitch  ' )
    

    // toprad, bottomrad, height, segments
    this.killingCircleArea.mesh = new THREE.Mesh( new THREE.CylinderGeometry(1, 1, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0xffdd22, transparent: true  }) )
    // about face on to camera
    this.killingCircleArea.mesh.rotation.x = 1.57
    this.killingCircleArea.mesh.material.opacity = 0.1


    this.drawKillingCircle()
    scene.add(this.killingCircle, this.killingCircleArea.mesh)
  }

  removeKillingCircle(){
    this.killingCircle.geometry.dispose()
    this.killingCircle.material.dispose()
    scene.remove(this.killingCircle)
    this.killingCircle = null

    this.killingCircleArea.mesh.geometry.dispose()
    this.killingCircleArea.mesh.material.dispose()
    scene.remove(this.killingCircleArea.mesh)
    this.killingCircleArea.mesh = null
    this.killingCircleArea = {}

  }

  drawKillingCircle(){

    let segmentCount = 32
    let radius
    // why doesnt this work
    radius = this.power/game.powerMax*2
    // console.log( 'rad is ', radius )
    // this works
    // radius = 1
    // only redraw if we changed size

    this.killingCircle.geometry.vertices = []
    var theta
    for (var i = 0; i <= segmentCount; i++) {
      theta = (i / segmentCount) * Math.PI * 2
      this.killingCircle.geometry.vertices.push( new THREE.Vector3( Math.cos(theta) * radius, Math.sin(theta) * radius, 0 ) )
    }

    // update
    this.killingCircleArea.mesh.scale.set( radius*1.1, radius*1.1, radius*1.1 )
  }

  startKillingCircle(){
    if(!this.killingCircle){
      this.addKillingCircle()
    }

    this.killingCircle.visible = true
    this.killingCircleArea.mesh.visible = true

    if(!this.killingCircleTimer.running){
      // console.log( 'bgegin circ timer' )
      this.killingCircleTimer.start()
    }
  }

  stopKillingCircle(){
    if(this.killingCircle && this.killingCircle.visible){
      // console.log( 'stop that circle' )
      this.killingCircle.visible = false
      this.killingCircleArea.mesh.visible = false
    }
  }

  customMovement(){
    if(this.killingCircle && this.killingCircle.visible){
      // console.log( 'move tha tcircle' )
      this.killingCircle.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
      this.killingCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
    }
  }

  customAnimation(){
    if(this.lifecycle == ALIVE){
      this.rotation()

      this.eatAnimation()
      if(this.killingCircle && this.killingCircle.visible){
          
        if(this.killingCircleTimer.time() > 100){
          this.killingCircleTimer.reset()
          // console.log( 'time to draw bitch' )
          this.removeKillingCircle()
          this.addKillingCircle()
          this.killingCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)


          // spend power to have killing circle open
          this.changePower(-4)
        }

        this.drawKillingCircle()
        this.killingCircle.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
        this.killingCircleArea.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)

        if(this.killingCircleArea && this.killingCircleArea.mesh){
          this.killingCircleArea.bbox = new THREE.Box3().setFromObject( this.killingCircleArea.mesh )
        }

      }
    } else if(this.lifecycle == DYING){
      this.deathAnimation()
    }
  }

  deathAnimation(){
    if(!this.animTimer.running){
      this.animTimer.start()
    }

    if(this.animTimer.time() > 20){
      this.animTimer.reset()

      this.mesh.rotation.y += 0.08

      let x,y,z
      x = this.mesh.scale.x * 1.009
      y = this.mesh.scale.y * 1.004
      z = this.mesh.scale.z * 1.009
      this.mesh.scale.set(x,y,z)

      this.mesh.material.opacity -= 0.01

      if(this.mesh.material.opacity <= 0){
        console.log( 'YOU HAVE DIED' )
        this.lifecycle = DEAD
      }
    }

  }

  eatAnimation(){
    if(this.eating){
      if(!this.eatingTimer.running){
        this.eatingTimer.start()
      }
    }

    if(this.eating || this.scaleFactor > 1 || this.scaleFactor < 1){
      console.log('eatters')
      // console.log( 'scaleFactor ' + this.scaleFactor )
      if(!this.animTimer.running){
        this.animTimer.start()
      } 

      // how often should we actually change mesh
      if(this.animTimer.time() > 1000){
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