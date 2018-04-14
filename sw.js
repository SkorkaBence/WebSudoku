/*
    sw.js - ServiceWorker for offline game access
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

const CACHE = 'sudoku-v1';
const DEV_MODE = false;

const preCacheList = [];

function SWLog(txt) {
    console.log("[Sudoku Service Worker] " + txt);
}

self.addEventListener('install', function(event) {
    SWLog("Service worker installed");
    if (DEV_MODE) {
        SWLog("Service worker is in DEV MODE so no sw cache will be used.");
    }

    event.waitUntil(
        precache().then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
    SWLog("Service worker activated");
});

self.addEventListener('fetch', function(event) {
    if (DEV_MODE) {
        return;
    }

    event.respondWith(fromCache(event.request).catch(fromServer(event.request)));

    if (navigator.onLine) {
        event.waitUntil(update(event.request));
    }
});

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll(preCacheList);
    });
}

function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (matching) {
                return matching;
            } else {
                return fromServer(request);
            }
        });
    });
}

function update(request) {
    return caches.open(CACHE).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response);
        });
    });
}

function fromServer(request){
    return fetch(request).then(function(response){
        return response;
    })
}