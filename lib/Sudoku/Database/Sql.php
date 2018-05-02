<?php

namespace Sudoku\Database;

use PDO;
use Exception;

class Sql {

    private $db;

    public function __construct() {
        global $_CONFIG;
        if (!isset($_CONFIG)) {
            throw new Exception("Config must be loaded first");
        }

        $this->db = new PDO("mysql:dbname=" . $_CONFIG["mysql"]["database"] . ";host=" . $_CONFIG["mysql"]["host"] . ";charset=utf8", $_CONFIG["mysql"]["username"], $_CONFIG["mysql"]["password"]);
    }

    public function select(string $query, array $params = []) : array {
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function execute(string $query, array $params = []) {
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
    }

}