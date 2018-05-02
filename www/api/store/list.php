<?php
require_once(__DIR__ . "/../../../lib/autoload.php");
use Sudoku\Api\IO;
use Sudoku\Store\Texture;
use Sudoku\Store\StoreListings;
use Sudoku\Database\Sql;

$sql = new Sql();
IO::print(array_merge(
    StoreListings::ListProducts(Texture::GetAllTextures($sql))
));
?>