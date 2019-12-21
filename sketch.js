// variable to hold a reference to our A-Frame world
var world;
var towerCollection;

var audioPlayer;
var fft;

var lightSource;
var lightSource2;
var lightSource3;
var lightSource4;

function setup() {
	noCanvas();
    world = new World('VRScene');

	audioPlayer = new Tone.Player("lux.mp3").toMaster();
	audioPlayer.autostart = true;

	fft = new Tone.FFT(16);
	audioPlayer.connect(fft);

	towerCollection = new TowerCollection("random");
	var sky = new Sphere({
		radius: 500
	});
	world.add(sky);

	var ground = new Plane({
		width: 500, height: 500,
		red: 0, green: 0, blue: 0,
		rotationX: -90,
		metalness: 0,
		shader: "flat"
	});
	world.add(ground);
 	var towerPos = towerCollection.towers[0].position;
	console.log(towerPos);

	// lightSource = new LightSource(0, color, towerPos.x - 1, 5, towerPos.z);
	// lightSource2 = new LightSource(0, color, towerPos.x + 1, 5, towerPos.z);
	// lightSource3 = new LightSource(0, color, towerPos.x, 5, towerPos.z - 1);
	// lightSource4 = new LightSource(0, color, towerPos.x, 5, towerPos.z + 1);

}

function draw() {
	// console.log(fft.getValue());
	towerCollection.update();
}


class Tower {
	constructor(id, color, x, y, z) {
		this.id = id;
		this.position = createVector(x, y, z);
		this.size = 1;
		this.color = color;

		this.object = new Box({
			x: this.position.x, y: this.position.y, z: this.position.z,
			width: this.size, height: 50, depth: this.size,
			red: this.color.levels[0], green: this.color.levels[1], blue: this.color.levels[2],
		});
		// this.object.tag.setAttribute('id', "tower" + this.id);

		this.lightSources = [];
		this.lightSources.push(new LightSource(id + ".1", "", this.position.x + 1, 5, this.position.z))
		this.lightSources.push(new LightSource(id + ".2", "", this.position.x - 1, 5, this.position.z))
		this.lightSources.push(new LightSource(id + ".3", "", this.position.x, 5, this.position.z + 1))
		this.lightSources.push(new LightSource(id + ".4", "", this.position.x, 5, this.position.z - 1))

		world.add(this.object);
		// this.lightSource = new LightSource(id, this.color, x, 1, z);
		this.fftValue = 0;
	}

	update(newValue) {
		console.log(this.fftValue);
		this.fftValue = map(newValue, -100, 0, 1, 20);
		this.object.setHeight(this.fftValue);
		for (var i = 0; i < this.lightSources.length; i++){
			this.lightSources[i].update(this.fftValue);
		}
	}
}

class TowerCollection {
	constructor(mode) {
		this.towers = [];
		colorMode(HSB, fft.size * 2, 100, 100);
		this.mode = mode;

		this.radius = 20;
		var angleDif = 2 * Math.PI / fft.size;

		for (var i = 0; i < fft.size; i++){
			var towerColor = color(i + fft.size, 100, 100);
			var x = this.radius * cos(angleDif * i);
			var y = this.radius * sin(angleDif * i);

			if (this.mode == "circle")
				this.towers.push(new Tower(i, towerColor, x, .5, y));
			if (this.mode == "random")
				this.towers.push(new Tower(i, towerColor, random(-10, 10), .5, random(-10, 10)));
		}
	}

	update() {
		for (var i = 0; i < fft.size; i++){
			this.towers[i].update(fft.getValue()[i]);
		}
	}
}

function mousePressed()
{
	Tone.context.resume();
}


class LightSource {
	constructor(id, lightColor, x, y, z) {
		this.id = id;
		this.position = createVector(x, y, z);
		// var lightSource = '<a-entity id="test" light="type: point; distance: 15; decay: 1; color: #FFF; intensity: 1.0" position="' + x + ' ' + y + ' ' + z + '"></a-entity>'
		var lightSource = '<a-light id=' + "light" + this.id + '></a-light>'
		$("#VRScene").append(lightSource);
		console.log($("#light" + this.id));
		var element = document.getElementById("light"  + id);
		element.setAttribute("position", {x: x, y: y, z: z});
		element.setAttribute("type", "point")
		element.setAttribute("decay", 0);
		element.setAttribute("distance", 30);
	}

	update(newHeight)
	{
		document.getElementById("light"  + this.id).setAttribute("intensity", map(newHeight, 1, 20, 0, .1));
	}

}


function colorToHex(colorToConvert) {
	var output = "#";
	output += hex(colorToConvert.levels[0]);
	output += hex(colorToConvert.levels[1]);
	output += hex(colorToConvert.levels[2])
}
