<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

// Guarda el mensaje de un asistente para la pizarra. Queda "en revisión" hasta que se aprueba en el panel.

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
