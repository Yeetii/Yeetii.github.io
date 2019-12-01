var game = new Phaser.Game(800, 850, Phaser.AUTO, '', { preload: preload, create: create, update: update});
var infoArea;
var lblMoney;
var lblTroops;
var lblPlayer;
var endTurnButton;
var squares = [];
var selectedSquare;
var selectedCircle;


var gameProperties = {
    squares: 16,
    squareSide: 200,
    mobilityCosts: {max: 10, attack: 3, move: 4, railmodifier: 2},
};

var graphicAssets = {
    tiles: [{URL: 'assets/tile.png', name:'forest', income:30}, {URL:'assets/tile.png', name:'lake', income:20}, {URL:'assets/tile.png', name:'mountain', income:10}],
    selected: {URL: 'assets/selected.png', name:'selected'},
    bunker: {URL: 'assets/bunker.png', name:'bunker', width: 50, height: 40,},
    tree: {URL: 'assets/tree.png', name: 'tree'},
    endTurnButton: {URL:'assets/endTurnButton.png', name:'endTurnButton', width: 120, height: 40,},
};

var txtStyle = {
    info: {font: '20px Arial', fill: '#FFF', align: 'left', fill: 'black'},
    player: {font: '20px Arial', fill: '#FFF', align: 'left', fill: 'white'},
    square: {font: '20px Arial', fill: '#FFF', align: 'center', fill: 'black',}
};

Square = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.troops = game.rnd.integerInRange(1, 5);
    this.mobility = gameProperties.mobilityCosts.max;
    this.owner = unowned;
    this.troopStyle = {font: '27px Arial', fill: '#FFF', align: 'center', fill: 'black', stroke: '#000000', strokeThickness: 4};

    this.tileNr = game.rnd.integerInRange(0, 2);
    this.tile = game.add.sprite(x, y, graphicAssets.tiles[this.tileNr].name);
    this.tile.inputEnabled = true;
    this.tile.events.onInputDown.add(this.squareListener, this);

    this.bunker = game.add.sprite(this.x + 15, this.y + 150, graphicAssets.bunker.name);
    this.bunker.inputEnabled = true;
    this.bunker.events.onInputOver.add(this.bunkerHover, this);
    this.bunker.events.onInputOut.add(this.bunkerUnHover, this);
    this.bunker.events.onInputDown.add(this.buildBunker, this)
    this.hasBunker = false;

    this.spawnTerrain();

    this.lblTroops = game.add.text(x + width / 2, y + height / 4, this.troops, this.troopStyle);
    this.lblTroops.fill = this.owner.color;
    this.lblTroops.anchor.set(0.5, 0.5);

    this.income = graphicAssets.tiles[this.tileNr].income;

    this.changeOwner = function (newOwner){
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
    this.recruit = function () {
        if(currentPlayer.money >= 10) {
            currentPlayer.changeMoney(-10);
            this.troops ++;
            this.updateTroopLbl();
        }
    };
    this.attack = function () {
        this.battle = function (attackers, defenders, bunker) {
            //Returns true if victory and false if loss
            var aDamage = parseInt(attackers * (bunker * -.5 + 1) * (game.rnd.integerInRange(5, 10) / 10));
            var dDamage = parseInt(defenders * (bunker * .5 + 1) * (game.rnd.integerInRange(5, 10) / 10));

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

        var attacker = selectedSquare;
        var defender = this;

        //
        var battle = this.battle(attacker.troops, defender.troops, this.hasBunker); //Change when bunkers are added
        defender.setTroops(battle.defenders);
        attacker.setTroops(battle.attackers);
        selectedSquare.mobility -= gameProperties.mobilityCosts.attack;
        if (defender.troops == 0) {//Moves into square if attack succeeds
            defender.owner.changeIncome(-this.income);
            attacker.owner.changeIncome(this.income);
            defender.owner = currentPlayer;
            this.move();
        }
    };

    this.move = function () {
        this.troops += selectedSquare.troops;
        this.mobility = ((selectedSquare.mobility <= this.mobility) ? selectedSquare.mobility : this.mobility);//Sets mobility to the lowest one
        selectedSquare.troops = 0;
        selectedSquare.updateTroopLbl();
        this.updateTroopLbl();
        this.mobility -= gameProperties.mobilityCosts.move;
        selectedSquare.mobility = gameProperties.mobilityCosts.max;
        this.selectSquare();
    };
};

Square.prototype = {
    squareListener: function () {
        if (game.input.activePointer.leftButton.isDown)  {
            if (this == selectedSquare){
                this.recruit();
            } else {
                this.selectSquare();
            }
        }
        if (game.input.activePointer.rightButton.isDown) {
            if (this != selectedSquare){
                if (this.owner === currentPlayer){
                    if (selectedSquare.mobility >= gameProperties.mobilityCosts.move) {
                        this.move();
                    } else {
                        return;
                    }
                } else {
                    if (selectedSquare.mobility >= gameProperties.mobilityCosts.attack && (Phaser.Math.distance(selectedSquare.x, selectedSquare.y, this.x, this.y) <= gameProperties.squareSide)){
                        this.attack();
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
        if (currentPlayer.money >= 50 && !this.hasBunker) {
            currentPlayer.changeMoney(-50);
            this.bunker.frame = 1;
            this.hasBunker = true;
            this.bunker.events.onInputDown.removeAll()
            this.bunker.events.onInputOut.removeAll()
            this.bunker.events.onInputOver.removeAll()
        }
    },

     spawnTerrain: function () {
        var terrainGroup = game.add.group();
        for (var i = 0; i <= 15; i++) {
            var terrainSprite = game.add.sprite(this.x + (Math.random() * gameProperties.squareSide), this.y + (Math.random() * gameProperties.squareSide), 'tree')//Adds new random terrain sprite to random location
            var rand = Math.random() + .5
            terrainSprite.scale.setTo(rand, rand)
            if (checkOverlap(terrainSprite, this.bunker)) {//Checks if the attempted terrain sprite overlaps with any existing sprite
                terrainSprite.kill();
                console.log(i)
                continue;//If the sprite overlaps it's scraped and the loop takes one step back
            }
            terrainGroup.add(terrainSprite)
        }
     },
}

Player = function(color) {
    this.money = 100;
    this.income = 20;
    this.color = color;

    this.changeMoney = function (amount){
        this.money += amount;
        if (this == currentPlayer){
            lblMoney.text = 'Money: ' + this.money;
        }
    };
    this.changeIncome = function(amount){
        this.income += amount;
    };
};

var player1 = new Player('blue');
var player2 = new Player('red');
var unowned = new Player('gray');
var currentPlayer = player1;


function preload () {
    game.load.image(graphicAssets.tiles[0].name, graphicAssets.tiles[0].URL);
    game.load.image(graphicAssets.tiles[1].name, graphicAssets.tiles[1].URL);
    game.load.image(graphicAssets.tiles[2].name, graphicAssets.tiles[2].URL);
    game.load.image(graphicAssets.selected.name, graphicAssets.selected.URL);
    game.load.image(graphicAssets.tree.name, graphicAssets.tree.URL);
    game.load.spritesheet(graphicAssets.bunker.name, graphicAssets.bunker.URL, graphicAssets.bunker.width, graphicAssets.bunker.height);
    game.load.spritesheet(graphicAssets.endTurnButton.name, graphicAssets.endTurnButton.URL, graphicAssets.endTurnButton.width, graphicAssets.endTurnButton.height);
};

function create() {
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }//Prevents right click menu
    game.input.mouse.capture = true;//Constantly checks mouse inputs, find better solution
    
    infoArea = infoDraw();
    squareCreate();
    squares[0].changeOwner(player1);
    squares[15].changeOwner(player2);
    selectedCircle = game.add.sprite(0, 0, graphicAssets.selected.name);
    selectedCircle.visible = false;

    //http://phaser.io/examples/v2/display/fullscreen
};

function infoDraw () {
    var graphics = game.add.graphics(0, 0);
    // set a fill and line style
    graphics.beginFill(0x607F5A);
    graphics.lineStyle(4, 0x607F5A, 1);
    
    // draw a shape
    graphics.moveTo(-3,50);
    graphics.lineTo(game.width + 3, 50);
    graphics.lineTo(game.width + 3, -3);
    graphics.lineTo(0, -3);
    graphics.endFill();

    lblPlayer =game.add.text(10, 15,'Player ' + currentPlayer.color, txtStyle.player);
    lblPlayer.fill = currentPlayer.color;
    lblMoney = game.add.text(150, 15, "Money: " + currentPlayer.money, txtStyle.info);

    endTurnButton = game.add.button(game.width - 150, 5, 'endTurnButton', endTurn, this, 1, 0);
};

function squareCreate () {
    //Height and width of squares
    var height = 200;
    var width = 200;
    //Left corner of square
    var x = 0;
    var y = 50;

    for (var i = 0; i < gameProperties.squares; i ++){
        squares.push(new Square(x, y, width, height));
        x += width;
        if (x >= game.width){
            y += height;
            x = 0;
        }
    }
    //Sets starting squares to 3 troops
    squares[0].setTroops(3);
    squares[gameProperties.squares - 1].setTroops(3)
};

function checkOverlap (spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);
}

function update () {

};


function endTurn () {
    if (currentPlayer == player1){
        currentPlayer = player2;     
    }else{
        currentPlayer = player1;    
    }
    selectedSquare = null;
    selectedCircle.visible = false;
    currentPlayer.changeMoney(currentPlayer.income);

    for (var i = 0; i < squares.length; i++){//Reset square mobility
        squares[i].mobility = gameProperties.mobilityCosts.max;
    }

    lblPlayer.text = 'Player ' + currentPlayer.color;
    lblPlayer.fill = currentPlayer.color;
    lblMoney.text = 'Money: ' + currentPlayer.money;
};