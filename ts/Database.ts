/*
    Database.ts - LocalStorage wrapper
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class Database {

    public static get(name : string) : any {
        const d = localStorage.getItem(name);
        if (d) {
            return JSON.parse(d);
        }
        return null;
    }

    public static set(name : string, data : any) : void {
        localStorage.setItem(name, JSON.stringify(data));
    }

    public static remove(name : string) : void {
        localStorage.removeItem(name);
    }

}