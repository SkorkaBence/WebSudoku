/*
    Init.js - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    This file is part of the Sudoku 


*/

let currentScene = null;
let renderBlock = false;
let LoadedImages = [];
const IMAGES = {

};

window.addEventListener("load", function() {
    console.log("Initilaizing...");

    if (!window.fetch) {
        alert("Ez a föngésző nem támogat FETCH -et!");
    }

    OnResized();
    window.RequiredImages = [];
    for (let k in IMAGES) {
        window.RequiredImages.push(IMAGES[k]);
    }
    LoadNextImage();

    ChangeScene(new Menu());

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

function LoadNextImage() {
    if (RequiredImages.length > 0) {
        let img = RequiredImages.pop();
        let imgtag = document.createElement("img");
        imgtag.addEventListener("load", function() {
            LoadNextImage();
        })
        imgtag.src = img;
        $("document").appendChild(imgtag);
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