<?php

namespace Sudoku\Users;

use Sudoku\Database\Sql;
use Exception;

class Account {

    private $db;
    private $id;
    private $coins = 0;

    public function __construct(Sql $sql, string $id) {
        $this->db = $sql;
        $this->id = $id;
    }

    private function LoadUserData() {
        $userdata = $this->db->select("SELECT * FROM users WHERE csf_id=:id", [
            ":id" => $this->id
        ]);
        if (count($userdata) < 1) {
            $this->db->execute("INSERT INTO users (csf_id) VALUES (:id)", [
                ":id" => $this->id
            ]);
        } else {
            $coins = intval($userdata[0]["coins"]);
        }
    }

    public function GetCoins() : int {
        return $this->coins;
    }

}