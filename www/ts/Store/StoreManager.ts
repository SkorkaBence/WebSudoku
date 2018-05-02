interface StoreItem {
    id : string;
    name : string;
    icon : string;
    price : number;
}

class StoreManager {

    public static GetStoreItems() : Promise<StoreItem[]> {
        return fetch("api/store/list").then(function(response) {
            return response.json();
        }).then(function (data) {
            return (data as StoreItem[]);
        });
    }

}