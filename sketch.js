// variable to hold a reference to our A-Frame world
var world;
var towerCollection;

var audioPlayer;
var fft;

function setup() {
	noCanvas();
    world = new World('VRScene');

	audioPlayer = new Tone.Player("funk.mp3").toMaster();
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
		rotationX: -90
	});
	world.add(ground);

	// lightSource = new LightSource(color, -1, 1, 1);

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
		this.object.tag.setAttribute('id', "tower" + this.id);

		world.add(this.object);
		// this.lightSource = new LightSource(id, this.color, x, 1, z);
		this.fftValue = 0;
	}

	update(newValue) {
		this.fftValue = map(newValue, -100, 0, 1, 20);
		this.object.setHeight(this.fftValue);
		// this.lightSource.setIntensity(this.fftValue / 10);
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
				this.towers.push(new Tower(i, towerColor, random(-50, 50), .5, random(-50, 50)));
		}
	}

	update() {
		for (var i = 0; i < fft.size	; i++){
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
		console.log("new lightsource...");
		var lightSource = '<a-light type="directional" position="0 0 0" rotation="-90 0 0" target="#tower"' + this.id + ';>';
		$("#VRScene").append(lightSource);
	}

	setIntensity(newIntensity)
	{
		$("#light" + this.id).attr("intensity", newIntensity);
	}

}


function colorToHex(colorToConvert) {
	var output = "#";
	output += hex(colorToConvert.levels[0]);
	output += hex(colorToConvert.levels[1]);
	output += hex(colorToConvert.levels[2])
}
