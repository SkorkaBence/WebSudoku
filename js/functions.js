/*
    functions.js - Game initializer
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

function $(e) {
    return document.querySelector(e);
}

function $$(e) {
    return document.querySelectorAll(e);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function isSquareNumber(n) {
    const sqrt = Math.round(Math.sqrt(n));
    const check = sqrt * sqrt;
    return (n == check);
}

function generateArray(size, def) {
    let arr = [];
    for (let i = 0; i < size; ++i) {
        arr[i] = def;
    }
    return arr;
}

function eventDelegate() {

}

function shuffle(array) {
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

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function calculateDistance(aX, aY, bX, bY) {
    let xDistance = aX - bX;
    let yDistance = aY - bY;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}
