<?php
session_start();
require_once 'connect.php';

header('Content-Type: application/json');

try {
    // Get all products
    $result = $conn->query("SELECT * FROM products");
    if (!$result) {
        throw new Exception('Failed to fetch products: ' . $conn->error);
    }

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'price' => $row['price'],
            'image' => $row['image'],
            'rating' => $row['rating'] ?? 5.0,
            'origin' => $row['origin'] ?? 'Made in Philippines',
            'description' => $row['description']
        ];
    }

    echo json_encode([
        'success' => true,
        'products' => $products
    ]);

} catch (Exception $e) {
    error_log('Products fetch error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 