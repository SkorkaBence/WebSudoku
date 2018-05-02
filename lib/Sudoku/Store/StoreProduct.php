<?php

namespace Sudoku\Store;

abstract class StoreProduct {

    public abstract function GetId() : string;
    public abstract function GetName() : string;
    public abstract function GetIcon() : string;
    public abstract function GetPrice() : int;

    public function ToJsonPreview() {
        return [
            "id" => $this->GetId(),
            "name" => $this->GetName(),
            "icon" => $this->GetIcon(),
            "price" => $this->GetPrice()
        ];
    }

}