/*
    scenes/Win.js - Winning scene
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku

    The firework effect was created with small modifications by following this guide:
        https://airbrake.io/blog/javascript/fourth-of-july-javascript-fireworks
*/

const FIREWORK_ACCELERATION = 1.05;
const FIREWORK_BRIGHTNESS_MIN = 50;
const FIREWORK_BRIGHTNESS_MAX = 70;
const FIREWORK_SPEED = 5;
const FIREWORK_TRAIL_LENGTH = 3;
const FIREWORK_TARGET_INDICATOR_ENABLED = false;
const PARTICLE_BRIGHTNESS_MIN = 50;
const PARTICLE_BRIGHTNESS_MAX = 80;
const PARTICLE_COUNT = 80;
const PARTICLE_DECAY_MIN = 0.005;
const PARTICLE_DECAY_MAX = 0.015;
const PARTICLE_FRICTION = 0.95;
const PARTICLE_GRAVITY = 0.7;
const PARTICLE_HUE_VARIANCE = 20;
const PARTICLE_TRANSPARENCY = 1;
const PARTICLE_SPEED_MIN = 1;
const PARTICLE_SPEED_MAX = 10;
const PARTICLE_TRAIL_LENGTH = 5;
const CANVAS_CLEANUP_ALPHA = 0.3;
const HUE_STEP_INCREASE = 0.5;
const TICKS_PER_FIREWORK_AUTOMATED_MIN = 20;
const TICKS_PER_FIREWORK_AUTOMATED_MAX = 80;

class Firework {

    private x : number;
    private y : number;
    private startX : number;
    private startY : number;
    public endX : number;
    public endY : number;
    private distanceToEnd : number;
    private distanceTraveled : number = 0;
    private trail : any[] = [];
    private trailLength : number = FIREWORK_TRAIL_LENGTH;
    private angle : number;
    private speed : number = FIREWORK_SPEED;
    private acceleration : number = FIREWORK_ACCELERATION;
    private brightness : number;
    private targetRadius : number = 2.5;
    public hue : number;

    constructor(startX : number, startY : number, endX : number, endY : number, hue : number) {
        this.x = startX;
        this.y = startY;

        this.startX = startX;
        this.startY = startY;

        this.endX = endX;
        this.endY = endY;

        this.distanceToEnd = calculateDistance(startX, startY, endX, endY);

        while(this.trailLength--) {
            this.trail.push([this.x, this.y]);
        }

        this.angle = Math.atan2(endY - startY, endX - startX);

        this.brightness = random(FIREWORK_BRIGHTNESS_MIN, FIREWORK_BRIGHTNESS_MAX);

        this.hue = hue;
    }

    public update() : boolean {
        this.trail.pop();
        this.trail.unshift([this.x, this.y]);

        if (FIREWORK_TARGET_INDICATOR_ENABLED) {
            if(this.targetRadius < 8) {
                this.targetRadius += 0.3;
            } else {
                this.targetRadius = 1;
            }
        }

        this.speed *= this.acceleration;

        let xVelocity = Math.cos(this.angle) * this.speed;
        let yVelocity = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = calculateDistance(this.startX, this.startY, this.x + xVelocity, this.y + yVelocity);

        this.x += xVelocity;
        this.y += yVelocity;

        return (this.distanceTraveled < this.distanceToEnd);
    }

    public draw(context : CanvasRenderingContext2D) : void {
        context.beginPath();

        let trailEndX = this.trail[this.trail.length - 1][0];
        let trailEndY = this.trail[this.trail.length - 1][1];

        context.moveTo(trailEndX, trailEndY);
        context.lineTo(this.x, this.y);

        context.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        context.stroke();

        if (FIREWORK_TARGET_INDICATOR_ENABLED) {
            context.beginPath();
            context.arc(this.endX, this.endY, this.targetRadius, 0, Math.PI * 2);
            context.stroke();
        }
    }
}

class Particle {

    private x : number;
    private y : number;
    private angle : number;
    private friction : number = PARTICLE_FRICTION;
    private gravity : number = PARTICLE_GRAVITY;
    private hue : number;
    private brightness : number;
    private decay : number;
    private speed : number;
    private trail : any[] = [];
    private trailLength : number = PARTICLE_TRAIL_LENGTH;
    private transparency : number = PARTICLE_TRANSPARENCY;

    constructor(x : number, y : number, hue : number) {
        this.x = x;
        this.y = y;

        this.angle = random(0, Math.PI * 2);
        this.hue = random(hue - PARTICLE_HUE_VARIANCE, hue + PARTICLE_HUE_VARIANCE);
        this.brightness = random(PARTICLE_BRIGHTNESS_MIN, PARTICLE_BRIGHTNESS_MAX);
        this.decay = random(PARTICLE_DECAY_MIN, PARTICLE_DECAY_MAX);    
        this.speed = random(PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX);
        while(this.trailLength--) {
            this.trail.push([this.x, this.y]);
        }
    }

    public update() : boolean {
        this.trail.pop();
        this.trail.unshift([this.x, this.y]);

        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;

        this.transparency -= this.decay;

        return (this.transparency > this.decay);
    }

    public draw(context : CanvasRenderingContext2D) : void {
        context.beginPath();
        let trailEndX = this.trail[this.trail.length - 1][0];
        let trailEndY = this.trail[this.trail.length - 1][1];
        context.moveTo(trailEndX, trailEndY);
        context.lineTo(this.x, this.y);
        context.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.transparency})`;
        context.stroke();
    }
}

class Win extends Scene {

    private fireworks : Firework[] = [];
    private particles : Particle[] = [];
    private hue : number = 120;
    private ticksSinceFireworkAutomated : number = 120;

    constructor() {
        super();
    }

    public load() : void {
        this.main.innerHTML = `
            <div class="winner noselect">
                Gratulálok!
            </div>
            <audio autoplay>
                <source src="audio/win.mp3" type="audio/mpeg">
            </auduo>
        `;

        window.setTimeout(function() {
            ChangeScene(new Menu(false));
        }, 8000);
    }

    public unload() : void {
        this.main.innerHTML = "";
    }

    private createParticles(x : number, y : number, hue : number) : void {
        let particleCount = PARTICLE_COUNT;
        while(particleCount--) {
            this.particles.push(new Particle(x, y, hue));
        }
    }

    public render() : void {
        this.backgroundCtx.fillStyle="#000000";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);

        for (let i = this.fireworks.length - 1; i >= 0; --i) {
            this.fireworks[i].draw(this.backgroundCtx);
            if (!this.fireworks[i].update()) {
                this.createParticles(this.fireworks[i].endX, this.fireworks[i].endY, this.fireworks[i].hue);
                this.fireworks.splice(i, 1);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; --i) {
            this.particles[i].draw(this.backgroundCtx);
            if (!this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }

        if(this.ticksSinceFireworkAutomated >= random(TICKS_PER_FIREWORK_AUTOMATED_MIN, TICKS_PER_FIREWORK_AUTOMATED_MAX)) {
            let startX = this.backgroundCanvas.width / 2;
            let startY = this.backgroundCanvas.height;
            let endX = random(0, this.backgroundCanvas.width);
            let endY = random(0, this.backgroundCanvas.height / 2);

            this.fireworks.push(new Firework(startX, startY, endX, endY, this.hue));
            this.ticksSinceFireworkAutomated = 0;
        } else {
            this.ticksSinceFireworkAutomated++;
        }

        this.hue = (this.hue + 1) % 180;

        this.postRendering();
    }

    public onMouseMove(event : any) : void {}
    public resized() : void {}

}