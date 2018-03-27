/*
    Init.js - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    This file is part of the Sudoku 


*/

let currentScene = null;
let renderBlock = false;
let gamesave = null;

window.addEventListener("load", function() {
    console.log("Initilaizing...");

    if (!window.fetch) {
        alert("Ez a föngésző nem támogat FETCH -et!");
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

    NextFrame();
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
    if (!renderBlock && typeof(currentScene) == "object" && currentScene != null && typeof(currentScene.render) == "function") {
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
        let s = new Sudoku();
        s.deserialize(state);
        return s;
    }
    return false;
}