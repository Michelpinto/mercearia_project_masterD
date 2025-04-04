<?php
require_once '../config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['customer_name'], $data['birth_date'], $data['address'], $data['items'])) {
    echo json_encode(["error" => "Invalid data"]);
    exit;
}

$customer_name = $conn->real_escape_string($data['customer_name']);
$birth_date = $conn->real_escape_string($data['birth_date']);
$address = $conn->real_escape_string($data['address']);

$conn->begin_transaction();

try {
    $sql = "INSERT INTO orders (customer_name, birth_date, address, total_price) VALUES ('$customer_name', '$birth_date', '$address', 0)";
    $conn->query($sql);
    $order_id = $conn->insert_id;

    $total_price = 0;

    foreach ($data['items'] as $item) {
        $product_id = (int) $item['product_id'];
        $quantity = (int) $item['quantity'];

        $product_query = $conn->query("SELECT name, price, quantity FROM products WHERE id = $product_id");
        if ($product_query->num_rows == 0) throw new Exception("Product not found");

        $product = $product_query->fetch_assoc();
        if ($product['quantity'] < $quantity) throw new Exception("Not enough stock");

        $subtotal = $product['price'] * $quantity;
        $total_price += $subtotal;

        $conn->query("INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_unit, subtotal) 
                      VALUES ($order_id, $product_id, '{$product['name']}', $quantity, {$product['price']}, $subtotal)");

        $conn->query("UPDATE products SET quantity = quantity - $quantity WHERE id = $product_id");
    }

    $conn->query("UPDATE orders SET total_price = $total_price WHERE id = $order_id");
    $conn->commit();

    echo json_encode(["message" => "Order placed successfully"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}
?>
