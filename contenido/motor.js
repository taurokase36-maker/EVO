/* SOLARIS · motor de dibujo "grabado" para las piezas de redes.
   Las tres láminas de propuestas/caverna, convertidas en funciones reutilizables. */
(function () {
  'use strict';
  var W = 1080, H = 1920, ctx = null;
  var C = { bg: '#070202', glow: '#6b0d07', accent: '#d9482c', cream: '#efe2d6', fire: '#e8803a' };

  function use(canvas) { W = canvas.width; H = canvas.height; ctx = canvas.getContext('2d'); }
  // Dibuja en un lienzo aparte (por ejemplo, una lámina de 1080x1920 para recortarla en un post)
  function offscreen(w, h, fn) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var save = [W, H, ctx]; use(c); fn(); W = save[0]; H = save[1]; ctx = save[2];
    return c;
  }

  // ---------- utilidades ----------
  function seedFrom(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function layer() { var c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  function smooth(x, seed) { var r = rng(seed), s = 0, a = 1, tot = 0; for (var i = 0; i < 5; i++) { var f = 1 + i * 1.7 + r() * 2, p = r() * 10; s += a * Math.sin(x * f + p); tot += a; a *= 0.6; } return 0.5 + 0.5 * s / tot; }
  function roman(n) { var out = ''; [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].forEach(function (p) { while (n >= p[0]) { out += p[1]; n -= p[0]; } }); return out; }

  // ---------- fondo ----------
  function background() { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); }
  function marble(seed) {
    var mb = layer(), mg = mb.getContext('2d'), r = rng(seed || 42);
    mg.strokeStyle = C.cream; mg.lineCap = 'round';
    for (var v = 0; v < 26 * H / 1920; v++) {
      var x = r() * W, y = r() * H, a = r() * Math.PI * 2;
      mg.globalAlpha = 0.04 + r() * 0.09; mg.lineWidth = 0.4 + r() * 1.6; mg.beginPath(); mg.moveTo(x, y);
      for (var s = 0; s < 120; s++) { a += (smooth(s * 0.08, v * 13) - 0.5) * 0.5; x += Math.cos(a) * 9; y += Math.sin(a) * 9; mg.lineTo(x, y); if (r() < 0.02) mg.moveTo(x, y); }
      mg.stroke();
    }
    ctx.drawImage(mb, 0, 0);
  }
  function grain(alpha) {
    var g = document.createElement('canvas'); g.width = W / 2; g.height = H / 2;
    var gx = g.getContext('2d'), img = gx.createImageData(g.width, g.height), r = rng(7);
    for (var i = 0; i < img.data.length; i += 4) { var v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    gx.putImageData(img, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha; ctx.drawImage(g, 0, 0, W, H); ctx.restore();
  }
  function vignette(a, cy) {
    var vg = ctx.createRadialGradient(W / 2, cy || H / 2, W * 0.42, W / 2, cy || H / 2, Math.max(W, H) * 0.66);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,' + a + ')');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  // ---------- grabado: líneas paralelas cuyo grosor sigue a light(x, y) ----------
  function engrave(c, o) {
    var ang = o.angle || 0, sp = o.spacing || 6, maxW = o.maxW || 2.4, step = 4;
    var dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    var cx = W / 2, cy = H / 2, L = Math.hypot(W, H) / 2 + 10;
    var buckets = []; for (var b = 0; b < 10; b++) buckets.push(new Path2D());
    for (var d = -L; d <= L; d += sp) {
      var prev = null;
      for (var u = -L; u <= L; u += step) {
        var wob = (o.wobble || 0.8) * Math.sin(u * 0.021 + d * 0.37);
        var x = cx + u * dx + (d + wob) * nx, y = cy + u * dy + (d + wob) * ny;
        if (x < -5 || y < -5 || x > W + 5 || y > H + 5) { prev = null; continue; }
        var l = clamp(o.light(x, y));
        if (l < 0.06) { prev = null; continue; }
        var bi = Math.min(9, Math.floor(l * 10));
        if (prev) { buckets[bi].moveTo(prev[0], prev[1]); buckets[bi].lineTo(x, y); }
        prev = [x, y];
      }
    }
    c.save(); c.lineCap = 'round'; c.strokeStyle = o.color || C.cream; c.globalAlpha = o.alpha || 1;
    buckets.forEach(function (p, i) { c.lineWidth = maxW * (i + 0.5) / 10; c.stroke(p); });
    c.restore();
  }

  // ---------- siluetas de gente bailando ----------
  function dancers(list, blur) {
    var l = layer(), g = l.getContext('2d');
    g.filter = blur ? 'blur(' + blur + 'px)' : 'none';
    g.strokeStyle = g.fillStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round';
    list.forEach(function (d) {
      var h = d.h, x = d.x, y = d.y, r = rng(seedFrom('d' + d.seed));
      var hipY = y - h * 0.47, neckY = y - h * 0.82, sway = (r() - 0.5) * h * 0.12;
      var hip = [x + sway * 0.4, hipY], neck = [x + sway, neckY];
      g.lineWidth = h * 0.13; g.beginPath(); g.moveTo(hip[0], hip[1]); g.lineTo(neck[0], neck[1]); g.stroke();
      g.beginPath(); g.arc(neck[0] + sway * 0.2, neckY - h * 0.09, h * 0.075, 0, Math.PI * 2); g.fill();
      g.lineWidth = h * 0.075;
      [-1, 1].forEach(function (s) {
        var kx = hip[0] + s * h * (0.06 + r() * 0.06), ky = hipY + h * 0.24;
        g.beginPath(); g.moveTo(hip[0], hip[1]); g.lineTo(kx, ky); g.lineTo(kx + s * h * r() * 0.08, y); g.stroke();
      });
      g.lineWidth = h * 0.06;
      [-1, 1].forEach(function (s) {
        var up = r() < 0.75, a1 = up ? -Math.PI / 2 + s * (0.35 + r() * 0.6) : Math.PI / 2 - s * (0.6 + r() * 0.5);
        var ex = neck[0] + s * h * 0.06 + Math.cos(a1) * h * 0.2, ey = neckY + h * 0.03 + Math.sin(a1) * h * 0.2;
        var a2 = a1 + s * (r() - 0.3) * 0.9;
        g.beginPath(); g.moveTo(neck[0] + s * h * 0.06, neckY + h * 0.03); g.lineTo(ex, ey); g.lineTo(ex + Math.cos(a2) * h * 0.19, ey + Math.sin(a2) * h * 0.19); g.stroke();
      });
    });
    return l;
  }
  function maskOf(l) { var d = l.getContext('2d').getImageData(0, 0, W, H).data; return function (x, y) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return 0; return d[(y * W + x) * 4 + 3] / 255; }; }

  // ---------- el sol eclipsado, grabado ----------
  function engravedSun(cx, cy, R, o) {
    o = o || {};
    var l = layer(), g = l.getContext('2d'), n = o.rays || 720, seed = seedFrom(o.seed || 'sol'), r = rng(seed);
    var spread = o.spread || 1.1;
    g.strokeStyle = C.cream; g.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.004;
      var s = Math.pow(smooth(a, seed), 2.2) * 0.75 + Math.pow(smooth(a * 3.1, seed + 9), 3) * 0.35;
      var len = R * ((o.minLen || 0.1) + s * spread + r() * 0.08);
      g.lineWidth = (0.8 + r() * 1.1) * (o.weight || 1);
      g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 1.01, cy + Math.sin(a) * R * 1.01); g.lineTo(cx + Math.cos(a) * (R + len), cy + Math.sin(a) * (R + len)); g.stroke();
    }
    g.globalCompositeOperation = 'destination-in';
    var fg = g.createRadialGradient(cx, cy, R, cx, cy, R * (1.2 + spread));
    fg.addColorStop(0, 'rgba(0,0,0,1)'); fg.addColorStop(0.45, 'rgba(0,0,0,0.55)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fg; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-atop';
    var tg = g.createRadialGradient(cx, cy, R, cx, cy, R * 1.6);
    tg.addColorStop(0, rgba(C.accent, 0.95)); tg.addColorStop(1, rgba(C.accent, 0));
    g.fillStyle = tg; g.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var hg = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 2.4);
    hg.addColorStop(0, rgba(C.accent, 0.5 * (o.halo || 1))); hg.addColorStop(0.2, rgba(C.glow, 0.45 * (o.halo || 1))); hg.addColorStop(1, rgba(C.glow, 0));
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, R * 2.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.drawImage(l, 0, 0);
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.shadowColor = C.accent; ctx.shadowBlur = 24; ctx.strokeStyle = C.cream; ctx.lineWidth = Math.max(1.4, R / 120);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  // Disco del sol grabado (sin eclipse): líneas horizontales con oscurecimiento hacia el borde
  function sunDisk(cx, cy, R) {
    var l = layer(), g = l.getContext('2d');
    engrave(g, { angle: 0, spacing: Math.max(3, R / 18), maxW: Math.max(1.4, R / 28), wobble: 0.3, light: function (x, y) { var d = Math.hypot(x - cx, y - cy) / R; return d > 1 ? 0 : 0.35 + 0.65 * Math.sqrt(1 - d * d); } });
    g.globalCompositeOperation = 'source-atop';
    var tg = g.createRadialGradient(cx, cy, 0, cx, cy, R); tg.addColorStop(0, rgba(C.cream, 1)); tg.addColorStop(0.7, rgba(C.fire, 0.9)); tg.addColorStop(1, rgba(C.accent, 1));
    g.fillStyle = tg; g.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var hg = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.9); hg.addColorStop(0, rgba(C.accent, 0.35)); hg.addColorStop(1, rgba(C.glow, 0));
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, R * 1.9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.drawImage(l, 0, 0);
  }
  // La luna: disco negro con un filo de luz (fase creciente según "lit": 0 = nueva)
  function moon(cx, cy, R, o) {
    o = o || {};
    ctx.save();
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(C.cream, o.rim || 0.35); ctx.lineWidth = 1.2; ctx.stroke();
    if (o.lit) {   // filo iluminado del lado del sol
      var a = o.angle || 0;
      ctx.translate(cx, cy); ctx.rotate(a);
      ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); ctx.ellipse(0, 0, R * (1 - o.lit * 2), R, 0, Math.PI / 2, -Math.PI / 2, true);
      ctx.fillStyle = C.cream; ctx.shadowColor = C.cream; ctx.shadowBlur = 12; ctx.fill();
    }
    ctx.restore();
  }

  // ---------- huella dentro del sol ----------
  function huella(cx, cy, size, seedStr, count, alpha) {
    var r = rng(seedFrom(seedStr)), lobes = 2 + Math.floor(r() * 5), twist = (r() - 0.5) * 1.6, amp = 0.05 + r() * 0.09, phase = r() * Math.PI * 2, wob = 3 + Math.floor(r() * 6);
    for (var k = 0; k < count; k++) {
      var base = 0.12 + (k / (count - 1)) * 0.82;
      ctx.beginPath();
      for (var i = 0; i <= 200; i++) {
        var a = i / 200 * Math.PI * 2, d = base * (1 + amp * Math.sin(lobes * a + phase + twist * k * 0.35) + amp * 0.45 * Math.sin(wob * a - phase * 1.7 + k * 0.5));
        var x = cx + Math.cos(a) * d * size, y = cy + Math.sin(a) * d * size; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath(); ctx.globalAlpha = (alpha || 1) * (0.3 + 0.7 * k / count);
      ctx.strokeStyle = k % 4 === 3 ? C.accent : C.cream; ctx.lineWidth = k % 4 === 3 ? 1.8 : 1.1; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- reloj de 24 h en romanos, con la noche (XVIII → III) en rojo ----------
  function clock(cx, cy, RO, o) {
    o = o || {};
    var ha = function (h) { return -Math.PI / 2 + h / 24 * Math.PI * 2; };
    ctx.save(); ctx.strokeStyle = rgba(C.cream, 0.45); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, RO, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, RO - RO * 0.15, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.shadowColor = C.accent; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(cx, cy, RO, ha(18), ha(27)); ctx.stroke(); ctx.restore();
    var big = Math.round(RO * 0.056), small = Math.round(RO * 0.041);
    for (var h = 0; h < 24; h++) {
      var a = ha(h), key = h === 18 || h === 3;
      ctx.strokeStyle = key ? C.accent : rgba(C.cream, 0.5); ctx.lineWidth = key ? 3 : 1.2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (RO - 12), cy + Math.sin(a) * (RO - 12)); ctx.lineTo(cx + Math.cos(a) * (RO + (key ? 22 : 12)), cy + Math.sin(a) * (RO + (key ? 22 : 12))); ctx.stroke();
      textOnCircle(h === 0 ? 'XXIV' : roman(h), cx, cy, RO - RO * 0.077, a, (key ? '600 ' + big + 'px' : '400 ' + small + 'px') + ' Cinzel', key ? C.accent : rgba(C.cream, 0.55), 1);
    }
    if (o.inscription) textOnCircle(o.inscription, cx, cy, RO + RO * 0.1, -Math.PI / 2, Math.round(RO * 0.06) + 'px "GFS Didot"', rgba(C.cream, 0.6), 6);
  }

  // ---------- texto ----------
  function text(str, x, y, font, color, opts) {
    opts = opts || {};
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = opts.align || 'center'; ctx.textBaseline = 'alphabetic';
    if (opts.spacing) ctx.letterSpacing = opts.spacing + 'px';
    if (opts.glow) { ctx.shadowColor = opts.glow; ctx.shadowBlur = 30; }
    ctx.fillText(str, x, y); ctx.restore();
  }
  // Título en Cinzel que se achica hasta entrar en maxW
  function title(str, x, y, size, maxW, opts) {
    opts = opts || {};
    var sp = opts.spacing === undefined ? size * 0.08 : opts.spacing;
    ctx.save(); ctx.letterSpacing = sp + 'px';
    while (size > 20) { ctx.font = '600 ' + size + 'px Cinzel'; if (ctx.measureText(str).width <= maxW) break; size -= 2; sp = size * 0.08; ctx.letterSpacing = sp + 'px'; }
    ctx.restore();
    text(str, x, y, '600 ' + size + 'px Cinzel', opts.color || C.cream, { spacing: sp, glow: opts.glow === false ? null : C.accent, align: opts.align });
    return size;
  }
  function textOnCircle(str, cx, cy, r, center, font, color, spacing) {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var widths = str.split('').map(function (ch) { return ctx.measureText(ch).width + (spacing || 0); });
    var total = widths.reduce(function (a, b) { return a + b; }, 0), a = center - total / r / 2;
    str.split('').forEach(function (ch, i) {
      var aw = widths[i] / r; a += aw / 2;
      ctx.save(); ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.rotate(a + Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore();
      a += aw / 2;
    });
    ctx.restore();
  }
  function credits(y, size) { text('SOMOS UNO  ×  MELT UNDERGROUND', W / 2, y, '600 ' + (size || 26) + 'px Cinzel', rgba(C.cream, 0.7), { spacing: 6 }); }
  function rule(y, w) { ctx.save(); ctx.strokeStyle = rgba(C.accent, 0.7); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(W / 2 - w / 2, y); ctx.lineTo(W / 2 + w / 2, y); ctx.stroke(); ctx.restore(); }

  // ---------- escena: la pared de la caverna con sombras y fuego ----------
  // o: { top, bot, left, right, people: [...] o shadow: capa propia, fireY }
  function wall(o) {
    var top = o.top, bot = o.bot, left = o.left || 70, right = o.right || W - 70, wallP = new Path2D(), pts = [], i, t;
    for (i = 0; i <= 60; i++) { t = i / 60; pts.push([left + (right - left) * t, top - 40 * Math.sin(t * Math.PI) + (smooth(t * 9, 11) - 0.5) * 70]); }
    for (i = 0; i <= 30; i++) { t = i / 30; pts.push([right + (smooth(t * 7, 12) - 0.5) * 60, top + (bot - top) * t]); }
    for (i = 60; i >= 0; i--) { t = i / 60; pts.push([left + (right - left) * t, bot + (smooth(t * 8, 13) - 0.5) * 50]); }
    for (i = 30; i >= 0; i--) { t = i / 30; pts.push([left + (smooth(t * 7, 14) - 0.5) * 60, top + (bot - top) * t]); }
    pts.forEach(function (p, i) { i ? wallP.lineTo(p[0], p[1]) : wallP.moveTo(p[0], p[1]); }); wallP.closePath();
    var M = maskOf(o.shadow || dancers(o.people, o.blur === undefined ? 7 : o.blur));
    var rock = layer(), rg = rock.getContext('2d');
    engrave(rg, { angle: 0.6, spacing: 9, maxW: 1.4, light: function (x, y) { return 0.25 + 0.35 * smooth(x * 0.01 + y * 0.004, 21) - Math.abs(y - (top + bot) / 2) / 3000; } });
    engrave(rg, { angle: -0.9, spacing: 11, maxW: 1.1, light: function (x, y) { return 0.15 + 0.3 * smooth(y * 0.01, 22); } });
    rg.globalCompositeOperation = 'destination-out'; rg.fill(wallP);
    ctx.globalAlpha = 0.35; ctx.drawImage(rock, 0, 0); ctx.globalAlpha = 1;
    var fireY = o.fireY || bot + 310;
    var wl = layer(), wg = wl.getContext('2d');
    engrave(wg, { angle: 0, spacing: 5.5, maxW: 2.6, wobble: 1.4, light: function (x, y) {
      var fire = clamp(1 - Math.hypot((x - W / 2) * 0.8, y - fireY) / ((bot - top) * 1.55));
      return (0.15 + fire) * (1 - M(x, y) * 0.95);
    } });
    wg.globalCompositeOperation = 'destination-in'; wg.fill(wallP);
    wg.globalCompositeOperation = 'source-atop';
    var tint = wg.createLinearGradient(0, bot, 0, top);
    tint.addColorStop(0, rgba(C.fire, 0.95)); tint.addColorStop(0.55, rgba(C.accent, 0.45)); tint.addColorStop(1, rgba(C.accent, 0));
    wg.fillStyle = tint; wg.fillRect(0, 0, W, H);
    ctx.drawImage(wl, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var fg = ctx.createRadialGradient(W / 2, fireY - 30, 20, W / 2, fireY - 30, 700);
    fg.addColorStop(0, rgba(C.fire, 0.55)); fg.addColorStop(0.35, rgba(C.accent, 0.25)); fg.addColorStop(1, rgba(C.glow, 0));
    ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H); ctx.restore();
    return wallP;
  }

  // ---------- escena: corte de la caverna (lámina) en coordenadas de 1080x1920 ----------
  // o: { G (suelo), sunX, sunR, frame: [x, y, w, h], labels: true, path: true }
  function caveSection(o) {
    var G = o.G || 760, fr = o.frame || [76, 196, 928, 1528], i;
    var frame = new Path2D(); frame.rect(fr[0], fr[1], fr[2], fr[3]);
    var chamber = new Path2D(), cpts = [];
    for (i = 0; i <= 80; i++) {
      var a = i / 80 * Math.PI * 2, rx = 400 + (smooth(a * 2, 31) - 0.5) * 60, ry = 190 + (smooth(a * 3, 32) - 0.5) * 50;
      cpts.push([540 + Math.cos(a) * rx, G + 410 + Math.sin(a) * ry]);
    }
    cpts.forEach(function (p, i) { i ? chamber.lineTo(p[0], p[1]) : chamber.moveTo(p[0], p[1]); }); chamber.closePath();
    var stairs = new Path2D(); stairs.moveTo(170, G); stairs.lineTo(262, G); stairs.lineTo(330, G + 240); stairs.lineTo(238, G + 250); stairs.closePath();
    var exit = new Path2D(); exit.moveTo(840, G + 250); exit.lineTo(920, G + 240); exit.lineTo(905, G); exit.lineTo(835, G); exit.closePath();
    var sunX = o.sunX || 780, sunR = o.sunR || 105;
    var sky = layer(), sg = sky.getContext('2d');
    engrave(sg, { angle: 0, spacing: 8, maxW: 1.6, light: function (x, y) { return y > G ? 0 : 0.18 + 0.8 * clamp(1 - Math.hypot(x - sunX, (y - G) * 1.6) / 520); } });
    sg.globalCompositeOperation = 'destination-in'; sg.fill(frame);
    sg.globalCompositeOperation = 'source-atop'; var tk = sg.createRadialGradient(sunX, G, 50, sunX, G, 600); tk.addColorStop(0, rgba(C.accent, 0.9)); tk.addColorStop(1, rgba(C.accent, 0)); sg.fillStyle = tk; sg.fillRect(0, 0, W, H);
    ctx.drawImage(sky, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, G); ctx.clip();
    if (o.rising) { sunDisk(sunX, G, sunR); } else { engravedSun(sunX, G, sunR, { rays: 600, spread: 0.85, seed: 'ocaso' }); }
    ctx.restore();
    var bottom = fr[1] + fr[3];
    var earth = layer(), eg = earth.getContext('2d');
    engrave(eg, { angle: Math.PI / 4, spacing: 7, maxW: 1.5, light: function (x, y) { return y < G || y > bottom ? 0 : (0.55 + 0.35 * smooth(x * 0.02 + y * 0.01, 33)) * clamp((bottom - y) / 60); } });
    eg.globalCompositeOperation = 'destination-in'; eg.fill(frame);
    eg.globalCompositeOperation = 'destination-out'; eg.fill(chamber); eg.fill(stairs); eg.fill(exit);
    ctx.globalAlpha = 0.75; ctx.drawImage(earth, 0, 0); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.cream; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fr[0], G); ctx.lineTo(fr[0] + fr[2], G); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(C.cream, 0.8);
    for (i = 0; i < 9; i++) { var t = i / 9, y = G + 20 + t * 225, x0 = 175 + t * 68; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + 88, y); ctx.stroke(); }
    var fx = 340, fy = G + 540;
    var people = [{ x: 470, y: G + 560, h: 150, seed: 11 }, { x: 545, y: G + 565, h: 160, seed: 12 }, { x: 620, y: G + 558, h: 150, seed: 13 }, { x: 505, y: G + 575, h: 130, seed: 14 }];
    var SM = maskOf(dancers(people.map(function (p) { return { x: fx + (p.x - fx) * 1.75, y: p.y - 10, h: p.h * 1.9, seed: p.seed }; }), 5));
    var inner = layer(), ig = inner.getContext('2d');
    engrave(ig, { angle: 0, spacing: 4.5, maxW: 1.8, light: function (x, y) { return (0.12 + 0.95 * clamp(1 - Math.hypot(x - fx, (y - fy) * 1.3) / 560)) * (1 - SM(x, y) * 0.95); } });
    ig.globalCompositeOperation = 'destination-in'; ig.fill(chamber);
    ig.globalCompositeOperation = 'source-atop'; var ft = ig.createRadialGradient(fx, fy, 10, fx, fy, 600); ft.addColorStop(0, rgba(C.fire, 0.9)); ft.addColorStop(1, rgba(C.accent, 0.2)); ig.fillStyle = ft; ig.fillRect(0, 0, W, H);
    ctx.drawImage(inner, 0, 0);
    ctx.strokeStyle = rgba(C.cream, 0.9); ctx.lineWidth = 2; ctx.stroke(chamber);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var gl = ctx.createRadialGradient(fx, fy - 20, 5, fx, fy - 20, 160); gl.addColorStop(0, rgba(C.fire, 0.9)); gl.addColorStop(1, rgba(C.glow, 0));
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(fx, fy - 20, 160, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.fire; ctx.lineWidth = 2;
    for (i = 0; i < 7; i++) { var off = (i - 3) * 9; ctx.beginPath(); ctx.moveTo(fx + off, fy + 10); ctx.bezierCurveTo(fx + off - 14, fy - 25, fx + off + 18, fy - 40 + Math.abs(3 - i) * 6, fx + off * 0.3, fy - 75 + Math.abs(3 - i) * 10); ctx.stroke(); }
    var bodies = dancers(people, 0), bg2 = bodies.getContext('2d');
    bg2.globalCompositeOperation = 'source-in'; bg2.fillStyle = '#000'; bg2.fillRect(0, 0, W, H);
    ctx.save(); ctx.shadowColor = C.fire; ctx.shadowBlur = 10; ctx.drawImage(bodies, 0, 0); ctx.restore();
    if (o.path !== false) {
      ctx.save(); ctx.setLineDash([3, 9]); ctx.strokeStyle = rgba(C.cream, 0.8); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(215, G - 60); ctx.lineTo(270, G + 120); ctx.quadraticCurveTo(330, G + 330, 450, G + 350); ctx.quadraticCurveTo(760, G + 360, 860, G + 260); ctx.lineTo(880, G - 60); ctx.stroke(); ctx.restore();
      ctx.fillStyle = C.cream; ctx.beginPath(); ctx.moveTo(880, G - 80); ctx.lineTo(870, G - 56); ctx.lineTo(890, G - 56); ctx.closePath(); ctx.fill();
    }
    if (o.labels !== false) {
      var tag = function (ch, x, y, lx, ly) {
        ctx.strokeStyle = rgba(C.cream, 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, ly); ctx.stroke();
        text(ch, lx + (lx > x ? 18 : -18), ly + 12, 'italic 40px "GFS Didot"', C.accent);
      };
      tag('α', sunX - 60, G - 120, sunX - 140, G - 230); tag('β', 230, G + 120, 150, G + 100); tag('γ', fx, fy - 70, 250, G + 680); tag('δ', 880, G + 140, 960, G + 100); tag('ε', 860, G + 390, 960, G + 660);
    }
  }

  window.Motor = {
    C: C, use: use, offscreen: offscreen, get W() { return W; }, get H() { return H; }, get ctx() { return ctx; },
    seedFrom: seedFrom, rng: rng, clamp: clamp, rgba: rgba, layer: layer, smooth: smooth, roman: roman,
    background: background, marble: marble, grain: grain, vignette: vignette, engrave: engrave,
    dancers: dancers, maskOf: maskOf, engravedSun: engravedSun, sunDisk: sunDisk, moon: moon, huella: huella, clock: clock,
    text: text, title: title, textOnCircle: textOnCircle, credits: credits, rule: rule, wall: wall, caveSection: caveSection,
    fonts: function () {
      return document.fonts.load('600 40px Cinzel').then(function () { return Promise.all([document.fonts.load('30px "GFS Didot"', 'ΑΣ'), document.fonts.load('italic 40px "Cormorant Garamond"'), document.fonts.load('40px "Cormorant Garamond"')]); }).catch(function () {});
    }
  };
})();
