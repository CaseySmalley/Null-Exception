"use strict";

var entity = new function() {
	var canvas = null;
	var ctx = null;
	var imageWidth = 0;
	var imageHeight = 0;
	
	this.init = function() {
		canvas = main.canvas;
		ctx = main.ctx;
		imageWidth = main.imageWidth;
		imageHeight = main.imageHeight;
	}
	
	this.Actor = function(x,y) {
		this.mesh = new animation.Mesh(x,y);
	}
	
	this.Actor.prototype.left = function(input) {
		this.mesh.goLeft(input);
	}
	
	this.Actor.prototype.right = function(input) {
		this.mesh.goRight(input);
	}
	
	this.Actor.prototype.stop = function() {
		this.mesh.goLeft(false);
		this.mesh.goRight(false);
	}
	
	this.Actor.prototype.tick = function() {
		this.mesh.tick();
		if (this.mesh.left) this.mesh.x -= this.WALK_SPEED;
		if (this.mesh.right) this.mesh.x += this.WALK_SPEED;
	}
	
	this.Actor.prototype.render = function() {
		this.mesh.render();
	}
	
	this.Actor.prototype.WALK_SPEED = 1.5;
}