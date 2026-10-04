<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib.php';
require __DIR__ . '/../app/auth.php';

require_role('admin');
$type = ($_GET['type'] ?? '') === 'passes' ? 'passes' : 'orders';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="somosuno-' . $type . '-' . date('Ymd-Hi') . '.csv"');
$out = fopen('php://output', 'w');
fwrite($out, "\xEF\xBB\xBF");  // para que Excel lea bien los acentos

// Evita que Excel ejecute fórmulas escritas en los campos
$safe = fn($v) => is_string($v) && preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v;

if ($type === 'orders') {
    fputcsv($out, ['codigo', 'estado', 'tanda', 'cantidad', 'precio', 'cargo', 'total', 'nombre', 'mail', 'embajador', 'ingresaron', 'pago_mp', 'creada', 'pagada']);
    foreach (q('SELECT * FROM orders ORDER BY created_at')->fetchAll() as $o) {
        fputcsv($out, array_map($safe, [$o['id'], $o['status'], $o['tier'], $o['qty'], $o['unit_price'], $o['fee'], $o['total'], $o['name'], $o['email'], $o['ref'], $o['checked_in'], $o['mp_payment'], $o['created_at'], $o['paid_at']]));
    }
} else {
    fputcsv($out, ['codigo', 'tipo', 'nombre', 'mail', 'embajador', 'link_invitacion', 'ingreso', 'creado']);
    foreach (q('SELECT * FROM passes ORDER BY created_at')->fetchAll() as $p) {
        fputcsv($out, array_map($safe, [$p['id'], $p['kind'], $p['name'], $p['email'], $p['ref'], $p['code'], $p['checked_in'] ? 'si' : 'no', $p['created_at']]));
    }
}
fclose($out);
