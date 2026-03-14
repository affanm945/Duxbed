<?php
/**
 * Database Configuration File
 * Duxbed Website Backend
 */

class Database {
    private $host = "localhost";
    private $db_name = "duxbed_website";
    private $username = "root";
    private $password = "Sulaikha945@";
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
        } catch(PDOException $exception) {
            $error_msg = "Database connection failed: " . $exception->getMessage();
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception($error_msg);
        }

        return $this->conn;
    }
}

