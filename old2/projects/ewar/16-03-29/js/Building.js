function Building (builtOn, sprite, sprite2){
	this.sprite = sprite
	this.builtOn = builtOn//Square which the building is built on
	this.isBuilt = false//Whether the building is built or not

	this.sprite.scale.x = gameProperties.gameScale;
	this.sprite.scale.y = gameProperties.gameScale;
	this.sprite.inputEnabled = false;
	this.sprite.events.onInputOver.add(this.hover, this);
	this.sprite.events.onInputOut.add(this.unHover, this);
	this.sprite.events.onInputUp.add(this.build, this)


	//Sprite 2 is used for buildings that use 2 sprites, for example railway
	if (sprite2 != null){
		this.sprite2 = sprite2
		this.sprite2.scale.x = gameProperties.gameScale;
		this.sprite2.scale.y = gameProperties.gameScale;
		this.sprite2.inputEnabled = false;
		this.sprite2.events.onInputOver.add(this.hover, this);
		this.sprite2.events.onInputOut.add(this.unHover, this);
		this.sprite2.events.onInputUp.add(this.build, this)
	}
}
Building.prototype = {
	build: function (){
		// NOTE!
		//Each building has to check for price on their own!!
		// NOTE!
		
		//Can't already be built or sprite invisible when trying to build
		if (!currentPlayer.isAi && this.sprite.frame != 1)
			return false
		if (this.isBuilt)
			return false

	    this.sprite.frame = 1;
	    this.isBuilt = true;
	    //Stops checking for events
	    this.sprite.events.onInputUp.removeAll()
	    this.sprite.events.onInputOut.removeAll()
	    this.sprite.events.onInputOver.removeAll()
	    this.sprite.inputEnabled = false

		if (this.sprite2 != null){
	        this.sprite2.frame = 1;
	        this.sprite2.events.onInputUp.removeAll()
	        this.sprite2.events.onInputOut.removeAll()
	        this.sprite2.events.onInputOver.removeAll()
	        this.sprite2.inputEnabled = false
	    }
	    return true
	},
	hover: function (){
		if (selectedUnit != null && this.builtOn === selectedUnit.square){
            this.sprite.frame = 1;

	        if (this.sprite2 != null){
	            this.sprite2.frame = 1;
	        }
        }	
	},
	unHover: function (){
		if (selectedUnit != null && this.builtOn === selectedUnit.square){
            this.sprite.frame = 0;
        
			if (this.sprite2 != null){
	            this.sprite2.frame = 0;
	        }
        }	
	},

	enableInput: function (){
		if (!this.isBuilt){//No input for built buildings
			this.sprite.inputEnabled = true;

			if (this.sprite2 != null){
				this.sprite2.inputEnabled = true;
			}
		}
	},
	disableInput: function (){
		this.sprite.inputEnabled = false;

		if (this.sprite2 != null){
			this.sprite2.inputEnabled = false;
		}
	},
};

function Bunker (builtOn) {
	var sprite = game.add.sprite(builtOn.x + 15, builtOn.y + gameProperties.squareSide - 10, graphicAssets.bunker.name)
	sprite.anchor.y = 1//In order to place the sprite in relation to it's lower side
	Building.call(this, builtOn, sprite)
}
Bunker.prototype = Object.create(Building.prototype)
Bunker.prototype.build = function() {
		//Only allows building if player has enough money
		if (currentPlayer.money >= gameProperties.buildCosts.bunker && Building.prototype.build.call(this)) {
			//Only draws money if building is successfull
		    currentPlayer.changeMoney(-gameProperties.buildCosts.bunker);
		}
};


function Railway (builtOn) {
	var spriteNS = game.add.sprite(builtOn.x + gameProperties.squareSide / 2, builtOn.y, graphicAssets.railNS.name)
	spriteNS.anchor.x = 0.5
	var spriteWE = game.add.sprite(builtOn.x, builtOn.y + gameProperties.squareSide / 2, graphicAssets.railWE.name)
	spriteWE.anchor.y = 0.5

	Building.call(this, builtOn, spriteNS, spriteWE)
}
Railway.prototype = Object.create(Building.prototype)
Railway.prototype.build = function() {
	if (currentPlayer.money >= gameProperties.buildCosts.railway && Building.prototype.build.call(this)){
		//Only draws money if building is successfull
		currentPlayer.changeMoney(-gameProperties.buildCosts.railway);

		this.mobilityCost = gameProperties.mobilityCosts.railway;
        this.income += gameProperties.railwayIncome
    }
};

function Headquarters (builtOn) {
	var sprite = game.add.sprite(builtOn.x + gameProperties.squareSide / 1.6, builtOn.y + 5, graphicAssets.headquarters.name)
	Building.call(this, builtOn, sprite)
	this.build()
}
Headquarters.prototype = Object.create(Building.prototype)