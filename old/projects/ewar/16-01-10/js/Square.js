function Square(x, y, width, height, owner, arrayX, arrayY) {
    this.x = x;
    this.y = y;
    this.arrayX = arrayX;
    this.arrayY = arrayY;
    this.troops = game.rnd.integerInRange(1, 5);
    this.mobility = gameProperties.mobilityCosts.max;
    this.owner = owner;//Why can't this access this.unowned?
    this.troopStyle = {font: '27px Arial', fill: '#FFF', align: 'center', fill: 'black', stroke: '#000000', strokeThickness: 4};

    //Are set in the terrain creator
    this.mobilityCost;
    this.income;
    this.defenseModifier;

    this.tile = game.add.sprite(this.x, this.y, graphicAssets.tile.name);
    this.tile.scale.x = gameProperties.gameScale;
    this.tile.scale.y = gameProperties.gameScale;
    this.tile.inputEnabled = true;
    this.tile.events.onInputDown.add(this.squareListener, this);

    //Bunker init
    this.bunker = game.add.sprite(this.x + 15, this.y + gameProperties.squareSide - 10, graphicAssets.bunker.name);
    this.bunker.anchor.y = 1//In order to place the bunker in relation to it's lower side
    this.bunker.scale.x = gameProperties.gameScale;
    this.bunker.scale.y = gameProperties.gameScale;
    this.bunker.inputEnabled = true;
    this.bunker.events.onInputOver.add(this.bunkerHover, this);
    this.bunker.events.onInputOut.add(this.bunkerUnHover, this);
    this.bunker.events.onInputDown.add(this.buildBunker, this)
    this.hasBunker = false;

    //Terrain init
    this.spawnTerrain();
    console.log('x:' + this.arrayX + ' y:' + this.arrayY + ' mobilityCost:' + this.mobilityCost + ' income:' + this.income + ' defenseModifier:' + this.defenseModifier);

    //Railway init
    this.railNS = game.add.sprite(this.x + this.tile.width / 2, this.y, graphicAssets.railNS.name)
    this.railNS.scale.x = gameProperties.gameScale;
    this.railNS.scale.y = gameProperties.gameScale;
    this.railNS.anchor.x = 0.5
    this.railNS.events.onInputOver.add(this.railwayHover, this);
    this.railNS.events.onInputOut.add(this.railwayUnHover, this);
    this.railNS.events.onInputDown.add(this.buildRailway, this)
    this.railNS.inputEnabled = true;

    this.railWE = game.add.sprite(this.x, this.y + this.tile.height / 2, graphicAssets.railWE.name)
    this.railWE.scale.x = gameProperties.gameScale;
    this.railWE.scale.y = gameProperties.gameScale;
    this.railWE.anchor.y = 0.5
    this.railWE.events.onInputOver.add(this.railwayHover, this);
    this.railWE.events.onInputOut.add(this.railwayUnHover, this);
    this.railWE.events.onInputDown.add(this.buildRailway, this)
    this.railWE.inputEnabled = true;
    this.hasRailway = false;

    //Headquarters init
    this.headquarters = game.add.sprite(this.x + this.tile.width / 1.6, this.y + 5, graphicAssets.headquarters.name)
    this.headquarters.scale.x = gameProperties.gameScale;
    this.headquarters.scale.y = gameProperties.gameScale;
    this.headquarters.frame = 0
    this.hasHeadquarters = false

    this.lblTroops = game.add.text(x + width / 2, y + height / 4, this.troops, this.troopStyle);
    this.lblTroops.fill = this.owner.color;
    this.lblTroops.anchor.set(0.5, 0.5);


    this.changeOwner = function (newOwner){
        this.owner.removeOwnedSquare(this)
        newOwner.addOwnedSquare(this)
        console.log(this.owner.ownedSquares.length);

        this.owner.changeIncome(-this.income);
        newOwner.changeIncome(this.income);

        this.owner = newOwner;
        this.lblTroops.fill = this.owner.color;
    };
    this.changeTroops = function (troops){
        this.troops += troops;
        this.updateTroopLbl(this);
    };
    this.setTroops = function (troops){
        this.troops = troops;
        this.updateTroopLbl();
    };
    this.updateTroopLbl = function (){
        this.lblTroops.text = this.troops;
        this.lblTroops.fill = this.owner.color;
    };


    this.selectSquare = function (){
        if (currentPlayer == this.owner){
            selectedSquare = this;
            selectedCircle.x = this.x + 10;
            selectedCircle.y = this.y + 10;
            selectedCircle.visible = true;
        }
    };
    this.recruit = function (newTroops) {
        if (newTroops == null){
            newTroops = 1
        }
        newTroops = parseInt(newTroops)//Makes sure there's no decimals
        //If the player can't recruit enough he gets as many as he can afford.
        if (currentPlayer.money <= (gameProperties.buildCosts.troops * newTroops)){
            newTroops = parseInt(currentPlayer.money / gameProperties.buildCosts.troops)
        }
        if(currentPlayer.money >= (gameProperties.buildCosts.troops * newTroops) && this.hasHeadquarters) {
            currentPlayer.changeMoney(-(gameProperties.buildCosts.troops * newTroops));
            this.troops += newTroops;
            this.updateTroopLbl();
        }
    };
    this.attack = function (attacker) {
        this.battle = function (attackers, defenders, bunker) {
            //Returns true if victory and false if loss
            var aDamage = parseInt(attackers * (bunker * -.5 + 1) * (1 - this.defenseModifier) * (game.rnd.integerInRange(5, 10) / 10));
            var dDamage = parseInt(defenders * (bunker * .5 + 1) * (1 + this.defenseModifier) * (game.rnd.integerInRange(5, 10) / 10));
            console.log(this.defenseModifier + ' DefMod')

            var aSurvivors = attackers -= dDamage;
            if (aSurvivors < 0){
                aSurvivors = 0;
            }
            var dSurvivors = defenders -= aDamage;
            if (dSurvivors < 0){
                dSurvivors = 0;
            }
            return {attackers: aSurvivors, defenders: dSurvivors};
        };

        //Make sure square can attack
        if (attacker.mobility < gameProperties.mobilityCosts.attack || attacker.troops <= 0){
            return
        }

        var attacker = attacker;
        var defender = this;

        //
        var battle = this.battle(attacker.troops, defender.troops, defender.hasBunker); //Change when bunkers are added
        defender.setTroops(battle.defenders);
        attacker.setTroops(battle.attackers);
        attacker.mobility -= gameProperties.mobilityCosts.attack;
        if (defender.troops == 0 && (attacker.mobility >= attacker.mobilityCost + defender.mobilityCost)) {//Moves into square if attack succeeds and if he has enough mobility
            //Counts to game over
            this.changeOwner(attacker.owner)
            this.move(attacker);
        }
    };

    this.move = function (originSqr) {
        //Makes sure player can move
        if (originSqr.mobility < this.mobilityCost + originSqr.mobilityCost){
            return
        }
        this.troops += originSqr.troops;
        this.mobility = ((originSqr.mobility <= this.mobility) ? originSqr.mobility : this.mobility);//Sets mobility to the lowest one
        this.mobility -= this.mobilityCost + originSqr.mobilityCost;
        originSqr.mobility = gameProperties.mobilityCosts.max;
        originSqr.troops = 0;
        originSqr.updateTroopLbl();
        this.updateTroopLbl();
        this.selectSquare();
    };
    // this.moveToward = function (originSqr, targetSqr){
    //     var startX = originSqr.arrayX
    //     var startY = originSqr.arrayY
    //     var goalX = targetSqr.arrayX
    //     var goalY = targetSqr.arrayY

    //     squares
    // }
};

Square.prototype = {
    squareListener: function () {
        if (game.input.activePointer.leftButton.isDown)  {
            if (this == selectedSquare){
                if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)){
                    this.recruit(10);
                } else {
                    this.recruit(1);
                }
            } else {
                this.selectSquare();
            }
        }

        else if (game.input.activePointer.rightButton.isDown) {
            if (this != selectedSquare){
                if (this.owner === currentPlayer){
                    if (Phaser.Math.distance(selectedSquare.x, selectedSquare.y, this.x, this.y) <= gameProperties.squareSide) {
                        this.move(selectedSquare);
                    } else {
                        return;
                    }
                } else {
                    if (Phaser.Math.distance(selectedSquare.x, selectedSquare.y, this.x, this.y) <= gameProperties.squareSide){
                        this.attack(selectedSquare);
                    }
                }
            }
        }
    },

    bunkerHover: function () {
        if (this == selectedSquare){
            this.bunker.frame = 1;
        }
    },
    bunkerUnHover: function () {
        if (this == selectedSquare){
            this.bunker.frame = 0;
        }
    },
    buildBunker: function () {
        if (currentPlayer.money >= gameProperties.buildCosts.railway && !this.hasBunker && selectedSquare == this) {//Only allows building of bunker if player can afford it, square doesn't already have one and if it's the selected square
            currentPlayer.changeMoney(-gameProperties.buildCosts.railway);
            this.bunker.frame = 1;
            this.hasBunker = true;
            //Stops checking for events
            this.bunker.events.onInputDown.removeAll()
            this.bunker.events.onInputOut.removeAll()
            this.bunker.events.onInputOver.removeAll()
            this.bunker.inputEnabled = false
        } else {//So it's still possible to select a square even if a bunker is clicked
            this.squareListener()
        }

    },

    railwayHover: function () {
        if (this == selectedSquare){
            this.railNS.frame = 1;
            this.railWE.frame = 1;
        }
    },
    railwayUnHover: function () {
        if (this == selectedSquare){
            this.railNS.frame = 0;
            this.railWE.frame = 0;
        }
    },
    buildRailway : function () {
        if (currentPlayer.money >= gameProperties.buildCosts.railway && !this.hasRailway && selectedSquare == this) {//Only allows building of railway if player can afford it, square doesn't already have one and if it's the selected square
            currentPlayer.changeMoney(-gameProperties.buildCosts.railway);
            this.railNS.frame = 1;
            this.railWE.frame = 1;

            this.hasRailway = true;
            this.mobilityCost = gameProperties.mobilityCosts.railway;
            this.income += gameProperties.railwayIncome

            //Stops checking for events
            this.railNS.events.onInputDown.removeAll()
            this.railNS.events.onInputOut.removeAll()
            this.railNS.events.onInputOver.removeAll()
            this.railNS.inputEnabled = false
            this.railWE.events.onInputDown.removeAll()
            this.railWE.events.onInputOut.removeAll()
            this.railWE.events.onInputOver.removeAll()
            this.railWE.inputEnabled = false
        } else {//So it's still possible to select a square even if a railway is clicked, some actions still doesn't work with this method though
            this.squareListener()
        }
    },

    //Builds headquarters for free, is used when starting the game
    spawnHeadquarters: function () {
        this.headquarters.frame = 1
        this.hasHeadquarters = true
    },

    spawnTerrain: function () {
        var terrainGroup = game.add.group();
        var terrainQty = 15;
        //Temporarily stores the new square properties
        var mobilityCost = 0;
        var income = 0;
        var defenseModifier = 0;

        //The same odds for all terrain in one square
        var rockChance = Math.random() * 2 + 0.1;
        var treeChance = Math.random() * 2 + 0.1;//Between 10 and 100% chance of getting tree instead of rock or swamp,
        var lakeChance = Math.random() + 0.05//Between 5 and 100% chance of getting lake, with 100% being the outcome 5% of the time
        
        for (var i = 0; i <= terrainQty; i++) {
            if (i === terrainQty && Math.random() < lakeChance){//chance of last terrain being lake
                var randomSprite = 'lake'
            }else if (Math.random() < treeChance){//Trees
                var randomSprite = 'tree'
            }else if (Math.random() < rockChance) {//Rocks
                var randomSprite = 'rock'
            }else{//Swamps 
                var randomSprite = 'swamp'
            }
            var terrainSprite = game.add.sprite(this.x, this.y, randomSprite)//Adds new random terrain
            terrainSprite.anchor.setTo(0.5, 0.5)
            //Moves to random location within square
            terrainSprite.x = this.x 
            + (terrainSprite.width * gameProperties.gameScale / 2)//Makes margin to the left, gamescale to get correct max size of sprite
            + (Math.random() * (gameProperties.squareSide - terrainSprite.width * gameProperties.gameScale));
            terrainSprite.y = this.y 
            + (terrainSprite.height * gameProperties.gameScale / 2)//Margin on top 
            + (Math.random() * (gameProperties.squareSide - terrainSprite.height * gameProperties.gameScale));

            var rand = ((parseInt(Math.random() * 5) + 5) / 10);//Random value between .5 and 1
            terrainSprite.scale.setTo(gameProperties.gameScale * rand, gameProperties.gameScale * rand)
            terrainGroup.add(terrainSprite)

            //Adds the terrainmodifier of the terrain to the square, this is averaged in the end. Rand makes the size of the sprite have an effect on the modifiers.
            mobilityCost += gameProperties.terrainModifiers[randomSprite].mobility * rand;
            income += gameProperties.terrainModifiers[randomSprite].income * rand;
            defenseModifier += gameProperties.terrainModifiers[randomSprite].defenseModifier * rand;
        }

        this.mobilityCost = parseInt(mobilityCost / terrainQty)
        this.income = parseInt(income / terrainQty)
        this.defenseModifier = parseInt(defenseModifier / terrainQty * 10) / 10 //Getting a decimal value with one decimal
    },
}
