<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Please login to make a purchase');
    }

    // Get POST data
    $data = json_decode(file_get_contents('php/input'), true);
    
    if (!isset($data['product_id']) || !isset($data['quantity'])) {
        throw new Exception('Missing required purchase information');
    }

    $productId = intval($data['product_id']);
    $quantity = intval($data['quantity']);
    $userId = $_SESSION['user_id'];

    // Start transaction
    $conn->begin_transaction();

    try {
        // Check product availability
        $stmt = $conn->prepare("SELECT price, stock FROM products WHERE id = ? AND stock >= ?");
        $stmt->bind_param("ii", $productId, $quantity);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Product not available in requested quantity');
        }

        $product = $result->fetch_assoc();
        $totalAmount = $product['price'] * $quantity;

        // Create order
        $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')");
        $stmt->bind_param("id", $userId, $totalAmount);
        $stmt->execute();
        $orderId = $conn->insert_id;

        // Add order items
        $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiid", $orderId, $productId, $quantity, $product['price']);
        $stmt->execute();

        // Update product stock
        $stmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        $stmt->bind_param("ii", $quantity, $productId);
        $stmt->execute();

        // Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Purchase successful',
            'order_id' => $orderId
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log('Purchase error: ' . $e->getMessage());
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