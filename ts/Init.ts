/*
    Init.js - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

let currentScene : Scene|null = null;
let renderBlock : boolean = false;
let gamesave : any = null;
let sw : ServiceWorkerManager|null = null;

window.addEventListener("load", function() {
    console.log("Initilaizing...");

    if (!window.fetch) {
        alert("Ez a föngésző nem támogat FETCH -et!");
    }

    if (CSS.supports("display", "grid") !== true) {
        alert("Ez a föngésző nem támogat CSS GRID -et!");
    }

    let DRM = true;

    if (window.location.origin == "https://sudoku.benceskorka.com") {
        sw = new ServiceWorkerManager(swUpdate, "/sw.js");
        DRM = false;
    }

    gamesave = new Database();

    OnResized();

    let game = LoadGameState();
    if (game !== null) {
        ChangeScene(new InGame(game));
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
    gamesave.remove("gamestate");
}

function SaveGameState(serializedGameState : any) : void {
    gamesave.set("gamestate", serializedGameState);
}

function LoadGameState() : Sudoku|null {
    const state = gamesave.get("gamestate");
    if (typeof(state) != "undefined" && state != null) {
        try {
            let s = new Sudoku(0);
            s.deserialize(state);
            return s;
        } catch (e) {
            console.warn("Error while trying to deserialize saved state:", e);
            return null;
        }
    }
    return null;
}

function swUpdate(status : any) : void {
    console.log("SW status", status);
}