/*
    scenes/CellTexture.ts - TexturePack creator
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

class CellTexture {

    private data : TexturePackCellData;

    constructor(data : TexturePackCellData) {
        this.data = data;
    }

    public setTexture(obj : HTMLElement) : void {
        if (this.data.background) {
            if (this.data.background.color) {
                obj.style.backgroundColor = this.data.background.color;
            }
            if (this.data.background.image) {
                obj.style.backgroundImage = `url('${this.data.background.image}')`;
                obj.style.backgroundPosition = '50% 50%';
                obj.style.backgroundRepeat = 'no-repeat';
                if (this.data.background.image_size) {
                    obj.style.backgroundSize = this.data.background.image_size;
                } else {
                    obj.style.backgroundSize = 'contain';
                }
            }
        }
        if (this.data.content) {
            let cnt = document.createElement("span");
            if (this.data.content.color) {
                obj.style.color = this.data.content.color;
            }
            if (this.data.content.text) {
                cnt.innerText = this.data.content.text;
            }
            obj.appendChild(cnt);
        }
    }


}