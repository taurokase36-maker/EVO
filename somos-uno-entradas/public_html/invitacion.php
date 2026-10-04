<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

$code = strtolower(preg_replace('/[^a-z0-9-]/i', '', (string) ($_REQUEST['c'] ?? '')) ?? '');
$inv = $code !== '' ? invite_info($code) : null;
if (!$inv) {
    message_page('invitación no válida', '<p>Este link no existe. Si te invitaron, pedile el link correcto a quien te lo pasó.</p><p><a class="btn btn-ghost" href="./">ver el evento</a></p>', '', 404);
}
if (is_past(cfg('invitations.valid_until'))) {
    message_page('las invitaciones ya cerraron', '<p>Igual podés venir: <a href="./#entradas">entradas acá</a>.</p>');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = clean_text((string) ($_POST['name'] ?? ''), 120);
    $email = clean_email((string) ($_POST['email'] ?? ''));
    if (!csrf_ok($_POST['csrf'] ?? null)) {
        $error = 'La página estuvo abierta mucho tiempo. Probá de nuevo.';
    } elseif (mb_strlen($name) < 3 || !$email) {
        $error = 'Revisá tu nombre y tu mail.';
    } else {
        $existing = q("SELECT token FROM passes WHERE kind = 'invitacion' AND email = ?", [$email])->fetchColumn();
        if ($existing) {
            redirect('ticket.php?t=' . rawurlencode((string) $existing));
        }
        if (invite_info($code)['left'] < 1) {
            $error = 'Se terminaron las invitaciones de este link.';
        } else {
            $ownerKey = clean_ref(strtolower((string) $inv['owner']));
            $pass = create_pass('invitacion', $name, $email, $ownerKey, $code);
            redirect('ticket.php?t=' . rawurlencode($pass['token']) . '&nueva=1');
        }
    }
    $inv = invite_info($code);
}

page_start('Invitación · ' . cfg('event.title'), 'page-msg');
?>
<main class="wrap narrow msg">
  <img src="<?= e(cfg('brand.logo')) ?>" alt="<?= e(cfg('brand.name')) ?>" class="msg-logo-img">
  <p class="kicker"><?= e(cfg('event.kicker')) ?></p>
  <h1>te invita <?= e($inv['owner']) ?></h1>
  <p class="lead"><?= e(cfg('event.date_label')) ?> · <?= e(cfg('event.venue')) ?></p>
  <p class="muted"><?= e(cfg('invitations.rules')) ?></p>
  <?php if ($error): ?><p class="alert" role="alert"><?= e($error) ?></p><?php endif; ?>
  <?php if ($inv['left'] > 0): ?>
    <p class="badge">quedan <?= (int) $inv['left'] ?></p>
    <form method="post" class="buy card">
      <?= csrf_field() ?>
      <input type="hidden" name="c" value="<?= e($code) ?>">
      <label>nombre y apellido (como en tu DNI)<input name="name" required minlength="3" maxlength="120" autocomplete="name"></label>
      <label>mail<input name="email" type="email" required maxlength="190" autocomplete="email" inputmode="email"></label>
      <button class="btn btn-solid btn-block" type="submit">quiero mi invitación</button>
    </form>
  <?php else: ?>
    <p class="alert">Se terminaron las invitaciones de este link. <a href="./#entradas">Entradas acá</a>.</p>
  <?php endif; ?>
</main>
<?php page_end();
