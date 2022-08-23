// Rounded rectangle render function
function roundRect(ctx, x, y, width, height, radius = 5, fill = false, stroke = true) {
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

// Canvas
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

// Classes
class Paddle {
    constructor(ctx, side) {
        this.movement = {
            up: false,
            down: false,
        };
        this.ctx = ctx;
        this.style = "white";
        this.width = 20;
        this.height = 100;
        this.radius = 10;
        this.margin = 50;
        this.speed = 10;
        this.xpos =
            side == "right" ? this.ctx.canvas.width - this.margin - this.width : this.margin;
        this.ypos = this.ctx.canvas.height / 2 - this.height / 2;
        this.ctx.fillStyle = this.style;
    }
    move() {
        if (this.ypos < this.ctx.canvas.height - this.height && this.movement.down)
            this.ypos += this.speed;
        else if (this.ypos > 0 && this.movement.up) this.ypos -= this.speed;
    }
    moveUp() {}
    draw() {
        roundRect(this.ctx, this.xpos, this.ypos, this.width, this.height, this.radius, true, true);
    }
}

class Ball {
    constructor(ctx, dx, dy, leftScoreFunc, rightScoreFunc) {
        this.leftScoreFunc = leftScoreFunc;
        this.rightScoreFunc = rightScoreFunc;
        this.ctx = ctx;
        this.style = "white";
        this.radius = 10;
        this.xpos = this.ctx.canvas.width / 2;
        this.ypos = this.ctx.canvas.height / 2;
        this.dx = dx;
        this.dy = dy;
        this.ctx.fillStyle = this.style;
    }
    move() {
        let rightScored = this.xpos < this.radius;
        let leftScored = this.xpos > this.ctx.canvas.width - this.radius;
        if (rightScored) {
            this.xpos = this.ctx.canvas.width / 2;
            this.ypos = this.ctx.canvas.height / 2;
            this.dx *= -1;
            this.rightScoreFunc();
        } else if (leftScored) {
            this.xpos = this.ctx.canvas.width / 2;
            this.ypos = this.ctx.canvas.height / 2;
            this.dx *= -1;
            this.leftScoreFunc();
        }
        let insideY = this.ypos > this.radius && this.ypos < this.ctx.canvas.height - this.radius;

        if (!insideY) this.dy = this.dy * -1;
        this.xpos += this.dx;
        this.ypos += this.dy;
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.xpos, this.ypos, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "white";
        this.ctx.fill();
    }
}

class Counter {
    constructor(ctx, scoreA, scoreB) {
        this.scoreA = scoreA;
        this.scoreB = scoreB;
        this.ctx = ctx;
        this.ctx.font = "50px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "white";
    }
    draw(scoreA, scoreB) {
        this.ctx.fillText(`${scoreA} - ${scoreB}`, this.ctx.canvas.width / 2, 60);
    }
}

// Scoring values
let scoreLeft = 0;
let scoreRight = 0;
const addLeft = () => {
    scoreLeft += 1;
};
const addRight = () => {
    scoreRight += 1;
};

// Loading Game
const paddleLeft = new Paddle(c, "left");
const paddleRight = new Paddle(c, "right");
const ball = new Ball(c, 7, 7, addLeft, addRight);
const counter = new Counter(c, scoreLeft, scoreRight);

// Initial Render
paddleLeft.draw();
paddleRight.draw();
ball.draw();

// Key Inputs
document.addEventListener(
    "keydown",
    (event) => {
        if (event.key == "w") paddleLeft.movement.up = true;
        if (event.key == "s") paddleLeft.movement.down = true;
        if (event.key == "ArrowUp") paddleRight.movement.up = true;
        if (event.key == "ArrowDown") paddleRight.movement.down = true;
    },
    false,
);
document.addEventListener(
    "keyup",
    (event) => {
        if (event.key == "w") paddleLeft.movement.up = false;
        if (event.key == "s") paddleLeft.movement.down = false;
        if (event.key == "ArrowUp") paddleRight.movement.up = false;
        if (event.key == "ArrowDown") paddleRight.movement.down = false;
    },
    false,
);

// Paddle collision detection
const checkColission = (ball, pad) => {
    let betweenX =
        ball.xpos + ball.radius > pad.xpos && ball.xpos - ball.radius < pad.xpos + pad.width;
    let betweenY = ball.ypos > pad.ypos && ball.ypos < pad.ypos + pad.height;
    if (betweenX && betweenY) return true;
    else return false;
};

// Main Game Loop
setInterval(() => {
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);

    // Paddle collision detection
    if (checkColission(ball, paddleLeft)) ball.dx *= -1;
    if (checkColission(ball, paddleRight)) ball.dx *= -1;

    // Movement
    paddleLeft.move();
    paddleRight.move();
    ball.move();

    // Rendering
    paddleLeft.draw();
    paddleRight.draw();
    ball.draw();
    counter.draw(scoreLeft, scoreRight);
}, 20);
