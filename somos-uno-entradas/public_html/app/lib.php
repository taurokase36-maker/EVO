<?php
declare(strict_types=1);

// ---------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------
// Si todavía no existe config.php, se usa el ejemplo (en modo demo) para que el sitio funcione apenas se sube.
$__cfgFile = is_file(__DIR__ . '/config.php') ? __DIR__ . '/config.php' : __DIR__ . '/config.example.php';
$GLOBALS['CFG'] = require $__cfgFile;
if (basename($__cfgFile) === 'config.example.php') {
    $GLOBALS['CFG']['demo_mode'] = true;
}
date_default_timezone_set((string) cfg('timezone', 'America/Argentina/Buenos_Aires'));

function cfg(string $path, $default = null)
{
    $v = $GLOBALS['CFG'];
    foreach (explode('.', $path) as $k) {
        if (!is_array($v) || !array_key_exists($k, $v)) {
            return $default;
        }
        $v = $v[$k];
    }
    return $v;
}

/** Nombre del evento: "THE SUN · release party". */
function event_name(): string
{
    $sub = (string) cfg('event.subhead', '');
    return (string) cfg('event.headline', '') . ($sub !== '' ? ' · ' . $sub : '');
}

/** Con quién lo presenta: "somos uno × melt underground presentan THE SUN · release party". */
function event_full(): string
{
    return trim(cfg('event.kicker', '') . ' ' . event_name());
}

/** Modo demo: lo que diga el panel (si se tocó el interruptor) o, si no, config.php. */
function demo(): bool
{
    $v = setting('demo_mode');
    return $v === null ? (bool) cfg('demo_mode', false) : $v === '1';
}

/** Access Token de Mercado Pago: el cargado desde el panel o, si no, el de config.php. */
function mp_token(): string
{
    return (string) (setting('mp_token') ?? cfg('mercadopago.access_token', ''));
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function e($s): string { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function money(int $n): string { return '$' . number_format($n, 0, ',', '.'); }
function now(): string { return date('Y-m-d H:i:s'); }
function base_url(): string
{
    $configured = rtrim((string) cfg('site_url', ''), '/');
    if ($configured !== '') {
        return $configured;
    }
    // Detecta el dominio y la carpeta del sitio (sirve también desde /admin)
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    $host = preg_replace('/[^a-z0-9.:\-]/i', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost'));
    $dir = str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/')));
    $dir = preg_replace('#/admin$#', '', rtrim($dir, '/'));
    return ($https ? 'https' : 'http') . '://' . $host . $dir;
}
function url(string $path = ''): string { return base_url() . '/' . ltrim($path, '/'); }
function is_past(?string $when): bool { return $when !== null && $when !== '' && time() > strtotime($when); }

function redirect(string $to): void
{
    header('Location: ' . $to, true, 303);
    exit;
}

function rand_code(int $len): string
{
    $alpha = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $s = '';
    for ($i = 0; $i < $len; $i++) {
        $s .= $alpha[random_int(0, strlen($alpha) - 1)];
    }
    return $s;
}
function new_token(): string { return bin2hex(random_bytes(16)); }

function clean_text(string $s, int $max): string
{
    $s = trim(preg_replace('/\s+/u', ' ', $s) ?? '');
    return mb_substr($s, 0, $max);
}

function clean_email(string $s): ?string
{
    $s = strtolower(trim($s));
    return filter_var($s, FILTER_VALIDATE_EMAIL) && strlen($s) <= 190 ? $s : null;
}

function clean_ref(string $s): string
{
    $s = strtolower(preg_replace('/[^a-z0-9_-]/i', '', $s) ?? '');
    return array_key_exists($s, (array) cfg('ambassadors', [])) ? $s : '';
}

function log_line(string $msg): void
{
    @file_put_contents(__DIR__ . '/../data/app.log', '[' . now() . '] ' . $msg . "\n", FILE_APPEND | LOCK_EX);
}

// ---------------------------------------------------------------------
// Sesión y CSRF
// ---------------------------------------------------------------------
function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('su_sess');
    session_start();
}

function csrf_token(): string
{
    start_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = new_token();
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string { return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">'; }

function csrf_ok(?string $token): bool
{
    start_session();
    return is_string($token) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

// ---------------------------------------------------------------------
// Base de datos
// ---------------------------------------------------------------------
function db(): PDO
{
    static $pdo = null;
    if ($pdo) {
        return $pdo;
    }
    $dsn = (string) cfg('db.dsn');
    $sqlite = str_starts_with($dsn, 'sqlite:');
    if ($sqlite) {
        $dir = dirname(substr($dsn, 7));
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
    }
    $pdo = new PDO($dsn, cfg('db.user'), cfg('db.pass'), [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    if ($sqlite) {
        $pdo->exec('PRAGMA journal_mode=WAL');
        $pdo->exec('PRAGMA busy_timeout=5000');
    }
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(16) PRIMARY KEY,
        token VARCHAR(64) NOT NULL UNIQUE,
        tier VARCHAR(32) NOT NULL,
        qty INT NOT NULL,
        unit_price INT NOT NULL,
        fee INT NOT NULL DEFAULT 0,
        total INT NOT NULL,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL,
        ref VARCHAR(32) NOT NULL DEFAULT '',
        status VARCHAR(16) NOT NULL DEFAULT 'pending',
        mp_preference VARCHAR(80) NOT NULL DEFAULT '',
        mp_payment VARCHAR(40) NOT NULL DEFAULT '',
        checked_in INT NOT NULL DEFAULT 0,
        emailed INT NOT NULL DEFAULT 0,
        created_at VARCHAR(19) NOT NULL,
        paid_at VARCHAR(19) NOT NULL DEFAULT ''
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        k VARCHAR(64) PRIMARY KEY,
        v TEXT NOT NULL
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(16) PRIMARY KEY,
        owner VARCHAR(64) NOT NULL UNIQUE,
        author VARCHAR(40) NOT NULL,
        body VARCHAR(255) NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'pending',
        created_at VARCHAR(19) NOT NULL
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS passes (
        id VARCHAR(16) PRIMARY KEY,
        token VARCHAR(64) NOT NULL UNIQUE,
        kind VARCHAR(16) NOT NULL,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL,
        ref VARCHAR(32) NOT NULL DEFAULT '',
        code VARCHAR(40) NOT NULL DEFAULT '',
        checked_in INT NOT NULL DEFAULT 0,
        emailed INT NOT NULL DEFAULT 0,
        created_at VARCHAR(19) NOT NULL
    )");
    return $pdo;
}

function q(string $sql, array $args = []): PDOStatement
{
    $st = db()->prepare($sql);
    $st->execute($args);
    return $st;
}

function order_by(string $field, string $value): ?array
{
    if (!in_array($field, ['id', 'token'], true)) {
        return null;
    }
    $row = q("SELECT * FROM orders WHERE $field = ?", [$value])->fetch();
    return $row ?: null;
}

function setting(string $k): ?string
{
    static $cache = null;
    if ($cache === null || $k === '__reset') {
        $cache = [];
        foreach (q('SELECT k, v FROM settings')->fetchAll() as $r) {
            $cache[$r['k']] = $r['v'];
        }
    }
    return $cache[$k] ?? null;
}

function set_setting(string $k, ?string $v): void
{
    q('DELETE FROM settings WHERE k = ?', [$k]);
    if ($v !== null) {
        q('INSERT INTO settings (k, v) VALUES (?, ?)', [$k, $v]);
    }
    setting('__reset');
}

// ---------------------------------------------------------------------
// Pizarra (mensajes de los asistentes, moderados)
// ---------------------------------------------------------------------
const MESSAGE_MAX = 120;

function message_for(string $owner): ?array
{
    $row = q('SELECT * FROM messages WHERE owner = ?', [$owner])->fetch();
    return $row ?: null;
}

function approved_messages(int $limit = 40): array
{
    return q("SELECT author, body FROM messages WHERE status = 'approved' ORDER BY created_at DESC LIMIT " . max(1, $limit))->fetchAll();
}

/** Primer nombre, para firmar la pizarra sin exponer el apellido. */
function first_name(string $full): string
{
    $parts = preg_split('/\s+/u', trim($full)) ?: [''];
    return mb_substr($parts[0], 0, 40);
}

/** Cantidad de personas adentro (ingresos registrados en la puerta). */
function people_inside(): int
{
    return (int) q("SELECT COALESCE(SUM(checked_in),0) FROM orders WHERE status = 'approved'")->fetchColumn()
        + (int) q('SELECT COALESCE(SUM(checked_in),0) FROM passes')->fetchColumn();
}

/** Número de asistente: posición de esta entrada entre todas (pagas, lista e invitaciones) por fecha de creación. */
function attendee_number(string $createdAt, string $id): int
{
    $paid = (int) q("SELECT COALESCE(SUM(qty),0) FROM orders WHERE status = 'approved' AND (created_at < ? OR (created_at = ? AND id < ?))", [$createdAt, $createdAt, $id])->fetchColumn();
    $passes = (int) q('SELECT COUNT(*) FROM passes WHERE created_at < ? OR (created_at = ? AND id < ?)', [$createdAt, $createdAt, $id])->fetchColumn();
    return $paid + $passes + 1;
}

function pass_by_token(string $token): ?array
{
    $row = q('SELECT * FROM passes WHERE token = ?', [$token])->fetch();
    return $row ?: null;
}

// ---------------------------------------------------------------------
// Entradas, lista e invitaciones
// ---------------------------------------------------------------------
function tiers(): array
{
    $out = [];
    foreach ((array) cfg('tickets', []) as $t) {
        $out[$t['id']] = $t;
    }
    return $out;
}

function tier_taken(string $tierId): int
{
    $cut = date('Y-m-d H:i:s', time() - 60 * (int) cfg('reserve_minutes', 30));
    return (int) q(
        "SELECT COALESCE(SUM(qty),0) FROM orders WHERE tier = ? AND (status = 'approved' OR (status = 'pending' AND created_at >= ?))",
        [$tierId, $cut]
    )->fetchColumn();
}

/** Lugares libres del evento: capacidad total − entradas pagas (aprobadas o reservadas) − invitaciones. La lista no garantiza lugar. */
function capacity_left(): int
{
    $cut = date('Y-m-d H:i:s', time() - 60 * (int) cfg('reserve_minutes', 30));
    $paid = (int) q(
        "SELECT COALESCE(SUM(qty),0) FROM orders WHERE status = 'approved' OR (status = 'pending' AND created_at >= ?)",
        [$cut]
    )->fetchColumn();
    $inv = (int) q("SELECT COUNT(*) FROM passes WHERE kind = 'invitacion'")->fetchColumn();
    return max(0, (int) cfg('event.capacity', PHP_INT_MAX) - $paid - $inv);
}

/** Estado de una tanda: ['open' => bool, 'left' => int, 'label' => texto si está cerrada] */
function tier_state(array $t): array
{
    $left = max(0, min((int) $t['stock'] - tier_taken($t['id']), capacity_left()));
    if ($left === 0) {
        return ['open' => false, 'left' => 0, 'label' => 'agotada'];
    }
    if (is_past($t['until'] ?? null)) {
        return ['open' => false, 'left' => $left, 'label' => 'cerrada'];
    }
    return ['open' => true, 'left' => $left, 'label' => ''];
}

function fee_for(int $subtotal): int
{
    return (int) round($subtotal * (float) cfg('service_fee_percent', 0) / 100);
}

function lista_count(): int { return (int) q("SELECT COUNT(*) FROM passes WHERE kind = 'lista'")->fetchColumn(); }

function lista_state(): array
{
    if (!cfg('lista.enabled', false)) {
        return ['open' => false, 'label' => 'sin lista'];
    }
    if (is_past(cfg('lista.closes'))) {
        return ['open' => false, 'label' => 'la lista ya cerró'];
    }
    if (lista_count() >= (int) cfg('lista.capacity', 0)) {
        return ['open' => false, 'label' => 'la lista está completa'];
    }
    return ['open' => true, 'label' => ''];
}

function invite_info(string $code): ?array
{
    $codes = (array) cfg('invitations.codes', []);
    if (!isset($codes[$code])) {
        return null;
    }
    $used = (int) q("SELECT COUNT(*) FROM passes WHERE kind = 'invitacion' AND code = ?", [$code])->fetchColumn();
    $left = max(0, min((int) $codes[$code]['quota'] - $used, capacity_left()));
    return $codes[$code] + ['code' => $code, 'used' => $used, 'left' => $left];
}

/** Crea un pase (lista o invitación). Si ese mail ya tiene uno del mismo tipo, devuelve el existente. */
function create_pass(string $kind, string $name, string $email, string $ref, string $code = ''): array
{
    $existing = q('SELECT * FROM passes WHERE kind = ? AND email = ?', [$kind, $email])->fetch();
    if ($existing) {
        return $existing;
    }
    $pass = [
        'id' => ($kind === 'lista' ? 'LI-' : 'IN-') . rand_code(4) . '-' . rand_code(4),
        'token' => new_token(), 'kind' => $kind, 'name' => $name, 'email' => $email,
        'ref' => $ref, 'code' => $code, 'created_at' => now(),
    ];
    q(
        'INSERT INTO passes (id, token, kind, name, email, ref, code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [$pass['id'], $pass['token'], $kind, $name, $email, $ref, $code, $pass['created_at']]
    );
    $pass = pass_by_token($pass['token']);
    send_pass_email($pass);
    return $pass;
}

// ---------------------------------------------------------------------
// Mercado Pago (Checkout Pro)
// ---------------------------------------------------------------------
function mp_request(string $method, string $path, ?array $body = null): array
{
    $token = mp_token();
    if ($token === '') {
        throw new RuntimeException('Falta el Access Token de Mercado Pago (cargalo en el panel → Pagos).');
    }
    $headers = ['Authorization: Bearer ' . $token, 'Content-Type: application/json'];
    if ($method === 'POST') {
        $headers[] = 'X-Idempotency-Key: ' . new_token();
    }
    $ch = curl_init('https://api.mercadopago.com' . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 20,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE));
    }
    $res = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($res === false) {
        throw new RuntimeException('Mercado Pago no respondió: ' . $err);
    }
    $data = json_decode((string) $res, true) ?: [];
    if ($code >= 400) {
        throw new RuntimeException('Mercado Pago respondió ' . $code . ': ' . ($data['message'] ?? substr((string) $res, 0, 200)));
    }
    return $data;
}

function mp_create_preference(array $order, array $tier): array
{
    $items = [[
        'id' => $tier['id'],
        'title' => cfg('event.title') . ' · ' . $tier['name'],
        'quantity' => (int) $order['qty'],
        'unit_price' => (float) $order['unit_price'],
        'currency_id' => 'ARS',
    ]];
    if ((int) $order['fee'] > 0) {
        $items[] = ['id' => 'servicio', 'title' => 'Cargo por servicio', 'quantity' => 1, 'unit_price' => (float) $order['fee'], 'currency_id' => 'ARS'];
    }
    $back = url('gracias.php');
    return mp_request('POST', '/checkout/preferences', [
        'items' => $items,
        'payer' => ['name' => $order['name'], 'email' => $order['email']],
        'external_reference' => $order['id'],
        'back_urls' => ['success' => $back, 'pending' => $back, 'failure' => $back],
        'auto_return' => 'approved',
        'binary_mode' => true,  // solo aprobado o rechazado: nada de pagos en efectivo que quedan pendientes
        'notification_url' => url('webhook.php'),
        'statement_descriptor' => (string) cfg('mercadopago.statement_descriptor', 'SOMOSUNO'),
        'expires' => true,
        'expiration_date_to' => date('Y-m-d\TH:i:s.000P', time() + 60 * (int) cfg('reserve_minutes', 30)),
    ]);
}

/** Aplica un pago de Mercado Pago a su orden. Es idempotente: se puede llamar varias veces con el mismo pago. */
function apply_payment(array $p): ?array
{
    $orderId = (string) ($p['external_reference'] ?? '');
    $order = $orderId !== '' ? order_by('id', $orderId) : null;
    if (!$order) {
        return null;
    }
    $status = (string) ($p['status'] ?? '');
    if ($status === 'approved') {
        $amount = (float) ($p['transaction_amount'] ?? 0);
        if (($p['currency_id'] ?? 'ARS') !== 'ARS' || $amount + 0.5 < (int) $order['total']) {
            log_line("Pago {$p['id']} con monto {$amount} no coincide con la orden {$orderId} ({$order['total']})");
            return $order;
        }
        $st = q(
            "UPDATE orders SET status = 'approved', mp_payment = ?, paid_at = ? WHERE id = ? AND status <> 'approved'",
            [(string) ($p['id'] ?? ''), now(), $orderId]
        );
        if ($st->rowCount() > 0) {
            send_order_email(order_by('id', $orderId));
        }
    } elseif (in_array($status, ['rejected', 'cancelled'], true)) {
        q("UPDATE orders SET status = ? WHERE id = ? AND status = 'pending'", [$status, $orderId]);
    } elseif (in_array($status, ['refunded', 'charged_back'], true)) {
        q("UPDATE orders SET status = 'refunded' WHERE id = ?", [$orderId]);
    }
    return order_by('id', $orderId);
}

// ---------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------
function mime_header(string $s): string { return '=?UTF-8?B?' . base64_encode($s) . '?='; }

function send_mail(string $to, string $subject, string $html): bool
{
    $from = (string) cfg('mail.from_email');
    if ($from === '' || !clean_email($to)) {
        return false;
    }
    $fromName = str_replace(["\r", "\n"], '', (string) cfg('mail.from_name', 'Somos Uno'));
    $host = parse_url(url(), PHP_URL_HOST) ?: 'localhost';
    $headers = [
        'From: ' . mime_header($fromName) . " <$from>",
        'Reply-To: ' . (cfg('brand.contact_email') ?: $from),
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    $body = chunk_split(base64_encode($html));
    $user = (string) cfg('mail.smtp_user');
    if ($user === '') {
        return @mail($to, mime_header($subject), $body, implode("\r\n", $headers));
    }

    $port = (int) cfg('mail.smtp_port', 465);
    $fp = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . cfg('mail.smtp_host') . ':' . $port, $errno, $errstr, 15);
    if (!$fp) {
        log_line("SMTP: no conecta ($errstr)");
        return false;
    }
    stream_set_timeout($fp, 15);
    $send = function (string $line, array $ok) use ($fp): void {
        if ($line !== '') {
            fwrite($fp, $line . "\r\n");
        }
        $resp = '';
        while (($l = fgets($fp, 515)) !== false) {
            $resp .= $l;
            if (strlen($l) < 4 || $l[3] === ' ') {
                break;
            }
        }
        if (!in_array((int) substr($resp, 0, 3), $ok, true)) {
            throw new RuntimeException('SMTP: ' . trim($resp));
        }
    };
    try {
        $send('', [220]);
        $send('EHLO ' . $host, [250]);
        if ($port === 587) {
            $send('STARTTLS', [220]);
            stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $send('EHLO ' . $host, [250]);
        }
        $send('AUTH LOGIN', [334]);
        $send(base64_encode($user), [334]);
        $send(base64_encode((string) cfg('mail.smtp_pass')), [235]);
        $send("MAIL FROM:<$from>", [250]);
        $send("RCPT TO:<$to>", [250, 251]);
        $send('DATA', [354]);
        $msg = implode("\r\n", array_merge($headers, [
            "To: <$to>",
            'Subject: ' . mime_header($subject),
            'Date: ' . date('r'),
            'Message-ID: <' . new_token() . "@$host>",
        ])) . "\r\n\r\n" . $body;
        $send($msg . "\r\n.", [250]);
        $send('QUIT', [221]);
        return true;
    } catch (Throwable $ex) {
        log_line($ex->getMessage());
        return false;
    } finally {
        fclose($fp);
    }
}

function mail_template(string $title, string $intro, string $link, string $button, string $foot): string
{
    $c = (array) cfg('brand.colors');
    return '<div style="background:' . e($c['bg']) . ';padding:32px 16px;font-family:Arial,sans-serif;color:' . e($c['cream']) . '">'
        . '<div style="max-width:480px;margin:0 auto">'
        . '<p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:' . e($c['accent']) . '">' . e(event_full()) . '</p>'
        . '<h1 style="font-family:Georgia,serif;font-style:italic;font-weight:normal;font-size:30px;margin:8px 0 16px">' . e($title) . '</h1>'
        . '<p style="font-size:15px;line-height:1.6">' . $intro . '</p>'
        . '<p style="font-size:15px;line-height:1.6">' . e(cfg('event.date_label')) . ' · ' . e(cfg('event.time_label')) . '<br>'
        . e(cfg('event.venue')) . ' · ' . e(cfg('event.address')) . '</p>'
        . '<p style="margin:28px 0"><a href="' . e($link) . '" style="background:' . e($c['cream']) . ';color:' . e($c['bg']) . ';padding:14px 26px;border-radius:40px;text-decoration:none;font-weight:bold">' . e($button) . '</a></p>'
        . '<p style="font-size:13px;line-height:1.6;opacity:.75">' . $foot . '</p>'
        . '</div></div>';
}

function send_order_email(?array $o): void
{
    if (!$o || (int) $o['emailed'] === 1) {
        return;
    }
    $tier = tiers()[$o['tier']]['name'] ?? $o['tier'];
    $html = mail_template(
        'tu entrada está lista',
        'Hola ' . e($o['name']) . '. Tenés <b>' . (int) $o['qty'] . ' × ' . e($tier) . '</b> para ' . e(cfg('event.title')) . '.',
        url('ticket.php?t=' . $o['token']),
        'ver mi entrada (QR)',
        'Código ' . e($o['id']) . '. Mostrá el QR en la puerta: vale para ' . (int) $o['qty'] . ' persona(s). ' . e(cfg('event.motto'))
    );
    if (send_mail($o['email'], 'Tu entrada · ' . cfg('event.title'), $html)) {
        q('UPDATE orders SET emailed = 1 WHERE id = ?', [$o['id']]);
    }
}

function send_pass_email(?array $p): void
{
    if (!$p || (int) $p['emailed'] === 1) {
        return;
    }
    $isInv = $p['kind'] === 'invitacion';
    $html = mail_template(
        $isInv ? 'estás invitado/a' : 'estás en la lista',
        'Hola ' . e($p['name']) . '. ' . ($isInv
            ? 'Tenés una invitación para ' . e(cfg('event.title')) . '. ' . e(cfg('invitations.rules'))
            : 'Quedaste en la lista de ' . e(cfg('event.title')) . ': ' . e(cfg('lista.benefit')) . '.'),
        url('ticket.php?t=' . $p['token']),
        'ver mi pase (QR)',
        'Código ' . e($p['id']) . '. ' . e(cfg('event.motto'))
    );
    if (send_mail($p['email'], ($isInv ? 'Tu invitación · ' : 'Estás en la lista · ') . cfg('event.title'), $html)) {
        q('UPDATE passes SET emailed = 1 WHERE id = ?', [$p['id']]);
    }
}
