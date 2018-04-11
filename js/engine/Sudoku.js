/*
    endine/Sudoku.js - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class SudokuCell {
    constructor() {
        this.value = 0;
        this.fixed = false;
    }

    clone() {
        let c = new SudokuCell();
        c.value = this.value;
        c.fixed = this.fixed;
        return c;
    }

    serialize() {
        return JSON.stringify({
            value: this.value,
            fixed: this.fixed
        });
    }

    deserialize(raw) {
        const data = JSON.parse(raw);
        this.value = data.value;
        this.fixed = data.fixed;
    }
}

class Sudoku {

    constructor(size) {
        if (typeof(size) != "number") {
            //console.error("First parameter must be a number");
            return;
        }

        if (size == 2 || size == 3) {
            this.subCells = false;
        } else if (isSquareNumber(size)) {
            this.subCells = true;
            this.subCellSize = Math.round(Math.sqrt(size));
        } else {
            console.error("Invalid size: ", size);
        }

        this.size = size;
        this.arena = [];

        for (let x = 0; x < size; ++x) {
            this.arena[x] = [];
            for (let y = 0; y < size; ++y) {
                this.arena[x][y] = new SudokuCell();
            }
        }
    }

    clone() {
        let res = new Sudoku(this.size);
        for (let x = 0; x < this.size; ++x) {
            for (let y = 0; y < this.size; ++y) {
                res.arena[x][y] = this.arena[x][y].clone();
            }
        }
        return res;
    }

    serialize() {
        let arena_data = [];
        for (let x = 0; x < this.size; ++x) {
            arena_data[x] = [];
            for (let y = 0; y < this.size; ++y) {
                arena_data[x][y] = this.arena[x][y].serialize();
            }
        }
        return JSON.stringify({
            size: this.size,
            subCells: this.subCells,
            subCellSize: this.subCellSize,
            arena: arena_data
        });
    }

    deserialize(raw) {
        const data = JSON.parse(raw);
        this.size = data.size;
        this.subCells = data.subCells;
        this.subCellSize = data.subCellSize;
        this.arena = [];
        for (let x = 0; x < this.size; ++x) {
            this.arena[x] = [];
            for (let y = 0; y < this.size; ++y) {
                let c = new SudokuCell();
                c.deserialize(data.arena[x][y]);
                this.arena[x][y] = c;
            }
        }
    }

    isValidCell(x, y) {
        if (typeof(x) != "number" || typeof(y) != "number") {
            console.error("Numbers required");
        }

        return (x >= 0 && y >= 0 && x < this.size && y < this.size);
    }

    setCell(x, y, c) {
        if (!this.isValidCell(x, y)) {
            return;
        }

        if (c >= 0 && c <= this.size) {
            this.arena[x][y].value = c;
        }
    }

    isCellFilled(x, y) {
        if (!this.isValidCell(x, y)) {
            return false;
        }
        return (this.arena[x][y].value > 0);
    }

    getCell(x, y) {
        if (!this.isValidCell(x, y)) {
            return false;
        }
        return this.arena[x][y].value;
    }

    isCellFixed(x, y) {
        if (!this.isValidCell(x, y)) {
            return false;
        }
        return this.arena[x][y].fixed;
    }

    setCellFixing(x, y, b) {
        if (!this.isValidCell(x, y)) {
            return false;
        }
        this.arena[x][y].fixed = b;
    }

    getPossibleValues(x, y) {
        if (!this.isValidCell(x, y)) {
            return [];
        }

        let boolarr = generateArray(this.size, true);

        for (let i = 0; i < this.size; ++i) {
            boolarr[this.arena[x][i].value - 1] = false;
            boolarr[this.arena[i][y].value - 1] = false;
        }

        if (this.subCells) {
            const sx = Math.floor(x / this.subCellSize) * this.subCellSize;
            const sy = Math.floor(y / this.subCellSize) * this.subCellSize;

            for (let xi = 0; xi < this.subCellSize; ++xi) {
                for (let yi = 0; yi < this.subCellSize; ++yi) {
                    boolarr[this.arena[sx + xi][sy + yi].value - 1] = false;
                }
            }
        }

        let res = [];
        for (let i = 0; i < boolarr.length; ++i) {
            if (boolarr[i]) {
                res.push(i + 1);
            }
        }

        return res;
    }

    getResult() {
        for (let x = 0; x < this.size; ++x) {
            for (let y = 0; y < this.size; ++y) {
                if (this.arena[x][y].value <= 0) {
                    return "not_solved";
                }
            }
        }

        // Sorok & Oszlopok ellenőrzése
        for (let i = 0; i < this.size; ++i) {
            let boolarr1 = generateArray(this.size, false);
            let boolarr2 = generateArray(this.size, false);
            for (let j = 0; j < this.size; ++j) {
                if (boolarr1[this.arena[i][j].value - 1] || boolarr2[this.arena[j][i].value - 1]) {
                    return "mistakes";
                }
                boolarr1[this.arena[i][j].value - 1] = true;
                boolarr2[this.arena[j][i].value - 1] = true;
            }
        }

        if (this.subCells) {
            // Al-területek ellenőrzése
            for (let cx = 0; cx < this.subCellSize; ++cx) {
                for (let cy = 0; cy < this.subCellSize; ++cy) {
                    let boolarr1 = generateArray(this.size, false);
                    for (let px = cx * this.subCellSize; px < (cx+1) * this.subCellSize; ++px) {
                        for (let py = cy * this.subCellSize; py < (cy+1) * this.subCellSize; ++py) {
                            if (boolarr1[this.arena[px][py].value - 1]) {
                                return "mistakes";
                            }
                            boolarr1[this.arena[px][py].value - 1] = true;
                        }
                    }
                }
            }
            /*
                --- DISCLAIMER ---
                A fenti ellenőrzés O(n^4) nek tűnhet, de igazából csak O(n^2),
                mivel a ciklusok kettessével érik el az O(n) szintet,
                mivel egy ciklus csak O(n^(1/2)) területet jár be.
            */
        }

        return "correct";
    }

    setNextPossibleValue(x, y) {
        const possibilities = getPossibleValues(x, y);
        if (possibilities.length == 0) {
            return 0;
        }

        const currentValue = this.arena[x][y].value;
        for (let i = 0; i < possibilities.length; ++i) {
            if (possibilities[i] > currentValue) {
                this.setCell(x, y, possibilities[i]);
                return;
            }
        }

        this.setCell(x, y, 0);
    }

}