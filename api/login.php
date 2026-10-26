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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password are required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Generate single active session token (invalidates any previous logins on other devices)
        $sessionToken = bin2hex(random_bytes(32));

        try {
            $upd = $pdo->prepare("UPDATE users SET session_token = :token, session_last_active = NOW() WHERE id = :id");
            $upd->execute([':token' => $sessionToken, ':id' => $user['id']]);
        } catch (PDOException $e) {
            // Auto-create column if missing on any environment
            $pdo->exec("ALTER TABLE users ADD COLUMN session_token VARCHAR(128) NULL DEFAULT NULL");
            $pdo->exec("ALTER TABLE users ADD COLUMN session_last_active TIMESTAMP NULL DEFAULT NULL");
            $upd = $pdo->prepare("UPDATE users SET session_token = :token, session_last_active = NOW() WHERE id = :id");
            $upd->execute([':token' => $sessionToken, ':id' => $user['id']]);
        }

        // Return user data including the unique active session token
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => (string)$user['id'],
                'username' => $user['username'],
                'fullName' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'avatarUrl' => $user['avatar_url'],
                'sessionToken' => $sessionToken
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid username or password']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}

?>
