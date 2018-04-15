/*
    Database.ts - LocalStorage wrapper
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class Database {

    constructor() {
        if (!window.localStorage) {
            window.alert("Your browser doesn't support localStorage");
        }
    }

    public get(name : string) : any {
        return localStorage.getItem(name);
    }

    set(name : string, data : any) : void {
        localStorage.setItem(name, data);
    }

    remove(name : string) : void {
        localStorage.removeItem(name);
    }

}