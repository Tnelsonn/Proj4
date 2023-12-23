"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var random_id = function (len) {
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return __spreadArray([], Array(len), true).reduce(function (a) { return a + p[Math.floor(Math.random() * p.length)]; }, '');
};
var g_origin = new URL(window.location.href).origin;
var g_id = random_id(12);
var thing_names = [
    "chair",
    "lamp",
    "mushroom",
    "outhouse",
    "pillar",
    "pond",
    "rock",
    "statue",
    "tree",
    "turtle",
];
var g_playerName;
//fetch player name from the html input
function start_pressed(name_value) {
    g_playerName = name_value;
    var s = [];
    s.push("<canvas id=\"myCanvas\" width=\"1000\" height=\"500\" style=\"border:1px solid #cccccc;\">");
    s.push("</canvas>");
    var content = document.getElementById('content');
    content.innerHTML = s.join('');
    main();
}
//this is just an example json string so i could see what the map
//{"status":"map","map":{"things":[{"x":995,"y":426,"kind":0}
//const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
//let g_playerName = playerNameInput.value;
// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
var httpPost = function (page_name, payload, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var response_obj = void 0;
                try {
                    response_obj = JSON.parse(request.responseText);
                }
                catch (err) { }
                if (response_obj) {
                    callback(response_obj);
                }
                else {
                    callback({
                        status: 'error',
                        message: 'response is not valid JSON',
                        response: request.responseText,
                    });
                }
            }
            else {
                if (request.status === 0 && request.statusText.length === 0) {
                    callback({
                        status: 'error',
                        message: 'connection failed',
                    });
                }
                else {
                    callback({
                        status: 'error',
                        message: "server returned status ".concat(request.status, ": ").concat(request.statusText),
                    });
                }
            }
        }
    };
    request.open('post', "".concat(g_origin, "/").concat(page_name), true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(payload));
};
var Sprite = /** @class */ (function () {
    function Sprite(Id, x, y, image_url, update_method, onclick_method, playerName) {
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
    Sprite.prototype.set_destination = function (x, y) {
        this.dest_x = this.x + x - 500;
        this.dest_y = this.y + y - 270;
    };
    Sprite.prototype.ignore_click = function (x, y) {
        /*
        does nothing which provides a default behavior for
        things that don't need to respond to clicks
        */
    };
    Sprite.prototype.move = function (dx, dy) {
        this.dest_x = this.x + dx;
        this.dest_y = this.y + dy;
    };
    Sprite.prototype.go_toward_destination = function () {
        if (this.dest_x === undefined)
            return;
        if (this.x < this.dest_x)
            this.x += Math.min(this.dest_x - this.x, this.speed);
        else if (this.x > this.dest_x)
            this.x -= Math.min(this.x - this.dest_x, this.speed);
        if (this.y < this.dest_y)
            this.y += Math.min(this.dest_y - this.y, this.speed);
        else if (this.y > this.dest_y)
            this.y -= Math.min(this.y - this.dest_y, this.speed);
    };
    Sprite.prototype.sit_still = function () {
    };
    return Sprite;
}());
var Model = /** @class */ (function () {
    function Model() {
        this.sprites = [];
        this.things = [];
        //this.sprites.push(new Sprite("abc",200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click,""));
        this.myAvatar = new Sprite(g_id, 0, 0, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination, g_playerName);
        this.sprites.push(this.myAvatar);
    }
    //calls the update method for each sprite which could be 
    Model.prototype.update = function () {
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            sprite.update();
        }
        for (var _b = 0, _c = this.things; _b < _c.length; _b++) {
            var thing = _c[_b];
            thing.update();
        }
    };
    //calls the onclick method for each sprite which could be "ignore_click" or "set_destination"
    Model.prototype.onclick = function (x, y) {
        this.myAvatar.onclick(x, y);
        console.log("x: ".concat(x, " y: ").concat(y));
        console.log("myAvatar.x: ".concat(this.myAvatar.x, " myAvatar.y: ").concat(this.myAvatar.y));
        console.log("passed ");
    };
    //calls the move method for the blue robot
    Model.prototype.move = function (dx, dy) {
        this.myAvatar.move(dx, dy);
    };
    return Model;
}());
var View = /** @class */ (function () {
    function View(model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas");
        this.myAvatar = new Image();
        this.myAvatar.src = "blue_robot.png";
        this.g_scroll_x = 0;
        this.g_scroll_y = 0;
        this.center_x = 500;
        this.center_y = 270;
        this.scroll_rate = 0.03;
    }
    //examples of the g_scroll_x and g_scroll_y being used
    //g_scroll_x += scroll_rate * (this.model.avatar.x - g_scroll_x - center_x);
    //g_scroll_y += scroll_rate * (this.model.avatar.y - g_scroll_y - center_y);
    View.prototype.update = function () {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, 1000, 500);
        this.g_scroll_x += this.scroll_rate * (this.model.myAvatar.x - this.g_scroll_x - this.center_x);
        this.g_scroll_y += this.scroll_rate * (this.model.myAvatar.y - this.g_scroll_y - this.center_y);
        //loops through the array of things and draws them on the canvas
        for (var _i = 0, _a = this.model.things; _i < _a.length; _i++) {
            var thing = _a[_i];
            ctx.drawImage(thing.image, thing.x - this.g_scroll_x - (thing.image.width / 2), thing.y - this.g_scroll_y - (thing.image.height));
        }
        //loops through the array of sprites and draws them on the canvas
        for (var _b = 0, _c = this.model.sprites; _b < _c.length; _b++) {
            var sprite = _c[_b];
            if (sprite === this.model.myAvatar) {
                //sprite.move(sprite.x-this.g_scroll_x, sprite.y-this.g_scroll_y);
                ctx.font = "20px Verdana";
                ctx.fillText(sprite.playerName, (sprite.x - this.g_scroll_x - sprite.image.width / 2), (sprite.y - this.g_scroll_y - sprite.image.height - 10));
                ctx.drawImage(sprite.image, (sprite.x - this.g_scroll_x - (sprite.image.width / 2)), (sprite.y - this.g_scroll_y - sprite.image.height));
            }
            else {
                ctx.font = "20px Verdana";
                ctx.fillText(sprite.playerName, sprite.x - this.g_scroll_x - (sprite.image.width / 2), sprite.y - this.g_scroll_y - (sprite.image.height - 10));
                ctx.drawImage(sprite.image, sprite.x - this.g_scroll_x - (sprite.image.width / 2), sprite.y - this.g_scroll_y - (sprite.image.height));
            }
        }
    };
    View.prototype.loadMap = function () {
        httpPost('ajax.html', {
            action: 'get_map',
        }, this.onReceiveMap.bind(this));
    };
    View.prototype.onReceiveMap = function (ob) {
        console.log("Response to get_map: ".concat(JSON.stringify(ob)));
        var things = ob.map.things;
        for (var _i = 0, things_1 = things; _i < things_1.length; _i++) {
            var thing = things_1[_i];
            this.model.things.push(new Sprite("thing", thing.x, thing.y, "".concat(thing_names[thing.kind], ".png"), Sprite.prototype.sit_still, Sprite.prototype.ignore_click, ""));
        }
    };
    return View;
}());
var first_time = true;
var Controller = /** @class */ (function () {
    function Controller(model, view) {
        var _this = this;
        this.onAcknowledgeClick = function (ob) {
            console.log("Response to update: ".concat(JSON.stringify(ob)));
            var updates = ob.updates;
            var id = g_id;
            if (updates) {
                for (var _i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
                    var update = updates_1[_i];
                    var playerHere = false;
                    for (var _a = 0, _b = _this.model.sprites; _a < _b.length; _a++) {
                        var sprite = _b[_a];
                        if (sprite.Id == update[0]) {
                            if (sprite.Id != id) {
                                sprite.set_destination(update[1], update[2]);
                                playerHere = true;
                                break;
                            }
                            else if (sprite.Id == id) {
                                playerHere = true;
                            }
                        }
                    }
                    if (playerHere == false) {
                        var tempsprite = new Sprite(update[0], update[1], update[2], "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click, update[3]);
                        _this.model.sprites.push(tempsprite);
                        //tempsprite.set_destination(update[1], update[2]);
                    }
                }
            }
        };
        this.model = model;
        this.view = view;
        this.key_right = false;
        this.key_left = false;
        this.key_up = false;
        this.key_down = false;
        this.last_updates_request_time = 0;
        var self = this;
        view.canvas.addEventListener("click", function (event) { self.onClick(event); });
        document.addEventListener('keydown', function (event) { self.keyDown(event); }, false);
        document.addEventListener('keyup', function (event) { self.keyUp(event); }, false);
        setInterval(function () { self.request_updates(); }, 1000);
    }
    Controller.prototype.onClick = function (event) {
        var x = event.pageX - this.view.canvas.offsetLeft;
        var y = event.pageY - this.view.canvas.offsetTop;
        this.model.onclick(x, y);
        httpPost('ajax.html', {
            Id: g_id,
            action: 'click',
            x: x,
            y: y,
            playerName: g_playerName,
        }, this.onclicksend.bind(this));
    };
    //unused
    Controller.prototype.keyDown = function (event) {
        if (event.keyCode == 39)
            this.key_right = true;
        else if (event.keyCode == 37)
            this.key_left = true;
        else if (event.keyCode == 38)
            this.key_up = true;
        else if (event.keyCode == 40)
            this.key_down = true;
    };
    //unused
    Controller.prototype.keyUp = function (event) {
        if (event.keyCode == 39)
            this.key_right = false;
        else if (event.keyCode == 37)
            this.key_left = false;
        else if (event.keyCode == 38)
            this.key_up = false;
        else if (event.keyCode == 40)
            this.key_down = false;
    };
    //pretty sure this is unused as well
    Controller.prototype.update = function () {
        //implement something to use gscroll 
        var dx = 0;
        var dy = 0;
        var speed = this.model.myAvatar.speed;
        if (this.key_right)
            dx += speed;
        if (this.key_left)
            dx -= speed;
        if (this.key_up)
            dy -= speed;
        if (this.key_down)
            dy += speed;
        if (dx != 0 || dy != 0)
            this.model.move(dx, dy);
    };
    Controller.prototype.request_updates = function () {
        httpPost('ajax.html', {
            Id: g_id,
            playerName: g_playerName,
            action: 'getUpdate',
        }, this.onAcknowledgeClick.bind(this));
    };
    Controller.prototype.onclicksend = function (ob) {
        console.log("Response to click: ".concat(JSON.stringify(ob)));
        this.view.update();
    };
    return Controller;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.model = new Model();
        this.view = new View(this.model);
        this.controller = new Controller(this.model, this.view);
    }
    Game.prototype.onTimer = function () {
        this.controller.update();
        this.model.update();
        this.view.update();
    };
    return Game;
}());
function main() {
    var game = new Game();
    game.view.loadMap();
    var timer = setInterval(function () { game.onTimer(); }, 40);
}
