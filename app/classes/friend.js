class Friend extends Character {
  constructor(health, power, baseColor){
    let geo = new THREE.TetrahedronGeometry(2)
    super(geo, new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()), baseColor)

    this.health = health
    this.power = power
    this.damageTimer = new Timer()
    this.damageTimer.start()  
  }

  changePower(pwr){
    this.power = incInRange(this.power, pwr, 0, this.powerMax())
  }

  attack(other_char){
    let health = other_char.health
    let pwr = Math.round( health * ( Math.pow(health, 2)/300 - 1/20*health + 0.1  ) )

    if(pwr <= this.power){
      // do % damage to other aguy
      other_char.takeDamage(pwr)

      // spend that much power
      this.changePower(-1*pwr)
    }
  }

  powerMax(){
    player.level * 25
  }

  customMovement(){
    // chase a fucker, sometimes
  }
}