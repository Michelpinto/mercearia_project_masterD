<?php
session_start();

require_once '../config.php'; 

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['password'])) {
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

$username = trim($data['username']);
$password = $data['password']; 

if (empty($username) || empty($password)) {
    echo json_encode(["error" => "Username and password cannot be empty"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
if (!$stmt) {
    error_log("Prepare failed: (" . $conn->errno . ") " . $conn->error);
    echo json_encode(["error" => "Database error"]);
    exit;
}

$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if ($password === $user['password']) {
        session_regenerate_id(true);
        $_SESSION['is_admin_logged_in'] = true;
        $_SESSION['admin_user_id'] = $user['id'];
        $_SESSION['admin_username'] = $user['username'];

        echo json_encode(["message" => "Login successful"]);
    } else {
        echo json_encode(["error" => "Incorrect password"]);
    }
} else {
    echo json_encode(["error" => "User not found"]);
}

$stmt->close();
$conn->close(); 
?>