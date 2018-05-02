class StoreScreen extends Scene {

    public load() : void {
        const __this = this;

        this.main.innerHTML = 'Loading...';

        Loader.Show();

        Promise.all([AccountManager.GetUserData(), HtmlLoader.LoadModule("store")]).then(function(results) {
            __this.main.innerHTML = results[1];
            $(".account").style.backgroundImage = `url('${results[0].GetImageUrl()}')`;
            $(".account").title = results[0].GetName();
            Loader.Hide();
            __this.OnHtmlLoaded();
        }).catch(function() {
            SceneManager.PushScene(new LoginScreen());
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

    private OnHtmlLoaded() : void {
        const __this = this;
        this.render();

        let bgurl = BackgroundImagePrefix + BackgroundImageList[Math.floor(Math.random() * BackgroundImageList.length)];
        $("#storebg").style.backgroundImage = "url('" + bgurl + "')";

        this.RefreshStoreItems();
    }

    public RefreshStoreItems() : void {
        const __this = this;

        $(".storebody").innerHTML = '';

        StoreManager.GetStoreItems().then(function(items) {
            items.forEach(function(item) {
                $(".storebody").appendChild(__this.GetItem(item));
            });
        });
    }

    private GetItem(data : StoreItem) : HTMLElement {
        const cnt = document.createElement("div");
        cnt.className = "itemcnt";
        const div = document.createElement("div");
        div.className = "item";

        const img = document.createElement("div");
        img.className = "icon";
        img.style.backgroundImage = `url(${data.icon})`;
        div.appendChild(img);

        const name = document.createElement("div");
        name.className = "name";
        name.innerText = data.name;
        div.appendChild(name);

        const price = document.createElement("div");
        price.className = "price";
        price.innerText = data.price.toString();
        div.appendChild(price);

        const coinicon = document.createElement("div");
        coinicon.className = "coinicon";
        price.appendChild(coinicon);

        cnt.appendChild(div);
        return cnt;
    }

}