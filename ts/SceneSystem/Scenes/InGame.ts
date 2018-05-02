/*
    SceneSystem/Scenes/InGame.ts - InGame scene
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class InGame extends Scene {

    private game : Sudoku;

    private selectedCellX : number = -1;
    private selectedCellY : number = -1;
    private audioPlayer : HTMLAudioElement|null = null;;
    private clickEffect : HTMLAudioElement|null = null;;
    private secondTimer : number|null = null;

    private timerModule : HTMLElement|null = null;
    private time : number = 0;

    private helpIcons : boolean = false;
    private checkCellWhenChanged : boolean = false;

    private texturePack : TexturePack;
    private textures : CellTexture[] = [];

    public constructor(game : Sudoku, textures : TexturePack);
    public constructor(game : SaveState);

    public constructor(game : Sudoku|SaveState, textures? : TexturePack) {
        super();

        if (game instanceof Sudoku) {
            this.game = game;
            if (!textures) {
                throw new Error("Texture pack needed");
            }
            if (textures.GetMaxCellNumber() < this.game.size) {
                throw new Error("Inalid texture pack");
            }
            this.texturePack = textures;
        } else {
            this.game = new Sudoku(0);
            this.game.deserialize(game.arena);
            this.time = game.time;
            this.texturePack = new TexturePack(game.texturePack);
            this.helpIcons = game.helpIcons;
            this.checkCellWhenChanged = game.checkCellWhenChanged;
        }
        this.textures = this.texturePack.GenerateTextures(this.game.size);
    }

    public load() : void {
        const __this = this;

        this.main.innerHTML = 'Loading...';

        HtmlLoader.LoadModule("game").then(function(html) {
            __this.main.innerHTML = html;
        }).then(function() {
            __this.OnHtmlLoaded();
        });
    }

    private OnHtmlLoaded() : void {
        const __this = this;

        this.audioPlayer = ($("#backgroundmusic") as HTMLAudioElement);
        this.timerModule = ($("#timer") as HTMLAudioElement);
        this.clickEffect = ($("#clickeffect") as HTMLAudioElement);

        $("#exitbtn").addEventListener("click", function() {
            ClearGameState();
            SceneManager.ChangeScene(new Menu(false));
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

        ($("#settings_checkwhenset") as HTMLInputElement).checked = this.checkCellWhenChanged;
        ($("#settings_helpicons") as HTMLInputElement).checked = this.helpIcons;

        this.changeBackground();
        this.render();
        window.setTimeout(function() {
            __this.render();
        }, 100);

        this.secondTimer = window.setInterval(function() {
            ++__this.time;
            if (__this.timerModule != null) {
                __this.timerModule.innerText = SecondsToReadableTime(__this.time);
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
                if (!possibilities[i - 1]) {
                    box.classList.add("disabled");
                }
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

        SaveGameState({
            arena: this.game.serialize(),
            time: this.time,
            texturePack: this.texturePack.ExportData(),
            helpIcons: this.helpIcons,
            checkCellWhenChanged: this.checkCellWhenChanged
        });

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
            SceneManager.ChangeScene(new Win());
        }
    }

    public showSadFace() : void {
        let face = $("#sadface");
        face.classList.add("visible");
        window.setTimeout(function() {
            face.classList.remove("visible");
        }, 1000);
    }

    public onMouseMove(event : MouseEvent) : void {}

}
