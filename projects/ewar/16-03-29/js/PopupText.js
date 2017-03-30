function PopupText(x, y, text, color) {
    var style = {font: '16px Arial', fill: '#E88', align: 'center', stroke: '#000000', strokeThickness: 3}//Had to be stored here to get the right colors when there are multiple popups at once.
    var popup = game.add.text(x, y, text, style)
    if (color != null)
        popup.style.fill = color;
        console.log(text)    
    //Fades to alpha 0 in ,5 seconds
    game.add.tween(popup).to( {alpha: 0}, 500, Phaser.Easing.Linear.None, true)
    delete popup
}


function MobilityPopup() {
    if (currentPlayer.isAi)
        return
    var color = '#FF4720'
    PopupText.call(this, game.input.x, game.input.y, 'Not enough mobility', color)
}

function MoneyPopup(cost) {
    var color = '#22A3D4'
    PopupText.call(this, game.input.x, game.input.y, 'Need at least ' + cost + ' money', color)
}

function DeathsPopup(squareX, squareY, amount, owner){
    var x = squareX + gameProperties.squareSide / 1.5
    var y = squareY + gameProperties.squareSide / 5
    var text = '-' + amount
    console.log(owner)
    var color = owner.color
    PopupText.call(this, x, y, text, color)
}