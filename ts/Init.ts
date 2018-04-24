/*
    Init.ts - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

let currentScene : Scene|null = null;
let renderBlock : boolean = false;
let sw : ServiceWorkerManager|null = null;

window.addEventListener("load", function() {
    console.log("Initilaizing...");

    if (!window.fetch) {
        alert("Ez a föngésző nem támogat FETCH -et!");
    }

    if (CSS.supports("display", "grid") !== true) {
        alert("Ez a föngésző nem támogat CSS GRID -et!");
    }

    let DRM = false;

    if (window.location.origin == "https://sudoku.benceskorka.com") {
        sw = new ServiceWorkerManager(swUpdate, "/sw.js");
        DRM = false;
    }

    OnResized();

    let game = LoadGameState();
    if (game !== null) {
        ChangeScene(new InGame(game as SaveState));
    } else {
        ChangeScene(new Menu(DRM));
    }

    let cv = $("canvas");
    document.addEventListener("mousemove", function(e) {
        if (currentScene != null) {
            currentScene.onMouseMove(e);
        }
    });
});

window.addEventListener("resize", OnResized);

function OnResized() : void {
    let canvas = ($("canvas") as HTMLCanvasElement);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (!renderBlock && typeof(currentScene) == "object" && currentScene != null && typeof(currentScene.resized) == "function") {
        currentScene.resized();
    }
}

function NextFrame() : void {
    if (renderBlock) {
        return;
    }
    if (typeof(currentScene) == "object" && currentScene != null && typeof(currentScene.render) == "function") {
        if (!currentScene.requireFrameRendering()) {
            return;
        }
        currentScene.render();
    }
    requestAnimationFrame(function() {
        NextFrame();
    });
}

function ChangeScene(newScene : Scene) : void {
    renderBlock = true;

    if (typeof(currentScene) == "object" && currentScene != null && typeof(currentScene.unload) == "function") {
        currentScene.unload();
    }

    currentScene = newScene;

    if (typeof(currentScene) == "object" && currentScene != null && typeof(currentScene.load) == "function") {
        currentScene.load();
    }

    renderBlock = false;
    NextFrame();
}

function ClearGameState() : void {
    Database.remove("gamestate");
}

function SaveGameState(gamestate : SaveState) : void {
    Database.set("gamestate", gamestate);
}

function LoadGameState() : SaveState|null {
    const state = Database.get("gamestate");
    if (typeof(state) != "undefined" && state != null) {
        return (state as SaveState);
    }
    return null;
}

function swUpdate(status : ServiceWorkerManagerDataPush) : void {
    console.log("SW status", status);
}