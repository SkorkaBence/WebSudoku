/*
    AppManager.ts - PWA management for ServiceWorker and PushNotification registration
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class ServiceWorkerManager {

    private updatecallback : Function;
    private sw : ServiceWorkerRegistration|null = null;

    constructor(updatecallback : Function, worker : string) {
        this.updatecallback = updatecallback;

        var _this = this;

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(worker).then(function(reg) {
                _this.pushupdate({
                    type: "sw_register",
                    status: "registered"
                });
                _this.sw = reg;
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
                _this.pushupdate({
                    type: "sw_register",
                    status: "failed"
                });
            });
    
            window.addEventListener('beforeinstallprompt', function(e : any) {
                e.userChoice.then(function(choiceResult : any) {
                    console.log(choiceResult.outcome);
                    if(choiceResult.outcome == 'dismissed') {
                        console.log('User cancelled home screen install');
                        _this.pushupdate({
                            type: "home_icon",
                            status: "cancelled"
                        });
                    } else {
                        console.log('User added to home screen');
                        _this.pushupdate({
                            type: "home_icon",
                            status: "added"
                        });
                    }
                });
            });
        }
    }

    pushupdate(data : any) : void {
        if (typeof(this.updatecallback) == "function") {
            try {
                this.updatecallback(data);
            } catch (e) {
                console.log("Callback error:", e);
            }
        }
    }

}