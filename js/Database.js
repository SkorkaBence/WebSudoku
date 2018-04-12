/*
    Database.js - LocalStorage wrapper
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class Database {

    constructor() {
        if (!window.localStorage) {
            window.alert("Your browser doesn't support localStorage");
        }
    }

    get(name) {
        return localStorage.getItem(name);
    }

    set(name, data) {
        localStorage.setItem(name, data);
    }

    remove(name) {
        localStorage.removeItem(name);
    }

}