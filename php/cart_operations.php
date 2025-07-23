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
$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Function to get cart items
function getCartItems($conn, $user_id) {
    $stmt = $conn->prepare("SELECT * FROM cart WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    return $items;
}

// Function to add item to cart
function addToCart($conn, $user_id, $item) {
    // Check if item already exists in cart
    $stmt = $conn->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param("is", $user_id, $item['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update quantity if item exists
        $row = $result->fetch_assoc();
        $new_quantity = $row['quantity'] + $item['quantity'];
        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
        $stmt->bind_param("ii", $new_quantity, $row['id']);
        return $stmt->execute();
    } else {
        // Insert new item
        $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, product_name, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issdss", 
            $user_id, 
            $item['id'], 
            $item['name'], 
            $item['quantity'], 
            $item['price'], 
            $item['image']
        );
        return $stmt->execute();
    }
}

// Function to update cart item quantity
function updateCartItem($conn, $user_id, $item_id, $quantity) {
    if ($quantity <= 0) {
        // Remove item if quantity is 0 or negative
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("is", $user_id, $item_id);
        return $stmt->execute();
    } else {
        // Update quantity
        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("iis", $quantity, $user_id, $item_id);
        return $stmt->execute();
    }
}

// Function to remove item from cart
function removeFromCart($conn, $user_id, $item_id) {
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param("is", $user_id, $item_id);
    return $stmt->execute();
}

// Handle different operations based on action
$action = $data['action'] ?? '';
$user_id = $_SESSION['user_id'];

try {
    switch ($action) {
        case 'get':
            $items = getCartItems($conn, $user_id);
            echo json_encode([
                'success' => true,
                'items' => $items
            ]);
            break;

        case 'add':
            if (!isset($data['item'])) {
                throw new Exception('Item data is required');
            }
            if (addToCart($conn, $user_id, $data['item'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Item added to cart'
                ]);
            } else {
                throw new Exception('Failed to add item to cart');
            }
            break;

        case 'update':
            if (!isset($data['item_id']) || !isset($data['quantity'])) {
                throw new Exception('Item ID and quantity are required');
            }
            if (updateCartItem($conn, $user_id, $data['item_id'], $data['quantity'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Cart updated'
                ]);
            } else {
                throw new Exception('Failed to update cart');
            }
            break;

        case 'remove':
            if (!isset($data['item_id'])) {
                throw new Exception('Item ID is required');
            }
            if (removeFromCart($conn, $user_id, $data['item_id'])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Item removed from cart'
                ]);
            } else {
                throw new Exception('Failed to remove item from cart');
            }
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    error_log("Cart operation error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?> 