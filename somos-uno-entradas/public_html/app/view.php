<?php
declare(strict_types=1);

function page_start(string $title, string $bodyClass = '', string $base = ''): void
{
    start_session();  // antes de imprimir nada: los formularios necesitan la cookie de sesión
    $c = (array) cfg('brand.colors');
    $desc = cfg('event.headline') . ' ' . cfg('event.date_label') . ' · ' . cfg('event.venue') . ' · ' . cfg('event.genres');
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    ?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($title) ?></title>
<meta name="description" content="<?= e($desc) ?>">
<meta property="og:title" content="<?= e(cfg('event.title')) ?>">
<meta property="og:description" content="<?= e($desc) ?>">
<meta name="theme-color" content="<?= e($c['bg'] ?? '#0b0930') ?>">
<link rel="icon" href="<?= e($base . cfg('brand.logo')) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&family=Caveat:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e($base) ?>assets/style.css?v=1">
<style>:root{--bg:<?= e($c['bg'] ?? '#0b0930') ?>;--glow:<?= e($c['glow'] ?? '#3a2cf0') ?>;--accent:<?= e($c['accent'] ?? '#9d8cff') ?>;--cream:<?= e($c['cream'] ?? '#f3e6cf') ?>}</style>
</head>
<body class="<?= e($bodyClass) ?>">
<?php if (demo()): ?><div class="demo-bar">modo demo · los pagos se aprueban solos</div><?php endif; ?>
<?php
}

function page_end(string $base = '', array $scripts = []): void
{
    ?>
<footer class="foot">
  <img src="<?= e($base . cfg('brand.logo')) ?>" alt="" class="foot-logo">
  <p><?= e(cfg('brand.name')) ?> · <a href="https://instagram.com/<?= e(cfg('brand.instagram')) ?>" target="_blank" rel="noopener">@<?= e(cfg('brand.instagram')) ?></a></p>
</footer>
<?php foreach ($scripts as $s): ?><script src="<?= e($base . $s) ?>"></script>
<?php endforeach; ?>
</body>
</html>
<?php
}

/** Página simple de mensaje (errores, estados). */
function message_page(string $title, string $html, string $base = '', int $status = 200): void
{
    http_response_code($status);
    page_start($title . ' · ' . cfg('brand.name'), 'page-msg', $base);
    ?>
<main class="wrap narrow msg">
  <a href="<?= e($base ?: './') ?>" class="msg-logo"><img src="<?= e($base . cfg('brand.logo')) ?>" alt="<?= e(cfg('brand.name')) ?>"></a>
  <h1><?= e($title) ?></h1>
  <div class="msg-body"><?= $html ?></div>
</main>
<?php
    page_end($base);
    exit;
}
