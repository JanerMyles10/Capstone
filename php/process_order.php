<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Invalid input data');
    }

    // Validate required fields
    $required_fields = ['username', 'email', 'number', 'address', 'city', 'postal_code', 'payment_method', 'items', 'subtotal', 'shipping', 'tax', 'total'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert into orders table
        $stmt = $conn->prepare("
            INSERT INTO orders (
                user_id,
                username,
                email,
                number,
                address,
                city,
                postal_code,
                payment_method,
                subtotal,
                shipping,
                tax,
                total,
                order_date,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        $user_id = $_SESSION['user_id'] ?? null;

        $stmt->bind_param(
            "isssssssdddd",
            $user_id,
            $data['username'],
            $data['email'],
            $data['number'],
            $data['address'],
            $data['city'],
            $data['postal_code'],
            $data['payment_method'],
            $data['subtotal'],
            $data['shipping'],
            $data['tax'],
            $data['total']
        );

        $stmt->execute();
        $order_id = $conn->insert_id;

        // Insert order items
        $stmt = $conn->prepare("
            INSERT INTO order_items (
                order_id,
                product_id,
                product_name,
                quantity,
                price,
                image
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");

        foreach ($data['items'] as $item) {
            $stmt->bind_param(
                "iisids",
                $order_id,
                $item['product_id'],
                $item['name'],
                $item['quantity'],
                $item['price'],
                $item['image']
            );
            $stmt->execute();
        }

        // Remove items from cart
        if ($user_id) {
            $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
        }

        // Commit transaction
        $conn->commit();

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully'
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    // Return error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 