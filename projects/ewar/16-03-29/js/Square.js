function Square(x, y, owner, arrayX, arrayY) {
    this.x = x;
    this.y = y;
    this.arrayX = arrayX;
    this.arrayY = arrayY;
    this.owner = owner;//Why can't this access this.unowned?
    this.heldRecruit = false//Tracks whether holdRecruit was used in order to prevent double recruiting with swipeRelease

    //Are set in the terrain creator
    this.mobilityCost;
    this.income;
    this.defenseModifier;

    this.tile = game.add.sprite(this.x, this.y, graphicAssets.tile.name);
    this.tile.scale.x = gameProperties.gameScale;
    this.tile.scale.y = gameProperties.gameScale;
    this.tile.inputEnabled = true;
    this.tile.events.onInputDown.add(this.squareListener, this);
    this.tile.events.onInputUp.add(this.swipeRelease, this);
    
    //Terrain init
    this.spawnTerrain();
    console.log('x:' + this.arrayX + ' y:' + this.arrayY + ' mobilityCost:' + this.mobilityCost + ' income:' + this.income + ' defenseModifier:' + this.defenseModifier);

    //Buildings initiation
    this.headquarters
    this.railway = new Railway(this)
    this.bunker = new Bunker(this)

    this.units = []
    this.units.push(new Troops(this))

    this.changeOwner = function (newOwner){
        this.owner.removeOwnedSquare(this)
        newOwner.addOwnedSquare(this)

        this.owner.changeIncome(-this.income);
        newOwner.changeIncome(this.income);
        this.owner = newOwner;
    };
};

Square.prototype = {
    squareListener: function () {
        console.log('Input detected'); 

        //Right click
        if (game.input.activePointer.rightButton.isDown) {
            console.log('Right click');
            selectedUnit.moveOrAttack(this);
        }
        else{
            this.selectToggle()
        }
        
        //Start recruit loop
        this.holdingRecruit()
    },
    holdingRecruit: function (waitTime) {
        //Sets waittime if there's no time given
        var waitTime = waitTime != null ? waitTime: 600
        //Check if mouse/finger is held down
        if (game.input.activePointer.isDown){
            //Doesn't recruit the first time it goes through the loop but after that.
            if(waitTime < 600){
                this.recruitToWhom()
                this.heldRecruit = true
            }
            //Continues the loop.
            if (currentPlayer.money >= gameProperties.buildCosts.troops){
                //Lowers the waittime between recruits, to go faster and faster.
                //With 800 as start and decreaseing with 170 there's 4 steps before reaching 120
                waitTime = waitTime > 120 ? waitTime - 160 : waitTime
                game.time.events.add(waitTime, this.holdingRecruit, this, waitTime)
            }
        }
    },
    recruitToWhom: function(amount) {
        if (amount == null)
            amount = 1

        //checks for troops
        if (this.units.length > 0){
            //loops through as many times as the amount in order to split the troops between the units with the least
            for (var a = 0; a < amount; a ++){
                var weakest = this.units[0]
                for (var i = 0; i < this.units.length; i ++){
                    if (this.units[i].amount < weakest.amount)
                        weakest = this.units[0]
                }
                weakest.recruit(1)
            }
        } else {
            this.units.push(new Troops(this, amount))
            this.units[0].select()
        }
    },
    selectToggle: function (){
        //Select first one if selected unit isn't in this square
        if (selectedUnit == null || selectedUnit.square != this)
            this.units[0].select()
        //If the selected unit is in this square select the next unit.
        else if (this.units.length > 1){
            var selectedIndex = this.units.indexOf(selectedUnit)
            if (++selectedIndex > this.units.length - 1)
                selectedIndex = 0

            this.units[selectedIndex].select()
        }
    },

    placeTroopLbls: function () {
        var amountOfLbls = this.units.length
        var spaceBetween = 40

        //The total width all labels takes up
        var totalWidth = (spaceBetween * (amountOfLbls - 1))
        console.log(totalWidth);
        var firstX = this.x + (gameProperties.squareSide / 2) - (totalWidth / 2)
        console.log(firstX);

        //Place labels
        for (var i = 0; i < amountOfLbls; i ++){
            this.units[i].troopLbl.setX(firstX + (spaceBetween * i))
            this.units[i].troopLbl.setY(this.y)
        }
    },

    swipeRelease: function (){
        //Have to use this function because this refers to the square I pressed on
        var targetSqr = this.findSquareUnderInput()
        console.log('Swipe release on x,y: ' + targetSqr.arrayX + ',' + targetSqr.arrayY)
        //Move or attack if released on another square
        if (selectedUnit != null && targetSqr != selectedUnit.square){
            selectedUnit.moveOrAttack(targetSqr)
        }else if (targetSqr.owner == currentPlayer && !this.heldRecruit){//Recruit if released on same square and player, and if holdRecruit haven't been used in this click
            if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)){
                this.recruitToWhom(10);
            } else {
                this.recruitToWhom(1);
            }
        }
        this.heldRecruit = false
    },
    findSquareUnderInput: function () {
        var shortestDistance = Phaser.Math.distance(game.input.x, game.input.y, squares[0][0].x, squares[0][0].y)
        var shortestX = 0;
        var shortestY = 0;
        for (var i = 0; i < gameProperties.squaresAmountSqrt; i ++){
            for (var z = 0; z < gameProperties.squaresAmountSqrt; z ++){
                //Since the squares coordinates are from it's upper left corner, the mouse has to be on the right and under the squares coordinates to be inside it.
                if (game.input.x >= squares[i][z].x && game.input.y >= squares[i][z].y){
                        var distance = Phaser.Math.distance(game.input.x, game.input.y, squares[i][z].x, squares[i][z].y)
                    if (distance < shortestDistance){
                        shortestDistance = distance
                        shortestX = i
                        shortestY = z
                    }
                }
            }
        }
        return squares[shortestX][shortestY];
    },

    removeUnit: function (unit) {
        //Remove fed units from square array
        var index = this.units.indexOf(unit)
        if (index > -1)
            this.units.splice(index, 1)
        if (this.units.length == 0)
            this.units.push(new Troops(this, 0))
    },
    //Merges units if there's more than one, not done
    mergeUnits: function () {
        //Todo, throw together amount and mobility into first unit. Kill the others.
        if (this.units.length > 1){
            var lowestMobility = this.units[0].mobility
            for (var i = 1; i < this.units.length; i ++){
                this.units[0].changeAmount(this.units[1].amount)
                if (this.units[1].mobility < lowestMobility)
                    lowestMobility = this.units[1].mobility
                this.units[1].killObject()
                //Since it removes the unit it's always the 2nd one it checks
            }
        }
        //Update remaining label
        this.placeTroopLbls()
    },

    //Builds headquarters for free, is used when starting the game
    spawnHeadquarters: function () {
        this.headquarters = new Headquarters(this)
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

    isFrontline: function () {
        var enemies = []
        if (this.arrayY + 1 < gameProperties.squaresAmountSqrt && squares[this.arrayY + 1][this.arrayX].owner != this.owner){
            enemies.push(squares[this.arrayY + 1][this.arrayX])
        }
        if (this.arrayY - 1 >= 0 && squares[this.arrayY - 1][this.arrayX].owner != this.owner){
            enemies.push(squares[this.arrayY - 1][this.arrayX])
        }
        if (this.arrayX + 1 < gameProperties.squaresAmountSqrt && squares[this.arrayY][this.arrayX + 1].owner != this.owner){
            enemies.push(squares[this.arrayY][this.arrayX + 1])
        }
        if (this.arrayX - 1 >= 0 && squares[this.arrayY][this.arrayX - 1].owner != this.owner){
            enemies.push(squares[this.arrayY][this.arrayX - 1])
        }
        return enemies
    }
}
