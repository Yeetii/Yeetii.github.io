function Player(color) {
    this.money = 100;
    this.income = 20;
    this.color = color;
    this.ownedSquares = [];
    this.startSquare;
    this.isAi = false;

    this.setStartSquare = function (startSquare){
        this.startSquare = startSquare
        this.startSquare.setTroops(3)
        this.startSquare.changeOwner(this);
        this.startSquare.spawnHeadquarters();
    }

    this.changeMoney = function (amount){
        this.money += amount;
        if (this == currentPlayer){
            lblMoney.text = 'Money: ' + this.money;
        }
    };
    this.changeIncome = function(amount){
        this.income += amount;
    };
    this.changeOwnedSqrs = function(amount){
        if (this === unowned) {
            return
        }
        this.ownedSquares += amount
        
    }
    this.addOwnedSquare = function(square){
        this.ownedSquares.push(square)
    }
    this.removeOwnedSquare = function(square){
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
    }

    this.ai = function () {
        var selectedSquare
        var hostileSquares = []
        var targetSquare
        var reserves = []
        //Recruiting, only if still owns start square
        if(this.startSquare.owner === this){
            var newTroops = (this.money - gameProperties.buildCosts.bunker) / gameProperties.buildCosts.troops
            this.startSquare.recruit(newTroops)
        }
        

        for (var i = 0; i < this.ownedSquares.length; i ++){//Counts up so it detecs squares more likely to be reserves first
            selectedSquare = this.ownedSquares[i]

            //Building
            if (this.money >= gameProperties.buildCosts.bunker){

                if (Math.random() > 0.5){
                    selectedSquare.buildBunker()
                }else{
                    selectedSquare.buildRailway()

                }
            }

            hostileSquares = selectedSquare.isFrontline()
            console.log(hostileSquares);
            if (hostileSquares.length > 0){
                targetSquare = hostileSquares[game.rnd.integerInRange(0, hostileSquares.length - 1)]
                if (targetSquare.troops < selectedSquare.troops){
                    targetSquare.attack(selectedSquare)
                } 
                if (reserves.length > 0){
                    console.log(reserves[reserves.length - 1]);
                    reserves[reserves.length - 1].moveToward(reserves[reserves.length - 1], selectedSquare)
                    reserves.splice(reserves.length - 1, 1)
                }
            } else {
                if (selectedSquare.troops > 0){
                    reserves.push(selectedSquare)//Squares that aren't on the frontline is added to reserves and used for reinforcing
                }
            }
        }
    }
}