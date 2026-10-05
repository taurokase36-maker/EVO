<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

// Guarda el mensaje de un asistente para la pizarra. Queda "en revisión" hasta que se aprueba en el panel.

// Mensaje desde la portada (pizarra pública): sin entrada, con nombre, límite por hora y moderación.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['public'] ?? '') === '1') {
    $home = fn(string $msg) => redirect('./?pz=' . $msg . '#pizarra');
    if (!cfg('wall.public', false)) {
        $home('cerrada');
    }
    if (!csrf_ok($_POST['csrf'] ?? null)) {
        $home('expirado');
    }
    if (trim((string) ($_POST['web'] ?? '')) !== '') {
        $home('ok');  // campo trampa: solo lo completan los bots
    }
    $body = clean_text((string) ($_POST['body'] ?? ''), MESSAGE_MAX);
    $author = first_name(clean_text((string) ($_POST['name'] ?? ''), 40));
    if (mb_strlen($body) < 2 || mb_strlen($author) < 2) {
        $home('vacio');
    }
    // Límite por conexión: se guarda un hash de la IP, nunca la IP.
    $who = 'web-' . substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . __DIR__), 0, 12);
    $recent = (int) q(
        'SELECT COUNT(*) FROM messages WHERE owner LIKE ? AND created_at >= ?',
        [$who . '-%', date('Y-m-d H:i:s', time() - 3600)]
    )->fetchColumn();
    if ($recent >= max(1, (int) cfg('wall.per_hour', 3))) {
        $home('limite');
    }
    q(
        'INSERT INTO messages (id, owner, author, body, created_at) VALUES (?, ?, ?, ?, ?)',
        ['MS-' . rand_code(4) . '-' . rand_code(4), $who . '-' . rand_code(8), $author, $body, now()]
    );
    $home('ok');
}

$token = preg_replace('/[^a-f0-9]/', '', (string) ($_POST['t'] ?? '')) ?? '';
$back = fn(string $q) => redirect('ticket.php?t=' . rawurlencode($token) . $q . '#pizarra');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $token === '') {
    redirect('./');
}
$order = order_by('token', $token);
$pass = $order ? null : pass_by_token($token);
if ((!$order || $order['status'] !== 'approved') && !$pass) {
    message_page('entrada no encontrada', '<p>Solo pueden escribir quienes tienen entrada, lista o invitación.</p>', '', 404);
}
if (!csrf_ok($_POST['csrf'] ?? null)) {
    $back('&msg=expirado');
}
if (message_for($token)) {
    $back('&msg=ya');
}

$body = clean_text((string) ($_POST['body'] ?? ''), MESSAGE_MAX);
if (mb_strlen($body) < 2) {
    $back('&msg=vacio');
}
$author = first_name($order ? $order['name'] : $pass['name']);

try {
    q(
        'INSERT INTO messages (id, owner, author, body, created_at) VALUES (?, ?, ?, ?, ?)',
        ['MS-' . rand_code(4) . '-' . rand_code(4), $token, $author, $body, now()]
    );
} catch (PDOException $ex) {
    $back('&msg=ya');  // ya había uno para esta entrada (dos envíos al mismo tiempo)
}
$back('&msg=ok');
