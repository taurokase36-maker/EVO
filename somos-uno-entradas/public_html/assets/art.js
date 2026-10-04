/* Huella de energía: arte único y determinístico para cada entrada.
   El mismo token siempre dibuja la misma huella. */
(function () {
  'use strict';

  // Generador pseudoaleatorio a partir de un texto (FNV-1a + mulberry32)
  function seedFrom(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /** Devuelve una lista de anillos: cada uno es un array de puntos [x, y] en un espacio de -1 a 1. */
  function rings(key, count) {
    var r = rng(seedFrom(key));
    var lobes = 2 + Math.floor(r() * 5);           // cuántas "ondas" tiene la huella
    var twist = (r() - 0.5) * 1.6;                  // cuánto gira de anillo a anillo
    var amp = 0.05 + r() * 0.09;                    // intensidad de la ondulación
    var phase = r() * Math.PI * 2;
    var wobble = 3 + Math.floor(r() * 6);
    var out = [];
    for (var k = 0; k < count; k++) {
      var base = 0.12 + (k / (count - 1)) * 0.82;
      var pts = [];
      for (var i = 0; i <= 120; i++) {
        var a = (i / 120) * Math.PI * 2;
        var d = base * (1
          + amp * Math.sin(lobes * a + phase + twist * k * 0.35)
          + amp * 0.45 * Math.sin(wobble * a - phase * 1.7 + k * 0.5));
        pts.push([Math.cos(a) * d, Math.sin(a) * d]);
      }
      out.push(pts);
    }
    return out;
  }

  function svg(key, color, accent) {
    var rs = rings(key, 14);
    var paths = rs.map(function (pts, k) {
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + (p[0] * 100).toFixed(2) + ' ' + (p[1] * 100).toFixed(2); }).join('') + 'Z';
      var c = k % 4 === 3 ? accent : color;
      var op = (0.35 + 0.65 * (k / rs.length)).toFixed(2);
      return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-opacity="' + op + '" stroke-width="' + (k % 4 === 3 ? 1.6 : 1) + '"/>';
    }).join('');
    return '<svg viewBox="-105 -105 210 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + paths + '</svg>';
  }

  function drawOn(ctx, key, cx, cy, size, color, accent, t, alpha) {
    alpha = alpha === undefined ? 1 : alpha;
    var rs = rings(key, 18);
    rs.forEach(function (pts, k) {
      ctx.beginPath();
      var s = size * (1 + (t ? 0.015 * Math.sin(t / 900 + k * 0.4) : 0));
      pts.forEach(function (p, i) { var x = cx + p[0] * s, y = cy + p[1] * s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath();
      ctx.globalAlpha = alpha * (0.3 + 0.7 * (k / rs.length));
      ctx.strokeStyle = k % 4 === 3 ? accent : color;
      ctx.lineWidth = (k % 4 === 3 ? 3.2 : 2) * size / 400;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  window.Huella = { svg: svg, draw: drawOn, rings: rings };

  var css = getComputedStyle(document.documentElement);
  var cream = (css.getPropertyValue('--cream') || '#f3e6cf').trim();
  var accent = (css.getPropertyValue('--accent') || '#9d8cff').trim();
  var bg = (css.getPropertyValue('--bg') || '#0b0930').trim();
  var glow = (css.getPropertyValue('--glow') || '#3a2cf0').trim();

  // Huella en la entrada
  document.querySelectorAll('[data-huella]').forEach(function (el) {
    el.innerHTML = svg(el.getAttribute('data-huella'), el.getAttribute('data-color') || cream, accent);
  });

  // Imagen para historias (1080x1920). Nunca incluye el QR ni el código de la entrada.
  var btn = document.querySelector('[data-share]');
  if (btn) {
    btn.addEventListener('click', function () {
      var d = btn.dataset;
      var c = document.createElement('canvas');
      c.width = 1080; c.height = 1920;
      var ctx = c.getContext('2d');
      var draw = function () {
        var g = ctx.createRadialGradient(540, 760, 40, 540, 760, 1100);
        g.addColorStop(0, glow); g.addColorStop(0.55, bg); g.addColorStop(1, bg);
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
        drawOn(ctx, d.share, 540, 760, 400, cream, accent);
        ctx.fillStyle = cream; ctx.textAlign = 'center';
        ctx.font = '600 30px "Space Mono", monospace';
        ctx.fillText((d.kicker || '').toUpperCase().split('').join(' '), 540, 230);
        ctx.font = 'italic 150px "Instrument Serif", Georgia, serif';
        ctx.fillText(d.headline || '', 540, 1360);
        ctx.font = 'italic 76px "Instrument Serif", Georgia, serif';
        ctx.fillText(d.motto || '', 540, 1470);
        ctx.font = '600 34px "Space Mono", monospace';
        ctx.fillText((d.when || '').toUpperCase(), 540, 1600);
        ctx.globalAlpha = 0.75;
        ctx.font = '400 30px "Space Mono", monospace';
        ctx.fillText(d.number ? 'SOMOS EL Nº ' + d.number : '', 540, 1700);
        ctx.globalAlpha = 1;
        c.toBlob(function (blob) {
          var file = new File([blob], 'somos-uno.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file] }).catch(function () {});
          } else {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'somos-uno.png';
            document.body.appendChild(a); a.click(); a.remove();
          }
        }, 'image/png');
      };
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(draw);
    });
  }
})();
