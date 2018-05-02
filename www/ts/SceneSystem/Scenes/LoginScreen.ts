class LoginScreen extends Scene {

    public load() : void {
        const __this = this;

        Loader.Show();

        HtmlLoader.LoadModule("login").then(function(html) {
            __this.main.innerHTML = html;
            Loader.Hide();
        }).then(function() {
            __this.OnHtmlLoaded();
        });
    }

    private OnHtmlLoaded() : void {
        $("#loginbtn").addEventListener("click", function() {
            AccountManager.StartLogIn().then(function(data) {
                if (data.status) {
                    SceneManager.PopScene();
                }
            });
        });
    }

    public unload() : void {
        this.main.innerHTML = '';
    }

    public render() : void {
        this.backgroundCtx.fillStyle = "#ffffff";
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);

        this.postRendering();
    }

}