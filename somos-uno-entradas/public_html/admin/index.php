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
  <img src="<?= e($B . asset((string) cfg('brand.logo'))) ?>" alt="" class="msg-logo-img">
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
function flash(string $text, bool $ok = true): void { $_SESSION['flash'] = [$ok, $text]; }

/** Prueba el token contra Mercado Pago. Devuelve el nickname de la cuenta o lanza un error. */
function mp_check(): string
{
    $me = mp_request('GET', '/users/me');
    return (string) ($me['nickname'] ?? $me['email'] ?? ('cuenta ' . ($me['id'] ?? '?')));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_ok($_POST['csrf'] ?? null)) {
        flash('La página estuvo abierta mucho tiempo. Probá de nuevo.', false);
        redirect('index.php');
    }
    $id = (string) ($_POST['id'] ?? '');
    switch ((string) ($_POST['action'] ?? '')) {
        case 'resend':
            if (order_by('id', $id)) {
                q('UPDATE orders SET emailed = 0 WHERE id = ?', [$id]);
                send_order_email(order_by('id', $id));
            } elseif (q('SELECT id FROM passes WHERE id = ?', [$id])->fetch()) {
                q('UPDATE passes SET emailed = 0 WHERE id = ?', [$id]);
                send_pass_email(q('SELECT * FROM passes WHERE id = ?', [$id])->fetch());
            }
            flash('Mail reenviado (si el mail está configurado).');
            break;

        case 'mp_token':
            $tok = preg_replace('/\s+/', '', (string) ($_POST['token'] ?? '')) ?? '';
            if ($tok === '') {
                set_setting('mp_token', null);
                flash('Token borrado del panel.');
            } elseif (!preg_match('/^(TEST|APP_USR)-[A-Za-z0-9-]{20,}$/', $tok)) {
                flash('Ese no parece un Access Token. Tiene que empezar con APP_USR- (real) o TEST- (prueba).', false);
            } else {
                set_setting('mp_token', $tok);
                try {
                    flash('Token guardado. Conectado como ' . mp_check() . '.');
                } catch (Throwable $ex) {
                    flash('Token guardado, pero Mercado Pago lo rechazó: ' . $ex->getMessage(), false);
                }
            }
            break;

        case 'mp_test':
            try {
                flash('Conexión OK: conectado como ' . mp_check() . '.');
            } catch (Throwable $ex) {
                flash('No conecta: ' . $ex->getMessage(), false);
            }
            break;

        case 'demo_off':
            try {
                $who = mp_check();
                set_setting('demo_mode', '0');
                flash('Modo demo apagado. Ahora se cobra de verdad con la cuenta ' . $who . (str_starts_with(mp_token(), 'TEST-') ? ' (token de PRUEBA: todavía no entra plata real).' : '.'));
            } catch (Throwable $ex) {
                flash('No se puede apagar el modo demo: ' . $ex->getMessage(), false);
            }
            break;

        case 'demo_on':
            set_setting('demo_mode', '1');
            flash('Modo demo prendido: los pagos se aprueban solos y no se cobra nada.');
            break;

        case 'purge_demo':
            $tokens = q("SELECT token FROM orders WHERE mp_payment = 'DEMO'")->fetchAll(PDO::FETCH_COLUMN);
            foreach ($tokens as $tk) {
                q('DELETE FROM messages WHERE owner = ?', [$tk]);
            }
            $n = q("DELETE FROM orders WHERE mp_payment = 'DEMO'")->rowCount();
            flash("Se borraron $n compras de prueba.");
            break;

        case 'msg_approve':
        case 'msg_reject':
            $status = $_POST['action'] === 'msg_approve' ? 'approved' : 'rejected';
            q('UPDATE messages SET status = ? WHERE id = ?', [$status, $id]);
            flash($status === 'approved' ? 'Mensaje publicado en la pizarra.' : 'Mensaje oculto.');
            break;
    }
    redirect('index.php' . (str_starts_with((string) ($_POST['action'] ?? ''), 'msg_') ? '#pizarra' : ''));
}
$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);

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

$demoOrders = (int) q("SELECT COUNT(*) FROM orders WHERE mp_payment = 'DEMO'")->fetchColumn();
$pending = q("SELECT * FROM messages WHERE status = 'pending' ORDER BY created_at")->fetchAll();
$published = q("SELECT * FROM messages WHERE status = 'approved' ORDER BY created_at DESC LIMIT 100")->fetchAll();

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
  <?php if ($flash): ?><p class="<?= $flash[0] ? 'ok-note' : 'alert' ?>" role="status"><?= e($flash[1]) ?></p><?php endif; ?>

  <section class="card payments">
    <div class="card-top">
      <h2>pagos</h2>
      <span class="status-pill <?= demo() ? 'status-demo' : 'status-live' ?>"><?= demo() ? 'modo demo · no se cobra' : 'cobrando de verdad' ?></span>
    </div>
    <p class="muted">Access Token de Mercado Pago:
      <?php if ($tok = mp_token()): ?>
        <b><?= e(substr($tok, 0, strpos($tok, '-') + 1) . '…' . substr($tok, -4)) ?></b>
        <?= str_starts_with($tok, 'TEST-') ? '(de prueba: no entra plata real)' : '(real)' ?>
      <?php else: ?><b>sin cargar</b><?php endif; ?>
    </p>
    <form method="post" class="inline-form">
      <?= csrf_field() ?><input type="hidden" name="action" value="mp_token">
      <input name="token" placeholder="pegá acá tu Access Token (APP_USR-… o TEST-…)" autocomplete="off" spellcheck="false">
      <button class="btn btn-ghost">guardar</button>
    </form>
    <div class="inline-form">
      <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="mp_test"><button class="btn btn-ghost">probar conexión</button></form>
      <?php if (demo()): ?>
        <form method="post" onsubmit="return confirm('¿Apagar el modo demo? Desde ahora las compras se cobran con Mercado Pago.')"><?= csrf_field() ?><input type="hidden" name="action" value="demo_off"><button class="btn btn-solid">apagar demo y cobrar</button></form>
      <?php else: ?>
        <form method="post" onsubmit="return confirm('¿Prender el modo demo? Las compras se aprueban solas SIN cobrar.')"><?= csrf_field() ?><input type="hidden" name="action" value="demo_on"><button class="btn btn-ghost">prender demo</button></form>
      <?php endif; ?>
      <?php if ($demoOrders): ?>
        <form method="post" onsubmit="return confirm('¿Borrar las <?= $demoOrders ?> compras de prueba?')"><?= csrf_field() ?><input type="hidden" name="action" value="purge_demo"><button class="link">borrar <?= $demoOrders ?> compras de prueba</button></form>
      <?php endif; ?>
    </div>
  </section>

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

  <section class="card" id="pizarra">
    <div class="card-top"><h2>pizarra · <?= count($pending) ?> por revisar</h2><a href="../pantalla.php" target="_blank" rel="noopener">abrir pantalla ↗</a></div>
    <?php foreach ($pending as $m): ?>
      <div class="mod-item">
        <div><p class="chalk"><?= e($m['body']) ?></p><small class="muted">— <?= e($m['author'] !== '' ? $m['author'] : 'anónimo') ?> · <?= e($m['created_at']) ?></small></div>
        <div>
          <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="msg_approve"><input type="hidden" name="id" value="<?= e($m['id']) ?>"><button class="btn btn-solid">publicar</button></form>
          <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="msg_reject"><input type="hidden" name="id" value="<?= e($m['id']) ?>"><button class="btn btn-ghost">ocultar</button></form>
        </div>
      </div>
    <?php endforeach; ?>
    <?php if (!$pending): ?><p class="muted">No hay mensajes por revisar.</p><?php endif; ?>
    <?php if ($published): ?>
      <details><summary class="muted">publicados (<?= count($published) ?>)</summary>
        <?php foreach ($published as $m): ?>
          <div class="mod-item">
            <div><p class="chalk"><?= e($m['body']) ?></p><small class="muted">— <?= e($m['author'] !== '' ? $m['author'] : 'anónimo') ?></small></div>
            <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="msg_reject"><input type="hidden" name="id" value="<?= e($m['id']) ?>"><button class="link">ocultar</button></form>
          </div>
        <?php endforeach; ?>
      </details>
    <?php endif; ?>
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
