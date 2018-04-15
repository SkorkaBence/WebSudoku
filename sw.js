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
    "https://csfcloud.blob.core.windows.net/resources/sudoku/01_gettyimages-450207051_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/02_gettyimages-544346474_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/03_gettyimages-642010642_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/04_gettyimages-536057853_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/05_gettyimages-170349835_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/06_gettyimages-74076688_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/07_gettyimages-483771218_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/08_gettyimages-512735064_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/09_gettyimages-510014070_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/10_gettyimages-452517269_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/11_gettyimages-490639794_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/12_gettyimages-534484823_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/13_gettyimages-861470990_super_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/14_gettyimages-635731456_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/15_gettyimages-492003884_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/16_gettyimages-621545726_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/17_gettyimages-92415747_high_resized.jpg",
    "https://csfcloud.blob.core.windows.net/resources/sudoku/18_gettyimages-672313436_super_resized.jpg"
];

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