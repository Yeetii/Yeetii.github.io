function Player(color) {
    this.money = 100;
    this.income = 20;
    this.color = color;
    this.ownedSquares = [];
    this.startSquare;

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
}