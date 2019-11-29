function Player(color) {
    this.money = 100;
    this.income = 20;
    this.color = color;
    this.ownedSquares = [];
    this.startSquare;
    this.isAi = false;
}
Player.prototype = {
    setStartSquare: function (startSquare){
        this.startSquare = startSquare
        this.startSquare.changeOwner(this);
        //In order to make the troops belong to the right player
        
        this.startSquare.units.push(new Troops(startSquare))
        this.startSquare.units[0].killObject()
        this.startSquare.units[0].setAmount(3)
        this.startSquare.spawnHeadquarters();
    },

    changeMoney: function (amount){
        this.money += amount;
        if (this == currentPlayer){
            lblMoney.text = 'Money: ' + this.money;
        }
    },
    changeIncome: function(amount){
        this.income += amount;
    },
    changeOwnedSqrs: function(amount){
        if (this === unowned) {
            return
        }
        this.ownedSquares += amount
        
    },
    addOwnedSquare: function(square){
        this.ownedSquares.push(square)
    },
    removeOwnedSquare: function(square){
        if (this === unowned) {
            return
        }
        var index = this.ownedSquares.indexOf(square)
        if (index > -1){
            this.ownedSquares.splice(index, 1)
        }
        //Calls game over if player runs out of squares
        if (this.ownedSquares.length <= 0){
            game.state.start("gameOverState", true, false, currentPlayer)
        }
    },

    ai: function () {
        var selectedSquare
        var hostileSquares = []
        var targetSquare
        var reserves = []
        var frontline = []

        this.weakestFrontline = function () {
            var weakest = frontline[0];
            for (var i = 1; i < frontline.length; i ++){
                if (frontline[i].units[0].amount > weakest.units[0].amount)
                    weakest = frontline[i]
            }
            return weakest
        }
        //Recruiting, only if still owns start square
        if(this.startSquare.owner === this){
            var newTroops = (this.money - gameProperties.buildCosts.bunker) / gameProperties.buildCosts.troops
            this.startSquare.recruitToWhom(newTroops)
        }
        

        for (var i = 0; i < this.ownedSquares.length; i ++){//Counts up so it detecs squares more likely to be reserves first
            selectedSquare = this.ownedSquares[i]

            //Building
            if (this.money >= gameProperties.buildCosts.bunker){

                if (Math.random() > 0.5){
                    selectedSquare.bunker.build()
                }else{
                    selectedSquare.railway.build()

                }
            }

            hostileSquares = selectedSquare.isFrontline()
            console.log(hostileSquares);
            if (hostileSquares.length > 0){
                targetSquare = hostileSquares[game.rnd.integerInRange(0, hostileSquares.length - 1)]
                frontline.push(selectedSquare)
                if (targetSquare.units[0].amount < selectedSquare.units[0].amount){
                    selectedSquare.units[0].attack(targetSquare)
                    targetSquare.mergeUnits()
                } 
                if (reserves.length > 0){
                    console.log('Reserves length ' + reserves[reserves.length - 1]);
                    reserves[reserves.length - 1].units[0].moveToward(selectedSquare)
                    selectedSquare.mergeUnits()
                    reserves.splice(reserves.length - 1, 1)
                }
            } else {
                if (selectedSquare.units[0].amount > 0){
                    reserves.push(selectedSquare)//Squares that aren't on the frontline is added to reserves and used for reinforcing
                }
            }
        }
        //Move remaining reserves to the weakest fronts
        if(reserves.length >= 1)
        for (var i = reserves.length - 1; i >= 0; i--){
             var weakest = this.weakestFrontline()
             console.log(weakest)
            reserves[i].units[0].moveToward(weakest)
            reserves.splice(i, 1)
        }
    },
}