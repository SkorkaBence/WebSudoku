/*
    engine/Generator.ts - Sudoku generator
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

function GenerateGame(size : number, empty_places : number) : Sudoku {
    console.log("Generating full sudoku...");
    let generationTime = -1 * Date.now();

    const solution = TryToSolveSudoku(new Sudoku(size), false);
    if (!solution.result) {
        console.error("Unknown error while solving an empty solution");
    }

    let game = (solution.solution as Sudoku);

    console.log("Full sudoku generated!");
    
    console.log("Removing random cells, while keeping then unique solution...");

    let indexes = [];
    for (let x = 0; x < size; ++x) {
        for (let y = 0; y < size; ++y) {
            indexes.push({
                x: x,
                y: y
            });
        }
    }

    indexes = shuffle(indexes);
    
    while (indexes.length > empty_places) {
        indexes.pop();
    }

    let consequetiveFails = 0;
    let execution_time = 0;

    while (indexes.length > 0 &&  execution_time < 2) {
        let position = indexes.pop();

        let start_time = Date.now();

        let x = position.x;
        let y = position.y;

        const currentValue = game.getCell(x, y);
        game.setCell(x, y, 0);
        let analysis = TryToSolveSudoku(game, true);
        if (analysis.solution_count != 1) {
            game.setCell(x, y, currentValue);
            consequetiveFails++;
        } else {
            consequetiveFails = 0;
        }

        execution_time = (Date.now() - start_time) / 1000;

        console.log("(" + indexes.length + " left, " + consequetiveFails + " fails, " + execution_time + "s)");
    }

    console.log("Done!");

    console.log("Fixating cells...");
    for (let x = 0; x < size; ++x) {
        for (let y = 0; y < size; ++y) {
            game.setCellFixing(x, y, game.isCellFilled(x, y));
        }
    }

    generationTime += Date.now();

    console.log("Done in " + (generationTime / 1000) +"s! New game fully generated!");

    return game;
}