class AccountManager {

    public static Init() : void {
        const __this = this;

        if (CSF) {
            this.RunCSFInit();
        } else {
            csfAsyncInit = function() {
                __this.RunCSFInit();
            }
        }
    }

    private static RunCSFInit() : void {
        CSF.init({
            client_id: "09507983004428191769"
        });
    }

    public static IsLoggedIn() : Promise<boolean> {
        return new Promise(function(resolve) {
            CSF.getLoginStatus(function(data) {
                resolve(data.status);
            });
        });
    }

    public static StartLogIn() : Promise<CSF_LOGIN_STATUS> {
        const __this = this;

        return new Promise(function(resolve) {
            CSF.login(function(data) {
                resolve(data);
            });
        });
    }

    private static _GetUserData() : Promise<CSFUser> {
        return new Promise(function(resolve) {
            CSF.api("user/me", {
                success: function(userdata) {
                    resolve(new CSFUser(userdata));
                }
            });
        });
    }

    public static GetUserData() : Promise<CSFUser> {
        const __this = this;

        return this.IsLoggedIn().then(function(status) {
            if (!status) {
                throw new Error("Not logged in.");
            }
            return __this._GetUserData();
        });
    }

}