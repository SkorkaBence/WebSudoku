/*
    endine/Sudoku.ts - Sudoku game core
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class SudokuCell {

    public value : number;
    public fixed : boolean;

    constructor() {
        this.value = 0;
        this.fixed = false;
    }

    public clone() : SudokuCell {
        let c = new SudokuCell();
        c.value = this.value;
        c.fixed = this.fixed;
        return c;
    }

    public serialize() : string {
        return JSON.stringify({
            value: this.value,
            fixed: this.fixed
        });
    }

    public deserialize(raw : string) : void {
        const data = JSON.parse(raw);
        this.value = data.value;
        this.fixed = data.fixed;
    }
}

class Sudoku {

    public size : number = 0;
    public arena : SudokuCell[][] = [];
    public timer : number = 0;
    public subCells : boolean = false;
    public subCellSize : number = 0;

    constructor(size : number) {
        if (size == 2 || size == 3) {
            this.subCells = false;
        } else if (isSquareNumber(size)) {
            this.subCells = true;
            this.subCellSize = Math.round(Math.sqrt(size));
        } else {
            console.error("Invalid size: ", size);
            return;
        }

        this.size = size;
        this.arena = [];
        this.timer = 0;

        for (let x = 0; x < size; ++x) {
            this.arena[x] = [];
            for (let y = 0; y < size; ++y) {
                this.arena[x][y] = new SudokuCell();
            }
        }
    }

    public secondTick() : void {
        ++this.timer;
    }

    public clone() : Sudoku {
        let res = new Sudoku(this.size);
        for (let x = 0; x < this.size; ++x) {
            for (let y = 0; y < this.size; ++y) {
                res.arena[x][y] = this.arena[x][y].clone();
            }
        }
        return res;
    }

    public serialize() : string {
        let arena_data : string[][] = [];
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
            timer: this.timer,
            arena: arena_data
        });
    }

    public deserialize(raw : string) : void {
        const data = JSON.parse(raw);
        this.size = data.size;
        this.subCells = data.subCells;
        this.subCellSize = data.subCellSize;
        this.timer = data.timer;
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

    public isValidCell(x : number, y : number) : boolean {
        if (typeof(x) != "number" || typeof(y) != "number") {
            console.error("Numbers required");
            return false;
        }

        return (x >= 0 && y >= 0 && x < this.size && y < this.size);
    }

    public setCell(x : number, y : number, c : number) : void {
        if (!this.isValidCell(x, y)) {
            return;
        }

        if (c >= 0 && c <= this.size) {
            this.arena[x][y].value = c;
        }
    }

    public isCellFilled(x : number, y : number) : boolean {
        if (!this.isValidCell(x, y)) {
            return false;
        }
        return (this.arena[x][y].value > 0);
    }

    public getCell(x : number, y : number) : number {
        if (!this.isValidCell(x, y)) {
            return 0;
        }
        return this.arena[x][y].value;
    }

    public isCellFixed(x : number, y : number) : boolean {
        if (!this.isValidCell(x, y)) {
            return false;
        }
        return this.arena[x][y].fixed;
    }

    public setCellFixing(x : number, y : number, b : boolean) : void {
        if (!this.isValidCell(x, y)) {
            return;
        }
        this.arena[x][y].fixed = b;
    }

    public getPossibleValues(x : number, y : number) : number[] {
        if (!this.isValidCell(x, y)) {
            return [];
        }

        let boolarr = this.getPossibleValuesBoolArray(x, y);

        let res = [];
        for (let i = 0; i < boolarr.length; ++i) {
            if (boolarr[i]) {
                res.push(i + 1);
            }
        }

        return res;
    }

    public getPossibleValuesBoolArray(x : number, y : number) : boolean[] {
        if (!this.isValidCell(x, y)) {
            return generateArray(this.size, false);
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

        return boolarr;
    }

    public getResult() : string {
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

    public setNextPossibleValue(x : number, y : number) : void {
        const possibilities = this.getPossibleValues(x, y);
        if (possibilities.length == 0) {
            return;
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