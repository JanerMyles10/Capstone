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

try {
    // Get orders for the current user
    $stmt = $conn->prepare("
        SELECT o.*, 
               GROUP_CONCAT(
                   CONCAT(oi.product_name, '|', oi.quantity, '|', oi.price, '|', oi.image)
                   SEPARATOR '||'
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.order_date DESC
    ");

    if ($stmt === false) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param("i", $_SESSION['user_id']);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to fetch orders: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $orders = [];

    while ($row = $result->fetch_assoc()) {
        // Parse items string into array
        $items = [];
        if ($row['items']) {
            $itemGroups = explode('||', $row['items']);
            foreach ($itemGroups as $group) {
                list($name, $quantity, $price, $image) = explode('|', $group);
                $items[] = [
                    'name' => $name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'image' => $image
                ];
            }
        }

        $orders[] = [
            'id' => $row['id'],
            'order_date' => $row['order_date'],
            'total' => $row['total'],
            'status' => $row['status'] ?? 'Pending',
            'items' => $items
        ];
    }

    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);

} catch (Exception $e) {
    error_log("Error fetching orders: " . $e->getMessage());
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