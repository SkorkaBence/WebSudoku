<?php
define("ROOT_DIR", __DIR__ . "/..");

require_once(ROOT_DIR . "/config.php");

require_once(__DIR__ . "/vendor/autoload.php");

require_once(__DIR__ . "/Sudoku/AutoLoader.php");
Sudoku\AutoLoader::register();