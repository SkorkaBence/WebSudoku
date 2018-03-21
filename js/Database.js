class Database {

    constructor(table) {
        if (!window.indexedDB) {
            window.alert("Your browser doesn't support a stable version of IndexedDB.");
        }

        this.request = window.indexedDB.open(table, 3);
        this.request.onerror = function(event) {
            console.error("Failed to open the database", event);
        };
        this.request.onsuccess = function(event) {

        };
    }

}