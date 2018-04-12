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
        this.selectedCellX = -1;
        this.selectedCellY = -1;
        this.audioPlayer = null;
        this.secondTimer = null;

        /* HELPS */
        this.helpIcons = false;
        this.checkCellWhenChanged = false;
        /* HELPS */

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

        this.backgroundImages = [
            "01_gettyimages-450207051_super_resized.jpg",
            "02_gettyimages-544346474_super_resized.jpg",
            "03_gettyimages-642010642_high_resized.jpg",
            "04_gettyimages-536057853_high_resized.jpg",
            "05_gettyimages-170349835_high_resized.jpg",
            "06_gettyimages-74076688_super_resized.jpg",
            "07_gettyimages-483771218_super_resized.jpg",
            "08_gettyimages-512735064_super_resized.jpg",
            "09_gettyimages-510014070_super_resized.jpg",
            "10_gettyimages-452517269_high_resized.jpg",
            "11_gettyimages-490639794_super_resized.jpg",
            "12_gettyimages-534484823_super_resized.jpg",
            "13_gettyimages-861470990_super_resized.jpg",
            "14_gettyimages-635731456_high_resized.jpg",
            "15_gettyimages-492003884_high_resized.jpg",
            "16_gettyimages-621545726_high_resized.jpg",
            "17_gettyimages-92415747_high_resized.jpg",
            "18_gettyimages-672313436_super_resized.jpg"
        ];
        this.textures = [];

        //const bgs = shuffle(["#F44336", "#9C27B0", "#3F51B5", "#2196F3", "#4CAF50", "#FF9800", "#795548", "#009688", "#CDDC39", "#E91E63"]);
        const bgs = shuffle(["red", "blue", "green", "yellow"]);
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
                    <div class="headerbutton" id="exitbtn">
                        <i class="material-icons">exit_to_app</i>
                    </div>
                </div>
                <div class="header-center">
                    <div id="timer" class="timer"></div>
                </div>
                <div class="header-right">
                    <div class="headerbutton" id="volumebtn">
                        <i class="material-icons">error</i>
                    </div>
                </div>
                <div class="gamebody">
                    <table id="gametable"></table>
                </div>
                <div class="celloptions"></div>
            </div>
            <div class="watermark-animation" id="sadface">&#128542;</div>
            <audio autoplay loop id="backgroundmusic">
                <source src="audio/music.mp3" type="audio/mpeg">
            </auduo>
        `;

        this.audioPlayer = $("#backgroundmusic");
        this.timerModule = $("#timer");

        $("#exitbtn").addEventListener("click", function() {
            ClearGameState();
            ChangeScene(new Menu());
        });
        $("#volumebtn").addEventListener("click", function() {
            if (_this.audioPlayer.paused) {
                _this.audioPlayer.play();
            } else {
                _this.audioPlayer.pause();
            }
            _this.render();
        });

        //$("#sudokubg").style.backgroundImage = "url('img/backgrounds/" +  + "')";
        let bgurl = "img/backgrounds/" + this.backgroundImages[Math.floor(Math.random() * this.backgroundImages.length)];
        $("#sudokubg").style.backgroundImage = "url('" + bgurl + "')";

        this.render();
        window.setTimeout(function() {
            _this.render();
        }, 100);

        this.secondTimer = window.setInterval(function() {
            _this.game.secondTick();
            _this.timerModule.innerText = SecondsToReadableTime(_this.game.timer);
        }, 1000);
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
        const optionsize = Math.max(Math.min((cellsize * this.game.size) / (this.game.size/* + 1*/) - 10, options.clientHeight - 20), 40);

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
        } else {
            possibilities = generateArray(this.game.size, true);
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
            $("#volumebtn .material-icons").innerText = "volume_off";
        } else {
            $("#volumebtn .material-icons").innerText = "volume_up";
        }

        /*this.backgroundCtx.fillStyle = "#FFFFFF";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);

        this.backgroundCtx.fillStyle = "#BF360C";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);*/

        SaveGameState(this.game.serialize());

        /*this.backgroundCtx.fillStyle="#FFFFFF";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height); 

        this.postRendering();*/
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
        }, 800);
    }

}