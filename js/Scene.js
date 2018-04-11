/*
    Scene.js - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class Scene {

    constructor() {
        this.backgroundCanvas = $("canvas");
        this.backgroundCtx = this.backgroundCanvas.getContext("2d");
        this.main = $("main");

        this.fps_count = 0;
        this.real_fps = 0;
        this.last_fps_save = 0;
        this.pressedKeys = [];
    }

    render() {
        console.error("You need to override the render function");
    }

    postRendering() {
        this.drawDebugInfo();

        const t = this;
        this.fps_count++;
        let now = Date.now();
        if (now - this.last_fps_save >= 1000) {
            this.real_fps = this.fps_count;
            this.fps_count = 0;
            this.last_fps_save = now;
            //console.log("FPS: " + this.real_fps);
        }
    }

    requireFrameRendering() {
        return true;
    }

    drawDebugInfo() {
        this.backgroundCtx.fillStyle = 'red';
        this.backgroundCtx.font = "20px 'Roboto Mono'";
        this.backgroundCtx.fillText(this.real_fps + " FPS", 0, 20);
    }

    onMouseMove(event) {}

    load() {}
    unload() {}
    resized() {}

}