function Troops(square, amount) {
	this.amount = amount
	if (this.amount == null)
    	this.amount = game.rnd.integerInRange(1, 5);
	this.mobility = gameProperties.mobilityCosts.max
	//Should be changed? Too much info?
	this.square = square
	this.troopLbl = new TroopLbl(this.square.x, this.square.y, this.square.owner.color, this.amount, this)
}
Troops.prototype = {
	linkToSquare: function (square){
		//Remove troops from old square
		if (this.square != null)
			this.square.removeUnit(this)
		square.units.push(this)
		this.square = square
		//Move trooplabel to new square
		this.square.placeTroopLbls()
	},
	//Might be unnecessary
	killObject: function (){
		this.square.removeUnit(this)
		this.troopLbl.destroy()
		this.troopLbl = null
		this.square = null
	},

	getAmount: function (){
		return this.amount
	},

	select: function (){
		if (this.square.owner != currentPlayer)
			return
		if (selectedUnit != null){
			//Merge troops if the previously selected troop was from another square
			selectedUnit.unselect(selectedUnit.square === this.square)
		}
		selectedUnit = this
		//Enable input for buildings if they aren't already built
        this.square.bunker.enableInput()
        this.square.railway.enableInput()

		this.troopLbl.select()
	},
	unselect: function (noMerge){
		this.troopLbl.unselect()

		this.square.bunker.disableInput()
		this.square.railway.disableInput()
		if (noMerge == null || !noMerge)
			this.square.mergeUnits()
		selectedUnit = null
	},

	changeAmount: function (troops){
	    this.amount += troops;
	    if (this.amount <= 0){
	        this.amount = 0
	        this.mobility = gameProperties.mobilityCosts.max;
	    }
	    this.troopLbl.update(this.amount);
	},
	setAmount: function (troops){
	    this.amount = troops;
	    if (this.amount < 0)
	    	this.amount = 0
	    this.troopLbl.update(this.amount);
	},
	recruit: function (newTroops) {
	    if (this.square.headquarters != null){//Can only recruit in squares with headquarters
	        console.log('Recruit starts');
	        //Clean input
	        if (newTroops == null || newTroops < 1){
	            newTroops = 1
	        }
	        newTroops = parseInt(newTroops)//Makes sure there's no decimals

	        //If the player can't recruit enough he gets as many as he can afford.
	        if (currentPlayer.money <= (gameProperties.buildCosts.troops * newTroops)){
	            newTroops = parseInt(currentPlayer.money / gameProperties.buildCosts.troops)
	        }
	        //To get a not enough money popup
	        if (newTroops <= 0)
	            newTroops = 1

	        if(currentPlayer.money >= (gameProperties.buildCosts.troops * newTroops)) {
	            console.log('Recruiting ' + newTroops);
	            currentPlayer.changeMoney(-(gameProperties.buildCosts.troops * newTroops));
	            this.changeAmount(newTroops)
	        } else {
	            new MoneyPopup(gameProperties.buildCosts.troops * newTroops)
	        }
	    } 
	},
	attack: function (defender) {
		//There can only be either one troop or none in a defending square
		var attacker = this //Attacking troops
		var defender = defender //Defending square
	    this.battle = function (attackers, defenders, bunker) {
	        //Returns true if victory and false if loss
	        var aDamage = parseInt(attackers * (bunker * -.5 + 1) * (1 - defender.defenseModifier) * (game.rnd.integerInRange(5, 10) / 10));
	        var dDamage = parseInt(defenders * (bunker * .5 + 1) * (1 + defender.defenseModifier) * (game.rnd.integerInRange(5, 10) / 10));
	        console.log(defender.defenseModifier + ' DefMod')

	        attacker.changeAmount(-dDamage)
	        new DeathsPopup(attacker.square.x, attacker.square.y, -dDamage, attacker.square.owner)

	        defender.units[0].changeAmount(-aDamage)
	        new DeathsPopup(defender.x, defender.y, -aDamage, defender.owner)
	    };
	    console.log('battle started');

	    //Make sure square can attack
	    if (attacker.mobility < gameProperties.mobilityCosts.attack){
	        new MobilityPopup()
	        return
	    }

	    if (attacker.amount > 0){
	    	if (defender.units.length > 0){//No battle if there's no defenders, even saves mobility?
	    		this.battle(attacker.amount, defender.units[0].amount, defender.bunker.isBuilt); //Change when bunkers are added
	        	attacker.mobility -= gameProperties.mobilityCosts.attack;
	    	}
	        if ((defender.units.length < 1 || (defender.units[0].amount == 0)) && (attacker.mobility >= attacker.square.mobilityCost + defender.mobilityCost)) {//Moves into square if attack succeeds and if he has enough mobility
	            defender.changeOwner(attacker.square.owner)
	            attacker.move(defender);
	        }	
	    }
	},
	move: function (targetSquare) {
		var movingTroops = this
		var originSquare = this.square
		var targetSquare = targetSquare

	    //Makes sure player can move
	    if (movingTroops.mobility < targetSquare.mobilityCost + movingTroops.square.mobilityCost){
	        console.log("Not enough mobility to move. Mobility needed: " + targetSquare.mobilityCost + movingTroops.square.mobilityCost + " Mobility available: " + movingTroops.mobility);
	        new MobilityPopup()
	        return false;
	    }

	    //If holding shift keep half of the moving troops
	    if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)){
	        stayingAmount = parseInt((movingTroops.amount / 2) - 0.5)
	        this.square.units.push(new Troops(this.square, stayingAmount))
	        movingTroops.changeAmount(-stayingAmount)
	    }

	    //Subtract mobilitycost
	    movingTroops.mobility -= targetSquare.mobilityCost + movingTroops.square.mobilityCost;

	    //Move troops
	    movingTroops.linkToSquare(targetSquare)
	    

	    //Merge remaining troops!
	    originSquare.mergeUnits()
	    //If the troops already in the targetsquare amounts to 0 kill them. Mostly to make moving into occupied squares easier. Can't be done earlier because a new one would be created automaticly.
	    if (targetSquare.units[0].amount <= 0){
	    	targetSquare.units[0].killObject()
	    }
	    //Place trooplabels in correct spots, has to be done again since the ghost of the defenders remain until this point
	    movingTroops.square.placeTroopLbls()

	    return true;
	},
	moveOrAttack: function (targetSquare) {
	    var originTroops = this
	    var targetSquare = targetSquare
	    if (originTroops != targetSquare.troops){
	        console.log('Move or attack chooses:');
	        if (targetSquare.owner === currentPlayer){
	            if (Phaser.Math.distance(originTroops.square.x, originTroops.square.y, targetSquare.x, targetSquare.y) <= gameProperties.squareSide) {
	                console.log('Moving directly');
	                originTroops.move(targetSquare);
	            } else {
	                console.log('Moving toward');
	                originTroops.moveToward(targetSquare)
	            }
	        } else {
	            if (Phaser.Math.distance(originTroops.square.x, originTroops.square.y, targetSquare.x, targetSquare.y) <= gameProperties.squareSide){
	                console.log('Attack');
	                originTroops.attack(targetSquare);
	            }
	        }
	    }
	},
	moveToward: function (targetSquare){
		var originTroops = this
		var targetSquare = targetSquare
	    console.log('moveToward initiated');
	    var startX = originTroops.square.arrayX
	    var startY = originTroops.square.arrayY
	    var endX = targetSquare.arrayX
	    var endY = targetSquare.arrayY
	    console.log("Start x,y " + startX + "," + startY + " End x,y " + endX + "," + endY);

	    var grid = []
	    for (var i = 0; i < squares.length; i++){
	        grid.push(new Array())
	        for (var z = 0; z < squares.length; z++){
	            if (squares[i][z].owner != currentPlayer){
	                grid[i][z] = 0
	            } else {
	                grid[i][z] = squares[i][z].mobilityCost
	            }
	        }
	    }

	    easystar.setGrid(grid)
	    var acceptableTiles = []
	    for (var i = 1; i < 10; i ++){
	        acceptableTiles.push(i)
	        easystar.setTileCost(i, i)
	    }
	        easystar.setAcceptableTiles(acceptableTiles)


	    easystar.findPath(startX, startY, endX, endY, function( path ) {
	        if (path === null) {
	            console.log("Path was not found.");
	        } else {
	            var previousMobilityCosts = 0
	            for (var i = 1; i < path.length; i ++){
	                //If pathfinder runs out of mobility it moves to the last one it can afford
	                if (previousMobilityCosts + squares[path[i].y][path[i].x].mobilityCost + squares[path[i - 1].y][path[i - 1].x].mobilityCost > originTroops.mobility){
	                    if(originTroops === squares[path[i].y][path[i].x].troops){
	                        console.log('Not enough mobility to move');
	                        return;
	                    }
	                    //Lower moving troops mobility to account for the squares they should move through. Removes the square they move into mobCost since it's drawn in the move function
	                    originTroops.mobility -= (previousMobilityCosts - squares[path[i - 1].y][path[i - 1].x].mobilityCost - originTroops.square.mobilityCost)
	                    console.log('Moving to ' + squares[path[i - 1].y][path[i - 1].x].arrayX + squares[path[i - 1].y][path[i - 1].x].arrayY);
	                    originTroops.move(squares[path[i - 1].y][path[i - 1].x])
	                    return;
	                }
	                //If pathfinder can reach target it moves to it
	                if (i == path.length - 1){
	                    originTroops.move(squares[path[i].y][path[i].x])
	                    console.log("Reached target");
	                    return
	                }
	                previousMobilityCosts += squares[path[i].y][path[i].x].mobilityCost + squares[path[i - 1].y][path[i - 1].x].mobilityCost;
	            }
	        }
	    });
	    easystar.calculate()
	},
}