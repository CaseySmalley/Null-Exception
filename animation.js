"use strict";

var animation = new function() {
	
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
	
	var Segment = function(x,y,pivX,pivY,width,height,angle,parent) {
		this.x = x;
		this.y = y;
		this.pivX = pivX;
		this.pivY = pivY;
		this.width = width;
		this.height = height;
		this.parent = parent;
		this.angle = angle;
	}
	
	Segment.prototype.applyParentRotation = function() {
		var list = [[this.x + this.pivX,this.y + this.pivY,this.angle]];
		list = this.parent.getParentRotation(list);
		for (var i = list.length - 1; i > -1; --i) {
			ctx.translate(list[i][0],list[i][1]);
			ctx.rotate(list[i][2]);
		}
	}
	
	Segment.prototype.getParentRotation = function(list) {
		list.push([this.x + this.pivX,this.y + this.pivY,this.angle]);
		if (this.parent) list = this.parent.getParentRotation(list);
		return list;
	}
	
	Segment.prototype.render = function(color) {
		ctx.save();
		ctx.beginPath();
			
		if (this.parent) {
			this.applyParentRotation();
		} else {
			ctx.translate(this.x + this.pivX,this.y + this.pivY);
			ctx.rotate(this.angle);
		}
	
		ctx.rect(-this.pivX,-this.pivY,this.width,this.height);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
	
	this.Mesh = function(x,y) {
		this.x = x;
		this.y = y;
		this.segments = [10];
		this.color = "rgba("+parseInt(Math.random()*150)+","+parseInt(Math.random()*150)+","+parseInt(Math.random()*150)+",1.0)";
		this.currentCycle = this.STAND_CYCLE;
		this.currentAnim = null;
		this.transitionFrame = null;
		this.isTransitioning = false;
		this.transitionSpeed = 0.0;
		this.currentFrame = 1;
		this.t = 0.0;
		
		this.left = false;
		this.right = false;
		
		this.segments[0] = new Segment(
			this.x,this.y, // Absolute position
			this.TORSO_WIDTH/2,this.TORSO_HEIGHT/2, // Pivot location
			this.TORSO_WIDTH,this.TORSO_HEIGHT, // Width & height
			0.0, // initial rotation
			null // parent, if null use absolute positioning
		);
		
		this.segments[1] = new Segment(
			-this.HEAD_WIDTH/2,-this.TORSO_HEIGHT/2 - this.HEAD_HEIGHT, // Relative position
			this.HEAD_WIDTH/2,this.HEAD_HEIGHT, // pivot location
			this.HEAD_WIDTH,this.HEAD_HEIGHT, // width & height
			0.0, // initial rotation
			this.segments[0] // parent
		);
		
		this.segments[2] = new Segment(
			this.TORSO_WIDTH/3 - this.LEG_WIDTH/2,this.TORSO_HEIGHT/2,
			this.LEG_WIDTH/2,0,
			this.LEG_WIDTH,this.LEG_HEIGHT,
			0.0,
			this.segments[0]
		);
		
		this.segments[3] = new Segment(
			-this.LEG_WIDTH/2,this.LEG_HEIGHT,
			this.LEG_WIDTH/2,0,
			this.LEG_WIDTH,this.LEG_HEIGHT,
			0.0,
			this.segments[2]
		);
		
		this.segments[4] = new Segment(
			-this.TORSO_WIDTH/3 - this.LEG_WIDTH/2,this.TORSO_HEIGHT/2,
			this.LEG_WIDTH/2,0,
			this.LEG_WIDTH,this.LEG_HEIGHT,
			0.0,
			this.segments[0]
		);
		
		this.segments[5] = new Segment(
			-this.LEG_WIDTH/2,this.LEG_HEIGHT,
			this.LEG_WIDTH/2,0,
			this.LEG_WIDTH,this.LEG_HEIGHT,
			0.0,
			this.segments[4]
		);
		
		this.segments[6] = new Segment(
			-this.TORSO_WIDTH/2 - this.ARM_WIDTH/2,-this.TORSO_HEIGHT/3,
			this.ARM_WIDTH/2,0,
			this.ARM_WIDTH,this.ARM_HEIGHT,
			0.0,
			this.segments[0]
		);
		
		this.segments[7] = new Segment(
			-this.ARM_WIDTH/2,this.ARM_HEIGHT,
			this.ARM_WIDTH/2,0,
			this.ARM_WIDTH,this.ARM_HEIGHT,
			0.0,
			this.segments[6]
		);
		
		this.segments[8] = new Segment(
			this.TORSO_WIDTH/2 - this.ARM_WIDTH/2,-this.TORSO_HEIGHT/3,
			this.ARM_WIDTH/2,0,
			this.ARM_WIDTH,this.ARM_HEIGHT,
			0.0,
			this.segments[0]
		);
		
		this.segments[9] = new Segment(
			-this.ARM_WIDTH/2,this.ARM_HEIGHT,
			this.ARM_WIDTH/2,0,
			this.ARM_WIDTH,this.ARM_HEIGHT,
			0.0,
			this.segments[8]
		);
	}
	
	this.Mesh.prototype.applyKeyFrame = function(frame) {
		for (var i = 0; i < this.segments.length; ++i) {
			this.segments[i].angle = frame[i];
		}
	}
	
	this.Mesh.prototype.interpolateKeyFrame = function(sFrame,eFrame,t) {
		var angle = 0.0;
		for (var i = 0; i < this.segments.length; ++i) {
			angle = sFrame[i] + (eFrame[i] - sFrame[i]) * t;
			this.segments[i].angle = angle;
		}
	}
	
	this.Mesh.prototype.getCurrentKeyFrame = function() {
		var frame = [this.segments.length];
		for (var i = 0; i < this.segments.length; ++i) {
			frame[i] = this.segments[i].angle;
		}
		return frame;
	}
	
	this.Mesh.prototype.transitionKeyFrame = function(newCycle,speed) {
		this.isTransitioning = true;
		this.transitionFrame = this.getCurrentKeyFrame();
		this.t = 0.0;
		this.transitionSpeed = speed;
		this.currentFrame = 1;
		this.currentCycle = newCycle;
	}
	
	this.Mesh.prototype.playAnimation = function(animCycle) {
		this.isTransitioning = true;
		this.transitionFrame = this.getCurrentKeyFrame();
		this.t = 0.0;
		this.transitionSpeed = 0.04;
		this.currentFrame = 1;
		this.currentAnim = animCycle;
	}
	
	this.Mesh.prototype.goLeft = function(input) {
		if (input && !this.left) {
			this.transitionKeyFrame(this.LEFT_WALK_CYCLE,0.07);
		} else  if (!input && !this.right) {
			this.transitionKeyFrame(this.STAND_CYCLE,0.07);
		}
		
		this.left = input;
	}
	
	this.Mesh.prototype.goRight = function(input) {
		if (input && !this.right) {
			this.transitionKeyFrame(this.RIGHT_WALK_CYCLE,0.07);
		} else if (!input && !this.left) {
			this.transitionKeyFrame(this.STAND_CYCLE,0.07);
		}
		
		this.right = input;
	}
	
	this.Mesh.prototype.tick = function() {
		if (this.currentAnim) {
			if (!this.isTransitioning) {
				this.interpolateKeyFrame(this.currentAnim[this.currentFrame],this.currentAnim[this.currentFrame+1],this.t);
				this.t += this.currentAnim[0];
				if (this.t > 1.0) {
					this.t = 0.0;
			
					++this.currentFrame;
					if (this.currentFrame > this.currentAnim.length - 2) {
						this.currentFrame = 1;
						this.currentAnim = null;
						this.transitionKeyFrame(this.currentCycle,0.04);
					}
				}
			} else {
				this.t += this.transitionSpeed;
				this.interpolateKeyFrame(this.transitionFrame,this.currentAnim[1],this.t);
			
				if (this.t > 1.0) {
					this.t = 0.0;
					this.isTransitioning = false;
				}
			}
			return;
		}
		
		if (!this.isTransitioning) {
			this.t += this.currentCycle[0];
		
			if (this.t > 1.0) {
				this.t = 0.0;
				
				++this.currentFrame;
				if (this.currentFrame > this.currentCycle.length - 2)
					this.currentFrame = 1;
			}
			
			this.interpolateKeyFrame(this.currentCycle[this.currentFrame],this.currentCycle[this.currentFrame+1],this.t);
		} else {
			this.t += this.transitionSpeed;
			this.interpolateKeyFrame(this.transitionFrame,this.currentCycle[1],this.t);
			
			if (this.t > 1.0) {
				this.t = 0.0;
				this.isTransitioning = false;
			}
		}
	}
	
	this.Mesh.prototype.render = function() {
		this.segments[0].x = this.x;
		this.segments[0].y = this.y;
		ctx.fillStyle = this.color;
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		for (var i = 0; i < this.segments.length; ++i) {
			this.segments[i].render(this.color);
		}
	}
	
	this.Mesh.prototype.HEAD_WIDTH = 50;
	this.Mesh.prototype.HEAD_HEIGHT = 50;
	this.Mesh.prototype.TORSO_WIDTH = 40;
	this.Mesh.prototype.TORSO_HEIGHT = 100;
	this.Mesh.prototype.ARM_WIDTH = 10;
	this.Mesh.prototype.ARM_HEIGHT = 50;
	this.Mesh.prototype.LEG_WIDTH = 10;
	this.Mesh.prototype.LEG_HEIGHT = 70;
	this.Mesh.prototype.WIDTH = this.Mesh.prototype.TORSO_WIDTH;
	this.Mesh.prototype.HEIGHT = this.Mesh.prototype.TORSO_HEIGHT + this.Mesh.prototype.LEG_HEIGHT * 2;
	
	// Movement animation cycles
	
	this.Mesh.prototype.STAND_CYCLE = [
	0.015, // Animation Speed
	[
	0.0, // torso
	0.05, // head
	0.0, // left upper leg
	0.0, // left lower leg
	0.0, // right upper leg
	0.0, // right lower leg
	0.25, // left upperarm
	-0.25, // left forearm
	-0.25, // right upperarm
	0.25 // right forearm
	],[
	0.0, // torso
	-0.05, // head
	0.0, // left upper leg
	0.0, // left lower leg
	0.0, // right upper leg
	0.0, // right lower leg
	0.15, // left upperarm
	-0.15, // left forearm
	-0.15, // right upperarm
	0.15 // right forearm
	],[
	0.0, // torso
	0.05, // head
	0.0, // left upper leg
	0.0, // left lower leg
	0.0, // right upper leg
	0.0, // right lower leg
	0.25, // left upperarm
	-0.25, // left forearm
	-0.25, // right upperarm
	0.25 // right forearm
	]];
	
	this.Mesh.prototype.RIGHT_WALK_CYCLE = [
	0.04, // animation speed
	[
	0.0, // torso
	0.05, // head
	-0.4, // left upper leg
	0.3, // left lower leg
	0.2, // right upper leg
	0.3, // right lower leg
	0.1, // left upperarm
	-0.1, // left forearm
	-0.1, // right upperarm
	0.1 // right forearm
	],[
	0.0, // torso
	-0.05, // head
	0.3, // left upper leg
	0.0, // left lower leg
	-0.3, // right upper leg
	0.2, // right lower leg
	0.1, // left upperarm
	-0.1, // left forearm
	-0.1, // right upperarm
	0.1 // right forearm
	],[
	0.0, // torso
	0.05, // head
	-0.4, // left upper leg
	0.3, // left lower leg
	0.2, // right upper leg
	0.3, // right lower leg
	0.1, // left upperarm
	-0.1, // left forearm
	-0.1, // right upperarm
	0.1 // right forearm
	]];
	
	this.Mesh.prototype.LEFT_WALK_CYCLE = [
	0.04, // Aimation speed
	[
	0.0, // torso
	0.05, // head
	0.4, // left upper leg
	-0.3, // left lower leg
	-0.2, // right upper leg
	-0.3, // right lower leg
	0.1, // left upperarm
	-0.1, // left forearm
	-0.1, // right upperarm
	0.1 // right forearm
	],[
	0.0, // torso
	-0.05, // head
	-0.3, // left upper leg
	0.0, // left lower leg
	0.3, // right upper leg
	-0.2, // right lower leg
	0.1, // left upperarm
	-0.1, // left forearm
	-0.1, // right upperarm
	0.1 // right forearm
	],[
	0.0, // torso
	0.05, // head
	0.4, // left upper leg
	-0.3, // left lower leg
	-0.2, // right upper leg
	-0.3, // right lower leg
	0.1, // left upperarm
	-0.1, // left forearm
	-0.1, // right upperarm
	0.1 // right forearm
	]];
	
	// "playable" animation cycles
	
	this.Mesh.prototype.WAVE_CYCLE = [
	0.1, // animation speed
	[
	0.0, // torso
	0.0, // head
	0.0, // left upper leg
	0.0, // left lower leg
	0.0, // right upper leg
	0.0, // right lower leg
	0.0, // left upperarm
	0.0, // left forearm
	-2.0, // right upperarm
	-1.5 // right forearm
	],[
	0.0, // torso
	0.0, // head
	0.0, // left upper leg
	0.0, // left lower leg
	0.0, // right upper leg
	0.0, // right lower leg
	0.0, // left upperarm
	0.0, // left forearm
	-1.7, // right upperarm
	-1.0 // right forearm
	],[
	0.0, // torso
	0.0, // head
	0.0, // left upper leg
	0.0, // left lower leg
	0.0, // right upper leg
	0.0, // right lower leg
	0.0, // left upperarm
	0.0, // left forearm
	-2.0, // right upperarm
	-1.5 // right forearm
	]];
	
}