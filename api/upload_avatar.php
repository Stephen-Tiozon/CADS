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
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Read raw body if application/json
$rawInput = file_get_contents('php://input');
$jsonData = json_decode($rawInput, true);

$userId = null;
if (isset($jsonData['userId'])) {
    $userId = (int)$jsonData['userId'];
} elseif (isset($_POST['userId'])) {
    $userId = (int)$_POST['userId'];
}

if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing userId']);
    exit();
}

$binaryData = null;
$ext = 'jpg';

// Case 1: Base64 JSON Payload (Bypasses InfinityFree WAF 403 blocks)
if (!empty($jsonData['avatar'])) {
    $avatarStr = $jsonData['avatar'];
    if (preg_match('/^data:image\/(\w+);base64,/', $avatarStr, $matches)) {
        $type = strtolower($matches[1]);
        if (in_array($type, ['jpeg', 'jpg', 'png', 'gif', 'webp'])) {
            $ext = ($type === 'jpeg') ? 'jpg' : $type;
        }
        $base64 = substr($avatarStr, strpos($avatarStr, ',') + 1);
        $binaryData = base64_decode($base64);
    } else {
        $binaryData = base64_decode($avatarStr);
    }
}
// Case 2: Standard Multipart File Upload
elseif (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['avatar'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, and GIF are allowed.']);
        exit();
    }
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $binaryData = file_get_contents($file['tmp_name']);
}

if (!$binaryData) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No valid image data received.']);
    exit();
}

// 5MB limit
if (strlen($binaryData) > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File size exceeds 5MB limit']);
    exit();
}

$filename = 'avatar_' . $userId . '_' . time() . '.' . $ext;
$uploadDir = __DIR__ . '/../uploads/avatars/';

// Ensure directory exists with writable permissions
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
}

$targetPath = $uploadDir . $filename;
$publicPath = '/uploads/avatars/' . $filename;

// Save file to disk
$saved = @file_put_contents($targetPath, $binaryData);

if ($saved !== false) {
    try {
        $stmt = $pdo->prepare("UPDATE users SET avatar_url = :avatar_url WHERE id = :id");
        $stmt->execute([
            ':avatar_url' => $publicPath,
            ':id' => $userId
        ]);
        echo json_encode(['success' => true, 'avatarUrl' => $publicPath]);
        exit();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        exit();
    }
} else {
    // Fallback: If disk write failed on free host due to filesystem permissions,
    // store the Base64 data URL directly in the database (since avatar_url is TEXT)
    try {
        $dataUrl = 'data:image/' . $ext . ';base64,' . base64_encode($binaryData);
        $stmt = $pdo->prepare("UPDATE users SET avatar_url = :avatar_url WHERE id = :id");
        $stmt->execute([
            ':avatar_url' => $dataUrl,
            ':id' => $userId
        ]);
        echo json_encode(['success' => true, 'avatarUrl' => $dataUrl]);
        exit();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save avatar image: ' . $e->getMessage()]);
        exit();
    }
}
?>
