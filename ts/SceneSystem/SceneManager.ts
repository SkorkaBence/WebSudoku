/*
    SceneSystem/SceneManager.ts - Scene manager
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class SceneManager {

    private static canvas : HTMLCanvasElement|null = null;
    private static activeScene : Scene|null = null;
    private static sceneStack : Scene[] = [];
    private static IsRenderinActive : boolean = false;

    public static Init() {
        const __this = this;

        this.canvas = ($("canvas") as HTMLCanvasElement);

        window.addEventListener("resize", function() {
            __this.OnResize();
        });
        window.addEventListener("mousemove", function(event) {
            __this.OnMouseMove(event);
        });

        this.OnResize();
    }

    public static ChangeScene(newScene : Scene) : void {
        if (this.activeScene) {
            this.activeScene.unload();
        }

        this.activeScene = newScene;
        this.activeScene.load();

        if (!this.IsRenderinActive) {
            this.RequestNextFrame();
        }
    }

    public static PushScene(newScene : Scene) : void {
        if (this.activeScene) {
            this.sceneStack.push(this.activeScene);
        }
        this.ChangeScene(newScene);
    }

    public static PopScene() : void {
        if (this.sceneStack.length > 0) {
            const loadnext = this.sceneStack.pop();
            if (loadnext) {
                this.ChangeScene(loadnext);
            }
        }
    }

    private static OnResize() : void {
        if (this.canvas) {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }
        if (this.activeScene) {
            this.activeScene.resized();
        }
    }

    private static OnMouseMove(event : MouseEvent) : void {
        if (this.activeScene) {
            this.activeScene.onMouseMove(event);
        }
    }

    private static RequestNextFrame() : void {
        const __this = this;

        this.IsRenderinActive  = true;

        window.requestAnimationFrame(function() {
            __this.DrawFrame();
        });
    }

    private static DrawFrame() : void {
        if (this.activeScene) {
            if (!this.activeScene.requireFrameRendering()) {
                this.IsRenderinActive = false;
                return;
            }

            this.activeScene.render();
            this.RequestNextFrame();
        }
    }

}