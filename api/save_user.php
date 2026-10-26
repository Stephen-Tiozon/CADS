<?php
require_once 'db.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['requesterId'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid request data or missing requester authentication.']);
    exit;
}

try {
    // Security Hardening: Verify requester is an Admin
    $adminStmt = $pdo->prepare("SELECT role FROM users WHERE id = :rid");
    $adminStmt->execute([':rid' => $data['requesterId']]);
    $requester = $adminStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$requester || $requester['role'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Access Denied: Only administrators can modify users.']);
        exit;
    }
    if (!empty($data['id'])) {
        // Update user
        if (!empty($data['password'])) {
            $hash = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET username = :username, full_name = :full_name, email = :email, role = :role, password_hash = :ph WHERE id = :id");
            $stmt->execute([
                ':username' => $data['username'],
                ':full_name' => $data['fullName'],
                ':email' => $data['email'] ?? null,
                ':role' => $data['role'],
                ':ph' => $hash,
                ':id' => $data['id']
            ]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET username = :username, full_name = :full_name, email = :email, role = :role WHERE id = :id");
            $stmt->execute([
                ':username' => $data['username'],
                ':full_name' => $data['fullName'],
                ':email' => $data['email'] ?? null,
                ':role' => $data['role'],
                ':id' => $data['id']
            ]);
        }
    } else {
        // Insert new user
        $hash = password_hash(!empty($data['password']) ? $data['password'] : 'password123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, full_name, email, role) VALUES (:username, :ph, :full_name, :email, :role)");
        $stmt->execute([
            ':username' => $data['username'],
            ':ph' => $hash,
            ':full_name' => $data['fullName'],
            ':email' => $data['email'] ?? null,
            ':role' => $data['role']
        ]);
    }
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
