/*
    scenes/Menu.js - Menu scene
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

declare var Trianglify : any;

class Menu extends Scene {

    private mouseX : number  = 0;
    private mouseY : number = 0;
    private showDRM : boolean;

    private bg_seed : string|undefined;
    private bg_pattern : any|undefined;
    private width : number|undefined;
    private height : number|undefined;

    private selectedSize : number|undefined;

    constructor(drm : boolean) {
        super();
        this.showDRM = drm;
    }

    public load() : void {
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
                    <hr>
                    <a href="https://benceskorka.com/" target="_blank" class="menubutton">
                        Készítő
                    </a>
                    <a href="https://github.com/SkorkaBence/WebSudoku/issues" target="_blank" class="menubutton">
                        Hiba bejelentés
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
                <a class="notpreferedmenubutton closelink">Nem</a>
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
        $("#drm-dialog .closelink").addEventListener("click", function() {
            $("#drm-dialog").classList.remove("visible");
        });
    }

    public unload() : void {
        this.main.innerHTML = "";
    }

    public render() : void {
        this.drawBackground();
        this.postRendering();
    }

    private drawBackground() : void {
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

    public onMouseMove(event : any) : void {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    private resetMenu() : void {
        $(".size-selection").style.display = "";
        $(".difficulty-selection").style.display = "none";
        $(".loading").style.display = "none";
    }

    private selectGameSize(event : any) : void {
        if (!event.target.hasAttribute("data-sudoku-size")) {
            return;
        }

        this.selectedSize = Number(event.target.getAttribute("data-sudoku-size"));

        $(".size-selection").style.display = "none";
        $(".difficulty-selection").style.display = "";
    }

    private selectDifficulty(event : any) : void {
        if (typeof(this.selectedSize) == "undefined") {
            return;
        }

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

        const __this = this;

        setTimeout(function() {
            const game = GenerateGame((__this.selectedSize as number), emptyCells);
            ChangeScene(new InGame(game));
        }, 300);
    }

    public resized() : void {}

}