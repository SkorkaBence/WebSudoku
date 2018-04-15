/*
    scenes/Menu.js - Menu scene
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class Menu extends Scene {

    constructor(drm) {
        super();
        this.mouseX = 0;
        this.mouseY = 0;
        this.showDRM = typeof(drm) == "boolean" ? drm : false;
    }

    load() {
        this.main.innerHTML = `
        <div class="vertical-center">
            <div class="horizontal-center menu noselect">
                <h1>Sudoku</h1>
                <div class="size-selection">
                    <h2>Játéktér mérete</h2>

                    <button class="menubutton sizebtn" data-sudoku-size="3">
                        3x3
                        <span class="material-icons menuicon">navigate_next</span>
                    </button>
                    <button class="menubutton sizebtn" data-sudoku-size="4">
                        4x4
                        <span class="material-icons menuicon">navigate_next</span>
                    </button>
                    <button class="menubutton sizebtn" data-sudoku-size="9">
                        9x9 (Normál Sudoku)
                        <span class="material-icons menuicon">navigate_next</span>
                    </button>
                    <a href="https://benceskorka.com/" target="_blank" class="menubutton">
                        Készítő
                    </a>
                </div>
                <div class="difficulty-selection">
                    <h2>Játék nehézsége</h2>
                    <button class="menubutton diffbtn" data-sudoku-diff="easy">
                        Könnyű
                        <span class="menuicon">&#128526;</span>
                    </button>
                    <button class="menubutton diffbtn" data-sudoku-diff="difficult">
                        Nehéz
                        <span class="menuicon">&#128578;</span>
                    </button>
                    <button class="menubutton diffbtn" data-sudoku-diff="max">
                        Nagyon nagyon nehéz
                        <span class="menuicon">&#128543;</span>
                    </button>
                </div>
                <div class="loading">
                    <h2>Kérlek várj...</h2>
                </div>
            </div>
        </div>
        <div class="dialog-container noselect" id="drm-dialog">
            <div class="circlebutton close">
                <i class="material-icons">close</i>
            </div>
            <div class="dialog">
                <h2>"Próbaverzió"</h2>
                <p>
                    Ennek az oldalnak a <a href="https://sudoku.benceskorka.com/">sudoku.benceskorka.com</a> címen kellene futnia.
                </p>
                <p>
                    Ha nem vált át a hivatalos oldalra, akkor ServiceWorker nélkül fog futni a játék,<br>
                    így nem lesz elérhető OFFLINE módban,<br>
                    illetve nem fog Progressive Web Appként működni,<br>
                    így nem adható hozzá a kezdőképernyőhöz.
                </p>
                <p>
                    Szeretne átmenni a <a href="https://sudoku.benceskorka.com/">sudoku.benceskorka.com</a> oldalra?
                </p>
                <a class="menubutton" href="https://sudoku.benceskorka.com/">Igen</a>
            </div>
        </div>
        `;

        this.resetMenu();

        const t = this;

        let buttons1 = $$(".sizebtn");
        for (let k = 0; k < buttons1.length; k++) {
            buttons1[k].addEventListener("click", function(event) {
                t.selectGameSize(event);
            }, false);
        }

        let buttons2 = $$(".diffbtn");
        for (let k = 0; k < buttons2.length; k++) {
            buttons2[k].addEventListener("click", function(event) {
                t.selectDifficulty(event);
            }, false);
        }

        if (this.showDRM) {
            $("#drm-dialog").classList.add("visible");
        }
        $("#drm-dialog .close").addEventListener("click", function() {
            $("#drm-dialog").classList.remove("visible");
        });
    }

    unload() {
        this.main.innerHTML = "";
    }

    render() {
        this.drawBackground();
        this.postRendering();
    }

    drawBackground() {
        const mouseMoveEffect = 50;

        if (typeof(this.bg_seed) === "undefined") {
            this.bg_seed = guid();
        }
        if (typeof(this.bg_pattern) == "undefined" || this.width !== this.backgroundCanvas.width || this.height !== this.backgroundCanvas.height) {
            this.width = this.backgroundCanvas.width;
            this.height = this.backgroundCanvas.height;
            this.bg_pattern = Trianglify({
                width: this.width + mouseMoveEffect,
                height: this.height + mouseMoveEffect,
                cell_size: 200,
                variance: 1,
                x_colors: "YlGnBu",
                seed: this.bg_seed
            }).canvas();
        }

        this.backgroundCtx.drawImage(
            this.bg_pattern,
            - mouseMoveEffect * (this.mouseX / this.width),
            - mouseMoveEffect * (this.mouseY / this.height),
            this.width + mouseMoveEffect,
            this.height + mouseMoveEffect);
    }

    onMouseMove(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    resetMenu() {
        $(".size-selection").style.display = "";
        $(".difficulty-selection").style.display = "none";
        $(".loading").style.display = "none";
    }

    selectGameSize(event) {
        if (!event.target.hasAttribute("data-sudoku-size")) {
            return;
        }

        this.selectedSize = Number(event.target.getAttribute("data-sudoku-size"));

        $(".size-selection").style.display = "none";
        $(".difficulty-selection").style.display = "";
    }

    selectDifficulty(event) {
        if (!event.target.hasAttribute("data-sudoku-diff")) {
            return;
        }
        let diff = event.target.getAttribute("data-sudoku-diff");

        let emptyCells = 0;

        if (this.selectedSize == 3 && diff == "easy") {
            // 3x3 - easy
            emptyCells = 1;
        } else if (this.selectedSize == 3 && diff == "difficult") {
            // 3x3 - difficult
            emptyCells = 3;
        } else if (this.selectedSize == 4 && diff == "easy") {
            // 4x4 - easy
            emptyCells = 3;
        } else if (this.selectedSize == 4 && diff == "difficult") {
            // 4x4 - difficult
            emptyCells = 5;
        } else if (diff == "easy") {
            // general size - easy
            emptyCells = (this.selectedSize * this.selectedSize) * 0.2;
        } else if (diff == "difficult") {
            // genera size - difficult
            emptyCells = (this.selectedSize * this.selectedSize) * 0.4;
        } else if (diff == "max") {
            emptyCells = (this.selectedSize * this.selectedSize);
        }

        $(".difficulty-selection").style.display = "none";
        $(".loading").style.display = "";

        const _this = this;

        new Promise(function(resolve) {
            setTimeout(function() {
                const game = GenerateGame(_this.selectedSize, emptyCells);
                resolve(game);
            }, 300);
        }).then(function(game) {
            ChangeScene(new InGame(game));
        });
    }

}