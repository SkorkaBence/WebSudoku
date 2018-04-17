/*
    scenes/InGame.js - InGame scene
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class CellTexture {
    constructor(type, data) {
        this.type = type;

        this.text = "";
        this.background = "";

        if (type == "color") {
            this.background = data;
        } else if (type == "number") {
            this.text = data;
        }
    }

    setTexture(obj) {
        if (this.type == "color") {
            obj.style.backgroundColor = this.background;
        } else if (this.type == "number") {
            obj.innerHTML = this.text;
        }
    }
}

class InGame extends Scene {

    constructor(game) {
        super();

        this.game = game;

        this.selectedCellX = -1;
        this.selectedCellY = -1;
        this.audioPlayer = null;
        this.clickEffect = null;
        this.secondTimer = null;

        /* HELPS */
        this.helpIcons = false;
        this.checkCellWhenChanged = true;
        /* HELPS */

        this.textures = [];

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

    load() {
        const _this = this;

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

        this.audioPlayer = $("#backgroundmusic");
        this.timerModule = $("#timer");
        this.clickEffect = $("#clickeffect");

        $("#exitbtn").addEventListener("click", function() {
            ClearGameState();
            ChangeScene(new Menu());
        });
        $("#settingsopener").addEventListener("click", function() {
            _this.render();
            $("#settingsdialog").classList.add("visible");
        });
        $("#settingsdialog .close").addEventListener("click", function() {
            $("#settingsdialog").classList.remove("visible");
        });
        $("#settingsdialog").addEventListener("click", function(event) {
            if (event.target.id == "settingsdialog") {
                $("#settingsdialog").classList.remove("visible");
            }
        });

        $("#settings_volume").addEventListener("click", function() {
            if (_this.audioPlayer.paused) {
                _this.audioPlayer.play();
            } else {
                _this.audioPlayer.pause();
            }
            _this.render();
        });
        $("#settings_backgroundchange").addEventListener("click", function() {
            _this.changeBackground();
        });
        $("#settings_checkwhenset").addEventListener("change", function() {
            _this.checkCellWhenChanged = $("#settings_checkwhenset").checked;
        });
        $("#settings_helpicons").addEventListener("change", function() {
            _this.helpIcons = $("#settings_helpicons").checked;
            _this.render();
        });

        this.changeBackground();
        this.render();
        window.setTimeout(function() {
            _this.render();
        }, 100);

        this.secondTimer = window.setInterval(function() {
            _this.game.secondTick();
            _this.timerModule.innerText = SecondsToReadableTime(_this.game.timer);
        }, 1000);
    }

    changeBackground() {
        let bgurl = BackgroundImagePrefix + BackgroundImageList[Math.floor(Math.random() * BackgroundImageList.length)];
        $("#sudokubg").style.backgroundImage = "url('" + bgurl + "')";
    }

    unload() {
        this.main.innerHTML = "";
        window.clearInterval(this.secondTimer);
    }

    resized() {
        this.render();

        const _this = this;
        window.setTimeout(function() {
            _this.render();
        }, 100);
    }

    requireFrameRendering() {
        return false;
    }

    render() {
        const t = this;

        let table = $("#gametable");
        let options = $(".celloptions");
        options.innerHTML = "";

        const usableWidth = table.parentNode.clientWidth - 4;
        const usableHeight = table.parentNode.clientHeight - 4;

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

        if (this.audioPlayer.paused) {
            $("#settings_volume").innerText = "Zene bekapcsolása";
        } else {
            $("#settings_volume").innerText = "Zene kikapcsolása";
        }

        /*this.backgroundCtx.fillStyle = "#FFFFFF";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);

        this.backgroundCtx.fillStyle = "#BF360C";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);*/

        SaveGameState(this.game.serialize());

        this.backgroundCtx.fillStyle="#000000";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height); 

        /*this.postRendering();*/
    }

    getCell(x, y) {
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

    selectCell(x, y) {
        this.selectedCellX = x;
        this.selectedCellY = y;

        const cellValue = this.game.getCell(x, y);
        if (cellValue !== false && cellValue > 0) {
            this.game.setCell(x, y, 0);
        }
        this.render();
    }

    changeCell(id) {
        //console.log(id);

        this.clickEffect.play();

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

    showSadFace() {
        let face = $("#sadface");
        face.classList.add("visible");
        window.setTimeout(function() {
            face.classList.remove("visible");
        }, 1000);
    }

}