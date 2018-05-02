interface CSFUserData {
    id : string;
    image : string;
    name : string;
    registered : string;
    username : string;
}

class CSFUser {

    private data : CSFUserData;

    public constructor(data : CSFUserData) {
        this.data = data;
    }

    public GetName() : string {
        return this.data.name;
    }
    
    public GetImageUrl() : string {
        return this.data.image;
    }

}