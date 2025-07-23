<?php
require_once 'connect.php';

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

try {
    // Add city column
    $sql = "ALTER TABLE data ADD COLUMN city VARCHAR(100) AFTER address";
    if (!$conn->query($sql)) {
        throw new Exception("Failed to add city column: " . $conn->error);
    }
    echo "City column added successfully<br>";

    // Add postal_code column
    $sql = "ALTER TABLE data ADD COLUMN postal_code VARCHAR(20) AFTER city";
    if (!$conn->query($sql)) {
        throw new Exception("Failed to add postal_code column: " . $conn->error);
    }
    echo "Postal code column added successfully<br>";

    // Update existing records with default values
    $sql = "UPDATE data SET city = 'Manila' WHERE city IS NULL";
    if (!$conn->query($sql)) {
        throw new Exception("Failed to update city values: " . $conn->error);
    }
    echo "Default city values updated<br>";

    $sql = "UPDATE data SET postal_code = '1000' WHERE postal_code IS NULL";
    if (!$conn->query($sql)) {
        throw new Exception("Failed to update postal_code values: " . $conn->error);
    }
    echo "Default postal code values updated<br>";

    echo "Database update completed successfully!";

} catch (Exception $e) {
    error_log("Error updating database: " . $e->getMessage());
    echo "Error: " . $e->getMessage();
}

$conn->close();
?> 