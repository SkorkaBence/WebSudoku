<?php

namespace Sudoku\Api;

use Exception;

class IO {

    private static $can_print = true;
    private static $response_code = 200;

    public static function get(string $key) {
        if (!isset($_GET[$key])) {
            self::error("Missing parameter: " . $key);
        }
        return $_GET[$key];
    }

    public static function print($data) {
        if (!self::$can_print) {
            throw new Exception("Only one IP print is allowed per session");
        }

        http_response_code(self::$response_code);
        header("Content-type: application/json; charset=utf-8");
        echo json_encode($data, JSON_PRETTY_PRINT);

        self::$can_print = false;
    }

    public static function error($message) {
        self::$response_code = 400;
        self::print([
            "error" => $message
        ]);
        exit;
    }

}