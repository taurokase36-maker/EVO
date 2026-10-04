<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib.php';
require __DIR__ . '/../app/auth.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
require_role('door', true);

function out(array $data): void
{
    exit(json_encode($data, JSON_UNESCAPED_UNICODE));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_ok($_SERVER['HTTP_X_CSRF'] ?? null)) {
    http_response_code(400);
    out(['ok' => false, 'error' => 'Pedido inválido. Recargá la página.']);
}

$in = json_decode((string) file_get_contents('php://input'), true) ?: [];
$action = (string) ($in['action'] ?? '');

/** Busca por token (del QR) o por código (SU-XXXX-XXXX / LI-… / IN-…). */
function find_entry(string $key): ?array
{
    $key = trim($key);
    if (preg_match('/[?&]t=([a-f0-9]{32})/', $key, $m)) {
        $key = $m[1];
    }
    if (preg_match('/^[a-f0-9]{32}$/', $key)) {
        $o = order_by('token', $key);
        if ($o) return ['type' => 'order', 'row' => $o];
        $p = pass_by_token($key);
        return $p ? ['type' => 'pass', 'row' => $p] : null;
    }
    $code = strtoupper($key);
    $o = order_by('id', $code);
    if ($o) return ['type' => 'order', 'row' => $o];
    $p = q('SELECT * FROM passes WHERE id = ?', [$code])->fetch();
    return $p ? ['type' => 'pass', 'row' => $p] : null;
}

function describe(array $entry): array
{
    $r = $entry['row'];
    if ($entry['type'] === 'order') {
        $valid = $r['status'] === 'approved';
        return [
            'token' => $r['token'], 'code' => $r['id'], 'name' => $r['name'],
            'kind' => tiers()[$r['tier']]['name'] ?? $r['tier'],
            'total' => (int) $r['qty'], 'used' => (int) $r['checked_in'],
            'valid' => $valid, 'warning' => $valid ? '' : 'Entrada no pagada o reembolsada (' . $r['status'] . ').',
        ];
    }
    $isInv = $r['kind'] === 'invitacion';
    $late = $isInv && is_past(cfg('invitations.valid_until'));
    return [
        'token' => $r['token'], 'code' => $r['id'], 'name' => $r['name'],
        'kind' => $isInv ? 'Invitación · ' . (invite_info($r['code'])['owner'] ?? '') : 'Lista · ' . cfg('lista.benefit'),
        'total' => 1, 'used' => (int) $r['checked_in'], 'valid' => true,
        'warning' => $late ? 'Pasó el horario de la invitación: paga general.' : '',
    ];
}

if ($action === 'lookup') {
    $entry = find_entry((string) ($in['key'] ?? ''));
    out($entry ? ['ok' => true, 'entry' => describe($entry)] : ['ok' => false, 'error' => 'No existe esa entrada.']);
}

if ($action === 'checkin') {
    $entry = find_entry((string) ($in['key'] ?? ''));
    if (!$entry) {
        out(['ok' => false, 'error' => 'No existe esa entrada.']);
    }
    $n = max(1, (int) ($in['n'] ?? 1));
    $r = $entry['row'];
    if ($entry['type'] === 'order') {
        $st = q(
            "UPDATE orders SET checked_in = checked_in + ? WHERE id = ? AND status = 'approved' AND checked_in + ? <= qty",
            [$n, $r['id'], $n]
        );
        $entry['row'] = order_by('id', $r['id']);
    } else {
        $st = q('UPDATE passes SET checked_in = 1 WHERE id = ? AND checked_in = 0', [$r['id']]);
        $entry['row'] = q('SELECT * FROM passes WHERE id = ?', [$r['id']])->fetch();
    }
    if ($st->rowCount() === 0) {
        out(['ok' => false, 'error' => 'Ya ingresó o no quedan lugares en esta entrada.', 'entry' => describe($entry)]);
    }
    out(['ok' => true, 'entry' => describe($entry)]);
}

if ($action === 'search') {
    $term = clean_text((string) ($in['q'] ?? ''), 60);
    if (mb_strlen($term) < 2) {
        out(['ok' => true, 'results' => []]);
    }
    $like = '%' . $term . '%';
    $res = [];
    foreach (q("SELECT * FROM orders WHERE status = 'approved' AND (name LIKE ? OR id LIKE ? OR email LIKE ?) LIMIT 15", [$like, $like, $like])->fetchAll() as $o) {
        $res[] = describe(['type' => 'order', 'row' => $o]);
    }
    foreach (q('SELECT * FROM passes WHERE name LIKE ? OR id LIKE ? OR email LIKE ? LIMIT 15', [$like, $like, $like])->fetchAll() as $p) {
        $res[] = describe(['type' => 'pass', 'row' => $p]);
    }
    out(['ok' => true, 'results' => $res]);
}

out(['ok' => false, 'error' => 'Acción desconocida.']);
