<?php
require_once 'auth_check.php';
require_once '../config.php';

header('Content-Type: application/json');

$sql = "SELECT * FROM orders ORDER BY created_at DESC";
$result = $conn->query($sql);

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

echo json_encode($orders);
?>
