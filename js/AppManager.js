/*
    AppManager.js - PWA management for ServiceWorker and PushNotification registration
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class ServiceWorkerManager {

    constructor(updatecallback, worker) {
        this.updatecallback = updatecallback;
        this.push = null;
        this.sw = null;

        var t = this;

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(worker).then(function(reg) {
                t.pushupdate({
                    type: "sw_register",
                    status: "registered"
                });
                t.sw = reg;
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
                t.pushupdate({
                    type: "sw_register",
                    status: "failed"
                });
            });
    
            window.addEventListener('beforeinstallprompt', function(e) {
                e.userChoice.then(function(choiceResult) {
                    console.log(choiceResult.outcome);
                    if(choiceResult.outcome == 'dismissed') {
                        console.log('User cancelled home screen install');
                        t.pushupdate({
                            type: "home_icon",
                            status: "cancelled"
                        });
                    } else {
                        console.log('User added to home screen');
                        t.pushupdate({
                            type: "home_icon",
                            status: "added"
                        });
                    }
                });
            });
        }
    }

    pushupdate(data) {
        if (typeof(this.updatecallback) == "function") {
            try {
                this.updatecallback(data);
            } catch (e) {
                console.log("Callback error:", e);
            }
        }
    }

}