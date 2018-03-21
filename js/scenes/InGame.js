class CellTexture {
    constructor(type, data) {
        this.type = type;

        this.text = "";
        this.background = "";
        this.selectedCellX = -1;
        this.selectedCellY = -1;

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
        this.redraw = false;

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
        this.main.innerHTML = `
            <div class="gamearea noselect">
                <div class="gamebody">
                    <table id="gametable"></table>
                </div>
                <div class="celloptions"></div>
            </div>
        `;
        this.redraw = true;
    }

    unload() {
        this.main.innerHTML = "";
    }

    resized() {
        this.redraw = true;
    }

    render() {
        const t = this;3

        if (this.redraw) {
            let table = $("#gametable");

            const usableWidth = table.parentNode.clientWidth - 3;
            const usableHeight = table.parentNode.clientHeight - 3;

            const cellsize = Math.min(usableWidth / this.game.size, usableHeight / this.game.size);

            table.innerHTML = "";
            for (let y = 0; y < this.game.size; ++y) {
                let tr = document.createElement("tr");
                for (let x = 0; x < this.game.size; ++x) {
                    let box = this.getCell(x, y);
                    box.style.width = cellsize + "px";
                    box.style.height = cellsize + "px";
                    box.style.fontSize = (cellsize * 0.6) + "px";
                    tr.appendChild(box);
                }
                table.appendChild(tr);
            }

            let options = $(".celloptions");
            options.innerHTML = "";
            for (let i = 0; i < this.game.size; i++) {
                let box = document.createElement("div");
                box.className = "option";
                this.textures[i].setTexture(box);
                box.addEventListener("click", ((function(id) {
                    return function() {
                        t.changeCell(id);
                    };
                })(i + 1)));
                options.appendChild(box);
            }

            this.backgroundCtx.fillStyle="#FFFFFF";
            this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);

            this.redraw = false;
        }

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
        this.redraw = true;
    }

    changeCell(id) {
        //console.log(id);
        this.game.setCell(this.selectedCellX, this.selectedCellY, id);
        this.redraw = true;

        let res = this.game.getResult();
        if (res == "not_solved") {

        } else if (res == "mistakes") {

        } else if (res == "correct") {
            ChangeScene(new Win());
        }
    }

}