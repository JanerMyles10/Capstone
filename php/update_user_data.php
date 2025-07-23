<?php
session_start();
require_once 'connect.php';

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Set JSON header
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Please log in first'
    ]);
    exit;
}

// Get JSON data from request
$json = file_get_contents('php://input');
error_log("Raw JSON received: " . $json);

$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON decode error: " . json_last_error_msg());
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Log decoded data
error_log("Decoded data: " . print_r($data, true));

// Validate required fields
$required_fields = ['username', 'number', 'email', 'address', 'city', 'postal_code'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        error_log("Missing required field: " . $field);
        echo json_encode([
            'success' => false,
            'message' => "Missing required field: $field"
        ]);
        exit;
    }
}

try {
    // Update user data in database
    $stmt = $conn->prepare("
        UPDATE data 
        SET username = ?, 
            number = ?, 
            email = ?, 
            address = ?, 
            city = ?, 
            postal_code = ?
        WHERE id = ?
    ");

    if ($stmt === false) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    error_log("Preparing to bind parameters");
    $stmt->bind_param(
        "ssssssi",
        $data['username'],
        $data['number'],
        $data['email'],
        $data['address'],
        $data['city'],
        $data['postal_code'],
        $_SESSION['user_id']
    );

    if (!$stmt->execute()) {
        throw new Exception("Failed to update address: " . $stmt->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Address updated successfully'
    ]);

} catch (Exception $e) {
    error_log("Error updating address: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

if (isset($stmt)) {
    $stmt->close();
}
$conn->close();
?> 