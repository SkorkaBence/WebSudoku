class HtmlLoader {

    private static cache : {[id : string] : string} = {};

    public static LoadModule(name : string) : Promise<string> {
        const __this = this;
        
        if (typeof(this.cache[name]) == "string") {
            return new Promise(function(resolve) {
                resolve(__this.cache[name]);
            });
        } else {
            return fetch("html/" + name + ".html").then(function(response) {
                return response.text();
            }).then(function(text) {
                __this.cache[name] = text;
                return text;
            });
        }
    }

}