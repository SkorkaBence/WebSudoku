<?php

namespace Sudoku\Store;

use Sudoku\Store\StoreProduct;

class StoreListings {

    public static function ListProducts(array $list) : array {
        $data = [];
        foreach ($list as $product) {
            if ($product instanceof StoreProduct) {
                $data[] = $product->ToJsonPreview();
            }
        }
        return $data;
    }

}