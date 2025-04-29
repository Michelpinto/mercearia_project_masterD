<?php
require_once 'auth_check.php';
require_once '../config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'], $data['name'], $data['price'], $data['quantity'], $data['category'])) {
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$id = (int)$data['id'];
$name = $conn->real_escape_string($data['name']);
$price = (float)$data['price'];
$quantity = (int)$data['quantity'];
$category = $conn->real_escape_string($data['category']);
$image = isset($data['image']) ? $conn->real_escape_string($data['image']) : '';

$sql = "UPDATE products 
        SET name = '$name', 
            price = $price, 
            quantity = $quantity, 
            category = '$category', 
            image = '$image'
        WHERE id = $id";

if ($conn->query($sql)) {
    echo json_encode(["message" => "Product updated successfully"]);
} else {
    echo json_encode(["error" => "Error updating product: " . $conn->error]);
}
?>
