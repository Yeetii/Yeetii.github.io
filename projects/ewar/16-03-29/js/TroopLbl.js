 function TroopLbl(x, y, color, amount, troop){
    this.troopStyle = {font: '27px Arial', align: 'center', fill: 'black', stroke: '#000000', strokeThickness: 4};
    //Find better way, only needed for selecting
    this.troop = troop
    this.lbl = game.add.text(x + gameProperties.squareSide / 2, y + gameProperties.squareSide / 4, amount, this.troopStyle)
    
    this.isSelected = false;
    
    this.lbl.fill = color;
    this.lbl.anchor.set(0.5, 0.5);
    this.lbl.events.onInputDown.add(this.listener, this);
    this.lbl.inputEnabled = true
    this.lbl.input.enableDrag(true)
    this.lbl.events.onDragStop.add(this.onDragStop, this)
}
TroopLbl.prototype = {
    select: function (){
        this.lbl.stroke = '#AAA'
        this.isSelected = true
    },
    unselect: function (){
        this.lbl.stroke = '#000'
        this.isSelected = false
        if (selectedUnit === this){
            selectedUnit = null
        }
    },
    update: function (newAmount){
        var amount = 0
        if (newAmount != null){
            amount = newAmount
        }
        this.lbl.text = amount;
    },
    updateColor: function (newColor){
        this.lbl.color = newColor
    },
    setX: function (x){
        this.lbl.x = x
    },
    setY: function (y){
        this.lbl.y = y + gameProperties.squareSide / 4
    },

    listener: function(){
        //Check if already selected
        if (!this.isSelected)
            this.troop.select()

    },
    onDragStop: function(){
        var releasedOnX = game.input.x
        var releasedOnY = game.input.y
        //Reset lbl to a real label position
        this.troop.square.placeTroopLbls()

        var releasedOnSquare = this.troop.square.findSquareUnderInput()
        //If released on own square
        if (releasedOnSquare === this.troop.square){
            //If released on start location, split in half
            //If released on another lbl merge
           // if ()
        }
        //If released on another square
        else{
        //If released on another square perform move or attack
        this.troop.moveOrAttack(releasedOnSquare)
        }
        
    },
    destroy: function(){
        this.lbl.destroy()
    }
}