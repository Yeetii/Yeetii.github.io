var gameProperties = {
    squaresAmount: 25,
    squaresAmountSqrt: 5,
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
    bunker: {URL: 'assets/bunker.png', name:'bunker', width: 50, height: 40,},
    railNS: {URL: 'assets/railNS.png', name: 'railNS', width: 20, height: 200},
    railWE: {URL: 'assets/railWE.png', name: 'railWE', width: 200, height: 20},
    headquarters: {URL: 'assets/headquarters.png', name: 'headquarters', width: 65, height: 50},
    tree: {URL: 'assets/tree.png', name: 'tree'},
    rock: {URL: 'assets/rock.png', name: 'rock'},
    lake: {URL: 'assets/lake.png', name: 'lake'},
    swamp: {URL: 'assets/swamp.png', name: 'swamp'},
    endTurnButton: {URL:'assets/endTurnButton.png', name:'endTurnButton', width: 120, height: 40,},
    button4x4: {URL:'assets/4x4.png', name:'button4x4', width: 200, height: 67,},
    button5x5: {URL:'assets/5x5.png', name:'button5x5', width: 200, height: 67,},
    button6x6: {URL:'assets/6x6.png', name:'button6x6', width: 200, height: 67,},
};

var txtStyle = {
    info: {font: '20px Arial', fill: '#000', align: 'left'},
    gameOver: {font: '60px Arial', fill: '#FFF', align: 'center'},
    ewar: {font: '100px Arial', fill: '#FAE60A', align: 'center'},
    player: {font: '20px Arial', fill: '#FFF', align: 'left'},
};

var currentPlayer
var selectedUnit
var lblMoney
var unowned
var squares = []; //Public for moveTowards


var easystar = new EasyStar.js();

window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}


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
    this.turn;
}

startMenuState.prototype = {
    create: function (){
        if (!Phaser.Device.desktop){
            this.scale.pageAlignVertically = true
            this.scale.pageAlignHorizontally = true;
            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        }
        
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
        //Could put all of these in the menu to prevent loadtimes on game start
        game.load.image(graphicAssets.tile.name, graphicAssets.tile.URL);
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
            gameProperties.squaresAmountSqrt = Math.sqrt(gameProperties.squaresAmount)

        } else { //Sets squares to 16 if no real value is given
            gameProperties.squaresAmount = 16
            gameProperties.squaresSqrtAmount = gameProperties.squaresAmountSqrt
        }
        squares = []//Without this line the old squares aren't deleted upon game restart
        this.turn = 1;//Has to be reset each game, counts turns
        gameProperties.squareSide = parseInt(game.width / gameProperties.squaresAmountSqrt)//Makes square sides depend upon the amount of squares
        gameProperties.gameScale = gameProperties.squareSide / gameProperties.standardSquareSide
     },

    create: function() {
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }//Prevents right click menu
        
        this.player1 = new Player('blue');
        this.player2 = new Player('red');
        this.player2.isAi = true;
        unowned = new Player('gray');
        //Currentplayer is set twice in order for the spawning of headquarters to get AI rules.
        currentPlayer = this.player2;

        
        this.squareCreate();
        currentPlayer = this.player1;
        infoArea = this.infoDraw();
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
        //Left corner of square
        var x = 0;
        var y = 50;

        for (var i = 0; i < Math.sqrt(gameProperties.squaresAmount); i ++){
            squares.push(new Array());
                for (var z = 0; z < Math.sqrt(gameProperties.squaresAmount); z ++){
                    squares[i].push(new Square(x, y, unowned, z, i));

                    x += gameProperties.squareSide;
                }
                y += gameProperties.squareSide;
                x = 0;
        }
        //Assigns starting squares to each player
        this.player1.setStartSquare(squares[0][0])
        this.player2.setStartSquare(squares[Math.sqrt(gameProperties.squaresAmount) - 1][Math.sqrt(gameProperties.squaresAmount) - 1])
    },

    endTurn: function () {
        this.turn++;
        if (currentPlayer == this.player1){
            currentPlayer = this.player2;
        }else{
            currentPlayer = this.player1;    
        }
        if (selectedUnit != null)
            selectedUnit.unselect()
        currentPlayer.changeMoney(currentPlayer.income);

        for (var i = 0; i < squares.length; i++){//Reset square mobility
            for (var z = 0; z < squares.length; z++){
                //There should never be more than 1 unit by this point, so it only resets the first one.
                if (squares[i][z].units.length > 0)
                    squares[i][z].units[0].mobility = gameProperties.mobilityCosts.max;
            }
        }

        this.lblPlayer.text = 'Player ' + currentPlayer.color;
        this.lblPlayer.fill = currentPlayer.color;
        lblMoney.text = 'Money: ' + currentPlayer.money;
        console.log('Turn nr ' + this.turn + ' begins');

        //Start ai if ai
        if (currentPlayer.isAi){
            currentPlayer.ai()
            this.endTurn()
        }
    },
}
var game = new Phaser.Game(800, 850, Phaser.AUTO, '');
game.state.add("startMenuState", startMenuState)
game.state.add("gameOverState", gameOverState)
game.state.add("gameState", gameState)
game.state.start("startMenuState")
