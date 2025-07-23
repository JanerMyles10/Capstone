<?php
session_start();
require_once 'connect.php';

// Set JSON header
header('Content-Type: application/json');

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Debug session
error_log("Checking login status. Session contents: " . print_r($_SESSION, true));

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    error_log("No user_id in session");
    echo json_encode([
        'logged_in' => false,
        'message' => 'Not logged in'
    ]);
    exit;
}

// Verify user exists in database
$check_user = $conn->prepare("SELECT id FROM data WHERE id = ?");
if ($check_user === false) {
    error_log("Failed to prepare user check statement: " . $conn->error);
    echo json_encode([
        'logged_in' => false,
        'message' => 'Database error'
    ]);
    exit;
}

$check_user->bind_param("i", $_SESSION['user_id']);
$check_user->execute();
$result = $check_user->get_result();

if ($result->num_rows === 0) {
    error_log("User ID " . $_SESSION['user_id'] . " not found in database");
    echo json_encode([
        'logged_in' => false,
        'message' => 'User not found'
    ]);
    exit;
}

error_log("User is logged in with ID: " . $_SESSION['user_id']);
echo json_encode([
    'logged_in' => true,
    'user_id' => $_SESSION['user_id']
]);

$check_user->close();
$conn->close();
?> 