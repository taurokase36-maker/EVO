<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

$token = preg_replace('/[^a-f0-9]/', '', (string) ($_GET['t'] ?? '')) ?? '';
$order = $token !== '' ? order_by('token', $token) : null;
$pass = (!$order && $token !== '') ? pass_by_token($token) : null;

if ((!$order || $order['status'] !== 'approved') && !$pass) {
    message_page('entrada no encontrada', '<p>Revisá el link que te llegó por mail.</p><p><a class="btn btn-ghost" href="./">ver el evento</a></p>', '', 404);
}

if ($order) {
    $kind = tiers()[$order['tier']]['name'] ?? $order['tier'];
    $who = $order['name'];
    $code = $order['id'];
    $people = (int) $order['qty'];
    $used = (int) $order['checked_in'];
    $detail = $people > 1 ? "vale para $people personas" : 'vale para 1 persona';
    $title = 'tu entrada';
} else {
    $isInv = $pass['kind'] === 'invitacion';
    $kind = $isInv ? 'Invitación' : 'Lista';
    $who = $pass['name'];
    $code = $pass['id'];
    $people = 1;
    $used = (int) $pass['checked_in'];
    $detail = $isInv ? (string) cfg('invitations.rules') : (string) cfg('lista.benefit');
    $title = $isInv ? 'tu invitación' : 'estás en la lista';
}
$done = $used >= $people;
$expired = $pass && $pass['kind'] === 'invitacion' && is_past(cfg('invitations.valid_until'));
$row = $order ?: $pass;
$number = attendee_number($row['created_at'], $row['id']);
$myMessage = message_for($token);
$msgNotes = [
    'ok' => 'listo. tu mensaje queda en revisión y aparece en la pizarra cuando se apruebe.',
    'ya' => 'ya dejaste tu mensaje.',
    'vacio' => 'escribí algo antes de enviar.',
    'expirado' => 'la página estuvo abierta mucho tiempo. probá de nuevo.',
];
$msgNote = $msgNotes[(string) ($_GET['msg'] ?? '')] ?? '';

page_start($title . ' · ' . cfg('event.title'), 'page-ticket');
?>
<main class="wrap narrow">
  <?php if (!empty($_GET['nueva'])): ?>
    <p class="ok-note">listo. también te lo mandamos por mail. hacé una captura por las dudas.</p>
  <?php endif; ?>
  <article class="ticket <?= $done || $expired ? 'is-used' : '' ?>">
    <header class="ticket-head">
      <img src="<?= e(asset((string) cfg('brand.logo'))) ?>" alt="" class="ticket-logo">
      <div>
        <p class="kicker"><?= e(event_full()) ?></p>
        <h1><?= e($title) ?></h1>
      </div>
    </header>
    <div class="huella" data-huella="<?= e($token) ?>" data-color="<?= e(cfg('brand.colors.bg')) ?>"></div>
    <p class="huella-label">tu huella · solar people nº <?= $number ?></p>
    <div class="qr" data-qr="<?= e(url('ticket.php?t=' . $token)) ?>" role="img" aria-label="Código QR de ingreso"></div>
    <p class="ticket-code"><?= e($code) ?></p>
    <?php if ($done): ?><p class="badge badge-off">ya ingresó</p><?php elseif ($expired): ?><p class="badge badge-off">vencida</p><?php endif; ?>
    <dl class="ticket-data">
      <div><dt>nombre</dt><dd><?= e($who) ?></dd></div>
      <div><dt>tipo</dt><dd><?= e($kind) ?></dd></div>
      <div><dt>cuándo</dt><dd><?= e(cfg('event.date_label')) ?> · <?= e(cfg('event.time_label')) ?></dd></div>
      <div><dt>dónde</dt><dd><a href="<?= e(cfg('event.maps_url')) ?>" target="_blank" rel="noopener"><?= e(cfg('event.venue')) ?> · <?= e(cfg('event.address')) ?></a></dd></div>
    </dl>
    <p class="ticket-detail"><?= e($detail) ?></p>
    <p class="ticket-motto"><?= e(cfg('event.motto')) ?></p>
  </article>

  <div class="share">
    <button class="btn btn-solid btn-block" type="button"
      data-share="<?= e($token) ?>"
      data-kicker="<?= e(cfg('event.kicker')) ?>"
      data-sub="<?= e((string) cfg('event.subhead', '')) ?>"
      data-headline="<?= e(cfg('event.headline')) ?>"
      data-motto="<?= e(cfg('event.motto')) ?>"
      data-when="<?= e(cfg('event.date_label') . ' · ' . cfg('event.venue')) ?>"
      data-number="<?= $number ?>">compartir en historias</button>
    <p class="fine">La imagen lleva tu huella, no tu QR: compartila tranquilo.</p>
  </div>

  <section class="card pizarra-form" id="pizarra">
    <h2>la pizarra</h2>
    <?php if ($msgNote): ?><p class="ok-note"><?= e($msgNote) ?></p><?php endif; ?>
    <?php if ($myMessage): ?>
      <p class="chalk">“<?= e($myMessage['body']) ?>”</p>
      <p class="muted"><?= ['pending' => 'en revisión', 'approved' => 'publicado en la pizarra', 'rejected' => 'no publicado'][$myMessage['status']] ?? '' ?></p>
    <?php else: ?>
      <p class="muted">Dejá un mensaje corto para la solar people. Se ve en la pizarra de la página y se proyecta en la fiesta.</p>
      <form method="post" action="mensaje.php" class="buy">
        <?= csrf_field() ?>
        <input type="hidden" name="t" value="<?= e($token) ?>">
        <label>tu mensaje (máximo <?= MESSAGE_MAX ?> caracteres)
          <textarea name="body" maxlength="<?= MESSAGE_MAX ?>" rows="3" required></textarea>
        </label>
        <button class="btn btn-ghost btn-block" type="submit">dejar mi mensaje</button>
      </form>
    <?php endif; ?>
  </section>
</main>
<?php page_end('', ['assets/qrcode.js', 'assets/art.js', 'assets/app.js']);
