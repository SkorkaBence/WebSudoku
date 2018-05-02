<?php

namespace Sudoku;

class AutoLoader {
    public static $prefix = __NAMESPACE__;
    public static $prefixLength;

    public static function load($class) {
        //If called with a class from another namespace (shouldn't happen too often if register is after composer's register)
        if(strpos($class, self::$prefix) !== 0) return false;

        //Remove root Namespace from the begining and replace \ with the correct separator for the operating system
        $file =  __DIR__  . substr(strtr($class, '\\', DIRECTORY_SEPARATOR), self::$prefixLength) . ".php";
        //echo $class . " ";
        //echo $file;
        if(file_exists($file)) {
            require_once($file);
            return true;
        } else {
            return false;
        }
    }

    public static function register() {
        self::$prefixLength = strlen(self::$prefix);
        spl_autoload_register(["self", "load"]);
    }
}