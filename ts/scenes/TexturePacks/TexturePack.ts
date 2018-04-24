/*
    scenes/TexturePack.ts - TexturePack creator
    Copyright (c) 2018 Bence Skorka. All rights reserved.
    https://github.com/SkorkaBence/WebSudoku
*/

interface TexturePackData {
    name : string;
    description : string;
    creator : string;
    icon : string;
    randomize : boolean;

    generator? : TexturePackCellData;
    cells? : TexturePackCellData[];
}

interface TexturePackCellData {
    background? : TexturePackCellBackgroundData;
    content? : TexturePackCellContentData;
}

interface TexturePackCellBackgroundData {
    color? : string;
    image? : string;
    image_size? : string;
}

interface TexturePackCellContentData {
    text? : string;
    color? : string;
}

class TexturePack {

    private data : TexturePackData;

    public constructor(data : TexturePackData) {
        this.data = data;
    }

    public ExportData() : TexturePackData {
        return this.data;
    }

    public GetMaxCellNumber() : number {
        if (this.data.generator) {
            return Infinity;
        } else if (this.data.cells) {
            return this.data.cells.length;
        } else {
            throw new Error("Invalid package");
        }
    }

    public GenerateTextures(numberOfCells : number) : CellTexture[] {
        let textures : CellTexture[] = [];

        if (this.data.generator) {
            const template = this.data.generator;
            for (let i = 0; i < numberOfCells; ++i) {
                let instance = (DeepCloneObject(template) as TexturePackCellData);
                if (instance.content) {
                    if (instance.content.text) {
                        if (instance.content.text.indexOf("@generated") == 0) {
                            let t = instance.content.text.replace("@generated", "");
                            if (t == "{cell_id}") {
                                instance.content.text = (i + 1) + "";
                            }
                        }
                    }
                }
                textures.push(new CellTexture(instance));
            }
        } else if (this.data.cells) {
            let indexes : number[] = [];
            for (let i = 0; i < this.data.cells.length; ++i) {
                indexes.push(i);
            }
            if (this.data.randomize) {
                indexes = shuffle(indexes);
            }
    
            for (let i = 0; i < numberOfCells; ++i) {
                textures.push(new CellTexture(this.data.cells[indexes[i]]));
            }
        }

        return textures;
    }
}

class TextureParser {

    public static Parse(filename : string) : Promise<TexturePack> {
        return fetch("textures/" + filename + ".json").then(function(response) {
            return response.json();
        }).then(function(data) {
            return new TexturePack(data);
        });
    }

}