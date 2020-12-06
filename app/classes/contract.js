class Contract {
  constructor(type, cost, targetId=null, clientId=null){

    // contract doesnt handle any of the money changing hands, because we want to be able to pay more into an existing contract and other suich weird shit

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