<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('./#entradas');
}
$back = fn(string $msg) => redirect('./?error=' . rawurlencode($msg) . '#entradas');

if (!csrf_ok($_POST['csrf'] ?? null)) {
    $back('La página estuvo abierta mucho tiempo. Probá de nuevo.');
}

$tier = tiers()[(string) ($_POST['tier'] ?? '')] ?? null;
$qty = (int) ($_POST['qty'] ?? 0);
$name = clean_text((string) ($_POST['name'] ?? ''), 120);
$email = clean_email((string) ($_POST['email'] ?? ''));
$ref = clean_ref((string) ($_POST['ref'] ?? ''));

if (!$tier) {
    $back('Elegí una entrada.');
}
if (tier_link($tier) !== '') {   // modo simple: esa entrada se paga con el link de Mercado Pago
    redirect(tier_link($tier));
}
if ($qty < 1 || $qty > (int) cfg('max_per_order', 4)) {
    $back('Cantidad inválida.');
}
if (mb_strlen($name) < 3 || !$email) {
    $back('Revisá tu nombre y tu mail.');
}

$order = [];
db()->beginTransaction();
try {
    $state = tier_state($tier);
    if (!$state['open']) {
        db()->rollBack();
        $back('La entrada ' . $tier['name'] . ' está ' . $state['label'] . '.');
    }
    if ($state['left'] < $qty) {
        db()->rollBack();
        $back('Quedan ' . $state['left'] . ' entradas ' . $tier['name'] . '.');
    }
    $unit = (int) $tier['price'];
    $fee = fee_for($unit * $qty);
    $order = [
        'id' => 'SU-' . rand_code(4) . '-' . rand_code(4),
        'token' => new_token(),
        'tier' => $tier['id'], 'qty' => $qty, 'unit_price' => $unit, 'fee' => $fee, 'total' => $unit * $qty + $fee,
        'name' => $name, 'email' => $email, 'ref' => $ref, 'created_at' => now(),
    ];
    q(
        'INSERT INTO orders (id, token, tier, qty, unit_price, fee, total, name, email, ref, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [$order['id'], $order['token'], $order['tier'], $qty, $unit, $fee, $order['total'], $name, $email, $ref, $order['created_at']]
    );
    db()->commit();
} catch (Throwable $ex) {
    if (db()->inTransaction()) {
        db()->rollBack();
    }
    log_line('checkout: ' . $ex->getMessage());
    $back('No pudimos reservar tu entrada. Probá de nuevo.');
}

// Modo demo: se aprueba sin pasar por Mercado Pago
if (demo()) {
    apply_payment(['id' => 'DEMO', 'status' => 'approved', 'external_reference' => $order['id'], 'transaction_amount' => $order['total'], 'currency_id' => 'ARS']);
    redirect('gracias.php?external_reference=' . rawurlencode($order['id']));
}

try {
    $pref = mp_create_preference($order, $tier);
    q('UPDATE orders SET mp_preference = ? WHERE id = ?', [(string) ($pref['id'] ?? ''), $order['id']]);
    redirect((string) $pref['init_point']);
} catch (Throwable $ex) {
    q("UPDATE orders SET status = 'cancelled' WHERE id = ?", [$order['id']]);
    log_line('preferencia: ' . $ex->getMessage());
    $back('No pudimos conectar con Mercado Pago. Probá de nuevo en un minuto.');
}
