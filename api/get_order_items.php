<?php
require_once '../config.php';
header('Content-Type: application/json');

$sql = "SELECT * FROM order_items ORDER BY order_id";
$result = $conn->query($sql);

$orderItems = [];
while ($row = $result->fetch_assoc()) {
    $orderItems[] = $row;
}

echo json_encode($orderItems);
?>
