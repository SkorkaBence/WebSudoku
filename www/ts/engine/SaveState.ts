/*
    engine/SaveState.ts - Sudoku solver
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

interface SaveState {
    arena : string;
    time : number;
    texturePack: TexturePackData;
    helpIcons: boolean;
    checkCellWhenChanged : boolean;
}