<?php
require_once 'connect.php';

header('Content-Type: application/json');

try {
    // Check if products table exists
    $result = $conn->query("SHOW TABLES LIKE 'products'");
    if ($result->num_rows === 0) {
        throw new Exception('Products table does not exist');
    }

    // Get table structure
    $result = $conn->query("DESCRIBE products");
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
    }

    // Get sample data
    $result = $conn->query("SELECT * FROM products LIMIT 1");
    $sample = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'table_exists' => true,
        'columns' => $columns,
        'sample_data' => $sample
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 