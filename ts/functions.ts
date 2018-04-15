/*
    functions.js - Util functions
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

function $(e : string) : HTMLElement {
    return (document.querySelector(e) as HTMLElement);
}

function $$(e : string) : NodeListOf<HTMLElement> {
    return document.querySelectorAll(e);
}

function guid() : string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function isSquareNumber(n : number) : boolean {
    const sqrt = Math.round(Math.sqrt(n));
    const check = sqrt * sqrt;
    return (n == check);
}

function generateArray(size : number, def : any) : any[] {
    let arr = [];
    for (let i = 0; i < size; ++i) {
        arr[i] = def;
    }
    return arr;
}

function shuffle(array : any[]) : any[] {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function random(min : number, max : number) : number {
    return Math.random() * (max - min) + min;
}

function calculateDistance(aX : number, aY : number, bX : number, bY : number) : number {
    let xDistance = aX - bX;
    let yDistance = aY - bY;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function pad(num : number, size : number) : string {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function SecondsToReadableTime(sec : number) : string {
    let negative = false;

    if (sec < 0) {
        negative = true;
        sec = -1 * sec;
    }

    let strs = [];
    const dividers = [60, 60, 24, 365];
    let current_divider = 0;

    while (sec > 0) {
        const divide = dividers[current_divider];
        ++current_divider;

        strs.unshift(pad(sec % divide, 2));
        sec = Math.floor(sec / divide);
    }

    return negative ? "-" : "" + strs.join(":");
}