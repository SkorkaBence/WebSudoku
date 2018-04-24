/*
    Init.ts - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

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

    SceneManager.Init();

    let game = LoadGameState();
    if (game !== null) {
        SceneManager.ChangeScene(new InGame(game as SaveState));
    } else {
        SceneManager.ChangeScene(new Menu(DRM));
    }
});

function swUpdate(status : ServiceWorkerManagerDataPush) : void {
    console.log("SW status", status);
}