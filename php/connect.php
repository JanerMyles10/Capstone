<?php
// Database connection parameters
$servername = "localhost";  // Change if needed (e.g., for remote DB)
$username = "root";         // Change to your database username
$password = "";             // Change to your database password
$dbname = "craft";          // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set the charset for better compatibility
$conn->set_charset("utf8mb4");
?>
