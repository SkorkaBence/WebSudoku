/*
    SceneSystem/Scene.ts - Abstract Scene class
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

abstract class Scene {

    protected backgroundCanvas : HTMLCanvasElement;
    protected backgroundCtx : CanvasRenderingContext2D;
    protected main : HTMLElement;
    private fps_count : number;
    public real_fps : number;
    private last_fps_save : number;

    constructor() {
        this.backgroundCanvas = ($("canvas") as HTMLCanvasElement);
        this.backgroundCtx = (this.backgroundCanvas.getContext("2d") as CanvasRenderingContext2D);
        this.main = $("main");

        this.fps_count = 0;
        this.real_fps = 0;
        this.last_fps_save = 0;
    }

    protected postRendering() : void {
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

    public requireFrameRendering() : boolean {
        return true;
    }

    private drawDebugInfo() : void {
        this.backgroundCtx.fillStyle = 'red';
        this.backgroundCtx.font = "20px 'Roboto Mono'";
        this.backgroundCtx.fillText(this.real_fps + " FPS", 0, 20);
    }

    public abstract render() : void;
    public abstract load() : void;
    public abstract unload() : void;

    public onMouseMove(event : MouseEvent) : void {};
    public resized() : void {};

}