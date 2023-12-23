interface HttpPostCallback {
	(x:any): any;
}

const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
}

const g_origin = new URL(window.location.href).origin;
const g_id = random_id(12);

const thing_names = [
	"chair", // 0
	"lamp",
	"mushroom", // 2
	"outhouse",
	"pillar", // 4
	"pond",
	"rock", // 6
	"statue",
	"tree", // 8
	"turtle",
];

let g_playerName: string;
//fetch player name from the html input
function start_pressed(name_value: string){
		g_playerName = name_value;
		let s: string[] = [];
		s.push(`<canvas id="myCanvas" width="1000" height="500" style="border:1px solid #cccccc;">`);
		s.push(`</canvas>`);
		const content = document.getElementById('content') as HTMLElement;
		content.innerHTML = s.join('');
		main();
		
	}
//this is just an example json string so i could see what the map
//{"status":"map","map":{"things":[{"x":995,"y":426,"kind":0}



//const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
//let g_playerName = playerNameInput.value;
// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
const httpPost = (page_name: string, payload: any, callback: HttpPostCallback) => {
	let request = new XMLHttpRequest();
	request.onreadystatechange = () => {
		if(request.readyState === 4)
		{
			if(request.status === 200) {
				let response_obj;
				try {
					response_obj = JSON.parse(request.responseText);
				} catch(err) {}
				if (response_obj) {
					callback(response_obj);
				} else {
					callback({
						status: 'error',
						message: 'response is not valid JSON',
						response: request.responseText,
					});
				}
			} else {
				if(request.status === 0 && request.statusText.length === 0) {
					callback({
						status: 'error',
						message: 'connection failed',
					});
				} else {
					callback({
						status: 'error',
						message: `server returned status ${request.status}: ${request.statusText}`,
					});
				}
			}
		}
	};
	request.open('post', `${g_origin}/${page_name}`, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify(payload));
}

//this basically verifies that the methods "of type OnClickHandler and UpdateHandler" are being used correctly
//both methods are being used in 3 different classes this ensures they are all the same structure
interface OnClickHandler {
	(x:number, y:number): void;
}
interface UpdateHandler {
	(): void;
  }

class Sprite {
	Id: string;
	playerName: string;
	x: number;
	y: number;
	speed: number;
	image: HTMLImageElement;
	update: UpdateHandler;
	onclick: OnClickHandler;
	dest_x: number;
	dest_y: number;
	constructor(Id:string,x:number, y:number, image_url:string, update_method:UpdateHandler, onclick_method:OnClickHandler, playerName: string) {
		this.Id = Id;
		this.x = x;
		this.y = y;
        this.speed = 4;
		this.image = new Image();
		this.image.src = image_url;
		this.update = update_method;
		this.onclick = onclick_method;
		this.dest_x = x;
		this.dest_y = y;
		this.playerName = playerName;
	}
	//these are the prototype methods for the sprite class
	set_destination(x:number, y:number){
		this.dest_x = this.x + x-500;
		this.dest_y = this.y + y-270;
	}

	ignore_click(x:number, y:number) {
		
		/* 
		does nothing which provides a default behavior for
		things that don't need to respond to clicks
		*/
	}
	
	move(dx:number, dy:number) {
		this.dest_x = this.x + dx;
		this.dest_y = this.y + dy;
		
	}

	go_toward_destination() {
		if(this.dest_x === undefined)
			return;

		if(this.x < this.dest_x)
			this.x += Math.min(this.dest_x - this.x, this.speed);
		else if(this.x > this.dest_x)
			this.x -= Math.min(this.x - this.dest_x, this.speed);
		if(this.y < this.dest_y)
			this.y += Math.min(this.dest_y - this.y, this.speed);
		else if(this.y > this.dest_y)
			this.y -= Math.min(this.y - this.dest_y, this.speed);
	}

	sit_still() {
	}
}


class Model {
	sprites: Sprite[];
	things: Sprite[];
	myAvatar: Sprite;
	constructor() {
		this.sprites = [];
		this.things = [];
		//this.sprites.push(new Sprite("abc",200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click,""));
		this.myAvatar = new Sprite(g_id,0, 0, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination,g_playerName);
		this.sprites.push(this.myAvatar);
	}
	//calls the update method for each sprite which could be 
	update() {
		for (const sprite of this.sprites) {
			sprite.update();
		}
		for (const thing of this.things) {
			thing.update();
		}
	}
	//calls the onclick method for each sprite which could be "ignore_click" or "set_destination"
	onclick(x:number, y:number) {
		this.myAvatar.onclick(x, y);
		console.log(`x: ${x} y: ${y}`);
		console.log(`myAvatar.x: ${this.myAvatar.x} myAvatar.y: ${this.myAvatar.y}`);
		console.log("passed ")
	}
	//calls the move method for the blue robot
	move(dx:number, dy:number) {
		
		this.myAvatar.move(dx, dy);
	}

}





class View
{
	model: Model;
	canvas: HTMLCanvasElement;
	myAvatar: HTMLImageElement;
	g_scroll_x: number;
	g_scroll_y: number;
	center_x: number;
	center_y: number;
	scroll_rate: number;
	constructor(model: Model) {
		this.model = model;
		this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
		this.myAvatar = new Image();
		this.myAvatar.src = "blue_robot.png";
		this.g_scroll_x = 0;
		this.g_scroll_y = 0;
		this.center_x = 500;
		this.center_y = 270;
		this.scroll_rate = 0.03
	}
	//examples of the g_scroll_x and g_scroll_y being used
	//g_scroll_x += scroll_rate * (this.model.avatar.x - g_scroll_x - center_x);
	//g_scroll_y += scroll_rate * (this.model.avatar.y - g_scroll_y - center_y);
	

update() {
	
	let ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
	ctx.clearRect(0, 0, 1000, 500);

	this.g_scroll_x += this.scroll_rate * (this.model.myAvatar.x - this.g_scroll_x - this.center_x);
	this.g_scroll_y += this.scroll_rate * (this.model.myAvatar.y - this.g_scroll_y - this.center_y);

	//loops through the array of things and draws them on the canvas
	for (const thing of this.model.things) {
		ctx.drawImage(thing.image, thing.x - this.g_scroll_x - (thing.image.width / 2) , thing.y - this.g_scroll_y - (thing.image.height) );
	}
		
	//loops through the array of sprites and draws them on the canvas
	for (const sprite of this.model.sprites) {
		if(sprite === this.model.myAvatar) {
			//sprite.move(sprite.x-this.g_scroll_x, sprite.y-this.g_scroll_y);
			ctx.font = "20px Verdana";
			ctx.fillText(sprite.playerName,  (sprite.x - this.g_scroll_x - sprite.image.width / 2), (sprite.y - this.g_scroll_y - sprite.image.height - 10));
			ctx.drawImage(sprite.image, (sprite.x - this.g_scroll_x - (sprite.image.width / 2)), (sprite.y - this.g_scroll_y - sprite.image.height));
		} else {
			ctx.font = "20px Verdana";
			ctx.fillText(sprite.playerName, sprite.x - this.g_scroll_x - (sprite.image.width / 2), sprite.y - this.g_scroll_y - (sprite.image.height - 10));
			ctx.drawImage(sprite.image, sprite.x - this.g_scroll_x - (sprite.image.width / 2), sprite.y - this.g_scroll_y - (sprite.image.height));
	}

	
}

}

	 
	loadMap(){
		httpPost('ajax.html', {
			action: 'get_map',
		}, this.onReceiveMap.bind(this));
	}
	
	onReceiveMap(ob: any){
		
		console.log(`Response to get_map: ${JSON.stringify(ob)}`);
		const things = ob.map.things;
		for (const thing of things) {
			this.model.things.push(new Sprite("thing",thing.x, thing.y,`${thing_names[thing.kind]}.png`, Sprite.prototype.sit_still, Sprite.prototype.ignore_click,""));
		}

	}

}







let first_time: boolean = true;


class Controller
{
	model: Model;
	view: View;
	key_right: boolean;
	key_left: boolean;
	key_up: boolean;
	key_down: boolean;
	last_updates_request_time: number;

	constructor(model:Model, view:View) {
		this.model = model;
		this.view = view;
		this.key_right = false;
		this.key_left = false;
		this.key_up = false;
		this.key_down = false;
		this.last_updates_request_time = 0;
		let self = this;
		view.canvas.addEventListener("click", function(event) { self.onClick(event); });
		document.addEventListener('keydown', function(event) { self.keyDown(event); }, false);
		document.addEventListener('keyup', function(event) { self.keyUp(event); }, false);
		
		setInterval(() => { self.request_updates(); }, 1000);
	}


	

	
	onClick(event:MouseEvent) {
		
		const x = event.pageX - this.view.canvas.offsetLeft;
		const y = event.pageY - this.view.canvas.offsetTop;
		this.model.onclick(x,y);
		httpPost('ajax.html', {
			Id: g_id,
			action: 'click',
			x: x,
			y: y,
			playerName: g_playerName,
		}, this.onclicksend.bind(this));
		
	}
	//unused
	keyDown(event:KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = true;
		else if(event.keyCode == 37) this.key_left = true;
		else if(event.keyCode == 38) this.key_up = true;
		else if(event.keyCode == 40) this.key_down = true;
	}
	//unused
	keyUp(event:KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = false;
		else if(event.keyCode == 37) this.key_left = false;
		else if(event.keyCode == 38) this.key_up = false;
		else if(event.keyCode == 40) this.key_down = false;
	}
	//pretty sure this is unused as well
	update() {
		//implement something to use gscroll 
		let dx = 0;
		let dy = 0;
        let speed = this.model.myAvatar.speed;
		if(this.key_right) dx += speed;
		if(this.key_left) dx -= speed;
		if(this.key_up) dy -= speed;
		if(this.key_down) dy += speed;
		if(dx != 0 || dy != 0)
			this.model.move(dx, dy);		
	
	}
	
	request_updates() {
		httpPost('ajax.html', {
			Id: g_id,
			playerName: g_playerName,
			action: 'getUpdate',
		}, this.onAcknowledgeClick.bind(this));
}

	onclicksend(ob: any){
		console.log(`Response to click: ${JSON.stringify(ob)}`);
		this.view.update();
	}
	onAcknowledgeClick = (ob: any) => {
		
		console.log(`Response to update: ${JSON.stringify(ob)}`);
		const updates = ob.updates;
		const id = g_id;
		if(updates){
		for (const update of updates) {
			let playerHere = false;
			for(const sprite of this.model.sprites){
				if(sprite.Id == update[0]){
					if(sprite.Id != id){
					sprite.set_destination(update[1], update[2]);
					playerHere = true;
					break;
					} else if (sprite.Id == id){
						playerHere = true;
					}
				}
			}
				if (playerHere == false) {
					const tempsprite = new Sprite(update[0], update[1], update[2], "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click,update[3]);
					this.model.sprites.push(tempsprite);
					//tempsprite.set_destination(update[1], update[2]);
				}
        }
	
}

}
}





class Game {
	model: Model;
	view: View;
	controller: Controller;
	constructor() {
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	
	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}

function main() {
let game = new Game();
game.view.loadMap();
let timer = setInterval(() => { game.onTimer(); }, 40);
}

