/*
    sw.js - ServiceWorker for offline game access
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

const CACHE = 'sudoku-v1';
const DEV_MODE = false;

self.importScripts('js/DataLists.js');

const preCacheList = [
    "audio/click.mp3",
    "audio/music.mp3",
    "audio/win.mp3",
    "textures/colors.json",
    "textures/numbers.json",
];

for (let i = 0; i < BackgroundImageList.length; ++i) {
    preCacheList.push(BackgroundImagePrefix + BackgroundImageList[i]);
}

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
        let needsUpdate = true;

        for (let i = 0; i < preCacheList.length; ++i) {
            if (event.request.url.indexOf(preCacheList[i]) > -1) {
                needsUpdate = false;
                break;
            }
        }

        if (needsUpdate) {
            event.waitUntil(update(event.request));
        }
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
            return matching || fromServer(request);
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