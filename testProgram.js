new function() {
	var x = 100;
	var y = 100;
	var dx = 0.8;
	var dy = 1.3;
	var size = 40;

	this.init = function() {
		dx = 1.4;
		dy = 0.1;
	}
	
	this.onmousedown = function(x,y) {
	
	}
	
	this.onkeydown = function(e) {
		
	}
	
	this.loop = function() {
		if (x + dx < 0 || x + size + dx > imageWidth) dx = -dx;
		if (y + dy < 0 || y + size + dy > imageHeight) dy = -dy;
		x += dx;
		y += dy;
		
		ctx.fillStyle = "gray";
		ctx.fillRect(0,0,imageWidth,imageHeight);
		ctx.fillStyle = "darkcyan";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.rect(x,y,size,size);
		ctx.fill();
		ctx.stroke();
	}
}