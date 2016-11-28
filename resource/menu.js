"use strict";

var menu = new function() {
	var canvas = null;
	var ctx = null;
	var imageWidth = 0;
	var imageHeight = 0;
	
	var currentMenu = null;
	this.mainMenu = null;
	this.optionsMenu = null;
	
	this.init = function() {
		canvas = main.canvas;
		ctx = main.ctx;
		imageWidth = main.imageWidth;
		imageHeight = main.imageHeight;
	
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,imageWidth,imageHeight);
		ctx.font = "bold 100px 'Courier New'";
		ctx.fillStyle = "white";
		ctx.fillText("Null Exception",imageWidth * 0.1,imageHeight * 0.2);
		
		var backgroundImage = new Image();
		backgroundImage.src = canvas.toDataURL();
	
		this.mainMenu = new MenuScreen(backgroundImage,
		[new MenuItem("< New Game >",imageWidth/2,imageHeight * 0.4,true),
		new MenuItem("< Load Game >",imageWidth/2,imageHeight * 0.5,true),
		new MenuItem("< Options >",imageWidth/2,imageHeight * 0.6,true),
		new MenuItem("< Credits >",imageWidth/2,imageHeight * 0.7,true)],
		function(i) {
			switch(i) {
				case 0:
					//main.transitionActiveState(world);
					currentMenu = menu.newMenu;
				break;
				
				case 1:
					currentMenu = menu.loadMenu;
				break;
				
				case 2:
					currentMenu = menu.optionsMenu;
				break;
				
				case 3:
					currentMenu = menu.creditsMenu;
				break;
			}
		});
		
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,imageWidth,imageHeight);
		backgroundImage = new Image();
		backgroundImage.src = canvas.toDataURL();
		this.newMenu = new MenuScreen(backgroundImage,
		[new MenuItem("< Back >",10,50,false)],
		function(i) {
			switch(i) {
				case 0:
					currentMenu = menu.mainMenu;
				break;
			}
		});
		
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,imageWidth,imageHeight);
		backgroundImage = new Image();
		backgroundImage.src = canvas.toDataURL();
		this.loadMenu = new MenuScreen(backgroundImage,
		[new MenuItem("< Back >",10,50,false)],
		function(i) {
			switch(i) {
				case 0:
					currentMenu = menu.mainMenu;
				break;
			}
		});
		
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,imageWidth,imageHeight);
		ctx.font = "bold 50px 'Courier New'";
		ctx.fillStyle = "white";
		ctx.fillText("Options",imageWidth * 0.4,imageHeight * 0.1);
		ctx.font = "50px 'Courier New'";
		ctx.fillText("- Key Bindings -",imageWidth * 0.3,imageHeight * 0.2);
		backgroundImage = new Image();
		backgroundImage.src = canvas.toDataURL();
		
		this.optionsMenu = new MenuScreen(backgroundImage,
		[new MenuItem("< Back >",10,50,false),
		new MenuItem("< Left >  < A >",imageWidth * 0.5,imageHeight * 0.35,true),
		new MenuItem("< Right >  < D >",imageWidth * 0.5,imageHeight * 0.45,true),
		new MenuItem("< Use >  < E >",imageWidth * 0.5,imageHeight * 0.55,true)],
		function(i) {
			switch(i) {
				case 0:
					currentMenu = menu.mainMenu;
				break;
				
				case 1:
					this.items[1].text = "< Left >  < ? >";
					this.editingKey = 1;
					this.pastKey = String.fromCharCode(this.leftKey);
				break;
				
				case 2:
					this.items[2].text = "< Right >  < ? >";
					this.editingKey = 2;
					this.pastKey = String.fromCharCode(this.rightKey);
				break;
				
				case 3:
					this.items[3].text = "< Use >  < ? >";
					this.editingKey = 3;
					this.pastKey = String.fromCharCode(this.useKey);
				break;
			}
		});
		this.optionsMenu.editingKey = -1;
		this.optionsMenu.pastKey = "?";
		this.optionsMenu.leftKey = 65;
		this.optionsMenu.rightKey = 68;
		this.optionsMenu.useKey = 69;
		
		this.optionsMenu.selectBounds = function(x,y) {
			if (this.editingKey < 0) {
				for (var i = 0; i < this.items.length; ++i) {
					this.items[i].selected = this.items[i].bounds.pointCollision(x,y);
				}
			}
		}
	
		this.optionsMenu.checkBounds = function(x,y) {
			if (this.editingKey < 0) {
				for (var i = 0; i < this.items.length; ++i) {
					if (this.items[i].bounds.pointCollision(x,y)) {
						this.items[i].selected = false;
						this.buttonEvent(i);
					}
				}
			} else {
				switch(this.editingKey) {
					case 1: this.items[this.editingKey].text = "< Left >  < "+this.pastKey+" >"; break;
					case 2: this.items[this.editingKey].text = "< Right >  < "+this.pastKey+" >"; break;
					case 3: this.items[this.editingKey].text = "< Use >  < "+this.pastKey+" >"; break;
				}
				this.editingKey = -1;
			}
		}
		
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,imageWidth,imageHeight);
		backgroundImage = new Image();
		backgroundImage.src = canvas.toDataURL();
		this.creditsMenu = new MenuScreen(backgroundImage,
		[new MenuItem("< Back >",10,50,false)],
		function(i) {
			switch(i) {
				case 0:
					currentMenu = menu.mainMenu;
				break;
			}
		});
		
		currentMenu = this.mainMenu;
	}
	
	var MenuItem = function(text,x,y,centered) {
		ctx.font = this.FONT;
		var length = ctx.measureText(text).width;
		this.x = x;
		this.y = y;
		this.text = text;
		this.bounds = new main.BoundingBox(this.x,this.y - this.FONT_SIZE/1.5,length,this.FONT_SIZE);	if (centered) {this.bounds.x -= length/2; this.x -= length/2;}
		this.selected = false;
	}
	
	MenuItem.prototype.render = function() {
		this.selected ? ctx.fillStyle = this.SELECTED_COLOUR : ctx.fillStyle = this.DEFAULT_COLOUR;
		//ctx.fillRect(this.bounds.x,this.bounds.y,this.bounds.width,this.bounds.height);
		ctx.fillText(this.text,this.x,this.y);
	}
	
	MenuItem.prototype.SELECTED_COLOUR = "yellow";
	MenuItem.prototype.DEFAULT_COLOUR = "white";
	MenuItem.prototype.FONT_SIZE = 50;
	MenuItem.prototype.FONT = MenuItem.prototype.FONT_SIZE+"px 'Courier New'";
	
	var MenuScreen = function(backgroundImage,items,buttonEvent) {
		this.backgroundImage = backgroundImage;
		this.items = items;
		this.buttonEvent = buttonEvent
	}
	
	MenuScreen.prototype.selectBounds = function(x,y) {
		for (var i = 0; i < this.items.length; ++i) {
			this.items[i].selected = this.items[i].bounds.pointCollision(x,y);
		}
	}
	
	MenuScreen.prototype.checkBounds = function(x,y) {
		for (var i = 0; i < this.items.length; ++i) {
			if (this.items[i].bounds.pointCollision(x,y)) {
				this.items[i].selected = false;
				this.buttonEvent(i);
			}
		}
	}
	
	MenuScreen.prototype.render = function() {
		ctx.drawImage(this.backgroundImage,0,0);
		ctx.font = MenuItem.prototype.FONT;
		for (var i = 0; i < this.items.length; ++i) {
			this.items[i].render();
		}
	}
	
	this.onmousedown = function(x,y) {
		currentMenu.checkBounds(x,y);
	}
	
	this.onmouseup = function(x,y) {
		
	}
	
	this.onmousemove = function(x,y) {
		currentMenu.selectBounds(x,y);
	}
	
	this.onkeydown = function(e) {
		switch(currentMenu) {
			case this.optionsMenu:
				if (this.optionsMenu.editingKey > -1) {
					switch(this.optionsMenu.editingKey) {
						case 1: 
							this.optionsMenu.leftKey = e.keyCode;
							this.optionsMenu.items[this.optionsMenu.editingKey].text = "< Left >  < "+e.key.toUpperCase()+" >"; 
						break;
						case 2:
							this.optionsMenu.rightKey = e.keyCode;
							this.optionsMenu.items[this.optionsMenu.editingKey].text = "< Right >  < "+e.key.toUpperCase()+" >"; 
						break;
						case 3: 
							this.optionsMenu.useKey = e.keyCode;
							this.optionsMenu.items[this.optionsMenu.editingKey].text = "< Use >  < "+e.key.toUpperCase()+" >"; 
						break;
					}
					this.optionsMenu.editingKey = -1;
				}
			break;
		}
	}
	
	this.onkeyup = function(e) {
		
	}
	
	this.loop = function() {
		currentMenu.render();
	}
}
