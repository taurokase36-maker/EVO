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
  var cream = (css.getPropertyValue('--cream') || '#efe2d6').trim();
  var accent = (css.getPropertyValue('--accent') || '#d9482c').trim();
  var bg = (css.getPropertyValue('--bg') || '#070202').trim();
  var glow = (css.getPropertyValue('--glow') || '#6b0d07').trim();

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
        ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
        // Eclipse: corona roja, disco negro y la huella adentro del sol
        var co = ctx.createRadialGradient(540, 760, 300, 540, 760, 620);
        co.addColorStop(0, accent); co.addColorStop(0.12, glow); co.addColorStop(1, bg);
        ctx.fillStyle = co; ctx.beginPath(); ctx.arc(540, 760, 620, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(540, 760, 300, 0, Math.PI * 2); ctx.fill();
        drawOn(ctx, d.share, 540, 760, 240, cream, accent);
        ctx.fillStyle = cream; ctx.textAlign = 'center';
        // Quién presenta: en una o dos líneas, según entre
        ctx.font = '600 30px "Space Mono", monospace';
        var spaced = function (s) { return s.toUpperCase().split('').join(' '); };
        var lines = [], line = '';
        (d.kicker || '').split(' ').forEach(function (w) {
          var t = line ? line + ' ' + w : w;
          if (line && ctx.measureText(spaced(t)).width > 960) { lines.push(line); line = w; } else { line = t; }
        });
        if (line) lines.push(line);
        lines.forEach(function (l, i) { ctx.fillText(spaced(l), 540, 210 + i * 50); });
        var hs = 170;   // el título se achica hasta entrar en el ancho
        do { ctx.font = hs + 'px "Instrument Serif", Georgia, serif'; hs -= 6; } while (hs > 60 && ctx.measureText(d.headline || '').width > 960);
        ctx.fillText(d.headline || '', 540, 1330);
        ctx.fillStyle = accent;
        var sub = spaced(d.sub || ''), ss = 38;
        do { ctx.font = '700 ' + ss + 'px "Space Mono", monospace'; ss -= 2; } while (ss > 16 && ctx.measureText(sub).width > 960);
        ctx.fillText(sub, 540, 1410);
        ctx.fillStyle = cream;
        ctx.font = 'italic 70px "Instrument Serif", Georgia, serif';
        ctx.fillText(d.motto || '', 540, 1510);
        ctx.font = '600 34px "Space Mono", monospace';
        ctx.fillText((d.when || '').toUpperCase(), 540, 1600);
        ctx.globalAlpha = 0.75;
        ctx.font = '400 30px "Space Mono", monospace';
        ctx.fillText(d.number ? 'SOLAR PEOPLE Nº ' + d.number : '', 540, 1700);
        ctx.globalAlpha = 1;
        c.toBlob(function (blob) {
          var file = new File([blob], 'solaris.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file] }).catch(function () {});
          } else {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'solaris.png';
            document.body.appendChild(a); a.click(); a.remove();
          }
        }, 'image/png');
      };
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(draw);
    });
  }
})();
