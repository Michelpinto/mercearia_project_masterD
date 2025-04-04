<?php
require_once '../config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name'], $data['quantity'], $data['price'])) {
    echo json_encode(["error" => "Invalid data"]);
    exit;
}

$name = $conn->real_escape_string($data['name']);
$quantity = (int) $data['quantity'];
$price = (float) $data['price'];

$sql = "INSERT INTO products (name, quantity, price) VALUES ('$name', $quantity, $price)";
if ($conn->query($sql)) {
    echo json_encode(["message" => "Product added successfully"]);
} else {
    echo json_encode(["error" => "Failed to add product"]);
}
?>
