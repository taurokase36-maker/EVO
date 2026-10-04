/* SOLARIS · visuales en vivo para proyectar en Melt.
   Cinco escenas que pulsan al BPM (127 por defecto), con tap tempo, MIDI clock y mapeo MIDI (pensado para el Xone:K2). */
(function () {
  'use strict';
  var M = Motor, C = M.C;
  var cv = document.getElementById('c'), g = cv.getContext('2d');
  var W, H, S, CX, CY, R;
  var BRAND = '"Major Mono Display", monospace', MONO = '"Space Mono", monospace';

  // ---------- parámetros (0..1) que se controlan con faders y perillas ----------
  var PARAMS = [
    ['master', 'brillo', 1], ['pulse', 'pulso', 0.7], ['glow', 'fuego / corona', 0.7], ['logo', 'logo encima', 0],
    ['speed', 'velocidad', 0.5], ['grain', 'grano', 0.3], ['shadow', 'sombras', 0.5], ['fade', 'fundido entre escenas', 0.3]
  ];
  var P = {}; PARAMS.forEach(function (p) { P[p[0]] = p[2]; });

  var SCENES = [
    { name: 'eclipse', draw: sceneEclipse },
    { name: 'la pared', draw: scenePared },
    { name: 'tránsito', draw: sceneTransito },
    { name: 'solaris', draw: sceneLogo },
    { name: 'grabado', draw: sceneGrabado }
  ];

  var st = {
    scene: 0, prev: -1, fadeStart: -10, bpm: 127, beat0: now(), flash: 0, blackout: false, black: 0, logoOn: false,
    transitBeat: 0, auto: false, autoNext: 0, taps: [], clock: [], clockAt: 0
  };
  function now() { return performance.now() / 1000; }

  // ---------- tiempo musical ----------
  function beatInfo(t) {
    var b = (t - st.beat0) * st.bpm / 60, n = Math.floor(b), ph = b - n;
    var k = Math.exp(-ph * 5.5) * (((n % 4) + 4) % 4 === 0 ? 1 : 0.7) * P.pulse;
    var off = Math.exp(-((ph + 0.5) % 1) * 7) * 0.35 * P.pulse;   // contratiempo, como un hi-hat
    return { b: b, n: n, ph: ph, k: k, off: off, bar: Math.floor(n / 4) };
  }
  function tap() {
    var t = now();
    if (st.taps.length && t - st.taps[st.taps.length - 1] > 2) st.taps = [];
    st.taps.push(t); if (st.taps.length > 8) st.taps.shift();
    if (st.taps.length >= 3) {
      var iv = (st.taps[st.taps.length - 1] - st.taps[0]) / (st.taps.length - 1);
      st.bpm = Math.round(Math.max(60, Math.min(200, 60 / iv)) * 10) / 10;
      st.beat0 = t;
      toast('BPM ' + st.bpm.toFixed(1));
    }
  }
  function sync() { st.beat0 = now(); toast('sync · beat 1'); }
  function nudgeBpm(d) { st.bpm = Math.round((st.bpm + d) * 10) / 10; toast('BPM ' + st.bpm.toFixed(1)); }

  // ---------- texturas (se calculan al abrir y al cambiar el tamaño) ----------
  var TX = {};
  var RINGS;
  function rings(key, count) {
    var r = M.rng(M.seedFrom(key));
    var lobes = 2 + Math.floor(r() * 5), twist = (r() - 0.5) * 1.6, amp = 0.05 + r() * 0.09, phase = r() * Math.PI * 2, wob = 3 + Math.floor(r() * 6), out = [];
    for (var k = 0; k < count; k++) {
      var base = 0.12 + (k / (count - 1)) * 0.82, pts = [];
      for (var i = 0; i <= 160; i++) {
        var a = (i / 160) * Math.PI * 2, d = base * (1 + amp * Math.sin(lobes * a + phase + twist * k * 0.35) + amp * 0.45 * Math.sin(wob * a - phase * 1.7 + k * 0.5));
        pts.push([Math.cos(a) * d, Math.sin(a) * d]);
      }
      out.push(pts);
    }
    return out;
  }
  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = innerWidth * dpr, h = innerHeight * dpr, sc = Math.min(1, 1920 / Math.max(w, h)) * (st.lowres ? 0.6 : 1);
    W = cv.width = Math.round(w * sc); H = cv.height = Math.round(h * sc);
    S = Math.min(W, H); CX = W / 2; CY = H / 2; R = S * 0.27;
    TX.buf = [document.createElement('canvas'), document.createElement('canvas')];
    TX.buf.forEach(function (b) { b.width = W; b.height = H; });
    var T = Math.ceil(R * 2 * 2.5);
    TX.corona = M.offscreen(T, T, function () { M.engravedSun(T / 2, T / 2, R, { rays: 1100, spread: 1.0, seed: 'grabado' }); });
    var T2 = Math.ceil(R * 4.2);
    TX.sun = M.offscreen(T2, T2, function () { M.sunDisk(T2 / 2, T2 / 2, R); });
    TX.wall = M.offscreen(W, H, function () { M.background(); M.wall({ top: H * 0.24, bot: H * 0.9, left: W * 0.05, right: W * 0.95, people: [], fireY: H * 1.15 }); });
    var shq = 3 + Math.round(P.shadow * 5);   // más "sombras" = más chica la capa = bordes más suaves
    TX.shadow = document.createElement('canvas'); TX.shadow.width = Math.round(W / shq); TX.shadow.height = Math.round(H / shq); TX.shq = shq;
    TX.layer = document.createElement('canvas'); TX.layer.width = W; TX.layer.height = H;
    var gr = document.createElement('canvas'); gr.width = 256; gr.height = 256;
    var gx = gr.getContext('2d'), img = gx.createImageData(256, 256), rr = M.rng(9);
    for (var i = 0; i < img.data.length; i += 4) { var v = rr() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    gx.putImageData(img, 0, 0); TX.grain = gr;
    RINGS = rings('the-sun', 18);
  }

  // ---------- piezas comunes ----------
  function rgba(hex, a) { return M.rgba(hex, Math.max(0, Math.min(1, a))); }
  function bg(c) { c.fillStyle = C.bg; c.fillRect(0, 0, W, H); }
  function ambient(c, x, y, amt) {
    var gr = c.createRadialGradient(x, y, R * 0.6, x, y, Math.max(W, H) * 0.75);
    gr.addColorStop(0, rgba(C.glow, amt)); gr.addColorStop(1, rgba(C.glow, 0));
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
  }
  function corona(c, x, y, scale, rot, alpha) {
    c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha; c.translate(x, y); c.rotate(rot); c.scale(scale, scale);
    c.drawImage(TX.corona, -TX.corona.width / 2, -TX.corona.height / 2); c.restore();
  }
  function huella(c, x, y, size, t, B, alpha) {
    var rot = t * 0.06 * (0.3 + P.speed * 1.4);
    RINGS.forEach(function (pts, i) {
      var wave = Math.exp(-(((B.b - i * 0.03) % 1 + 1) % 1) * 5.5) * P.pulse;
      var s = size * (1 + 0.012 * Math.sin(t * 1.1 + i * 0.4) + 0.05 * wave);
      var acc = i % 4 === 3;
      c.save(); c.translate(x, y); c.rotate(rot * (1 + i * 0.04));
      c.beginPath();
      for (var j = 0; j < pts.length; j++) { var q = pts[j]; j ? c.lineTo(q[0] * s, q[1] * s) : c.moveTo(q[0] * s, q[1] * s); }
      c.closePath();
      c.globalAlpha = Math.min(1, (0.3 + 0.7 * i / RINGS.length) * (alpha || 1) * (1 + 0.4 * wave));
      c.strokeStyle = acc ? C.accent : C.cream; c.lineWidth = (acc ? 2.4 : 1.4) * S / 1080 * (1 + 0.5 * wave);
      if (acc) { c.shadowColor = C.accent; c.shadowBlur = 12 + 20 * wave; }
      c.stroke(); c.restore();
    });
  }
  function rim(c, x, y, r, k) {
    c.save(); c.shadowColor = C.accent; c.shadowBlur = 24 + 40 * k; c.strokeStyle = rgba(C.cream, 0.75 + 0.25 * k);
    c.lineWidth = (2.4 + 2.6 * k) * S / 1080; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke(); c.restore();
  }
  function glint(c, x, y, size, amt) {
    if (amt <= 0.01) return;
    c.save(); c.globalCompositeOperation = 'lighter';
    var fg = c.createRadialGradient(x, y, 0, x, y, size);
    fg.addColorStop(0, rgba('#ffffff', amt)); fg.addColorStop(0.15, rgba(C.cream, 0.8 * amt)); fg.addColorStop(0.4, rgba(C.accent, 0.4 * amt)); fg.addColorStop(1, rgba(C.glow, 0));
    c.fillStyle = fg; c.beginPath(); c.arc(x, y, size, 0, Math.PI * 2); c.fill();
    var sw = size * 2.4, sg = c.createLinearGradient(x - sw, y, x + sw, y);
    sg.addColorStop(0, rgba(C.accent, 0)); sg.addColorStop(0.5, rgba(C.cream, 0.7 * amt)); sg.addColorStop(1, rgba(C.accent, 0));
    c.fillStyle = sg; c.fillRect(x - sw, y - 1.5, sw * 2, 3); c.restore();
  }
  // Logo "solaris" con la O como eclipse
  function wordmark(c, x, y, size, k, alpha) {
    var str = 'solaris', chars = str.split('');
    c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha;
    c.font = size + 'px ' + BRAND;
    var sp = size * 0.06, widths = chars.map(function (ch) { return c.measureText(ch).width; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + sp * 6;
    var cap = c.measureText('h').actualBoundingBoxAscent, cx = x - total / 2;
    chars.forEach(function (ch, i) {
      if (ch === 'o') {
        var ox = cx + widths[i] / 2, oy = y - cap / 2, r = Math.min(widths[i], cap) / 2;
        var gr = c.createRadialGradient(ox, oy, r * 0.9, ox, oy, r * (2.4 + 1.2 * k));
        gr.addColorStop(0, rgba(C.accent, 0.95)); gr.addColorStop(0.2, rgba(C.glow, 0.8)); gr.addColorStop(1, rgba(C.glow, 0));
        c.fillStyle = gr; c.beginPath(); c.arc(ox, oy, r * (2.4 + 1.2 * k), 0, Math.PI * 2); c.fill();
        c.fillStyle = C.bg; c.beginPath(); c.arc(ox, oy, r, 0, Math.PI * 2); c.fill();
        c.shadowColor = C.accent; c.shadowBlur = 18 + 30 * k; c.strokeStyle = C.cream; c.lineWidth = Math.max(2, size / 48);
        c.beginPath(); c.arc(ox, oy, r, 0, Math.PI * 2); c.stroke();
        c.shadowBlur = 0; c.fillStyle = C.cream; c.beginPath(); c.arc(ox + r * 0.62, oy - r * 0.62, Math.max(2.5, size / 55), 0, Math.PI * 2); c.fill();
      } else {
        c.shadowColor = C.accent; c.shadowBlur = 20 + 30 * k; c.fillStyle = C.cream; c.textAlign = 'left';
        c.fillText(ch, cx, y); c.shadowBlur = 0;
      }
      cx += widths[i] + sp;
    });
    c.restore();
    return total;
  }
  function slogan(c, x, y, size, alpha) {
    c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha; c.font = '700 ' + size + 'px ' + MONO; c.fillStyle = C.accent;
    c.textAlign = 'center'; c.letterSpacing = size * 0.45 + 'px'; c.fillText('FOR THE SOLAR PEOPLE', x + size * 0.22, y); c.restore();
  }
  var SOMOS = new Path2D('M80 258 L80 270 A110 110 0 0 1 190 160 L210 160 A110 110 0 0 1 320 270 L320 370 A110 110 0 0 0 430 480 L450 480 A110 110 0 0 0 560 370 L560 382');
  function somosUno(c, x, y, size, k) {
    c.save(); c.translate(x, y); c.rotate(Math.PI / 2); c.scale(size / 540, size / 540); c.translate(-320, -320);
    c.strokeStyle = c.fillStyle = C.cream; c.lineWidth = 20; c.shadowColor = C.accent; c.shadowBlur = 16 + 30 * k;
    c.stroke(SOMOS); c.beginPath(); c.moveTo(183, 320); c.lineTo(457, 320); c.stroke();
    c.beginPath(); c.arc(80, 320, 30, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(560, 320, 30, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  // =====================================================================
  //  1 · ECLIPSE: el sol grabado con la huella adentro
  // =====================================================================
  function sceneEclipse(c, t, B) {
    bg(c);
    ambient(c, CX, CY, (0.25 + 0.3 * B.k) * P.glow);
    corona(c, CX, CY, 1 + 0.07 * B.k * (0.5 + P.glow), t * 0.02 * (0.3 + P.speed), 0.75 + 0.25 * P.glow);
    rim(c, CX, CY, R, B.k);
    huella(c, CX, CY, R * 0.8, t, B, 1);
    var bar16 = ((B.n % 16) + 16) % 16;   // destello del anillo de diamante cada 4 compases
    glint(c, CX + Math.cos(-0.75) * R, CY + Math.sin(-0.75) * R, R * (0.12 + 0.5 * (bar16 === 0 ? Math.exp(-B.ph * 2.5) : 0) + 0.08 * B.k), 0.5 + 0.5 * (bar16 === 0 ? 1 - B.ph : 0));
  }

  // =====================================================================
  //  2 · LA PARED: sombras de la gente bailando, luz de fuego
  // =====================================================================
  function dancer(s, x, feet, h, t, B, i) {
    var hb = B.b * 0.5 + i * 0.37, bounce = B.k * h * 0.035 / Math.max(0.2, P.pulse) * P.pulse;
    var sway = Math.sin(hb * Math.PI * 2) * h * 0.05 * (0.4 + P.speed);
    var hipY = feet - h * 0.47 + bounce, neckY = feet - h * 0.82 + bounce * 1.2;
    var hip = [x + sway * 0.5, hipY], neck = [x + sway, neckY];
    s.lineWidth = h * 0.13; s.beginPath(); s.moveTo(hip[0], hip[1]); s.lineTo(neck[0], neck[1]); s.stroke();
    s.beginPath(); s.arc(neck[0] + sway * 0.1, neckY - h * 0.09, h * 0.075, 0, Math.PI * 2); s.fill();
    s.lineWidth = h * 0.075;
    [-1, 1].forEach(function (sd) {
      var kx = hip[0] + sd * h * 0.09 + sway * 0.2, ky = hipY + h * 0.24 - bounce * 0.5;
      s.beginPath(); s.moveTo(hip[0], hip[1]); s.lineTo(kx, ky); s.lineTo(x + sd * h * 0.1, feet); s.stroke();
    });
    s.lineWidth = h * 0.06;
    var style = i % 3;
    [-1, 1].forEach(function (sd) {
      var up = style === 0 ? 1 : style === 1 ? (sd > 0 ? 1 : 0.3) : 0.5 + 0.5 * Math.sin(B.b * Math.PI + i);
      var wave = Math.sin(B.b * Math.PI * (style === 2 ? 1 : 0.5) + i + sd) * 0.35;
      var a1 = -Math.PI / 2 + sd * (0.35 + (1 - up) * 1.6 + wave * 0.6);
      var sx = neck[0] + sd * h * 0.06, sy = neckY + h * 0.03;
      var ex = sx + Math.cos(a1) * h * 0.2, ey = sy + Math.sin(a1) * h * 0.2, a2 = a1 + sd * (0.2 + wave);
      s.beginPath(); s.moveTo(sx, sy); s.lineTo(ex, ey); s.lineTo(ex + Math.cos(a2) * h * 0.19, ey + Math.sin(a2) * h * 0.19); s.stroke();
    });
  }
  function scenePared(c, t, B) {
    c.drawImage(TX.wall, 0, 0);
    var flick = 0.75 + 0.12 * Math.sin(t * 9.3) + 0.08 * Math.sin(t * 23.1 + 1) + 0.05 * Math.sin(t * 41.7);
    // sombras: se dibujan chicas y se agrandan, así quedan suaves
    if (TX.shq !== 3 + Math.round(P.shadow * 5)) { var nq = 3 + Math.round(P.shadow * 5); TX.shadow.width = Math.round(W / nq); TX.shadow.height = Math.round(H / nq); TX.shq = nq; }
    var sh = TX.shadow, s = sh.getContext('2d'), q = sh.width / W;
    s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, sh.width, sh.height);
    var grow = 1 + 0.05 * flick + 0.02 * B.k;
    s.setTransform(q * grow, 0, 0, q * grow, (1 - grow) * sh.width / 2, (1 - grow) * sh.height);
    s.strokeStyle = s.fillStyle = C.bg; s.lineCap = 'round'; s.lineJoin = 'round';
    var n = 7;
    for (var i = 0; i < n; i++) {
      var x = W * (0.13 + i * (0.74 / (n - 1))), hh = H * (0.5 + 0.12 * ((i * 37) % 5) / 4);
      dancer(s, x, H * (0.9 + 0.02 * (i % 2)), hh, t, B, i);
    }
    c.save(); c.globalAlpha = 0.6 + 0.35 * P.shadow; c.imageSmoothingQuality = 'high'; c.drawImage(sh, 0, 0, W, H); c.restore();
    // fuego
    c.save(); c.globalCompositeOperation = 'lighter';
    var fy = H * 1.1, fg = c.createRadialGradient(CX, fy, 20, CX, fy, H * 0.95);
    var amt = (0.35 + 0.25 * flick + 0.3 * B.k) * P.glow;
    fg.addColorStop(0, rgba(C.fire, amt)); fg.addColorStop(0.4, rgba(C.accent, amt * 0.45)); fg.addColorStop(1, rgba(C.glow, 0));
    c.fillStyle = fg; c.fillRect(0, 0, W, H); c.restore();
    // el sol arriba: la salida
    corona(c, CX, H * 0.12, 0.26, t * 0.03, 0.9);
    huella(c, CX, H * 0.12, R * 0.26 * 0.8, t, B, 0.8);
  }

  // =====================================================================
  //  3 · TRÁNSITO: la luna cruza el sol → totalidad → anillo de diamante (ciclo de 8 compases)
  // =====================================================================
  function sceneTransito(c, t, B) {
    bg(c);
    var L = 32, p = (((B.b - st.transitBeat) % L) + L) % L / L;
    // la luna frena en el centro: la totalidad dura unos 2 compases
    var u = p * 2 - 1, au = Math.max(0, Math.abs(u) - 0.25) / 0.75, dx = R * 2.6 * (u < 0 ? -1 : 1) * Math.pow(au, 1.3), dy = dx * 0.22;
    var d = Math.hypot(dx, dy), mr = R * 1.04;
    var visible = Math.min(1, d / (R + mr));
    var total = d < mr - R + R * 0.01;
    ambient(c, CX, CY, (0.15 + 0.5 * visible + 0.25 * B.k) * P.glow);
    if (total) {
      corona(c, CX, CY, 1 + 0.08 * B.k, t * 0.02 * (0.3 + P.speed), 1);
      rim(c, CX, CY, R, B.k);
      huella(c, CX, CY, R * 0.8, t, B, 0.9);
    } else {
      c.save(); c.globalAlpha = 0.85 + 0.15 * B.k; c.drawImage(TX.sun, CX - TX.sun.width / 2, CY - TX.sun.height / 2); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; var sg = c.createRadialGradient(CX, CY, R, CX, CY, R * (1.8 + visible));
      sg.addColorStop(0, rgba(C.fire, 0.35 * visible)); sg.addColorStop(1, rgba(C.glow, 0)); c.fillStyle = sg; c.fillRect(0, 0, W, H); c.restore();
      c.fillStyle = C.bg; c.beginPath(); c.arc(CX + dx, CY + dy, mr, 0, Math.PI * 2); c.fill();
      c.strokeStyle = rgba(C.cream, 0.12); c.lineWidth = 1.2; c.stroke();
    }
    // anillo de diamante justo antes y después de la totalidad
    var edge = d - (mr - R);
    if (edge > -R * 0.01 && edge < R * 0.14) {
      var a = Math.atan2(-dy, -dx), amt = 1 - Math.max(0, edge) / (R * 0.14);
      glint(c, CX + Math.cos(a) * R, CY + Math.sin(a) * R, R * (0.25 + 0.45 * amt), amt);
    }
  }
  function drop() {   // salta al comienzo de la totalidad
    if (st.scene !== 2) setScene(2, true);
    st.transitBeat = beatInfo(now()).b - 32 * 0.33; toast('drop · totalidad');   // ~1 beat de anillo de diamante y después la totalidad
  }

  // =====================================================================
  //  4 · SOLARIS: el logo
  // =====================================================================
  function sceneLogo(c, t, B) {
    bg(c);
    ambient(c, CX, CY, (0.2 + 0.3 * B.k) * P.glow);
    huella(c, CX, CY, S * 0.55, t * 0.5, B, 0.16);
    var size = Math.min(W * 0.13, H * 0.24) * (1 + 0.025 * B.k);
    wordmark(c, CX, CY + size * 0.3, size, B.k, 1);
    slogan(c, CX, CY + size * 0.3 + size * 0.55, Math.max(14, size * 0.14), 0.95);
    somosUno(c, CX, H * 0.86, S * 0.09, B.k);
  }

  // =====================================================================
  //  5 · GRABADO: todo el cuadro como un grabado de líneas que respira
  // =====================================================================
  function sceneGrabado(c, t, B) {
    bg(c);
    var L = TX.layer, lg = L.getContext('2d');
    lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, W, H);
    var NB = 8, paths = []; for (var i = 0; i < NB; i++) paths.push(new Path2D());
    var sp = Math.max(5, S / 150), step = Math.max(5, W / 320), rr = R * (1 + 0.06 * B.k), spd = 0.3 + P.speed * 1.4;
    var wob = S * 0.006 * (1 + B.k * 2.5), ripple = t * 3 * spd + B.ph * Math.PI * 2;
    for (var y = sp / 2; y < H; y += sp) {
      var prev = null;
      for (var x = 0; x <= W + step; x += step) {
        var yy = y + Math.sin(x * 0.004 + t * 0.8 * spd + y * 0.01) * wob;
        var dx = x - CX, dy = yy - CY, d = Math.sqrt(dx * dx + dy * dy) / rr;
        var l = 0.05 + 0.04 * B.off;
        var rd = (d - 1) * 7; l += Math.exp(-rd * rd) * (0.75 + 0.5 * B.k);
        if (d > 1) l += 0.5 * Math.exp(-(d - 1) * 2.2) * (0.65 + 0.35 * Math.sin(Math.atan2(dy, dx) * 9 + t * spd)) * P.glow;
        else l += 0.14 * (0.5 + 0.5 * Math.sin(d * 28 - ripple));
        if (l < 0.07) { prev = null; continue; }
        var bi = Math.min(NB - 1, Math.floor(Math.min(1, l) * NB));
        if (prev) { paths[bi].moveTo(prev[0], prev[1]); paths[bi].lineTo(x, yy); }
        prev = [x, yy];
      }
    }
    lg.lineCap = 'round'; lg.strokeStyle = C.cream;
    var maxW = sp * 0.55;
    paths.forEach(function (p, i) { lg.lineWidth = maxW * (i + 0.5) / NB; lg.stroke(p); });
    lg.globalCompositeOperation = 'source-atop';
    var tg = lg.createRadialGradient(CX, CY, rr * 0.9, CX, CY, rr * 2.6);
    tg.addColorStop(0, rgba(C.accent, 0.9)); tg.addColorStop(0.5, rgba(C.fire, 0.35)); tg.addColorStop(1, rgba(C.accent, 0.05));
    lg.fillStyle = tg; lg.fillRect(0, 0, W, H);
    c.drawImage(L, 0, 0);
  }

  // ---------- capas encima de todo ----------
  function overlays(c, t, B) {
    var la = Math.max(P.logo, st.logoOn ? 1 : 0);
    if (la > 0.01 && st.scene !== 3) {
      var size = Math.min(W * 0.05, H * 0.09);
      c.save(); c.fillStyle = rgba(C.bg, 0.55 * la); c.fillRect(0, H - size * 2.6, W, size * 2.6); c.restore();
      wordmark(c, CX, H - size * 1.25, size, B.k * 0.5, la);
      slogan(c, CX, H - size * 0.45, Math.max(11, size * 0.2), la * 0.9);
    }
    if (st.flash > 0.01) {
      c.save(); c.globalCompositeOperation = 'lighter';
      var fg = c.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.8);
      fg.addColorStop(0, rgba(C.cream, st.flash)); fg.addColorStop(0.5, rgba(C.accent, st.flash * 0.6)); fg.addColorStop(1, rgba(C.glow, st.flash * 0.3));
      c.fillStyle = fg; c.fillRect(0, 0, W, H); c.restore();
    }
    var vg = c.createRadialGradient(CX, CY, S * 0.45, CX, CY, Math.max(W, H) * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    if (P.grain > 0.01) {
      c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = 0.09 * P.grain;
      var ox = Math.floor(Math.random() * 256), oy = Math.floor(Math.random() * 256);
      c.fillStyle = c.createPattern(TX.grain, 'repeat'); c.translate(-ox, -oy); c.fillRect(ox, oy, W, H); c.restore();
    }
    var dark = Math.max(st.black, 1 - P.master);
    if (dark > 0.001) { c.fillStyle = 'rgba(0,0,0,' + Math.min(1, dark) + ')'; c.fillRect(0, 0, W, H); }
  }

  // ---------- bucle ----------
  var last = now();
  function frame() {
    var t = now(), dt = Math.min(0.1, t - last); last = t;
    var B = beatInfo(t);
    st.flash *= Math.exp(-dt * 6);
    st.black += ((st.blackout ? 1 : 0) - st.black) * Math.min(1, dt * 5);
    if (st.auto && B.bar >= st.autoNext) { st.autoNext = B.bar + 16; setScene((st.scene + 1) % SCENES.length, true); }
    var fadeDur = 0.2 + P.fade * 1.8, f = (t - st.fadeStart) / fadeDur;
    var a = TX.buf[0].getContext('2d');
    SCENES[st.scene].draw(a, t, B);
    if (f < 1 && st.prev >= 0) {
      var b = TX.buf[1].getContext('2d');
      SCENES[st.prev].draw(b, t, B);
      g.globalAlpha = 1; g.drawImage(TX.buf[1], 0, 0);
      g.globalAlpha = f * f * (3 - 2 * f); g.drawImage(TX.buf[0], 0, 0); g.globalAlpha = 1;
    } else {
      g.drawImage(TX.buf[0], 0, 0);
    }
    overlays(g, t, B);
    hud(B);
    requestAnimationFrame(frame);
  }
  function setScene(i, quiet) {
    if (i === st.scene || i < 0 || i >= SCENES.length) return;
    st.prev = st.scene; st.scene = i; st.fadeStart = now();
    if (i === 2) st.transitBeat = beatInfo(now()).b;   // el tránsito arranca desde el principio
    if (!quiet) toast((i + 1) + ' · ' + SCENES[i].name);
    ledFeedback();
  }

  // ---------- HUD, ayuda y avisos ----------
  var hudEl = document.getElementById('hud'), helpEl = document.getElementById('help'), toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.remove('fade');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.add('fade'); }, 1400);
  }
  var hudTick = 0;
  function hud(B) {
    if (hudEl.classList.contains('hidden') || ++hudTick % 4) return;
    var beat = ((B.n % 4) + 4) % 4, dots = '';
    for (var i = 0; i < 4; i++) dots += '<i class="' + (i === beat ? 'on' : '') + '"></i>';
    hudEl.innerHTML = '<b>' + (st.scene + 1) + ' · ' + SCENES[st.scene].name + '</b>' + (st.auto ? ' · auto' : '') + (st.blackout ? ' · blackout' : '') +
      '<div class="dots">' + dots + '</div>BPM ' + st.bpm.toFixed(1) + (now() - st.clockAt < 1 ? ' · MIDI clock' : '') +
      '<br>' + midiLabel + '<br><span style="color:rgba(239,226,214,.55)">' +
      PARAMS.map(function (p) { return p[1] + ' ' + Math.round(P[p[0]] * 100); }).join(' · ') + '</span>';
  }

  // ---------- acciones (teclado y MIDI) ----------
  var ACTIONS = {
    scene1: ['escena 1 · eclipse', function () { setScene(0); }],
    scene2: ['escena 2 · la pared', function () { setScene(1); }],
    scene3: ['escena 3 · tránsito', function () { setScene(2); }],
    scene4: ['escena 4 · solaris', function () { setScene(3); }],
    scene5: ['escena 5 · grabado', function () { setScene(4); }],
    tap: ['tap tempo', tap],
    sync: ['sync (beat 1)', sync],
    flash: ['flash', function () { st.flash = 1; }],
    blackout: ['blackout', function () { st.blackout = !st.blackout; toast(st.blackout ? 'blackout' : 'luz'); }],
    logoToggle: ['logo encima (prende/apaga)', function () { st.logoOn = !st.logoOn; toast(st.logoOn ? 'logo: sí' : 'logo: no'); }],
    drop: ['drop (totalidad)', drop],
    auto: ['automático', function () { st.auto = !st.auto; st.autoNext = beatInfo(now()).bar + 16; toast(st.auto ? 'automático: sí' : 'automático: no'); }],
    bpmUp: ['BPM +0,5', function () { nudgeBpm(0.5); }],
    bpmDown: ['BPM −0,5', function () { nudgeBpm(-0.5); }]
  };
  ACTIONS.quality = ['calidad (baja/alta)', function () { st.lowres = !st.lowres; build(); toast(st.lowres ? 'calidad baja: más fluido' : 'calidad alta'); }];
  var KEYS = { q: 'quality', '1': 'scene1', '2': 'scene2', '3': 'scene3', '4': 'scene4', '5': 'scene5', ' ': 'tap', s: 'sync', f: 'flash', b: 'blackout', l: 'logoToggle', d: 'drop', a: 'auto', ArrowUp: 'bpmUp', ArrowDown: 'bpmDown' };
  addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (KEYS[k]) { e.preventDefault(); ACTIONS[KEYS[k]][1](); return; }
    if (k === 'h') { hudEl.classList.toggle('hidden'); helpEl.classList.toggle('hidden'); }
    if (k === 'm') toggleMidi();
    if (k === 'Enter') fullscreen();
  });
  addEventListener('dblclick', fullscreen);
  function fullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen(); }
  var idleT; addEventListener('mousemove', function () { document.body.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { document.body.classList.add('idle'); }, 2500); });

  // ---------- MIDI ----------
  // Mapeo de fábrica pensado para el Xone:K2 (capa 1): faders = CC 16–19, fila de perillas de arriba = CC 4–7. Cualquier canal.
  var DEFAULT_MAP = {
    master: { type: 'cc', num: 16 }, pulse: { type: 'cc', num: 17 }, glow: { type: 'cc', num: 18 }, logo: { type: 'cc', num: 19 },
    speed: { type: 'cc', num: 4 }, grain: { type: 'cc', num: 5 }, shadow: { type: 'cc', num: 6 }, fade: { type: 'cc', num: 7 }
  };
  var STORE = 'solaris-midi-v1', map = load();
  function load() { try { var m = JSON.parse(localStorage.getItem(STORE)); if (m && typeof m === 'object') return m; } catch (e) {} return JSON.parse(JSON.stringify(DEFAULT_MAP)); }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(map)); } catch (e) {} }
  var midi = null, learning = null, ccState = {}, midiLabel = 'MIDI: sin conectar';
  function matches(b, type, ch, num) { return b && b.type === type && b.num === num && (b.ch === undefined || b.ch === null || b.ch === ch); }
  function onMidi(ev) {
    var d = ev.data, s = d[0];
    if (s === 0xF8) { clockTick(); return; }
    if (s === 0xFA || s === 0xFB) { st.beat0 = now(); st.clock = []; return; }
    if (s >= 0xF0) return;
    var type = s & 0xF0, ch = s & 0x0F, num = d[1], val = d[2];
    var kind = type === 0xB0 ? 'cc' : (type === 0x90 && val > 0) ? 'note' : null;
    if (!kind) return;
    if (learning) {
      Object.keys(map).forEach(function (k) { if (matches(map[k], kind, ch, num)) delete map[k]; });   // un control, una función
      map[learning] = { type: kind, ch: ch, num: num }; save();
      toast('asignado: ' + labelOf(learning) + ' → ' + bindLabel(map[learning]));
      learning = null; renderMidi(); ledFeedback(); return;
    }
    Object.keys(map).forEach(function (k) {
      if (!matches(map[k], kind, ch, num)) return;
      if (P.hasOwnProperty(k)) { if (kind === 'cc') P[k] = val / 127; else P[k] = P[k] > 0.5 ? 0 : 1; }
      else if (ACTIONS[k]) {
        if (kind === 'note') ACTIONS[k][1]();
        else { var key = ch + ':' + num, was = ccState[key] || 0; if (val >= 64 && was < 64) ACTIONS[k][1](); ccState[key] = val; }
      }
    });
  }
  function clockTick() {
    var t = now(); st.clockAt = t; st.clock.push(t); if (st.clock.length > 49) st.clock.shift();
    if (st.clock.length >= 25) {
      var bpm = 60 / ((st.clock[st.clock.length - 1] - st.clock[0]) / (st.clock.length - 1) * 24);
      if (bpm > 50 && bpm < 220) st.bpm = st.bpm + (bpm - st.bpm) * 0.1;
    }
  }
  function connectInputs() {
    var names = [];
    midi.inputs.forEach(function (inp) { inp.onmidimessage = onMidi; names.push(inp.name); });
    midiLabel = names.length ? 'MIDI: ' + names.join(', ') : 'MIDI: sin controladores';
    document.getElementById('midi-status').textContent = names.length ? 'conectado: ' + names.join(', ') : 'no encuentro controladores. Enchufá el K2 por USB y esperá unos segundos.';
  }
  function ledFeedback() {   // prende en el K2 el botón de la escena activa (si los botones están asignados a notas)
    if (!midi) return;
    midi.outputs.forEach(function (out) {
      ['scene1', 'scene2', 'scene3', 'scene4', 'scene5'].forEach(function (k, i) {
        var b = map[k]; if (!b || b.type !== 'note') return;
        try { out.send([0x90 | (b.ch || 0), b.num, i === st.scene ? 127 : 0]); } catch (e) {}
      });
    });
  }
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: false }).then(function (m) {
      midi = m; connectInputs(); ledFeedback();
      m.onstatechange = function () { connectInputs(); ledFeedback(); };
    }).catch(function () { midiLabel = 'MIDI: permiso denegado'; document.getElementById('midi-status').textContent = 'Chrome no dio permiso para usar MIDI. Tocá el candado de la barra de direcciones y permití "Dispositivos MIDI".'; });
  } else {
    midiLabel = 'MIDI: este navegador no soporta (usá Chrome)';
  }

  // Panel de mapeo
  var midiEl = document.getElementById('midi'), table = document.getElementById('midi-table');
  function labelOf(k) { var p = PARAMS.filter(function (x) { return x[0] === k; })[0]; return p ? p[1] : ACTIONS[k][0]; }
  function bindLabel(b) { return b ? (b.type === 'cc' ? 'CC ' : 'nota ') + b.num + (b.ch !== undefined && b.ch !== null ? ' · canal ' + (b.ch + 1) : '') : '—'; }
  function renderMidi() {
    var rows = PARAMS.map(function (p) { return p[0]; }).concat(Object.keys(ACTIONS));
    table.innerHTML = rows.map(function (k) {
      return '<tr><td>' + labelOf(k) + '</td><td>' + bindLabel(map[k]) + '</td><td style="text-align:right">' +
        '<button data-learn="' + k + '" class="' + (learning === k ? 'learning' : '') + '">' + (learning === k ? 'mové un control…' : 'aprender') + '</button> ' +
        (map[k] ? '<button data-clear="' + k + '">×</button>' : '') + '</td></tr>';
    }).join('');
  }
  table.addEventListener('click', function (e) {
    var l = e.target.getAttribute('data-learn'), c = e.target.getAttribute('data-clear');
    if (l) { learning = learning === l ? null : l; renderMidi(); }
    if (c) { delete map[c]; save(); renderMidi(); }
  });
  document.getElementById('midi-reset').addEventListener('click', function () { map = JSON.parse(JSON.stringify(DEFAULT_MAP)); save(); renderMidi(); toast('mapeo de fábrica'); });
  document.getElementById('midi-close').addEventListener('click', toggleMidi);
  function toggleMidi() { learning = null; midiEl.classList.toggle('hidden'); renderMidi(); }

  // ---------- arranque ----------
  var wake = null;
  function keepAwake() { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wake = w; }).catch(function () {}); }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') keepAwake(); });
  var resizeT;
  addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(build, 300); });
  var fonts = ['40px "Major Mono Display"', '700 20px "Space Mono"', '400 20px "Space Mono"'];
  Promise.all(fonts.map(function (f) { return document.fonts.load(f); })).catch(function () {}).then(function () {
    build();
    document.getElementById('start').classList.add('hidden');
    toast('H: ayuda · M: MIDI · Enter: pantalla completa');
    keepAwake();
    window.SOLARIS = { setScene: setScene, P: P, st: st, drop: drop };   // para probar desde la consola
    requestAnimationFrame(frame);
  });
})();
