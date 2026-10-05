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
$wallNote = [
    'ok'       => 'listo. tu mensaje queda en revisión y aparece en la pizarra cuando se apruebe.',
    'vacio'    => 'escribí un mensaje.',
    'limite'   => 'ya dejaste varios mensajes. probá de nuevo en un rato.',
    'expirado' => 'la página estuvo abierta mucho tiempo. probá de nuevo.',
    'cerrada'  => 'la pizarra no está recibiendo mensajes.',
][(string) ($_GET['pz'] ?? '')] ?? '';
$ig = (string) cfg('brand.instagram');
$intl = (array) cfg('event.intl_guest', []);

page_start(cfg('event.title') . ' · ' . cfg('event.date_label'));
?>
<header class="hero">
  <div class="wrap hero-inner">
    <div class="hero-logos">
      <figure class="hero-brand">
        <img src="<?= e(asset((string) cfg('brand.logo'))) ?>" alt="" class="hero-logo">
        <figcaption><?= e(cfg('brand.name')) ?></figcaption>
      </figure>
      <?php if (cfg('brand.partner_logo')): ?>
        <span class="hero-x" aria-hidden="true">×</span>
        <figure class="hero-brand">
          <img src="<?= e(asset((string) cfg('brand.partner_logo'))) ?>" alt="" class="hero-logo hero-logo-partner">
          <figcaption><?= e(cfg('event.venue')) ?></figcaption>
        </figure>
      <?php endif; ?>
    </div>
    <p class="kicker"><?= e(cfg('event.kicker')) ?></p>
    <h1 class="title" aria-label="<?= e(cfg('event.headline')) ?>"><?= wordmark((string) cfg('event.headline')) ?></h1>
    <?php if (cfg('event.subhead')): ?><p class="hero-sub"><?= e(cfg('event.subhead')) ?></p><?php endif; ?>
    <p class="hero-date"><?= e(cfg('event.date_label')) ?> · <?= e(cfg('event.venue')) ?></p>
    <p class="hero-motto"><?= e(cfg('event.motto')) ?></p>
    <div class="countdown" data-start="<?= e(date('c', (int) strtotime((string) cfg('event.starts_at')))) ?>" aria-live="polite"></div>
    <div class="hero-cta">
      <a href="#entradas" class="btn btn-solid">comprar entrada</a>
      <?php if ($lista['open']): ?><a href="#lista" class="btn btn-ghost">anotarme en la lista</a><?php endif; ?>
      <?php if ($ig !== ''): ?><a href="https://instagram.com/<?= e($ig) ?>" class="btn btn-ghost" target="_blank" rel="noopener"><?= ig_icon() ?>@<?= e($ig) ?></a><?php endif; ?>
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
      <?php if (is_array($dj)): ?><li><span class="set-time"><?= e($dj[0]) ?></span><?= e($dj[1]) ?><?php if (!empty($dj[2])): ?><span class="set-tag"><?= e($dj[2]) ?></span><?php endif; ?></li><?php else: ?><li><?= e($dj) ?></li><?php endif; ?>
    <?php endforeach; ?></ul>
    <?php if (cfg('event.guest.name')): ?>
      <div class="guest">
        <span class="label"><?= e(cfg('event.guest.label')) ?></span>
        <p class="guest-name"><?= sax_icon() ?><?= e(cfg('event.guest.name')) ?></p>
        <p class="guest-detail"><?= e(cfg('event.guest.detail')) ?></p>
      </div>
    <?php endif; ?>
    <?php if (!empty($intl['name'])): ?>
      <div class="intl">
        <span class="label"><?= e($intl['label'] ?? '') ?></span>
        <p class="guest-name"><?= e($intl['name']) ?></p>
        <?php if (!empty($intl['time'])): ?><p class="set-time"><?= e($intl['time']) ?></p><?php endif; ?>
        <p class="guest-detail"><?= e($intl['detail'] ?? '') ?></p>
        <?php if (!empty($intl['logo']) || !empty($intl['instagram'])): ?>
          <a class="intl-by" <?php if (!empty($intl['instagram'])): ?>href="https://instagram.com/<?= e($intl['instagram']) ?>" target="_blank" rel="noopener"<?php endif; ?>>
            <?php if (!empty($intl['logo'])): ?><img src="<?= e(asset((string) $intl['logo'])) ?>" alt="<?= e($intl['by'] ?? '') ?>" class="intl-logo"><?php endif; ?>
            <?php if (!empty($intl['instagram'])): ?><span><?= ig_icon() ?>@<?= e($intl['instagram']) ?></span><?php endif; ?>
          </a>
        <?php endif; ?>
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
      <div class="pillar"><span class="num">0<?= $i + 1 ?></span><h3><?= e($p[0]) ?><?php if (($p[2] ?? '') === 'no-phone'): ?><?= no_phone_icon() ?><?php endif; ?></h3><p><?= e($p[1]) ?></p></div>
    <?php endforeach; ?>
  </section>

  <section class="wrap wall" id="pizarra" aria-label="La pizarra">
    <h2 class="section-title section-caps">LA PIZARRA</h2>
    <div class="board">
      <?php if ($wall): ?>
        <?php foreach ($wall as $i => $m): ?>
          <figure class="note" style="--r: <?= (crc32($m['author'] . $m['body']) % 7) - 3 ?>deg">
            <blockquote><?= e($m['body']) ?></blockquote>
            <?php if ($m['author'] !== ''): ?><figcaption>— <?= e($m['author']) ?></figcaption><?php endif; ?>
          </figure>
        <?php endforeach; ?>
      <?php else: ?>
        <p class="note-empty">todavía está en blanco. sé el primero en escribir.</p>
      <?php endif; ?>
    </div>
    <?php if (cfg('wall.public', false)): ?>
      <form method="post" action="mensaje.php" class="buy wall-form">
        <?= csrf_field() ?>
        <input type="hidden" name="public" value="1">
        <label class="hp" aria-hidden="true">web<input name="web" tabindex="-1" autocomplete="off"></label>
        <?php if ($wallNote): ?><p class="ok-note" role="status"><?= e($wallNote) ?></p><?php endif; ?>
        <label>tu mensaje para la solar people <small class="muted" data-count>(máximo <?= MESSAGE_MAX ?>)</small>
          <textarea name="body" maxlength="<?= MESSAGE_MAX ?>" rows="3" required></textarea>
        </label>
        <button class="btn btn-ghost btn-block" type="submit">escribir en la pizarra</button>
      </form>
      <p class="fine">Es anónimo. Los mensajes se revisan antes de publicarse y esa noche se proyectan en Melt.</p>
    <?php else: ?>
      <p class="fine">Cada persona con entrada deja un mensaje. Lo vas a ver proyectado en Melt esa noche.</p>
    <?php endif; ?>
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
          <?php if (!empty($t['detail'])): ?><p class="tier-detail"><?= e($t['detail']) ?></p><?php endif; ?>
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

  <?php if ($ig !== ''): ?>
  <section class="wrap follow" aria-label="Instagram">
    <img src="<?= e(asset((string) cfg('brand.logo'))) ?>" alt="" class="follow-logo">
    <p>novedades, horarios y la próxima fecha</p>
    <a href="https://instagram.com/<?= e($ig) ?>" class="btn btn-solid" target="_blank" rel="noopener"><?= ig_icon() ?>seguir a @<?= e($ig) ?></a>
  </section>
  <?php endif; ?>

  <section class="wrap faq" aria-label="Preguntas frecuentes">
    <h2 class="section-title">preguntas</h2>
    <?php foreach ((array) cfg('faq', []) as $f): ?>
      <details><summary><?= e($f[0]) ?></summary><p><?= e($f[1]) ?></p></details>
    <?php endforeach; ?>
  </section>
</main>
<?php $music = (string) cfg('music.file', 'assets/musica.mp3'); if ($music !== '' && is_file(__DIR__ . '/' . $music)): ?>
<audio id="bg-music" src="<?= e(asset($music)) ?>" loop preload="auto" data-volume="<?= e((string) cfg('music.volume', 0.6)) ?>"></audio>
<button type="button" class="sound is-off" id="sound" aria-label="activar música" aria-pressed="false">
  <svg viewBox="0 0 40 40" aria-hidden="true"><g class="sound-rays"><?php for ($r = 0; $r < 12; $r++): ?><line x1="20" y1="3" x2="20" y2="8" transform="rotate(<?= $r * 30 ?> 20 20)"/><?php endfor; ?></g><circle class="sound-sun" cx="20" cy="20" r="8.5"/><circle class="sound-moon" cx="20" cy="20" r="8.5"/></svg>
</button>
<?php endif; ?>
<?php page_end('', ['assets/app.js']);
