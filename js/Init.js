/*
    Init.js - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

let currentScene = null;
let renderBlock = false;
let gamesave = null;

window.addEventListener("load", function() {
    console.log("Initilaizing...");

    if (!window.fetch) {
        alert("Ez a föngésző nem támogat FETCH -et!");
    }

    if (!CSS.supports("display", "grid")) {
        alert("Ez a föngésző nem támogat CSS GRID -et!");
    }

    gamesave = new Database();

    OnResized();

    let game = LoadGameState();
    if (game !== false) {
        ChangeScene(new InGame(game));
    } else {
        ChangeScene(new Menu());
    }

    let cv = $("canvas");
    document.addEventListener("mousemove", function(e) {
        currentScene.onMouseMove(e);
    });
});

window.addEventListener("resize", OnResized);

function OnResized() {
    let canvas = $("canvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (!renderBlock && typeof(currentScene) == "object" && currentScene != null && typeof(currentScene.resized) == "function") {
        currentScene.resized();
    }
}

function NextFrame() {
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

function ChangeScene(newScene) {
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

function ClearGameState() {
    gamesave.remove("gamestate");
}

function SaveGameState(serializedGameState) {
    gamesave.set("gamestate", serializedGameState);
}

function LoadGameState() {
    const state = gamesave.get("gamestate");
    if (typeof(state) != "undefined" && state != null) {
        try {
            let s = new Sudoku();
            s.deserialize(state);
            return s;
        } catch (e) {
            console.warn("Error while trying to deserialize saved state:", e);
            return false;
        }
    }
    return false;
}