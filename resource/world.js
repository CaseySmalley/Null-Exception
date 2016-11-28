"use strict";

var world = new function() {
	
	var canvas = null;
	var ctx = null;
	var imageWidth = 0;
	var imageHeight = 0;
	var backgroundImage = null;
	var backgroundPanL = 0;
	var backgroundPanR = 0;
	var backgroundPanSpeed = 0;
	
	var testPlayer = null;
	var testNPC = null;
	
	var t = 0.0;
	var frame = true;
	var frantic = false;
	var foreground = null;
	
	this.toggleFrantic = function() {
		frantic = !frantic;
	}
	
	this.init = function() {
		canvas = main.canvas;
		ctx = main.ctx;
		imageWidth = main.imageWidth;
		imageHeight = main.imageHeight;
		this.loop = function() {}
		
		testPlayer = new entity.Actor(imageWidth/2 - 50,imageHeight - animation.Mesh.prototype.HEIGHT - 50);
		//testNPC = new animation.Mesh(100,imageHeight - animation.Mesh.prototype.HEIGHT - 50);
	}
	
	var levelJSONCallback = function(levelJSON) {
		// actual level setup
		var rawLevel = JSON.parse(levelJSON);
		backgroundImage = new Image();
		backgroundImage.src = rawLevel.backgroundTexture;
		
		backgroundPanL = -main.imageWidth;
		backgroundPanR = 0;
		backgroundPanSpeed = 1.0;
		
		ctx.fillStyle = "rgba(100,100,100,1.0)";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 3;
		
		ctx.beginPath();
		ctx.moveTo(100,imageHeight * 0.9);
		ctx.lineTo(imageWidth - 100,imageHeight * 0.9);
		ctx.lineTo(imageWidth,imageHeight);
		ctx.lineTo(0,imageHeight);
		ctx.lineTo(100,imageHeight * 0.9);
		ctx.fill();
		ctx.stroke();
		
		ctx.fillStyle = "rgba(80,80,80,1.0)";
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(100,0);
		ctx.lineTo(100,imageHeight * 0.9);
		ctx.lineTo(0,imageHeight);
		ctx.moveTo(imageWidth - 100,0);
		ctx.lineTo(imageWidth,0);
		ctx.lineTo(imageWidth,imageHeight);
		ctx.lineTo(imageWidth - 100,imageHeight * 0.9);
		ctx.lineTo(imageWidth - 100,0);
		ctx.fill();
		ctx.stroke();
		
		ctx.fillStyle = "rgba(75,75,75,1.0)";
		ctx.beginPath();
		ctx.rect(100,0,imageWidth - 200,imageHeight * 0.9);
		ctx.fill();
		ctx.stroke();
		
		ctx.fillStyle = "rgba(0,150,150,0.5)";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 0.8;
		ctx.clearRect(100,imageHeight * 0.4,imageWidth - 200,imageHeight * 0.3);
		ctx.beginPath();
		ctx.rect(100,imageHeight * 0.4,imageWidth - 200,imageHeight * 0.3);
		ctx.fill();
		ctx.stroke();
		
		foreground = new Image();
		foreground.src = canvas.toDataURL();
		
		
		world.loop = loop;
	}
	
	this.loadLevel = function(url) {
		main.requestFile(url,levelJSONCallback);
	}
	
	this.onkeydown = function(e) {
		switch(e.keyCode) {
			case menu.optionsMenu.rightKey: testPlayer.right(true); break;
			case menu.optionsMenu.leftKey: testPlayer.left(true); break;
			case menu.optionsMenu.useKey: testPlayer.mesh.playAnimation(animation.Mesh.prototype.WAVE_CYCLE); break;
		}
	}
	
	this.onkeyup = function(e) {
		switch(e.keyCode) {
			case menu.optionsMenu.rightKey: testPlayer.right(false); break;
			case menu.optionsMenu.leftKey: testPlayer.left(false); break;
		}
	}
	
	this.onmousedown = function(x,y) {
		
	}
	
	this.onmouseup = function(x,y) {
		
	}
	
	this.onmousemove = function(x,y) {
		
	}
	
	var loop = function() {
		// Tick
		backgroundPanL += backgroundPanSpeed;
		backgroundPanR += backgroundPanSpeed;
		if (backgroundPanSpeed > 0) {
			if (backgroundPanL > main.imageWidth) backgroundPanL = -main.imageWidth;
			if (backgroundPanR > main.imageWidth) backgroundPanR = -main.imageWidth;
		} else {
			if (backgroundPanL < -main.imageWidth) backgroundPanL = main.imageWidth;
			if (backgroundPanR < -main.imageWidth) backgroundPanR = main.imageWidth;
		}
		
		testPlayer.tick();
		/*testNPC.tick();
		if (testPlayer.x < 100) testPlayer.x = 100;
		if (testPlayer.x > 880) testPlayer.x = 880;
		if (testNPC.x < 110) {
			testNPC.goLeft(false);
			testNPC.goRight(true);
		} else if (testNPC.x > 880) {
			testNPC.goRight(false);
			testNPC.goLeft(true);
		}*/
		//Render
		ctx.drawImage(backgroundImage,backgroundPanL,0);
		ctx.drawImage(backgroundImage,backgroundPanR,0);
		
		ctx.drawImage(foreground,0,0);
		testPlayer.render();
		//testNPC.render();
	}
}
