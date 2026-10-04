<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib.php';
require __DIR__ . '/../app/view.php';
require __DIR__ . '/../app/auth.php';

header('X-Robots-Tag: noindex');
$role = require_role('door');
$B = '../';
page_start('Puerta · ' . cfg('brand.name'), 'page-scan', $B);
?>
<main class="wrap narrow scan" data-csrf="<?= e(csrf_token()) ?>">
  <div class="admin-top">
    <h1>puerta</h1>
    <nav><?php if ($role === 'admin'): ?><a class="btn btn-ghost" href="index.php">panel</a> <?php endif; ?><a class="btn btn-ghost" href="logout.php">salir</a></nav>
  </div>

  <div class="camera">
    <video id="video" playsinline muted></video>
    <canvas id="canvas" hidden></canvas>
    <button id="start" class="btn btn-solid">activar cámara</button>
    <div class="aim" aria-hidden="true"></div>
  </div>

  <div id="result" class="result" aria-live="assertive" hidden></div>

  <form id="manual" class="search">
    <input id="manual-q" placeholder="código o nombre" autocomplete="off">
    <button class="btn btn-ghost">buscar</button>
  </form>
  <div id="matches"></div>
</main>
<?php page_end($B, ['assets/jsQR.js', 'assets/scan.js']);
