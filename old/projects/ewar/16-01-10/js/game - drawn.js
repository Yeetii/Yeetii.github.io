var game = new Phaser.Game(800, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render});
var gameArea;
var infoArea;
var lblMoney;
var lblTroops;
var infoBox;
var currentPlayer;

var gameProperties = {
    squares: 16,
}

var txtStyle = {
    font: '20px Arial', fill: '#FFF', align: 'left',
}

Square = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.troops;
    this.owner;

    var graphics = game.add.graphics(this.x, this.y);
    // set a fill and line style
    graphics.beginFill(0xffffff);
    graphics.lineStyle(3, 0x000, 1);
    
    // draw a shape
    graphics.moveTo(0,0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height);
    graphics.lineTo(0, height);
    graphics.lineTo(0, 0);
    graphics.endFill();

    this.lblTsdroops = game.add.text(x + width / 2, y + height / 2, "Money: " + this.troops, txtStyle);
}

var squares = [];

Player = function() {
    this.money = 100;
    this.troops = 10;
}

var player1 = new Player();


function preload () {

}

function create() {
    
    infoCreate();
    squareCreate();

    //http://phaser.io/examples/v2/display/fullscreen
}

function infoCreate () {
    var graphics = game.add.graphics(0, 0);
    // set a fill and line style
    graphics.beginFill(0x669999);
    graphics.lineStyle(3, 0xcc3300, 1);
    
    // draw a shape
    graphics.moveTo(-3,50);
    graphics.lineTo(game.width + 3, 50);
    graphics.lineTo(game.width + 3, -3);
    graphics.lineTo(0, -3);
    graphics.endFill();

    lblMoney = game.add.text(10, 15, "Money: " + player1.money, txtStyle);
    lblTroops = game.add.text(200, 15, "Troops: " + player1.troops, txtStyle);
}

function squareCreate () {
    //Height and width of squares
    var height = (game.height - 50) / Math.sqrt(gameProperties.squares);
    var width = game.width / Math.sqrt(gameProperties.squares);
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
}

function update () {
}

function render () {
    
}