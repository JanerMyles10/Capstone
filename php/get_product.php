<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

try {
    if (!isset($_GET['id'])) {
        throw new Exception('Product ID is required');
    }

    $productId = intval($_GET['id']);

    // Check if product ID is valid
    if ($productId <= 0) {
        throw new Exception('Invalid product ID');
    }

    // Prepare and execute the query
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }

    $stmt->bind_param("i", $productId);
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute query: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception('Failed to get result: ' . $stmt->error);
    }

    if ($result->num_rows === 0) {
        throw new Exception('Product not found');
    }

    $product = $result->fetch_assoc();
    if (!$product) {
        throw new Exception('Failed to fetch product data');
    }

    // Format the response
    $response = [
        'success' => true,
        'product' => [
            'id' => $product['id'],
            'name' => $product['name'],
            'price' => $product['price'],
            'image' => $product['image'],
            'rating' => $product['rating'] ?? 5.0,
            'origin' => $product['origin'] ?? 'Made in Philippines',
            'description' => $product['description']
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    error_log('Product fetch error: ' . $e->getMessage());
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