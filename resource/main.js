"use strict";

var main = new function() {
	this.canvas = null;
	this.ctx = null;
	this.imageWidth = 1024;
	this.imageHeight = 768;
	
	var activeState = menu;
	var isTransitioning = false;
	var transitionState = null;
	var transitionStage = -1;
	var transitionAlpha = 0;
	var transitionAlphaInc = 0.03;
	var transitionDelay = 100;
	var transitionCheck = Date.now();
	
	this.setActiveState = function(namespace) {
		activeState = namespace;
	}
	
	// "Loopable" states menu, world & terminal
	this.transitionActiveState = function(namespace) {
		isTransitioning = true;
		transitionStage = 0;
		transitionState = namespace;
	}
	
	this.requestFile = function(path,callback) {
		var req = new XMLHttpRequest();
		req.overrideMimeType("text/plain");
		req.open("GET", path, true);
		req.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.status == 200)
					callback(this.responseText);
				else if (this.status == 404)
					callback(null);
			}
		}
		req.send();
	}
	
	this.BoundingBox = function(x,y,width,height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	this.BoundingBox.prototype.pointCollision = function(x,y) {
		return (x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height);
	}
	
	window.onload = function() {
		
		main.canvas = document.getElementById("canvas");
		main.ctx = canvas.getContext("2d");
		main.canvas.width = main.imageWidth;
		main.canvas.height = main.imageHeight;
		
		animation.init();
		entity.init();
		terminal.init();
		world.init();
		menu.init();
		
		world.loadLevel("resource/testLevel/testWorld.json");
		
		terminal.createTerminal("testTerminal","resource/testlevel/testterminal.json");
		terminal.createTerminal("testTerminal2","resource/testlevel/testterminal2.json");
		terminal.useTerminal("testTerminal");
		
		requestAnimationFrame(loop);
	}
	
	window.onkeydown = function(e) {
		activeState.onkeydown(e);
	}
	
	window.onkeyup = function(e) {
		activeState.onkeyup(e);
	}
	
	window.onmousedown = function(e) {
		var bounds = canvas.getBoundingClientRect();
		activeState.onmousedown(e.clientX - bounds.left,e.clientY - bounds.top);
	}
	
	window.onmouseup = function(e) {
		var bounds = canvas.getBoundingClientRect();
		activeState.onmouseup(e.clientX - bounds.left,e.clientY - bounds.top);
	}
	
	window.onmousemove = function(e) {
		var bounds = canvas.getBoundingClientRect();
		activeState.onmousemove(e.clientX - bounds.left,e.clientY - bounds.top);
	}
	
	var loop = function() {
		activeState.loop();
		if (isTransitioning) {
			switch(transitionStage) {
				case 0:
					transitionAlpha += transitionAlphaInc;
					if (transitionAlpha > 1.0) {
						transitionAlpha = 1.0;
						transitionStage = 1;
						transitionCheck = Date.now();
					}
				break;
				
				case 1:
					if (Date.now() - transitionCheck > transitionDelay) {
						activeState = transitionState;
						transitionStage = 2;
					}
				break;
				
				case 2:
					transitionAlpha -= transitionAlphaInc;
					if (transitionAlpha < 0.0) {
						transitionAlpha = 0.0;
						isTransitioning = false;
						transitionStage = -1;
						transitionState = null;
					}
				break;
			}
			main.ctx.fillStyle = "rgba(0,0,0," + transitionAlpha + ")";
			main.ctx.fillRect(0,0,main.imageWidth,main.imageHeight);
		}
		
		requestAnimationFrame(loop);
	}
}
