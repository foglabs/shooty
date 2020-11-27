class Contract {
  constructor(type, cost, targetId=null, clientId=null){

    this.type = type
    // player or enemy
    this.cost = cost
    
    if(targetId){
      this.targetId = targetId
    }

    if(clientId){
      this.clientId = clientId
    }
  }

  newTarget(targetId){
    this.targetId = targetId
  }
}