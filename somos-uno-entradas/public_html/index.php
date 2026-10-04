<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';
require __DIR__ . '/app/view.php';

// Link de embajador: ?ref=oda queda guardado 30 días
$ref = clean_ref((string) ($_GET['ref'] ?? ''));
if ($ref !== '') {
    setcookie('su_ref', $ref, ['expires' => time() + 30 * 86400, 'path' => '/', 'samesite' => 'Lax']);
} else {
    $ref = clean_ref((string) ($_COOKIE['su_ref'] ?? ''));
}

$tiers = tiers();
$states = [];
foreach ($tiers as $id => $t) {
    $states[$id] = tier_state($t);
}
$lista = lista_state();
$feePct = (float) cfg('service_fee_percent', 0);
$max = (int) cfg('max_per_order', 4);
$error = (string) ($_GET['error'] ?? '');
$wall = approved_messages(40);

page_start(cfg('event.title') . ' · ' . cfg('event.date_label'));
?>
<header class="hero">
  <div class="wrap hero-inner">
    <div class="hero-logos">
      <img src="<?= e(cfg('brand.logo')) ?>" alt="<?= e(cfg('brand.name')) ?>" class="hero-logo">
      <?php if (cfg('brand.partner_logo')): ?>
        <span class="hero-x" aria-hidden="true">×</span>
        <img src="<?= e(cfg('brand.partner_logo')) ?>" alt="<?= e(cfg('event.venue')) ?>" class="hero-logo hero-logo-partner">
      <?php endif; ?>
    </div>
    <p class="kicker"><?= e(cfg('event.kicker')) ?></p>
    <div class="eclipse">
      <div class="eclipse-disc" aria-hidden="true"></div>
      <h1 class="display"><?= e(cfg('event.headline')) ?></h1>
    </div>
    <?php if (cfg('event.subhead')): ?><p class="hero-sub"><?= e(cfg('event.subhead')) ?></p><?php endif; ?>
    <p class="hero-date"><?= e(cfg('event.date_label')) ?> · <?= e(cfg('event.venue')) ?></p>
    <p class="hero-motto"><?= e(cfg('event.motto')) ?></p>
    <div class="countdown" data-start="<?= e(date('c', (int) strtotime((string) cfg('event.starts_at')))) ?>" aria-live="polite"></div>
    <div class="hero-cta">
      <a href="#entradas" class="btn btn-solid">comprar entrada</a>
      <?php if ($lista['open']): ?><a href="#lista" class="btn btn-ghost">anotarme en la lista</a><?php endif; ?>
    </div>
  </div>
</header>

<main>
  <?php if ($error !== ''): ?>
    <div class="wrap"><p class="alert" role="alert"><?= e($error) ?></p></div>
  <?php endif; ?>

  <section class="wrap info" aria-label="Información">
    <div><span class="label">cuándo</span><strong><?= e(cfg('event.date_label')) ?></strong><small><?= e(cfg('event.time_label')) ?></small></div>
    <div><span class="label">dónde</span><strong><?= e(cfg('event.venue')) ?></strong><small><a href="<?= e(cfg('event.maps_url')) ?>" target="_blank" rel="noopener"><?= e(cfg('event.address')) ?> ↗</a></small></div>
    <div><span class="label">qué suena</span><strong><?= e(cfg('event.genres')) ?></strong><small><?= e(cfg('event.age')) ?></small></div>
  </section>

  <section class="wrap lineup" aria-label="Line up">
    <span class="label">line up</span>
    <ul class="sets"><?php foreach ((array) cfg('event.lineup', []) as $dj): ?>
      <?php if (is_array($dj)): ?><li><span class="set-time"><?= e($dj[0]) ?></span><?= e($dj[1]) ?></li><?php else: ?><li><?= e($dj) ?></li><?php endif; ?>
    <?php endforeach; ?></ul>
    <?php if (cfg('event.guest.name')): ?>
      <div class="guest">
        <span class="label"><?= e(cfg('event.guest.label')) ?></span>
        <p class="guest-name"><?= e(cfg('event.guest.name')) ?></p>
        <p class="guest-detail"><?= e(cfg('event.guest.detail')) ?></p>
      </div>
    <?php endif; ?>
  </section>

  <?php if (cfg('about.text')): ?>
  <section class="wrap release" aria-label="Qué es SOLARIS">
    <span class="label"><?= e(cfg('about.label')) ?></span>
    <p><?= e(cfg('about.text')) ?></p>
    <?php if (cfg('release.text')): ?><p class="release-note"><?= e(cfg('release.text')) ?></p><?php endif; ?>
  </section>
  <?php endif; ?>

  <section class="wrap pillars" aria-label="Concepto">
    <?php foreach ((array) cfg('pillars', []) as $i => $p): ?>
      <div class="pillar"><span class="num">0<?= $i + 1 ?></span><h3><?= e($p[0]) ?></h3><p><?= e($p[1]) ?></p></div>
    <?php endforeach; ?>
  </section>

  <section class="wrap wall" id="pizarra" aria-label="La pizarra">
    <h2 class="section-title">la pizarra</h2>
    <div class="board">
      <?php if ($wall): ?>
        <?php foreach ($wall as $i => $m): ?>
          <figure class="note" style="--r: <?= (crc32($m['author'] . $m['body']) % 7) - 3 ?>deg">
            <blockquote><?= e($m['body']) ?></blockquote>
            <figcaption>— <?= e($m['author']) ?></figcaption>
          </figure>
        <?php endforeach; ?>
      <?php else: ?>
        <p class="note-empty">todavía está en blanco. sacá tu entrada y sé el primero en escribir.</p>
      <?php endif; ?>
    </div>
    <p class="fine">Cada persona con entrada deja un mensaje. Lo vas a ver proyectado en Melt esa noche.</p>
  </section>

  <section class="wrap" id="entradas">
    <h2 class="section-title">entradas</h2>
    <div class="tiers">
      <?php foreach ($tiers as $id => $t): $s = $states[$id]; ?>
        <article class="tier <?= $s['open'] ? '' : 'is-closed' ?>">
          <div class="tier-head">
            <h3><?= e($t['name']) ?></h3>
            <?php if (!$s['open']): ?>
              <span class="badge badge-off"><?= e($s['label']) ?></span>
            <?php elseif ($s['left'] <= max(5, (int) ceil($t['stock'] * 0.25))): ?>
              <span class="badge">quedan <?= (int) $s['left'] ?></span>
            <?php elseif (!empty($t['note'])): ?>
              <span class="badge badge-soft"><?= e($t['note']) ?></span>
            <?php endif; ?>
          </div>
          <p class="price">
            <?php if (!empty($t['anchor']) && (int) $t['anchor'] > (int) $t['price']): ?><s><?= money((int) $t['anchor']) ?></s><?php endif; ?>
            <?= money((int) $t['price']) ?>
          </p>
          <?php if ($s['open'] && tier_link($t) !== ''): ?>
            <a class="btn btn-solid btn-block" href="<?= e(tier_link($t)) ?>" rel="noopener">comprar en mercado pago</a>
          <?php elseif ($s['open']): ?>
            <form method="post" action="checkout.php" class="buy">
              <?= csrf_field() ?>
              <input type="hidden" name="tier" value="<?= e($id) ?>">
              <input type="hidden" name="ref" value="<?= e($ref) ?>">
              <label>cantidad
                <select name="qty" data-price="<?= (int) $t['price'] ?>" data-fee="<?= e((string) $feePct) ?>">
                  <?php for ($i = 1; $i <= min($max, $s['left']); $i++): ?><option value="<?= $i ?>"><?= $i ?></option><?php endfor; ?>
                </select>
              </label>
              <label>nombre y apellido<input name="name" required minlength="3" maxlength="120" autocomplete="name"></label>
              <label>mail (te llega la entrada)<input name="email" type="email" required maxlength="190" autocomplete="email" inputmode="email"></label>
              <p class="total">total <strong data-total><?= money((int) $t['price'] + fee_for((int) $t['price'])) ?></strong><?php if ($feePct > 0): ?> <small>incluye cargo por servicio</small><?php endif; ?></p>
              <button class="btn btn-solid btn-block" type="submit">pagar con mercado pago</button>
            </form>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    </div>
    <p class="fine">En puerta: <?= money((int) cfg('event.door_price', 0)) ?>. Pagás con tarjeta, débito o dinero en cuenta de Mercado Pago.</p>
    <?php if (!uses_checkout() && cfg('link_note')): ?><p class="fine"><?= e(cfg('link_note')) ?></p><?php endif; ?>
  </section>

  <?php if (cfg('lista.enabled', false)): ?>
  <section class="wrap" id="lista">
    <h2 class="section-title">lista</h2>
    <div class="card">
      <p class="lead"><?= e(cfg('lista.benefit')) ?></p>
      <?php if (cfg('lista.note')): ?><p class="muted lista-note"><?= e(cfg('lista.note')) ?></p><?php endif; ?>
      <?php if ($lista['open']): ?>
        <form method="post" action="lista.php" class="buy">
          <?= csrf_field() ?>
          <input type="hidden" name="ref" value="<?= e($ref) ?>">
          <label>nombre y apellido<input name="name" required minlength="3" maxlength="120" autocomplete="name"></label>
          <label>mail<input name="email" type="email" required maxlength="190" autocomplete="email" inputmode="email"></label>
          <?php if (cfg('ambassadors')): ?>
          <label>¿quién te invitó?
            <select name="who">
              <option value="">nadie, vine solo/a</option>
              <?php foreach ((array) cfg('ambassadors') as $k => $n): ?><option value="<?= e($k) ?>" <?= $k === $ref ? 'selected' : '' ?>><?= e($n) ?></option><?php endforeach; ?>
            </select>
          </label>
          <?php endif; ?>
          <button class="btn btn-ghost btn-block" type="submit">anotarme</button>
        </form>
      <?php else: ?>
        <p class="muted"><?= e($lista['label']) ?>.</p>
      <?php endif; ?>
    </div>
  </section>
  <?php endif; ?>

  <section class="wrap faq" aria-label="Preguntas frecuentes">
    <h2 class="section-title">preguntas</h2>
    <?php foreach ((array) cfg('faq', []) as $f): ?>
      <details><summary><?= e($f[0]) ?></summary><p><?= e($f[1]) ?></p></details>
    <?php endforeach; ?>
  </section>
</main>
<?php page_end('', ['assets/app.js']);
