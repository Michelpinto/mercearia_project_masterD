<?php
require_once '../config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name'], $data['quantity'], $data['price'], $data['category'])) {
    echo json_encode(["error" => "Invalid data"]);
    exit;
}

$name = $conn->real_escape_string($data['name']);
$quantity = (int)$data['quantity'];
$price = (float)$data['price'];
$category = $conn->real_escape_string($data['category']);
$image = isset($data['image']) ? $conn->real_escape_string($data['image']) : '';

$sql = "INSERT INTO products (name, category, image, quantity, price) 
        VALUES ('$name', '$category', '$image', $quantity, $price)";

if ($conn->query($sql)) {
    echo json_encode([
        "message" => "Product added successfully",
        "id" => $conn->insert_id
    ]);
} else {
    echo json_encode(["error" => "Failed to add product: " . $conn->error]);
}
?>
