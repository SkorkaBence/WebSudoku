/*
    sw.js - ServiceWorker for offline game access
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

var must_cache = [
    '/'
];
var might_cache = [
];
var never_cache = [
];

var staticCacheName = 'sudoku-v1';

function SWLog(txt) {
    console.log("[Sudoku Service Worker] " + txt);
}

function cacheStatus(url) {
    for (var i = 0; i < never_cache.length; i++) {
        if (url.indexOf(never_cache[i]) > -1) {
            return "no_cache";
        }
    }

    for (var i = 0; i < might_cache.length; i++) {
        if (url.indexOf(might_cache[i]) > -1) {
            return "might_cache";
        }
    }

    for (var i = 0; i < must_cache.length; i++) {
        if (url.indexOf(must_cache[i]) > -1) {
            return "must_cache";
        }
    }

    return "unknown";
}

self.addEventListener('install', function(event) {
    SWLog("Service worker installed");
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {})
    );
});

self.addEventListener('activate', function(event) {
    SWLog("Service worker activated");
});

self.addEventListener('fetch', function(event) {
    var url = event.request.url;
    var cahce_status = cacheStatus(url);
    //SWLog("FETCH: " + url + " || " + cahce_status);

    if (cahce_status == "no_cache") {
        return;
    }

    event.waitUntil(
        caches.match(event.request).then(function(response) {
            if (response) {
                if (cahce_status == "must_cache" || !navigator.onLine) {
                    return response;
                }
            }
            return fetch(event.request).then(function(response) {
                if (cahce_status == "might_cache" || cahce_status == "must_cache") {
                    return caches.open(staticCacheName).then(function(cache) {
                        cache.put(event.request.url, response.clone());
                        return response;
                    });
                }
            });
        }).catch(function(error) {
            //SWLog('Cache error');
        })
    );
});

self.addEventListener('push', function(event) {
    SWLog('Push Received');
    SWLog('Push data: ' + event.data.text());

    try {
        var push_data = JSON.parse(event.data.text());

        if (typeof(push_data.type) != "string") {
            throw "Missing data type";
        }
        var type = push_data.type;

        if (type === "notification") {
            var title = '[[missing title]]';
            var body = '[[missing body]]';
            var icon = 'img/pageicon192.png';
            var badge = 'img/badge_black.png';
            var url = 'https://sudoku.benceskorka.com/';
            var tag = '';

            if (typeof(push_data.title) == "string") {
                title = push_data.title;
            }

            if (typeof(push_data.body) == "string") {
                body = push_data.body;
            }

            if (typeof(push_data.icon) == "string") {
                icon = push_data.icon;
            }

            if (typeof(push_data.badge) == "string") {
                badge = push_data.badge;
            }

            if (typeof(push_data.url) == "string") {
                url = push_data.url;
            }

            if (typeof(push_data.tag) == "string") {
                tag = push_data.tag;
            }

            event.waitUntil(self.registration.showNotification(title, {
                body: body,
                icon: icon,
                badge: badge,
                vibrate: [100, 50, 100],
                tag: tag,
                data: {
                    url: url
                }
            }));
        } else {
            throw "Invalid type!";
        }
    } catch (err) {
        SWLog('Push failed ' + JSON.stringify(err));
    }
});

self.addEventListener('notificationclick', function(event) {
    SWLog('Notification click Received');
    console.log(event.notification);

    event.notification.close();

    let data = event.notification.data;
    let url = typeof(data.url) == "string" ? data.url : "https://sudoku.benceskorka.com/";

    event.waitUntil(
        clients.openWindow(url)
    );
});

self.addEventListener('sync', function(event) {
    SWLog('Sync recieved');
});