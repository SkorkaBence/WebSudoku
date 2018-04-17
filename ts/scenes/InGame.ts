/*
    scenes/InGame.ts - InGame scene
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class CellTexture {

    private type : string;
    private text : string;
    private background : string;

    constructor(type : string, data : string|number) {
        this.type = type;

        this.text = "";
        this.background = "";

        if (type == "color") {
            this.background = (data as string);
        } else if (type == "number") {
            this.text = (data as string);
        }
    }

    setTexture(obj : HTMLElement) : void {
        if (this.type == "color") {
            obj.style.backgroundColor = this.background;
        } else if (this.type == "number") {
            obj.innerHTML = this.text;
        }
    }
}

class InGame extends Scene {

    private game : Sudoku;

    private selectedCellX : number = -1;
    private selectedCellY : number = -1;
    private audioPlayer : HTMLAudioElement|null = null;;
    private clickEffect : HTMLAudioElement|null = null;;
    private secondTimer : number|null = null;
    private timerModule : HTMLElement|null = null;

    private helpIcons : boolean = false;
    private checkCellWhenChanged : boolean = false;

    private textures : CellTexture[] = [];

    constructor(game : Sudoku) {
        super();

        this.game = game;

        //const bgs = shuffle(["#F44336", "#9C27B0", "#3F51B5", "#2196F3", "#4CAF50", "#FF9800", "#795548", "#009688", "#CDDC39", "#E91E63"]);
        const bgs = shuffle(["red", "blue", "lime", "yellow"]);
        if (this.game.size <= bgs.length) {
            for (let i = 0; i < this.game.size; i++) {
                this.textures.push(new CellTexture("color", bgs[i % bgs.length]));
            }
        } else {
            for (let i = 0; i < this.game.size; i++) {
                this.textures.push(new CellTexture("number", i + 1));
            }
        }
    }

    public load() : void {
        const __this = this;

        this.main.innerHTML = `
            <div class="fullscreen background" id="sudokubg"></div>
            <div class="gamearea noselect">
                <div class="header-left">
                    <div class="circlebutton" id="exitbtn">
                        <i class="material-icons">exit_to_app</i>
                    </div>
                </div>
                <div class="header-center">
                    <div id="timer" class="timer"></div>
                </div>
                <div class="header-right">
                    <div class="circlebutton" id="settingsopener">
                        <i class="material-icons">settings</i>
                    </div>
                </div>
                <div class="gamebody">
                    <table id="gametable"></table>
                </div>
                <div class="celloptions"></div>
            </div>
            <div class="watermark-animation" id="sadface">&#128542;</div>
            <div class="dialog-container noselect" id="settingsdialog">
                <div class="circlebutton close">
                    <i class="material-icons">close</i>
                </div>
                <div class="dialog">
                    <h2>Beállítások</h2>
                    <button class="menubutton" id="settings_volume">???</button>
                    <button class="menubutton" id="settings_backgroundchange">Háttérkép megváltoztatása</button>
                    <p>
                        <label class="customcheckbox">
                            <input type="checkbox" id="settings_checkwhenset" ${this.checkCellWhenChanged ? "checked" : ""}>
                            <span class="checkbox">
                                <span class="tick"></span>
                            </span>
                            Lerakott elemek ellenőrzése
                        </label>
                    </p>
                    <p>
                        <label class="customcheckbox">
                            <input type="checkbox" id="settings_helpicons" ${this.helpIcons ? "checked" : ""}>
                            <span class="checkbox">
                                <span class="tick"></span>
                            </span>
                            Csak az elfogadott lehetőségek jelenjenek meg
                        </label>
                    </p>
                </div>
            </div>
            <audio autoplay loop id="backgroundmusic">
                <source src="audio/music.mp3" type="audio/mpeg">
            </auduo>
            <audio id="clickeffect">
                <source src="audio/click.mp3" type="audio/mpeg">
            </auduo>
        `;

        this.audioPlayer = ($("#backgroundmusic") as HTMLAudioElement);
        this.timerModule = ($("#timer") as HTMLAudioElement);
        this.clickEffect = ($("#clickeffect") as HTMLAudioElement);

        $("#exitbtn").addEventListener("click", function() {
            ClearGameState();
            ChangeScene(new Menu(false));
        });
        $("#settingsopener").addEventListener("click", function() {
            __this.render();
            $("#settingsdialog").classList.add("visible");
        });
        $("#settingsdialog .close").addEventListener("click", function() {
            $("#settingsdialog").classList.remove("visible");
        });
        $("#settingsdialog").addEventListener("click", function(event) {
            if (event.target != null) {
                if ((event.target as HTMLElement).id === "settingsdialog") {
                    $("#settingsdialog").classList.remove("visible");
                }
            }
        });

        $("#settings_volume").addEventListener("click", function() {
            if (__this.audioPlayer == null) {
                return;
            }
            if (__this.audioPlayer.paused) {
                __this.audioPlayer.play();
            } else {
                __this.audioPlayer.pause();
            }
            __this.render();
        });
        $("#settings_backgroundchange").addEventListener("click", function() {
            __this.changeBackground();
        });
        $("#settings_checkwhenset").addEventListener("change", function() {
            __this.checkCellWhenChanged = ($("#settings_checkwhenset") as HTMLInputElement).checked;
        });
        $("#settings_helpicons").addEventListener("change", function() {
            __this.helpIcons = ($("#settings_helpicons") as HTMLInputElement).checked;
            __this.render();
        });

        this.changeBackground();
        this.render();
        window.setTimeout(function() {
            __this.render();
        }, 100);

        this.secondTimer = window.setInterval(function() {
            __this.game.secondTick();
            if (__this.timerModule != null) {
                __this.timerModule.innerText = SecondsToReadableTime(__this.game.timer);
            }
        }, 1000);
    }

    private changeBackground() : void {
        let bgurl = BackgroundImagePrefix + BackgroundImageList[Math.floor(Math.random() * BackgroundImageList.length)];
        $("#sudokubg").style.backgroundImage = "url('" + bgurl + "')";
    }

    public unload() : void {
        this.main.innerHTML = "";
        if (this.secondTimer != null) {
            window.clearInterval(this.secondTimer);
        }
    }

    public resized() : void {
        this.render();

        const __this = this;
        window.setTimeout(function() {
            __this.render();
        }, 100);
    }

    public requireFrameRendering() : boolean {
        return false;
    }

    public render() : void {
        const t = this;

        const table = $("#gametable");
        const tableParent = (table.parentNode as HTMLElement);
        const options = $(".celloptions");
        options.innerHTML = "";

        const usableWidth = tableParent.clientWidth - 4;
        const usableHeight = tableParent.clientHeight - 4;

        const cellsize = Math.min(usableWidth / this.game.size, usableHeight / this.game.size);
        const optionsize = Math.max(Math.min(cellsize - 10, 140), 35);

        table.innerHTML = "";
        for (let y = 0; y < this.game.size; ++y) {
            let tr = document.createElement("tr");
            for (let x = 0; x < this.game.size; ++x) {
                let box = this.getCell(x, y);
                box.style.width = cellsize + "px";
                box.style.height = cellsize + "px";
                box.style.fontSize = (cellsize * 0.55) + "px";
                tr.appendChild(box);
            }
            table.appendChild(tr);
        }

        let possibilities;

        if (this.helpIcons) {
            possibilities = this.game.getPossibleValuesBoolArray(this.selectedCellX, this.selectedCellY);
        } else if (this.selectedCellX >= 0 && this.selectedCellY >= 0) {
            possibilities = generateArray(this.game.size, true);
        } else {
            possibilities = generateArray(this.game.size, false);
        }

        for (let i = 1; i <= this.game.size; ++i) {
            let box = document.createElement("div");
            box.className = "option";
            box.style.width = optionsize + "px";
            box.style.height = optionsize + "px";
            box.style.fontSize = (optionsize * 0.55) + "px";
            if (i > 0) {
                this.textures[i - 1].setTexture(box);
                let sp = document.createElement("span");
                sp.innerHTML = box.innerHTML;
                box.innerHTML = "";
                if (!possibilities[i - 1]) {
                    box.classList.add("disabled");
                }
                box.appendChild(sp);
                box.id = "cell-option-" + i;
            } else {
                box.innerHTML = "<span class='fa fa-eraser'></span>";
            }
            box.addEventListener("click", ((function(id) {
                return function() {
                    t.changeCell(id);
                };
            })(i)));
            options.appendChild(box);
        }

        if (this.audioPlayer != null) {
            if (this.audioPlayer.paused) {
                $("#settings_volume").innerText = "Zene bekapcsolása";
            } else {
                $("#settings_volume").innerText = "Zene kikapcsolása";
            }
        }

        SaveGameState(this.game.serialize());

        this.backgroundCtx.fillStyle="#000000";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height); 

        /*this.postRendering();*/
    }

    private getCell(x : number, y : number) : HTMLElement {
        const t = this;
        let cell = document.createElement("td");
        const value = this.game.getCell(x, y);
        const fixed = this.game.isCellFixed(x, y);

        cell.classList.add("cell-" + x + "-" + y);

        if (fixed) {
            cell.classList.add("fixed-cell");
        } else {
            cell.classList.add("changeable-cell");
            cell.addEventListener("click", function() {
                t.selectCell(x, y);
            });
        }

        if (value <= 0) {
            cell.classList.add("unset-cell");
        } else {
            cell.classList.add("set-cell");
            cell.classList.add("cell-value-" + value);

            this.textures[value - 1].setTexture(cell);
        }

        if (this.game.subCells) {
            const subSectionSize = this.game.subCellSize;

            if (x % subSectionSize == 0) {
                cell.classList.add("section-border-left");
            }
            if (y % subSectionSize == 0) {
                cell.classList.add("section-border-top");
            }
            if (x % subSectionSize == subSectionSize - 1) {
                cell.classList.add("section-border-right");
            }
            if (y % subSectionSize == subSectionSize - 1) {
                cell.classList.add("section-border-bottom");
            }
        }

        if (x == this.selectedCellX && y == this.selectedCellY ) {
            cell.classList.add("selected-cell");
        }

        return cell;
    }

    private selectCell(x : number, y : number) : void {
        this.selectedCellX = x;
        this.selectedCellY = y;

        const cellValue = this.game.getCell(x, y);
        if (cellValue > 0) {
            this.game.setCell(x, y, 0);
        }
        this.render();
    }

    private changeCell(id : number) : void {
        if (this.clickEffect != null) {
            this.clickEffect.play();
        }

        if (this.checkCellWhenChanged) {
            const possibilities = this.game.getPossibleValuesBoolArray(this.selectedCellX, this.selectedCellY);
            if (!possibilities[id - 1]) {
                //$("#cell-option-" + id).classList.add("invalid-choiche");
                window.navigator.vibrate([200, 100, 200]);
                this.showSadFace();
                return;
            }
        }

        this.game.setCell(this.selectedCellX, this.selectedCellY, id);
        this.selectedCellX = -1;
        this.selectedCellY = -1;

        this.render();

        let res = this.game.getResult();
        if (res == "not_solved") {

        } else if (res == "mistakes") {

        } else if (res == "correct") {
            ClearGameState();
            ChangeScene(new Win());
        }
    }

    public showSadFace() : void {
        let face = $("#sadface");
        face.classList.add("visible");
        window.setTimeout(function() {
            face.classList.remove("visible");
        }, 1000);
    }

    public onMouseMove(event : any) : void {}

}