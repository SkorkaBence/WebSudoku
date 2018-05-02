<?php
require_once(__DIR__ . "/../../lib/autoload.php");
use Sudoku\Api\IO;
use Sudoku\Store\Texture;
use Sudoku\Database\Sql;

$texture_id = IO::get("id");
$sql = new Sql();
try {
    $texture = Texture::GetTextureById($sql, $texture_id);
    IO::print($texture->GetTextureData());
} catch (Exception $e) {
    IO::error($e->getMessage());
}
?>