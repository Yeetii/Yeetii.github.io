var gameProperties = {
    squaresAmount: 25,
    squareSide: 200,
    standardSquareSide: 200,
    gameScale: 1,
    mobilityCosts: {max: 10, attack: 3, railway: 1},
    buildCosts: {railway: 50, bunker: 50, troops: 10},
    railwayIncome: 5,
    //The average of these numbers are given to the square
    terrainModifiers: {lake: {defenseModifier: .8, income: 200, mobility: 0}, tree: {defenseModifier: 0, income: 10, mobility: 3}, rock: {defenseModifier: .5, income: 8, mobility: 6}, swamp: {defenseModifier: .3, income: -10, mobility: 4}}
};

var graphicAssets = {
    tile: {URL: 'assets/tile.png', name:'tile'},
    selected: {URL: 'assets/selected.png', name:'selected'},
    bunker: {URL: 'assets/bunker.png', name:'bunker', width: 50, height: 40,},
    railNS: {URL: 'assets/railNS.png', name: 'railNS', width: 20, height: 200},
    railWE: {URL: 'assets/railWE.png', name: 'railWE', width: 200, height: 20},
    headquarters: {URL: 'assets/headquarters.png', name: 'headquarters', width: 65, height: 50},
    tree: {URL: 'assets/tree.png', name: 'tree'},
    rock: {URL: 'assets/rock.png', name: 'rock'},
    lake: {URL: 'assets/lake.png', name: 'lake'},
    swamp: {URL: 'assets/swamp.png', name: 'swamp'},
    endTurnButton: {URL:'assets/endTurnButton.png', name:'endTurnButton', width: 120, height: 40,},
    button4x4: {URL:'assets/4x4.png', name:'button4x4', width: 120, height: 40,},
    button5x5: {URL:'assets/5x5.png', name:'button5x5', width: 120, height: 40,},
    button6x6: {URL:'assets/6x6.png', name:'button6x6', width: 120, height: 40,},
};

var txtStyle = {
    info: {font: '20px Arial', fill: '#000', align: 'left'},
    gameOver: {font: '60px Arial', fill: '#FFF', align: 'center'},
    ewar: {font: '100px Arial', fill: '#FAE60A', align: 'center'},
    player: {font: '20px Arial', fill: '#FFF', align: 'left'},
};

    var currentPlayer
    var selectedSquare
    var selectedCircle
    var lblMoney
    var unowned

var startMenuState = function (game) {
    this.lblEwar
    this.lblStartMenu
    this.button4x4
    this.button5x5
    this.button6x6
}
var gameOverState = function (game) {
    this.lblGameOver
}

var gameState = function (game){
    this.player1
    this.player2
    this.infoArea;
    this.lblPlayer;
    this.endTurnButton;
    this.squares = [];
}

startMenuState.prototype = {
    create: function (){
        var ewarText = 'Ewar'
        var startMenuText = 'Choose size of battlefield'
        this.lblEwar = game.add.text(game.world.centerX, game.world.centerY - 300, ewarText, txtStyle.ewar)
        this.lblStartMenu = game.add.text(game.world.centerX, game.world.centerY - 200, startMenuText, txtStyle.gameOver);
        this.lblStartMenu.anchor.set(0.5, 0.5);
        this.lblEwar.anchor.set(0.5, 0.5);
        this.button4x4 = game.add.button(game.world.centerX, game.world.centerY, 'button4x4', function(){this.startGame(16)}, this, 1, 0);
        this.button5x5 = game.add.button(game.world.centerX, game.world.centerY + 80, 'button5x5', function(){this.startGame(25)}, this, 1, 0);
        this.button6x6 = game.add.button(game.world.centerX, game.world.centerY + 160, 'button6x6', function(){this.startGame(36)}, this, 1, 0);
        this.button4x4.anchor.set(0.5, 0.5);
        this.button5x5.anchor.set(0.5, 0.5);
        this.button6x6.anchor.set(0.5, 0.5);
        //
        //Not good method make new buttons instead!!
        //
        this.button4x4.scale.setTo(1.5, 1.5);
        this.button5x5.scale.setTo(1.5, 1.5);
        this.button6x6.scale.setTo(1.5, 1.5);
    },
    startGame: function (squaresAmount){
        game.state.start("gameState", true, false, squaresAmount)
    },
    preload: function (){
        game.load.spritesheet(graphicAssets.button4x4.name, graphicAssets.button4x4.URL, graphicAssets.button4x4.width, graphicAssets.button4x4.height);
        game.load.spritesheet(graphicAssets.button5x5.name, graphicAssets.button5x5.URL, graphicAssets.button5x5.width, graphicAssets.button5x5.height);
        game.load.spritesheet(graphicAssets.button6x6.name, graphicAssets.button6x6.URL, graphicAssets.button6x6.width, graphicAssets.button6x6.height);
    }
}

gameOverState.prototype = {
    init: function (winner){
        var gameOverTxt = 'Game over\n\n' + 'player ' + winner.color + ' won'
        this.lblGameOver = game.add.text(game.world.centerX, game.world.centerY, gameOverTxt, txtStyle.gameOver);
        this.lblGameOver.anchor.set(0.5, 0.5);
    },
    create: function (){
        game.input.onDown.addOnce(this.restartGame, this);
    },
    restartGame: function (){
        game.state.start("startMenuState")
    }
}

gameState.prototype = {
    

    preload: function () {
        game.load.image(graphicAssets.tile.name, graphicAssets.tile.URL);
        game.load.image(graphicAssets.selected.name, graphicAssets.selected.URL);
        game.load.image(graphicAssets.tree.name, graphicAssets.tree.URL);
        game.load.image(graphicAssets.rock.name, graphicAssets.rock.URL);
        game.load.image(graphicAssets.lake.name, graphicAssets.lake.URL);
        game.load.image(graphicAssets.swamp.name, graphicAssets.swamp.URL);
        game.load.spritesheet(graphicAssets.bunker.name, graphicAssets.bunker.URL, graphicAssets.bunker.width, graphicAssets.bunker.height);
        game.load.spritesheet(graphicAssets.railNS.name, graphicAssets.railNS.URL, graphicAssets.railNS.width, graphicAssets.railNS.height);
        game.load.spritesheet(graphicAssets.railWE.name, graphicAssets.railWE.URL, graphicAssets.railWE.width, graphicAssets.railWE.height);
        game.load.spritesheet(graphicAssets.headquarters.name, graphicAssets.headquarters.URL, graphicAssets.headquarters.width, graphicAssets.headquarters.height);
        game.load.spritesheet(graphicAssets.endTurnButton.name, graphicAssets.endTurnButton.URL, graphicAssets.endTurnButton.width, graphicAssets.endTurnButton.height);
     },

     init: function(squaresAmount) {
        //Only sets squares if it's fed a value
        if (squaresAmount > 0){
            gameProperties.squaresAmount = squaresAmount
        }
        //Sets square to 16 if it's 0
        if (gameProperties.squaresAmount === 0){
            gameProperties.squaresAmount = 16
        }
        this.squares = []//Without this line the old squares aren't deleted upon game restart
        gameProperties.squareSide = (game.width / Math.sqrt(gameProperties.squaresAmount))//Makes square sides depend upon the amount of squares
        gameProperties.gameScale = gameProperties.squareSide / gameProperties.standardSquareSide
     },

    create: function() {
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }//Prevents right click menu
        game.input.mouse.capture = true;//Constantly checks mouse inputs, find better solution

        this.player1 = new Player('blue');
        this.player2 = new Player('red');
        unowned = new Player('gray');
        currentPlayer = this.player1;
        
        infoArea = this.infoDraw();
        this.squareCreate();
        selectedCircle = game.add.sprite(0, 0, graphicAssets.selected.name);
        selectedCircle.visible = false;
        //http://phaser.io/examples/v2/display/fullscreen
    },

    infoDraw: function () {
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

        this.lblPlayer =game.add.text(10, 15,'Player ' + currentPlayer.color, txtStyle.player);
        this.lblPlayer.fill = currentPlayer.color;
        lblMoney = game.add.text(150, 15, "Money: " + currentPlayer.money, txtStyle.info);

        this.endTurnButton = game.add.button(game.width - 150, 5, 'endTurnButton', this.endTurn, this, 1, 0);
    },

    squareCreate: function () {
        //Height and width of squares
        var height = gameProperties.squareSide;
        var width = gameProperties.squareSide;
        //Left corner of square
        var x = 0;
        var y = 50;

        for (var i = 0; i < Math.sqrt(gameProperties.squaresAmount); i ++){
            this.squares.push(new Array());
                for (var z = 0; z < Math.sqrt(gameProperties.squaresAmount); z ++){
                    this.squares[i].push(new Square(x, y, width, height, unowned, z, i));

                    x += width;
                }
                y += height;
                x = 0;
        }
        //Sets starting squares to 3 troops
        this.squares[0][0].setTroops(3);
        this.squares[0][0].changeOwner(this.player1);
        this.squares[0][0].spawnHeadquarters()
        this.squares[Math.sqrt(gameProperties.squaresAmount) - 1][Math.sqrt(gameProperties.squaresAmount) - 1].setTroops(3)
        this.squares[Math.sqrt(gameProperties.squaresAmount) - 1][Math.sqrt(gameProperties.squaresAmount) - 1].changeOwner(this.player2);
        this.squares[Math.sqrt(gameProperties.squaresAmount) - 1][Math.sqrt(gameProperties.squaresAmount) - 1].spawnHeadquarters();
    },

    ai: function () {
        this.decreaseXorY = function (x, y){
            var x = x
            var y = y
            game.rnd.integerInRange(0,1) === 0 ? x-=1 : y-=1
            //Avoids x or y value under 0
            if (x < 0 ){
                x++
                y--
            }
            if (y < 0){
                y++
                x--
            }
            if (x < 0 ){
                x++
            }
            return [x,y]
        }

        var originSqrX = this.squares.length - 1
        var originSqrY = this.squares.length - 1
        var targetSqr
        var decreaseXorY

        if (this.squares[originSqrX][originSqrY].owner != currentPlayer){
            var randomSquareNr = game.rnd.integerInRange(0, currentPlayer.ownedSquares.length - 1)
            console.log(game.rnd.integerInRange(0, currentPlayer.ownedSquares.length - 1));
            console.log(randomSquareNr);
            var randomSquare = currentPlayer.ownedSquares[randomSquareNr]
            console.log(randomSquare);
            originSqrX = randomSquare.arrayX
            originSqrY = randomSquare.arrayY
        }

        //Recruit
        var newTroops = (currentPlayer.money - 50) / gameProperties.buildCosts.troops
        this.squares[originSqrX][originSqrY].recruit(newTroops)

        while(true){
            //Build bunker
            if (currentPlayer.money >= 50){
                if (Math.random() > 0.5){
                    this.squares[originSqrX][originSqrY].buildBunker()
                }else{
                    this.squares[originSqrX][originSqrY].buildRailway()
                }
            }

            //Choose target
            decreaseXorY = this.decreaseXorY(originSqrX, originSqrY)
            targetSqr = this.squares[decreaseXorY[0]][decreaseXorY[1]]

            //Break if at edge
            if (targetSqr === this.squares[originSqrX][originSqrY]){
                break
            }

            console.log(this.squares[originSqrX][originSqrY].mobility + ' mobility ' + originSqrX + originSqrY + ' square')
            //Move and attack
            if (targetSqr.owner === currentPlayer) {
                targetSqr.move(this.squares[originSqrX][originSqrY])
            }else {
                targetSqr.attack(this.squares[originSqrX][originSqrY])
            }

            //Move origin square
            decreaseXorY = this.decreaseXorY(originSqrX, originSqrY)
            originSqrX = decreaseXorY[0]
            originSqrY = decreaseXorY[1]
            if (this.squares[originSqrX][originSqrY].owner != currentPlayer){
                break
            }
        }


        this.endTurn()
    },

    endTurn: function () {
        if (currentPlayer == this.player1){
            currentPlayer = this.player2;
        }else{
            currentPlayer = this.player1;    
        }
        selectedCircle.visible = false;
        selectedSquare = null;
        currentPlayer.changeMoney(currentPlayer.income);

        for (var i = 0; i < this.squares.length; i++){//Reset square mobility
            for (var z = 0; z < this.squares.length; z++){
            this.squares[i][z].mobility = gameProperties.mobilityCosts.max;
            }
        }

        if (currentPlayer === this.player2){
            this.ai()
        }

        this.lblPlayer.text = 'Player ' + currentPlayer.color;
        this.lblPlayer.fill = currentPlayer.color;
        lblMoney.text = 'Money: ' + currentPlayer.money;
    },
}
var game = new Phaser.Game(800, 850, Phaser.AUTO, '');
game.state.add("startMenuState", startMenuState)
game.state.add("gameOverState", gameOverState)
game.state.add("gameState", gameState)
game.state.start("startMenuState")