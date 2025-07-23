<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Please login to view order details');
    }

    // Get order ID from URL
    if (!isset($_GET['order_id'])) {
        throw new Exception('Order ID is required');
    }

    $orderId = intval($_GET['order_id']);
    $userId = $_SESSION['user_id'];

    // Get order details
    $stmt = $conn->prepare("
        SELECT o.*, oi.quantity, oi.price, p.name as product_name, p.image
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = ? AND o.user_id = ?
    ");
    
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }

    $stmt->bind_param("ii", $orderId, $userId);
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute query: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception('Failed to get result: ' . $stmt->error);
    }

    if ($result->num_rows === 0) {
        throw new Exception('Order not found');
    }

    // Process order items
    $items = [];
    $subtotal = 0;
    $shipping = 0;
    $orderDate = '';
    $status = '';

    while ($row = $result->fetch_assoc()) {
        if (empty($orderDate)) {
            $orderDate = $row['order_date'];
            $status = $row['status'] ?? 'Pending';
        }
        
        $items[] = [
            'name' => $row['product_name'],
            'quantity' => $row['quantity'],
            'price' => $row['price'],
            'image' => $row['image']
        ];
        $subtotal += $row['price'] * $row['quantity'];
    }

    // Calculate shipping (free for orders over $50)
    if ($subtotal < 50) {
        $shipping = 10;
    }

    $total = $subtotal + $shipping;

    // Format the response
    $response = [
        'success' => true,
        'order' => [
            'id' => $orderId,
            'date' => $orderDate,
            'status' => $status,
            'items' => $items,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total' => $total
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    error_log('Order fetch error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

if (isset($stmt)) {
    $stmt->close();
}
if (isset($conn)) {
    $conn->close();
}
?> 