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

page_start($title . ' · ' . cfg('event.title'), 'page-ticket');
?>
<main class="wrap narrow">
  <?php if (!empty($_GET['nueva'])): ?>
    <p class="ok-note">listo. también te lo mandamos por mail. hacé una captura por las dudas.</p>
  <?php endif; ?>
  <article class="ticket <?= $done ? 'is-used' : '' ?>">
    <header class="ticket-head">
      <img src="<?= e(cfg('brand.logo')) ?>" alt="" class="ticket-logo">
      <div>
        <p class="kicker"><?= e(cfg('event.kicker')) ?></p>
        <h1><?= e($title) ?></h1>
      </div>
    </header>
    <div class="qr" data-qr="<?= e(url('ticket.php?t=' . $token)) ?>" role="img" aria-label="Código QR de ingreso"></div>
    <p class="ticket-code"><?= e($code) ?></p>
    <?php if ($done): ?><p class="badge badge-off">ya ingresó</p><?php endif; ?>
    <dl class="ticket-data">
      <div><dt>nombre</dt><dd><?= e($who) ?></dd></div>
      <div><dt>tipo</dt><dd><?= e($kind) ?></dd></div>
      <div><dt>cuándo</dt><dd><?= e(cfg('event.date_label')) ?> · <?= e(cfg('event.time_label')) ?></dd></div>
      <div><dt>dónde</dt><dd><a href="<?= e(cfg('event.maps_url')) ?>" target="_blank" rel="noopener"><?= e(cfg('event.venue')) ?> · <?= e(cfg('event.address')) ?></a></dd></div>
    </dl>
    <p class="ticket-detail"><?= e($detail) ?></p>
    <p class="ticket-joke"><?= e(cfg('event.joke')) ?></p>
  </article>
</main>
<?php page_end('', ['assets/qrcode.js', 'assets/app.js']);
