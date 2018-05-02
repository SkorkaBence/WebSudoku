<?php

namespace Sudoku\Store;

use Sudoku\Database\Sql;
use Exception;

class Texture extends StoreProduct {

    private $parameters;
    private $data;

    public function __construct(array $data) {
        $this->parameters = $data;
        $this->data = json_decode($data["data"], true);
    }

    public static function GetTextureById(Sql $sql, string $id) : Texture {
        $texturedata = $sql->select("SELECT * FROM textures WHERE id=:id", [
            ":id" => $id
        ]);
        if (count($texturedata) != 1) {
            throw new Exception("Invalid ID");
        }
        return new Texture($texturedata[0]);
    }

    public static function GetAllTextures(Sql $sql) : array {
        $textures = [];
        $texturedata = $sql->select("SELECT * FROM textures ORDER BY rand()");
        foreach ($texturedata as $tex) {
            $textures[] = new Texture($tex);
        }
        return $textures;
    }

    public function GetId() : string {
        return $this->parameters["id"];
    }

    public function GetName() : string {
        return $this->data["name"];
    }

    public function GetIcon() : string {
        return $this->data["icon"];
    }

    public function GetPrice() : int {
        return $this->parameters["price"];
    }

    public function GetTextureData($who = null) : array {
        if ($this->parameters["price"] != 0) {
            if ($who == null) {
                throw new Exception("You must be logged in to access this resource");
            }
            
        }
        return $this->data;
    }

}