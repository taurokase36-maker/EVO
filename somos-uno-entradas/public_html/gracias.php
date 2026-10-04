<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

$orderId = (string) ($_GET['external_reference'] ?? '');
$paymentId = (string) ($_GET['payment_id'] ?? ($_GET['collection_id'] ?? ''));

// Confirmamos el pago directo con Mercado Pago (no confiamos en los parámetros de la URL)
if (!demo() && $orderId !== '' && ctype_digit($paymentId)) {
    try {
        $p = mp_request('GET', '/v1/payments/' . $paymentId);
        if ((string) ($p['external_reference'] ?? '') === $orderId) {
            apply_payment($p);
        }
    } catch (Throwable $ex) {
        log_line('gracias: ' . $ex->getMessage());
    }
}

$order = $orderId !== '' ? order_by('id', $orderId) : null;
if (!$order) {
    message_page('no encontramos tu compra', '<p>Si pagaste y no te llegó el mail, escribinos a <a href="mailto:' . e(cfg('brand.contact_email')) . '">' . e(cfg('brand.contact_email')) . '</a>.</p><p><a class="btn btn-ghost" href="./">volver</a></p>');
}

if ($order['status'] === 'approved') {
    redirect('ticket.php?t=' . rawurlencode($order['token']) . '&nueva=1');
}

if ($order['status'] === 'pending') {
    message_page(
        'estamos confirmando tu pago',
        '<p>Mercado Pago todavía no nos confirmó el pago. Suele tardar unos segundos.</p>'
        . '<p>Apenas se apruebe te llega la entrada a <b>' . e($order['email']) . '</b>.</p>'
        . '<p><a class="btn btn-solid" href="gracias.php?external_reference=' . e(rawurlencode($order['id'])) . '">actualizar</a></p>'
    );
}

message_page(
    'el pago no se completó',
    '<p>No se cobró nada. Podés intentar de nuevo con otro medio de pago.</p><p><a class="btn btn-solid" href="./#entradas">volver a intentar</a></p>'
);
