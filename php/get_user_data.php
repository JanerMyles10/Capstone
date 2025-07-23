<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

try {
    // Prepare statement to get user data
    $stmt = $conn->prepare("SELECT username, email, number, address, city, postal_code FROM data WHERE id = ?");
    
    if ($stmt === false) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param("i", $_SESSION['user_id']);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute statement: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user) {
        echo json_encode([
            'success' => true,
            'user' => [
                'username' => $user['username'],
                'email' => $user['email'],
                'number' => $user['number'],
                'address' => $user['address'],
                'city' => $user['city'],
                'postal_code' => $user['postal_code'],
            ]
        ]);
    } else {
        throw new Exception("User not found");
    }

} catch (Exception $e) {
    error_log("Error fetching user data: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching user data: ' . $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?> 