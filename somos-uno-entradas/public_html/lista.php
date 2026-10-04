<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('./#lista');
}
$back = fn(string $msg) => redirect('./?error=' . rawurlencode($msg) . '#lista');

if (!csrf_ok($_POST['csrf'] ?? null)) {
    $back('La página estuvo abierta mucho tiempo. Probá de nuevo.');
}
$state = lista_state();
if (!$state['open']) {
    $back(ucfirst($state['label']) . '.');
}

$name = clean_text((string) ($_POST['name'] ?? ''), 120);
$email = clean_email((string) ($_POST['email'] ?? ''));
if (mb_strlen($name) < 3 || !$email) {
    $back('Revisá tu nombre y tu mail.');
}
$ref = clean_ref((string) ($_POST['who'] ?? '')) ?: clean_ref((string) ($_POST['ref'] ?? ''));

$pass = create_pass('lista', $name, $email, $ref);
redirect('ticket.php?t=' . rawurlencode($pass['token']) . '&nueva=1');
