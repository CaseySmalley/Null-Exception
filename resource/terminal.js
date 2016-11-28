"use strict";

var terminal = new function() {
	
	var buffer = null;
	var ctx = null;
	var imageWidth = 500;
	var imageHeight = 330;
	var terminalList = [];
	var currentTerminal = null;
	
	this.init = function() {
		buffer = document.getElementById("terminalBuffer");
		ctx = buffer.getContext("2d");
		buffer.width = imageWidth;
		buffer.height = imageHeight; 
		ctx.imageSmoothingEnabled = false;
	}
	
	var File = function(name,type,content) {
		this.name = name;
		this.type = type;
		this.content = null;
		
		switch(this.type) {
			case this.TXT:
				try {
					this.content = content.trim().split("\n");
					for (var i = 0; i < this.content.length; ++i) {
						this.content[i] = this.content[i].trim();
					}
				} catch(e) {
					this.content = "";
				}
			break;
		
			case this.EXE:
				this.setupContentCode(content,this);
			break;
		}
	}
	
	File.prototype.TXT = 1;
	File.prototype.EXE = 2;
	File.prototype.CORRUPTED_EXE = 3;
	
	File.prototype.setupContentCode = function(codeURL,ref) {
		var req = new XMLHttpRequest();
		req.overrideMimeType("text/plain");
		req.timeout = 10000;
		req.open("GET",codeURL,true);
		req.onload = function() {
			if (this.status == 200) {
				try {
					eval("ref.content = " + this.responseText);
				} catch(e) {
					ref.type = File.prototype.CORRUPTED_EXE;
					ref.content = this.responseText;
					console.log("Error: Failed to initialize content code");
				}
			}
		}
		req.send();
	}
	
	var Directory = function(name,parent) {
		this.name = name;
		this.parent = parent;
		this.children = [];
		this.files = [];
		if (this.parent != null) this.parent.addChild(this);
		
		this.addChild = function(d) {
			this.children.push(d);
		}
		
		this.addFile = function(f) {
			this.files.push(f);
		}
		
		this.getParent = function() {
			return this.parent;
		}
		
		this.getFullPath = function() {
			if (this.parent != null) {
				return this.parent.getFullPath() + this.name + "\\";
			} else {
				return this.name + "\\";
			}
		}
	}
	
	var Terminal = function(url) {
		this.display = false;
		this.lastCheck = Date.now();
		this.lastExeCheck = Date.now();
		this.nextExeDelay = 0;
		this.exeProgress = 0;
		this.loadingExe = false;
		this.loadedExe = false;
		this.command = "";
		this.canInputCommand = true;
		this.previousCommands = ["","","","","","","","",""];
		this.currentDirectory = null;
		this.baseDirectory = null;
		this.currentFile = null;
		this.hasLoaded = false;
		
		this.requestFile(url,this);
	}
	
	Terminal.prototype.commandMax = 30;
	Terminal.prototype.delay = 500;
	Terminal.prototype.exeDelay = 300;
	Terminal.prototype.setupDirectory = function(div,parent) {
		var workingDirectory = new Directory(div.name,parent);
		var type = "";
		for (var i = 0; i < div.content.length; ++i) {
			type = div.content[i].type;
			if (type === "txt") {
				workingDirectory.addFile(new File(div.content[i].name,File.prototype.TXT,div.content[i].content));
			} else if (type === "exe") {
				workingDirectory.addFile(new File(div.content[i].name,File.prototype.EXE,div.content[i].content));
			} else if (type === "div") {
				Terminal.prototype.setupDirectory(div.content[i],workingDirectory);
			}
		}
	}
	
	Terminal.prototype.JSONFileCallback = function(terminalJSON) {
		try {
			var rawterminal = JSON.parse(terminalJSON);
			this.currentDirectory = new Directory(rawterminal.name,null);
			this.baseDirectory = this.currentDirectory;
			var type = "";
			for (var i = 0; i < rawterminal.content.length; ++i) {
				type = rawterminal.content[i].type;
				if (type === "txt") {
					this.currentDirectory.addFile(new File(rawterminal.content[i].name,File.prototype.TXT,rawterminal.content[i].content));
				} else if (type === "exe") {
					this.currentDirectory.addFile(new File(rawterminal.content[i].name,File.prototype.EXE,rawterminal.content[i].content));
				} else if (type === "div") {
					Terminal.prototype.setupDirectory(rawterminal.content[i],this.currentDirectory);
				}
			}
			
			this.hasLoaded = true;
			
		} catch(e) {
			console.log("Error: Terminal Failed To Parse");
		}
	}
	
	Terminal.prototype.requestFile = function(path,obj) {
		var req = new XMLHttpRequest();
		req.overrideMimeType("text/plain");
		req.open("GET", path, true);
		req.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.status == 200)
					obj.JSONFileCallback(this.responseText);
				else if (this.status == 404)
					obj.JSONFileCallback(null);
			}
		}
		req.send();
	}
	
	Terminal.prototype.onmousedown = function(x,y) {
		if (this.currentFile != null) {
			if (this.currentFile.type === File.prototype.EXE) this.currentFile.content.onmousedown(x,y);
		}
	}
	
	Terminal.prototype.onkeydown = function(e) {
		if (this.hasLoaded) {
			if (this.canInputCommand) {
				if (e.key === "Backspace") {
					this.command = this.command.substring(0,this.command.length - 1);
					return;
				} else if (e.key === "Enter") {
					this.addToLog(this.command);
					this.processCommand(this.command);
					this.command = "";
					return;
				}
				if (e.key.length <= 1 && this.command.length < this.commandMax) this.command += e.key;
			} else if (this.currentFile != null) {
				//if (this.currentFile.type === File.prototype.EXE)
				//	this.currentFile.content.onkeydown(e);
				if (e.key === "Escape") {
					this.addToLog("Exited " + this.currentFile.name);
					this.currentFile = null;
					this.canInputCommand = true;
					this.loadedExe = false;
				}
			}
		}
	}
	
	Terminal.prototype.addToLog = function(s) {
		for (var i = this.previousCommands.length - 1; i > 0; --i) {
			this.previousCommands[i] = this.previousCommands[i - 1]
		}
		this.previousCommands[0] = s;
	}
	
	Terminal.prototype.processCommand = function(command) {
		var tokens = command.split(" ");
		command = tokens[0].toUpperCase();
		if (command === "CLEAR" || command === "CLS") {
			for (var i = 0; i < this.previousCommands.length; ++i) {
				this.previousCommands[i] = "";
			}
		} else
		
		if (command === "HELP") {
			this.addToLog("");
			if (tokens[1] === undefined) {
				this.addToLog("cls, cd, dir, copy, del, open");
				this.addToLog("type 'help <command>'");
			} else if (tokens[1].toUpperCase() === "CLEAR" || tokens[1].toUpperCase() === "CLS") {
				this.addToLog("Clears the screen.");
				this.addToLog("'cls' or 'clear'");
			} else if (tokens[1].toUpperCase() === "CD") {
				this.addToLog("Changes the current directory");
				this.addToLog("to the one specified.");
				this.addToLog("'cd ..' return to parent directory.");
				this.addToLog("'cd <folder name>'");
			} else if (tokens[1].toUpperCase() === "OPEN") {
				this.addToLog("Opens the specified file.");
				this.addToLog("'open <filename>'");
			} else if (tokens[1].toUpperCase() === "COPY") {
				this.addToLog("Copies the specified file.");
				this.addToLog("'copy <filename>'");
			} else if (tokens[1].toUpperCase() === "DEL") {
				this.addToLog("Deletes the specified file.");
				this.addToLog("'del <filename>'");
			} else if (tokens[1].toUpperCase() === "HELP") {
				this.addToLog("A very helpful command.");
			}
		} else
		
		if (command === "OPEN") {
			try {
				for (var i = 0; i < this.currentDirectory.files.length; ++i) {
					if (tokens[1].toUpperCase() === this.currentDirectory.files[i].name.toUpperCase()) {
						this.currentFile = this.currentDirectory.files[i];
						if (this.currentFile.type === File.prototype.EXE) {
							this.currentFile.content.init();
							this.loadingExe = true;
							this.nextExeDelay = parseInt(Math.random() * this.exeDelay);
							this.lastExeCheck = Date.now();
							this.exeProgress = 0;
							this.addToLog("Loading " + this.currentFile.name + " " + this.exeProgress + "%.");
						}
						this.canInputCommand = false;
						return;
					}
				}
				this.addToLog("");
				this.addToLog("File not found.");
			} catch(e) {this.previousCommands[0] = "Error opening file."}
		} else
		
		if (command === "CD") {
			if (tokens[1] != undefined) {
				tokens[1] = tokens[1].toUpperCase();
				var isFound = false;
				if (tokens[1] === ".." && this.currentDirectory.parent != null) {this.currentDirectory = this.currentDirectory.parent; isFound = true;}
				for (var i = 0; i < this.currentDirectory.children.length; ++i) {
					if (this.currentDirectory.children[i].name.toUpperCase() === tokens[1]) {
						this.currentDirectory = this.currentDirectory.children[i];
						isFound = true;
						break;
					}
				}
				
				if (!isFound) this.addToLog("Directory Not Found.");
			}
		} else
		
		if (command === "DIR") {
			this.addToLog("");
			this.addToLog("Directory of '" + this.currentDirectory.getFullPath() + "'");
			for (var i = 0; i < this.currentDirectory.children.length; ++i) {
				this.addToLog(this.currentDirectory.children[i].name + " <DIR>");
			}
			
			for (var i = 0; i < this.currentDirectory.files.length; ++i) {
				this.addToLog(this.currentDirectory.files[i].name);
			}
		} else
		
		if (command === "COPY") {
			
		} else
		
		if (command === "DEL") {
			if (tokens[1] != undefined) {
				tokens[1] = tokens[1].toUpperCase();
				for (var i = 0; i < this.currentDirectory.files.length; ++i) {
					if (this.currentDirectory.files[i].name.toUpperCase() === tokens[1]) {
						--this.currentDirectory.files.length;
						delete this.currentDirectory.files[i];
						return;
					}
				}
				
				tokens[1] = tokens[1].toUpperCase();
				for (var i = 0; i < this.currentDirectory.children.length; ++i) {
					if (this.currentDirectory.children[i].name.toUpperCase() === tokens[1]) {
						--this.currentDirectory.children.length;
						delete this.currentDirectory.children[i];
						return;
					}
				}
				
				this.addToLog("File/Directory Not Found.");
			}
		} else
		
		{
			this.previousCommands[0] = "Unknown Command '"+command.toLowerCase()+"'";
		}
	}
	
	Terminal.prototype.loop = function() {
		// tick
		if (Date.now() - this.lastCheck > this.delay) {
			this.display = !this.display;
			this.lastCheck = Date.now();
		}
		
		if (this.loadingExe) {
			if (Date.now() - this.lastExeCheck > this.nextExeDelay) {
				this.exeProgress += 10;
				if (this.exeProgress > 100) {
					this.loadingExe = false;
					this.loadedExe = true;
				}
				
				if (this.exeProgress < 110)
					this.previousCommands[0] = "Loading " + this.currentFile.name + " " + this.exeProgress + "%";
				else
					this.addToLog("Executing " + this.currentFile.name + "...");
				
				this.nextExeDelay = parseInt(Math.random() * this.exeDelay);
				this.lastExeCheck = Date.now();
			}
		}
		// render
		ctx.fillStyle = "#00004b";
		ctx.fillRect(0,0,imageWidth,imageHeight);
		if (this.currentFile == null || this.loadingExe) {
			ctx.fillStyle = "white";
			if (this.display) ctx.fillRect(29 + ctx.measureText(this.command).width,295,2,16);
			ctx.font="15px 'Courier New'";
			ctx.fillText("> " + this.command,10,308);
			for (var i = 0; i < this.previousCommands.length; ++i) {
				if (!(this.previousCommands[i] === "")) ctx.fillText("> " + this.previousCommands[i],10,275 - i*30);
			}
		} else {
			if (this.currentFile.type == File.prototype.TXT || this.currentFile.type == File.prototype.CORRUPTED_EXE) {
				ctx.fillStyle = "white";
				ctx.font="15px 'Courier New'";
				ctx.fillText("> " + this.currentDirectory.getFullPath() + this.currentFile.name,10,35);
				for (var i = 0; i < this.currentFile.content.length; ++i) {
					ctx.fillText(this.currentFile.content[i],25,70 + 17 * i);
				}
			} else if (this.currentFile.type == File.prototype.EXE && this.loadedExe) {
				this.currentFile.content.loop();
			}
		}
		//
		main.ctx.drawImage(buffer,0,0,main.imageWidth,main.imageHeight);
	}
	
	this.createTerminal = function(id,url) {
		if (terminalList[id] === undefined)
			terminalList[id] = new Terminal(url);
		else
			console.log("Error: a terminal with that ID already exists");
	}
	
	this.useTerminal = function(id) {
		if (terminalList[id] !== undefined) {
			currentTerminal = terminalList[id];
		} else if (id === "null") {
			currentTerminal = null;
		} else {
			console.log("Error: No terminal with that ID exists");
		}
	}
	
	this.getCurrentTerminal = function() {
		return currentTerminal;
	}
	
	this.onkeydown = function(e) {
		if (currentTerminal) currentTerminal.onkeydown(e);
	}
	
	this.onkeyup = function(e) {
		
	}
	
	this.onmousedown = function(x,y) {
		if (currentTerminal) currentTerminal.onmousedown(x,y);
	}
	
	this.onmouseup = function(x,y) {
		
	}
	
	this.onmousemove = function(x,y) {
		
	}
	
	this.loop = function() {
		if (currentTerminal) currentTerminal.loop();
	}
}
