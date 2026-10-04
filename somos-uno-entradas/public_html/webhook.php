<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';

// Mercado Pago avisa acá cada vez que cambia un pago.
// Siempre volvemos a consultar el pago a la API, así nadie puede falsificar una aprobación.

$raw = (string) file_get_contents('php://input');
$body = json_decode($raw, true) ?: [];
$type = (string) ($body['type'] ?? ($_GET['type'] ?? ($_GET['topic'] ?? '')));
$id = (string) ($body['data']['id'] ?? ($_GET['data_id'] ?? ($_GET['id'] ?? '')));

// Validación opcional de firma (Webhooks → clave secreta)
$secret = (string) cfg('mercadopago.webhook_secret', '');
if ($secret !== '' && isset($_SERVER['HTTP_X_SIGNATURE'])) {
    $parts = [];
    foreach (explode(',', (string) $_SERVER['HTTP_X_SIGNATURE']) as $kv) {
        [$k, $v] = array_pad(explode('=', trim($kv), 2), 2, '');
        $parts[$k] = $v;
    }
    $dataId = strtolower((string) ($_GET['data_id'] ?? $id));
    $manifest = 'id:' . $dataId . ';request-id:' . ($_SERVER['HTTP_X_REQUEST_ID'] ?? '') . ';ts:' . ($parts['ts'] ?? '') . ';';
    if (!hash_equals(hash_hmac('sha256', $manifest, $secret), (string) ($parts['v1'] ?? ''))) {
        log_line('webhook: firma inválida');
        http_response_code(401);
        exit('firma inválida');
    }
}

if ($type === 'payment' && ctype_digit($id)) {
    try {
        apply_payment(mp_request('GET', '/v1/payments/' . $id));
    } catch (Throwable $ex) {
        log_line('webhook: ' . $ex->getMessage());
        http_response_code(500);  // Mercado Pago reintenta
        exit('error');
    }
}

http_response_code(200);
echo 'ok';
