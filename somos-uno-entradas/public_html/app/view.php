<?php
declare(strict_types=1);

function page_start(string $title, string $bodyClass = '', string $base = ''): void
{
    start_session();  // antes de imprimir nada: los formularios necesitan la cookie de sesión
    $c = (array) cfg('brand.colors');
    $desc = event_full() . ' · ' . cfg('event.date_label') . ' · ' . cfg('event.venue') . ' · ' . cfg('event.genres');
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
<meta name="theme-color" content="<?= e($c['bg'] ?? '#070202') ?>">
<link rel="icon" href="<?= e($base . asset((string) cfg('brand.logo'))) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Major+Mono+Display&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&family=Caveat:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= e($base . asset('assets/style.css')) ?>">
<style>:root{--bg:<?= e($c['bg'] ?? '#070202') ?>;--glow:<?= e($c['glow'] ?? '#6b0d07') ?>;--accent:<?= e($c['accent'] ?? '#d9482c') ?>;--cream:<?= e($c['cream'] ?? '#efe2d6') ?>}</style>
</head>
<body class="<?= e($bodyClass) ?>">
<?php if (demo() && uses_checkout()): ?><div class="demo-bar">modo demo · los pagos se aprueban solos</div><?php endif; ?>
<?php
}

function page_end(string $base = '', array $scripts = []): void
{
    ?>
<footer class="foot">
  <img src="<?= e($base . asset((string) cfg('brand.logo'))) ?>" alt="" class="foot-logo">
  <p><?= e(cfg('brand.name')) ?> · <a href="https://instagram.com/<?= e(cfg('brand.instagram')) ?>" target="_blank" rel="noopener"><?= ig_icon() ?>@<?= e(cfg('brand.instagram')) ?></a></p>
</footer>
<?php foreach ($scripts as $s): ?><script src="<?= e($base . asset($s)) ?>"></script>
<?php endforeach; ?>
</body>
</html>
<?php
}

/** Logo SOLARIS: letras sueltas que flotan; la "o" es un sol eclipsado (disco negro, corona y anillo de diamante). */
function wordmark(string $word): string
{
    $out = '';
    foreach (mb_str_split(mb_strtolower($word)) as $i => $ch) {
        $out .= $ch === 'o'
            ? '<span class="ch eo" style="--i:' . $i . '"><i></i></span>'
            : '<span class="ch" style="--i:' . $i . '">' . e($ch) . '</span>';
    }
    return '<span class="wordmark" aria-hidden="true">' . $out . '</span>';
}

/** Saxo en línea (junto al invitado especial). */
function sax_icon(): string
{
    return '<svg class="sax" viewBox="0 0 72 100" aria-hidden="true">'
        . '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
        . '<path d="M8 9 L19 14" stroke-width="3.2"/>'
        . '<path d="M19 14 C29 17 36 19 36 29 L35 70 C35 91 59 91 59 73 L59 60" stroke-width="7"/>'
        . '<path d="M55.5 61 L62.5 61 L69 46 L49 46 Z" fill="currentColor" stroke-width="2"/>'
        . '<path d="M49 46 Q59 43 69 46" stroke-width="2.4"/>'
        . '<path d="M40 36 L44 34 M40 48 L44 46 M39.5 60 L43.5 58" stroke-width="1.6"/></g>'
        . '<g fill="var(--accent)"><circle cx="35.8" cy="37" r="1.9"/><circle cx="35.6" cy="45" r="1.9"/><circle cx="35.4" cy="53" r="1.9"/><circle cx="35.2" cy="61" r="1.9"/></g>'
        . '</svg>';
}

/** Celular tachado (pilar "Conexión"). */
function no_phone_icon(): string
{
    return '<svg class="no-phone" viewBox="0 0 32 32" aria-label="sin celular" role="img" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">'
        . '<rect x="10" y="4" width="12" height="24" rx="2.5"/><path d="M14.5 24.5h3"/>'
        . '<path d="M5 5l22 22" stroke="var(--accent)" stroke-width="2.6"/></svg>';
}

/** Ícono de Instagram (hereda el color del texto). */
function ig_icon(): string
{
    return '<svg class="ig" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">'
        . '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
}

/** Página simple de mensaje (errores, estados). */
function message_page(string $title, string $html, string $base = '', int $status = 200): void
{
    http_response_code($status);
    page_start($title . ' · ' . cfg('brand.name'), 'page-msg', $base);
    ?>
<main class="wrap narrow msg">
  <a href="<?= e($base ?: './') ?>" class="msg-logo"><img src="<?= e($base . asset((string) cfg('brand.logo'))) ?>" alt="<?= e(cfg('brand.name')) ?>"></a>
  <h1><?= e($title) ?></h1>
  <div class="msg-body"><?= $html ?></div>
</main>
<?php
    page_end($base);
    exit;
}
