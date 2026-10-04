<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';

// Pantalla para el proyector de Melt: contador "somos X", mensajes aprobados en rotación y la huella animada.
$c = (array) cfg('brand.colors');
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');
?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pantalla · <?= e(cfg('brand.name')) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&family=Caveat:wght@500;700&display=swap" rel="stylesheet">
<style>
  :root { --bg: <?= e($c['bg'] ?? '#0b0930') ?>; --glow: <?= e($c['glow'] ?? '#3a2cf0') ?>; --accent: <?= e($c['accent'] ?? '#9d8cff') ?>; --cream: <?= e($c['cream'] ?? '#f3e6cf') ?>; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; background: var(--bg); color: var(--cream); overflow: hidden; cursor: none; }
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; }
  .top { position: fixed; top: 4vh; left: 0; right: 0; text-align: center; font: 700 1.6vw/1 'Space Mono', monospace; letter-spacing: .35em; text-transform: uppercase; color: var(--accent); }
  .count { position: fixed; bottom: 6vh; left: 0; right: 0; text-align: center; font: italic 6vw/1 'Instrument Serif', Georgia, serif; }
  .count small { display: block; font: 700 1.1vw/1.6 'Space Mono', monospace; letter-spacing: .3em; text-transform: uppercase; color: var(--accent); margin-top: 1vh; }
  .msg { position: fixed; inset: 18vh 12vw 26vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: opacity 1.2s ease; }
  .msg p { font: 700 5.2vw/1.15 'Caveat', cursive; text-shadow: 0 0 40px rgba(0,0,0,.6); }
  .msg span { font: 400 1.6vw/1 'Space Mono', monospace; letter-spacing: .2em; color: var(--accent); margin-top: 3vh; }
  .hidden { opacity: 0; }
  .full { position: fixed; top: 2vh; right: 2vw; background: none; border: 1px solid var(--accent); color: var(--accent); font: 700 12px 'Space Mono', monospace; padding: 8px 12px; border-radius: 20px; cursor: pointer; }
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="top"><?= e(cfg('event.kicker')) ?></div>
<div class="msg hidden" id="msg"><p id="msg-text"></p><span id="msg-author"></span></div>
<div class="count"><span id="count">somos uno.</span><small id="count-sub"></small></div>
<button class="full" id="full">pantalla completa</button>
<script src="assets/art.js"></script>
<script>
(function () {
  'use strict';
  var css = getComputedStyle(document.documentElement);
  var cream = css.getPropertyValue('--cream').trim(), accent = css.getPropertyValue('--accent').trim();
  var bg = css.getPropertyValue('--bg').trim(), glow = css.getPropertyValue('--glow').trim();
  var cv = document.getElementById('bg'), ctx = cv.getContext('2d');
  var seeds = ['somos-uno'], messages = [], idx = 0;

  function resize() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
  addEventListener('resize', resize); resize();

  // Huellas de fondo: una por mensaje aprobado, superpuestas y respirando
  function frame(t) {
    var w = cv.width, h = cv.height;
    var g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.7);
    g.addColorStop(0, glow); g.addColorStop(0.6, bg); g.addColorStop(1, bg);
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    var size = Math.min(w, h) * 0.42;
    seeds.slice(0, 6).forEach(function (s, i) {
      Huella.draw(ctx, s, w / 2, h / 2, size * (1 + i * 0.12), cream, accent, t + i * 700, i === 0 ? 0.35 : 0.12);
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function load() {
    fetch('pizarra.php', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      messages = d.messages || [];
      seeds = ['somos-uno'].concat(messages.map(function (m) { return m.author + m.body; }));
      document.getElementById('count').textContent = d.inside > 0 ? 'somos ' + d.inside : 'somos uno.';
      document.getElementById('count-sub').textContent = d.inside > 0 && d.capacity ? 'de ' + d.capacity + ' bajo tierra' : '';
    }).catch(function () {});
  }
  load(); setInterval(load, 20000);

  var box = document.getElementById('msg');
  function next() {
    if (!messages.length) { box.classList.add('hidden'); return; }
    box.classList.add('hidden');
    setTimeout(function () {
      var m = messages[idx++ % messages.length];
      document.getElementById('msg-text').textContent = m.body;
      document.getElementById('msg-author').textContent = '— ' + m.author;
      box.classList.remove('hidden');
    }, 1200);
  }
  setTimeout(next, 1500); setInterval(next, 7000);

  document.getElementById('full').addEventListener('click', function () {
    (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
    this.remove();
  });
})();
</script>
</body>
</html>
