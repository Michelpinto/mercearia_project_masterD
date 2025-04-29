<?php
require_once '../config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['fullName'], $data['dateOfBirth'], $data['address'], $data['items']) ||
    !is_array($data['items']) ||
    count($data['items']) === 0
) {
    echo json_encode(["error" => "Missing required fields or no items provided"]);
    exit;
}

$fullName    = $conn->real_escape_string($data['fullName']);
$dateOfBirth = $conn->real_escape_string($data['dateOfBirth']);
$address     = $conn->real_escape_string($data['address']);

$total_price = 0;
foreach ($data['items'] as $item) {
    if (!isset($item['product_id'], $item['quantity'], $item['price'])) {
        echo json_encode(["error" => "Missing required fields in items"]);
        exit;
    }
    $quantity = (int)$item['quantity'];
    $price    = (float)$item['price'];
    $subtotal = $quantity * $price;
    $total_price += $subtotal;
}

$sql = "INSERT INTO orders (customer_name, birth_date, address, total_price) 
        VALUES ('$fullName', '$dateOfBirth', '$address', $total_price)";

if (!$conn->query($sql)) {
    echo json_encode(["error" => "Failed to add order: " . $conn->error]);
    exit;
}

$order_id = $conn->insert_id;

foreach ($data['items'] as $item) {
    $product_id   = (int)$item['product_id'];
    $productName  = isset($item['product_name']) ? $conn->real_escape_string($item['product_name']) : '';
    $quantity     = (int)$item['quantity'];
    $price_per_unit = (float)$item['price'];
    $subtotal     = $quantity * $price_per_unit;
    
    $sql_item = "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_unit, subtotal)
                 VALUES ($order_id, $product_id, '$productName', $quantity, $price_per_unit, $subtotal)";
                 
    if (!$conn->query($sql_item)) {
        echo json_encode(["error" => "Failed to insert order item: " . $conn->error]);
        exit;
    }
}

echo json_encode([
    "message" => "Order placed successfully", 
    "orderId" => $order_id
]);
?>
