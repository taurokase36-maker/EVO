<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib.php';
require __DIR__ . '/../app/view.php';
require __DIR__ . '/../app/auth.php';

header('X-Robots-Tag: noindex');
$B = '../';

// ---------- Login ----------
if (current_role() === null) {
    $error = '';
    $configured = cfg('admin.password', '') !== '' || cfg('admin.door_password', '') !== '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $configured) {
        $role = try_login((string) ($_POST['password'] ?? ''));
        if ($role) {
            redirect($role === 'door' ? 'scan.php' : 'index.php');
        }
        $error = 'Contraseña incorrecta.';
    }
    page_start('Panel · ' . cfg('brand.name'), 'page-admin', $B);
    ?>
<main class="wrap narrow msg">
  <img src="<?= e($B . cfg('brand.logo')) ?>" alt="" class="msg-logo-img">
  <h1>panel</h1>
  <?php if (!$configured): ?>
    <p class="alert">Primero poné una contraseña en <b>app/config.php</b> → <code>admin.password</code>.</p>
  <?php else: ?>
    <?php if ($error): ?><p class="alert" role="alert"><?= e($error) ?></p><?php endif; ?>
    <form method="post" class="buy card">
      <label>contraseña<input type="password" name="password" required autofocus autocomplete="current-password"></label>
      <button class="btn btn-solid btn-block">entrar</button>
    </form>
  <?php endif; ?>
</main>
<?php
    page_end($B);
    exit;
}

if (current_role() === 'door') {
    redirect('scan.php');
}
require_role('admin');

// ---------- Acciones ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_ok($_POST['csrf'] ?? null)) {
    $id = (string) ($_POST['id'] ?? '');
    if (($_POST['action'] ?? '') === 'resend') {
        if ($o = order_by('id', $id)) {
            q('UPDATE orders SET emailed = 0 WHERE id = ?', [$id]);
            send_order_email(order_by('id', $id));
        } elseif ($p = q('SELECT * FROM passes WHERE id = ?', [$id])->fetch()) {
            q('UPDATE passes SET emailed = 0 WHERE id = ?', [$id]);
            send_pass_email(q('SELECT * FROM passes WHERE id = ?', [$id])->fetch());
        }
    }
    redirect('index.php?ok=1');
}

// ---------- Números ----------
$sold = q("SELECT tier, COALESCE(SUM(qty),0) AS n, COALESCE(SUM(total),0) AS gross, COALESCE(SUM(checked_in),0) AS inside FROM orders WHERE status = 'approved' GROUP BY tier")->fetchAll();
$totals = ['n' => 0, 'gross' => 0, 'inside' => 0];
$byTier = [];
foreach ($sold as $r) {
    $byTier[$r['tier']] = $r;
    foreach ($totals as $k => $_) {
        $totals[$k] += (int) $r[$k];
    }
}
$feePct = (float) cfg('mercadopago.fee_percent', 0);
$net = (int) round($totals['gross'] * (1 - $feePct / 100));
$passes = q("SELECT kind, COUNT(*) AS n, COALESCE(SUM(checked_in),0) AS inside FROM passes GROUP BY kind")->fetchAll();
$passStats = ['lista' => ['n' => 0, 'inside' => 0], 'invitacion' => ['n' => 0, 'inside' => 0]];
foreach ($passes as $r) {
    $passStats[$r['kind']] = ['n' => (int) $r['n'], 'inside' => (int) $r['inside']];
}
$inside = $totals['inside'] + $passStats['lista']['inside'] + $passStats['invitacion']['inside'];
$capacity = (int) cfg('event.capacity', 0);
$free = capacity_left();

// Ranking de embajadores (entradas pagas + lista)
$rank = [];
foreach ((array) cfg('ambassadors', []) as $k => $n) {
    $rank[$k] = ['name' => $n, 'paid' => 0, 'lista' => 0];
}
foreach (q("SELECT ref, COALESCE(SUM(qty),0) AS n FROM orders WHERE status = 'approved' AND ref <> '' GROUP BY ref")->fetchAll() as $r) {
    if (isset($rank[$r['ref']])) $rank[$r['ref']]['paid'] = (int) $r['n'];
}
foreach (q("SELECT ref, COUNT(*) AS n FROM passes WHERE kind = 'lista' AND ref <> '' GROUP BY ref")->fetchAll() as $r) {
    if (isset($rank[$r['ref']])) $rank[$r['ref']]['lista'] = (int) $r['n'];
}
uasort($rank, fn($a, $b) => ($b['paid'] + $b['lista']) <=> ($a['paid'] + $a['lista']));

$invites = [];
foreach (array_keys((array) cfg('invitations.codes', [])) as $code) {
    $invites[] = invite_info($code);
}

// ---------- Listados ----------
$search = clean_text((string) ($_GET['q'] ?? ''), 60);
$like = '%' . $search . '%';
$orders = q("SELECT * FROM orders WHERE status IN ('approved','refunded') AND (name LIKE ? OR email LIKE ? OR id LIKE ?) ORDER BY created_at DESC LIMIT 500", [$like, $like, $like])->fetchAll();
$people = q("SELECT * FROM passes WHERE (name LIKE ? OR email LIKE ? OR id LIKE ?) ORDER BY created_at DESC LIMIT 500", [$like, $like, $like])->fetchAll();
$tiers = tiers();

page_start('Panel · ' . cfg('brand.name'), 'page-admin', $B);
?>
<main class="wrap admin">
  <div class="admin-top">
    <h1>panel</h1>
    <nav><a class="btn btn-solid" href="scan.php">escanear QR</a> <a class="btn btn-ghost" href="logout.php">salir</a></nav>
  </div>
  <?php if (!empty($_GET['ok'])): ?><p class="ok-note">Listo.</p><?php endif; ?>

  <section class="kpis">
    <div><span class="label">entradas vendidas</span><strong><?= (int) $totals['n'] ?></strong></div>
    <div><span class="label">recaudado bruto</span><strong><?= money($totals['gross']) ?></strong><small>neto estimado <?= money($net) ?></small></div>
    <div><span class="label">lista</span><strong><?= $passStats['lista']['n'] ?></strong><small>de <?= (int) cfg('lista.capacity', 0) ?></small></div>
    <div><span class="label">invitaciones</span><strong><?= $passStats['invitacion']['n'] ?></strong></div>
    <div><span class="label">adentro</span><strong><?= $inside ?><?= $capacity ? ' / ' . $capacity : '' ?></strong></div>
    <div><span class="label">lugares libres</span><strong><?= $free ?></strong><small>para venta online e invitaciones</small></div>
  </section>

  <section class="admin-grid">
    <div class="card">
      <h2>por tanda</h2>
      <table><tr><th>tanda</th><th>vendidas</th><th>stock</th><th>$</th></tr>
      <?php foreach ($tiers as $id => $t): $r = $byTier[$id] ?? ['n' => 0, 'gross' => 0]; ?>
        <tr><td><?= e($t['name']) ?></td><td><?= (int) $r['n'] ?></td><td><?= (int) $t['stock'] ?></td><td><?= money((int) $r['gross']) ?></td></tr>
      <?php endforeach; ?></table>
    </div>
    <div class="card">
      <h2>embajadores</h2>
      <table><tr><th></th><th>pagas</th><th>lista</th></tr>
      <?php foreach ($rank as $k => $r): ?>
        <tr><td><?= e($r['name']) ?><br><small class="muted">?ref=<?= e($k) ?></small></td><td><?= $r['paid'] ?></td><td><?= $r['lista'] ?></td></tr>
      <?php endforeach; ?></table>
    </div>
    <div class="card">
      <h2>links de invitación</h2>
      <table><tr><th></th><th>usadas</th></tr>
      <?php foreach ($invites as $i): ?>
        <tr><td><?= e($i['owner']) ?><br><small class="muted copy" data-copy="<?= e(url('invitacion.php?c=' . $i['code'])) ?>">invitacion.php?c=<?= e($i['code']) ?> · copiar</small></td><td><?= $i['used'] ?> / <?= (int) $i['quota'] ?></td></tr>
      <?php endforeach; ?></table>
    </div>
  </section>

  <form class="search" method="get"><input name="q" value="<?= e($search) ?>" placeholder="buscar por nombre, mail o código"><button class="btn btn-ghost">buscar</button></form>

  <section class="card">
    <div class="card-top"><h2>entradas pagas</h2><a href="export.php?type=orders">descargar CSV</a></div>
    <div class="table-wrap"><table>
      <tr><th>código</th><th>nombre</th><th>tanda</th><th>cant.</th><th>total</th><th>ingresó</th><th>ref</th><th></th></tr>
      <?php foreach ($orders as $o): ?>
        <tr class="<?= $o['status'] === 'refunded' ? 'muted' : '' ?>">
          <td><?= e($o['id']) ?></td><td><?= e($o['name']) ?><br><small class="muted"><?= e($o['email']) ?></small></td>
          <td><?= e($tiers[$o['tier']]['name'] ?? $o['tier']) ?></td><td><?= (int) $o['qty'] ?></td><td><?= money((int) $o['total']) ?></td>
          <td><?= (int) $o['checked_in'] ?>/<?= (int) $o['qty'] ?></td><td><?= e($o['ref']) ?></td>
          <td><form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="resend"><input type="hidden" name="id" value="<?= e($o['id']) ?>"><button class="link">reenviar mail</button></form></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$orders): ?><tr><td colspan="8" class="muted">Todavía no hay ventas.</td></tr><?php endif; ?>
    </table></div>
  </section>

  <section class="card">
    <div class="card-top"><h2>lista e invitaciones</h2><a href="export.php?type=passes">descargar CSV</a></div>
    <div class="table-wrap"><table>
      <tr><th>código</th><th>nombre</th><th>tipo</th><th>de</th><th>ingresó</th><th></th></tr>
      <?php foreach ($people as $p): ?>
        <tr>
          <td><?= e($p['id']) ?></td><td><?= e($p['name']) ?><br><small class="muted"><?= e($p['email']) ?></small></td>
          <td><?= $p['kind'] === 'invitacion' ? 'invitación' : 'lista' ?></td>
          <td><?= e($p['kind'] === 'invitacion' ? (invite_info($p['code'])['owner'] ?? $p['code']) : $p['ref']) ?></td>
          <td><?= (int) $p['checked_in'] ? 'sí' : '—' ?></td>
          <td><form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="resend"><input type="hidden" name="id" value="<?= e($p['id']) ?>"><button class="link">reenviar mail</button></form></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$people): ?><tr><td colspan="6" class="muted">Nadie anotado todavía.</td></tr><?php endif; ?>
    </table></div>
  </section>
</main>
<?php page_end($B, ['assets/app.js']);
