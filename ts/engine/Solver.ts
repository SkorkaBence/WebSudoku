/*
    endine/Solver.ts - Sudoku solver
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

interface SudokuSolverResult {
    result: boolean;
    solution: Sudoku|null;
    solution_count: number;
};

function TryToSolveSudoku(game : Sudoku, get_solution_count : Boolean) : SudokuSolverResult {
    let minV = game.size + 1;
    let minX = -1;
    let minY = -1;
    let missing = 0;
    let possibilities : number[] = [];

    for (let x = 0; x < game.size; ++x) {
        for (let y = 0; y < game.size; ++y) {
            if (!game.isCellFilled(x, y)) {
                missing++;
                let p = game.getPossibleValues(x, y);
                if (p.length < minV) {
                    minV = p.length;
                    minX = x;
                    minY = y;
                    possibilities = p;
                }
            }
        }
    }

    if (missing > 0) {
        let indexes : number[] = [];
        for (let k = 0; k < possibilities.length; ++k) {
            let d;
            do {
                d = Math.floor(Math.random() * possibilities.length);
            } while(indexes.lastIndexOf(d) > 0);
            indexes.push(d);
        }

        //let clone = game.clone();
        let oneSolution = null;
        let solutionCount = 0;

        for (let k = 0; k < indexes.length; ++k) {
            game.setCell(minX, minY, possibilities[indexes[k]]);

            const r = TryToSolveSudoku(game, get_solution_count);
            if (r.result) {
                solutionCount += r.solution_count;
                oneSolution = r.solution;
                if (get_solution_count !== true || solutionCount >= 2) {
                    r.solution_count = solutionCount;
                    game.setCell(minX, minY, 0);
                    return r;
                }
            }
        }
        game.setCell(minX, minY, 0);

        return {
            result: (solutionCount > 0),
            solution: oneSolution,
            solution_count: solutionCount
        }
    } else if (game.getResult() == "correct") {
        return {
            result: true,
            solution: game.clone(),
            solution_count: 1
        };
    } else {
        return {
            result: false,
            solution: null,
            solution_count: 0
        }
    }
}