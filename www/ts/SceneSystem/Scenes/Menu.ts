/*
    SceneSystem/Scenes/Menu.ts - Menu scene
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
        const __this = this;

        Loader.Show();

        HtmlLoader.LoadModule("menu").then(function(html) {
            __this.main.innerHTML = html;
            Loader.Hide();
        }).then(function() {
            __this.OnHtmlLoaded();
        });
    }

    private OnHtmlLoaded() : void {
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

        $(".storebtn").addEventListener("click", function() {
            SceneManager.PushScene(new StoreScreen());
        });

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

    public onMouseMove(event : MouseEvent) : void {
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

        Loader.Show();

        setTimeout(function() {
            const size = (__this.selectedSize as number);
            const game = GenerateGame(size, emptyCells);
            let texturepackname = "default_numbers";
            if (size <= 4) {
                texturepackname = "default_colors";
            }
            TextureParser.Parse(texturepackname).then(function(pack) {
                Loader.Hide();
                SceneManager.ChangeScene(new InGame((game as Sudoku), pack));
            });
        }, 300);
    }

    public resized() : void {}

}