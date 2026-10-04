/* SOLARIS · visuales en vivo para proyectar en Melt.
   Seis escenas con los personajes de SOLARIS que pulsan al BPM (127 por defecto), con tap tempo, MIDI clock y mapeo MIDI (pensado para el Xone:K2). */
(function () {
  'use strict';
  var M = Motor, C = M.C;
  var cv = document.getElementById('c'), g = cv.getContext('2d');
  var W, H, S, CX, CY, R;
  var BRAND = '"Major Mono Display", monospace', MONO = '"Space Mono", monospace';

  // ---------- parámetros (0..1) que se controlan con faders y perillas ----------
  var PARAMS = [
    ['master', 'brillo', 1], ['pulse', 'pulso', 0.7], ['glow', 'fuego / corona', 0.7], ['logo', 'logo encima', 0],
    ['speed', 'velocidad', 0.5], ['grain', 'grano', 0.3], ['shadow', 'sombras', 0.5], ['fade', 'fundido entre escenas', 0.3],
    ['zoom', 'zoom', 0.5], ['temp', 'color (rojo ↔ oro)', 0.5], ['trail', 'estela', 0], ['punch', 'golpe de cámara', 0.3],
    ['rings', 'anillos de la huella', 1], ['crowd', 'cantidad de personajes', 0.6], ['glitch', 'glitch', 0], ['strobe', 'strobe (velocidad)', 0],
    ['rotate', 'rotación', 0.5], ['corona', 'tamaño de la corona', 0.5]
  ];
  var WRAP = { rotate: true };   // con encoder, la rotación da vueltas sin tope
  var P = {}; PARAMS.forEach(function (p) { P[p[0]] = p[2]; });

  var SCENES = [
    { name: 'el ritual', draw: sceneRitual },
    { name: 'la pared', draw: scenePared },
    { name: 'el eclipse', draw: sceneTransito },
    { name: 'solaris', draw: sceneLogo },
    { name: 'el gigante', draw: sceneGrabado },
    { name: 'la multitud', draw: sceneMultitud }
  ];

  var st = {
    scene: 0, prev: -1, fadeStart: -10, bpm: 127, beat0: now(), flash: 0, blackout: false, black: 0, logoOn: false,
    transitBeat: 0, auto: false, autoNext: 0, taps: [], clock: [], clockAt: 0,
    mirror: 0, freeze: false, tempoMul: 1, strobeHold: false, text: null, textAt: 0
  };
  function now() { return performance.now() / 1000; }

  // ---------- tiempo musical ----------
  function beatInfo(t) {
    var b = (t - st.beat0) * st.bpm / 60 * st.tempoMul, n = Math.floor(b), ph = b - n;
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
    TX.wall = M.offscreen(W, H, function () {   // pared limpia, con pinturas rupestres sutiles en la roca y en la pared
      M.background();
      var wp = M.wall({ top: H * 0.15, bot: H * 0.92, left: W * 0.08, right: W * 0.92, people: [], fireY: H * 1.15 }), cx = M.ctx;
      var outside = new Path2D(); outside.rect(0, 0, W, H); outside.addPath(wp); cx.save(); cx.clip(outside, 'evenodd');
      cavePaintings(cx, 0, 0, W, H, 'roca', '#d98a5a', 0.5, 46); cx.restore();
      cx.save(); cx.clip(wp); cavePaintings(cx, W * 0.09, H * 0.17, W * 0.82, H * 0.42, 'pared', '#f0b48a', 0.2, 16); cx.restore();
    });
    TX.sky = M.offscreen(W, H, function () {   // cielo grabado para la multitud
      M.background();
      var l = M.layer(), lg = l.getContext('2d');
      M.engrave(lg, { angle: 0, spacing: Math.max(6, S / 140), maxW: 1.8, light: function (x, y) { return y > H * 0.7 ? 0 : 0.12 + 0.85 * M.clamp(1 - Math.hypot(x - W / 2, (y - H * 0.34) * 1.4) / (S * 0.75)); } });
      lg.globalCompositeOperation = 'source-atop'; var tg = lg.createRadialGradient(W / 2, H * 0.34, S * 0.1, W / 2, H * 0.34, S * 0.9);
      tg.addColorStop(0, M.rgba(C.accent, 0.9)); tg.addColorStop(1, M.rgba(C.accent, 0.1)); lg.fillStyle = tg; lg.fillRect(0, 0, W, H);
      M.ctx.drawImage(l, 0, 0);
    });
    TX.mask = document.createElement('canvas'); TX.mask.width = Math.round(W / 5); TX.mask.height = Math.round(H / 5);
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
    c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha; c.translate(x, y); c.rotate(rot + (P.rotate - 0.5) * Math.PI * 2); c.scale(scale, scale);
    c.drawImage(TX.corona, -TX.corona.width / 2, -TX.corona.height / 2); c.restore();
  }
  function huella(c, x, y, size, t, B, alpha) {
    var rot = t * 0.06 * (0.3 + P.speed * 1.4) + (P.rotate - 0.5) * Math.PI * 2, nr = Math.round(4 + P.rings * 14);
    RINGS.forEach(function (pts, i) {
      if (i >= nr) return;
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
  function eclipseCore(c, x, y, t, B, extra) {
    corona(c, x, y, (0.7 + P.corona * 0.6) * (1 + (extra || 0.07) * B.k * (0.5 + P.glow)), t * 0.02 * (0.3 + P.speed), 0.75 + 0.25 * P.glow);
    c.fillStyle = C.bg; c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
    rim(c, x, y, R, B.k);
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
  //  LOS PERSONAJES: los muñecos de SOLARIS y su coreografía
  // =====================================================================
  // Ángulos de los brazos medidos desde "hacia abajo", positivos hacia afuera (π = arriba).
  // Codo: positivo sigue girando hacia afuera, negativo dobla hacia adentro (mano en la cintura).
  var POSES = {
    down:   { la: 0.25, le: 0.15, ra: 0.25, re: 0.15, lg: 0.12, kn: 0, lean: 0, jump: 0 },
    up:     { la: 2.75, le: 0.12, ra: 2.75, re: 0.12, lg: 0.15, kn: 0, lean: 0, jump: 0 },
    vee:    { la: 2.3, le: 0, ra: 2.3, re: 0, lg: 0.22, kn: 0, lean: 0, jump: 0 },
    clap:   { la: 2.95, le: 0.75, ra: 2.95, re: 0.75, lg: 0.12, kn: 0.1, lean: 0, jump: 0 },
    pointR: { la: 0.6, le: -2.0, ra: 2.65, re: 0, lg: 0.18, kn: 0.1, lean: 0.1, jump: 0 },
    pointL: { la: 2.65, le: 0, ra: 0.6, re: -2.0, lg: 0.18, kn: 0.1, lean: -0.1, jump: 0 },
    hips:   { la: 0.75, le: -2.1, ra: 0.75, re: -2.1, lg: 0.17, kn: 0, lean: 0, jump: 0 },
    tee:    { la: 1.57, le: 0, ra: 1.57, re: 0, lg: 0.22, kn: 0, lean: 0, jump: 0 },
    pumpR:  { la: 0.35, le: -0.5, ra: 2.4, re: 0.9, lg: 0.14, kn: 0.15, lean: 0.06, jump: 0 },
    pumpL:  { la: 2.4, le: 0.9, ra: 0.35, re: -0.5, lg: 0.14, kn: 0.15, lean: -0.06, jump: 0 },
    crouch: { la: 1.15, le: 0.7, ra: 1.15, re: 0.7, lg: 0.26, kn: 0.8, lean: 0, jump: 0 },
    jump:   { la: 2.7, le: 0.1, ra: 2.7, re: 0.1, lg: 0.28, kn: 0, lean: 0, jump: 1 },
    swayL:  { la: 1.0, le: 0.9, ra: 0.45, re: 1.3, lg: 0.14, kn: 0.1, lean: -0.13, jump: 0 },
    swayR:  { la: 0.45, le: 1.3, ra: 1.0, re: 0.9, lg: 0.14, kn: 0.1, lean: 0.13, jump: 0 }
  };
  var CHOREO = [   // secuencias de 8 beats (2 compases)
    ['up', 'down', 'up', 'down', 'vee', 'clap', 'vee', 'clap'],
    ['pointR', 'hips', 'pointL', 'hips', 'pumpR', 'pumpL', 'pumpR', 'jump'],
    ['swayL', 'swayR', 'swayL', 'swayR', 'tee', 'up', 'tee', 'up'],
    ['clap', 'clap', 'vee', 'vee', 'crouch', 'jump', 'crouch', 'jump'],
    ['pumpR', 'pumpR', 'pumpL', 'pumpL', 'pointR', 'pointL', 'up', 'up'],
    ['hips', 'swayR', 'hips', 'swayL', 'clap', 'up', 'clap', 'up']
  ];
  var POSE_KEYS = ['la', 'le', 'ra', 're', 'lg', 'kn', 'lean', 'jump'];
  // Pose de un personaje en el beat b. seq = índice de coreografía, delay en beats (para hacer olas), force = pose forzada
  function poseAt(b, seq, delay, force) {
    var bb = b - (delay || 0), n = Math.floor(bb), ph = bb - n;
    var list = CHOREO[((seq % CHOREO.length) + CHOREO.length) % CHOREO.length];
    var A = POSES[force || list[((n - 1) % 8 + 8) % 8]], Bp = POSES[force || list[(n % 8 + 8) % 8]];
    var e = Math.min(1, ph / 0.28); e = 1 - Math.pow(1 - e, 3);   // cambia rápido, justo en el golpe
    var out = { ph: ph };
    POSE_KEYS.forEach(function (k) { out[k] = A[k] + (Bp[k] - A[k]) * e; });
    return out;
  }
  // Dibuja un personaje. (x, feet) = pies, h = altura. Usa el strokeStyle/fillStyle que ya tenga c.
  function figure(c, x, feet, h, p, k) {
    var jump = p.jump * Math.sin(Math.min(1, p.ph) * Math.PI) * h * 0.2;
    var bounce = (k || 0) * h * 0.03 + p.kn * h * 0.12;
    c.save(); c.translate(x, feet - jump); c.rotate(p.lean);
    var hipY = -h * 0.47 + bounce, neckY = -h * 0.82 + bounce * 1.1;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = h * 0.13; c.beginPath(); c.moveTo(0, hipY); c.lineTo(0, neckY); c.stroke();
    c.beginPath(); c.arc(0, neckY - h * 0.09, h * 0.075, 0, Math.PI * 2); c.fill();
    c.lineWidth = h * 0.075;
    [-1, 1].forEach(function (sd) {   // piernas
      var ta = p.lg + p.kn * 0.7, sa = p.lg - p.kn * 0.5;
      var kx = sd * Math.sin(ta) * h * 0.25, ky = hipY + Math.cos(ta) * h * 0.25;
      c.beginPath(); c.moveTo(0, hipY); c.lineTo(kx, ky); c.lineTo(kx + sd * Math.sin(sa) * h * 0.24, ky + Math.cos(sa) * h * 0.24); c.stroke();
    });
    c.lineWidth = h * 0.06;
    [[-1, p.la, p.le], [1, p.ra, p.re]].forEach(function (a) {   // brazos
      var sd = a[0], sx = sd * h * 0.06, sy = neckY + h * 0.03;
      var ex = sx + sd * Math.sin(a[1]) * h * 0.2, ey = sy + Math.cos(a[1]) * h * 0.2, fa = a[1] + a[2];
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(ex + sd * Math.sin(fa) * h * 0.19, ey + Math.cos(fa) * h * 0.19); c.stroke();
    });
    c.restore();
  }
  // Silueta negra con borde de luz (para ponerlas delante de algo que brilla)
  function silhouette(c, x, feet, h, p, k, rim) {
    c.save(); c.strokeStyle = c.fillStyle = C.bg;
    c.shadowColor = rim || C.accent; c.shadowBlur = h * 0.12 + 18 * (k || 0);
    figure(c, x, feet, h, p, k); c.restore();
  }
  function eclipseAt(c, x, y, r, t, B) {
    corona(c, x, y, (r / R) * (0.7 + P.corona * 0.6) * (1 + 0.07 * B.k * (0.5 + P.glow)), t * 0.02 * (0.3 + P.speed), 0.75 + 0.25 * P.glow);
    c.fillStyle = C.bg; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    rim(c, x, y, r, B.k);
    huella(c, x, y, r * 0.8, t, B, 1);
  }

  // ---------- pinturas rupestres sutiles (para la pared de la cueva) ----------
  function cavePaintings(c, x0, y0, w, h, seed, color, alpha, count) {
    var r = M.rng(M.seedFrom(seed)), U = S / 1080;
    function rough(pts, close) {   // trazo de pigmento, un poco tembloroso
      c.beginPath();
      pts.forEach(function (q, i) { var jx = (r() - 0.5) * 2 * U, jy = (r() - 0.5) * 2 * U; i ? c.lineTo(q[0] + jx, q[1] + jy) : c.moveTo(q[0] + jx, q[1] + jy); });
      if (close) c.closePath(); c.stroke();
    }
    var kinds = ['hand', 'spiral', 'sun', 'rings', 'zigzag', 'animal', 'person', 'dots', 'eclipse'];
    c.save(); c.strokeStyle = c.fillStyle = color; c.lineCap = 'round'; c.lineJoin = 'round';
    for (var i = 0; i < count; i++) {
      var kind = kinds[Math.floor(r() * kinds.length)], cx = x0 + r() * w, cy = y0 + r() * h, s = (26 + r() * 46) * U, rot = (r() - 0.5) * 0.6;
      c.globalAlpha = alpha * (0.5 + r() * 0.5); c.lineWidth = (2 + r() * 2.5) * U;
      c.save(); c.translate(cx, cy); c.rotate(rot);
      if (kind === 'hand') {   // mano en negativo: pigmento soplado alrededor
        var fingers = [[-0.55, -1.25], [-0.2, -1.55], [0.15, -1.6], [0.5, -1.35], [0.95, -0.35]];
        for (var d = 0; d < 260; d++) {
          var a = r() * Math.PI * 2, rr = s * (0.95 + r() * 0.9);
          c.globalAlpha = alpha * 0.35 * r(); c.fillRect(Math.cos(a) * rr * 0.7, Math.sin(a) * rr * 0.9 - s * 0.3, 1.6 * U, 1.6 * U);
        }
        c.globalAlpha = alpha * 0.5;
        c.beginPath(); c.ellipse(0, 0, s * 0.42, s * 0.5, 0, 0, Math.PI * 2); c.stroke();
        fingers.forEach(function (f) { rough([[f[0] * s * 0.4, -s * 0.3], [f[0] * s * 0.55, f[1] * s * 0.6]]); });
      } else if (kind === 'spiral') {
        var sp = []; for (var q = 0; q < 60; q++) { var th = q * 0.32; sp.push([Math.cos(th) * th * s * 0.055, Math.sin(th) * th * s * 0.055]); } rough(sp);
      } else if (kind === 'sun' || kind === 'eclipse') {
        var cr = []; for (var q2 = 0; q2 <= 24; q2++) { var a2 = q2 / 24 * Math.PI * 2; cr.push([Math.cos(a2) * s * 0.4, Math.sin(a2) * s * 0.4]); } rough(cr, true);
        if (kind === 'sun') for (var ry = 0; ry < 10; ry++) { var a3 = ry / 10 * Math.PI * 2; rough([[Math.cos(a3) * s * 0.55, Math.sin(a3) * s * 0.55], [Math.cos(a3) * s * 0.85, Math.sin(a3) * s * 0.85]]); }
        else { c.beginPath(); c.arc(0, 0, s * 0.12, 0, Math.PI * 2); c.fill(); }
      } else if (kind === 'rings') {
        for (var ri = 1; ri <= 3; ri++) { c.beginPath(); c.arc(0, 0, s * 0.18 * ri, 0, Math.PI * 2); c.stroke(); }
      } else if (kind === 'zigzag') {
        var zz = []; for (var zi = 0; zi < 7; zi++) zz.push([(zi - 3) * s * 0.22, (zi % 2 ? -1 : 1) * s * 0.18]); rough(zz);
      } else if (kind === 'animal') {   // bisonte / ciervo de palitos
        rough([[-s * 0.6, 0], [-s * 0.2, -s * 0.22], [s * 0.35, -s * 0.18], [s * 0.6, -s * 0.05], [s * 0.45, s * 0.12], [-s * 0.5, s * 0.12]], true);
        [-0.45, -0.25, 0.25, 0.42].forEach(function (lx) { rough([[lx * s, s * 0.12], [lx * s, s * 0.5]]); });
        rough([[s * 0.6, -s * 0.05], [s * 0.78, -s * 0.3], [s * 0.7, -s * 0.48]]); rough([[s * 0.66, -s * 0.12], [s * 0.9, -s * 0.38]]);
      } else if (kind === 'person') {   // el personaje, como pintura rupestre
        figure(c, 0, s * 0.6, s * 1.2, poseFixed(['up', 'vee', 'pointR', 'tee'][Math.floor(r() * 4)]), 0);
      } else {   // filas de puntos
        for (var di = 0; di < 3; di++) for (var dj = 0; dj < 5; dj++) { c.beginPath(); c.arc((dj - 2) * s * 0.2, (di - 1) * s * 0.2, 2.4 * U, 0, Math.PI * 2); c.fill(); }
      }
      c.restore();
    }
    c.restore();
  }
  function poseFixed(name) { var p = { ph: 0 }; POSE_KEYS.forEach(function (k) { p[k] = POSES[name][k]; }); p.jump = 0; return p; }

  // =====================================================================
  //  1 · EL RITUAL: los personajes bailan en ronda alrededor del sol (son sus rayos)
  // =====================================================================
  function sceneRitual(c, t, B) {
    bg(c);
    var r = S * 0.16;
    ambient(c, CX, CY, (0.25 + 0.3 * B.k) * P.glow);
    eclipseAt(c, CX, CY, r, t, B);
    var n = Math.round(6 + P.crowd * 8), rr = r * 1.72, h = r * 0.95, spin = t * 0.05 * (0.3 + P.speed) + (P.rotate - 0.5) * Math.PI * 2;
    var bar = Math.floor(B.b / 4), seq = Math.floor(bar / 2);
    for (var i = 0; i < n; i++) {
      var a = spin + i / n * Math.PI * 2;
      c.save(); c.translate(CX + Math.cos(a) * rr, CY + Math.sin(a) * rr); c.rotate(a + Math.PI / 2);
      silhouette(c, 0, 0, h, poseAt(B.b, seq, i / n * 0.9), B.k, C.accent);
      c.restore();
    }
  }

  // =====================================================================
  //  2 · LA PARED: la pared de la caverna con las sombras de los personajes
  // =====================================================================
  function scenePared(c, t, B) {
    c.drawImage(TX.wall, 0, 0);
    var flick = 0.75 + 0.12 * Math.sin(t * 9.3) + 0.08 * Math.sin(t * 23.1 + 1) + 0.05 * Math.sin(t * 41.7);
    if (TX.shq !== 3 + Math.round(P.shadow * 5)) { var nq = 3 + Math.round(P.shadow * 5); TX.shadow.width = Math.round(W / nq); TX.shadow.height = Math.round(H / nq); TX.shq = nq; }
    var sh = TX.shadow, s = sh.getContext('2d'), q = sh.width / W;
    s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, sh.width, sh.height);
    var grow = 1 + 0.05 * flick + 0.02 * B.k;
    s.setTransform(q * grow, 0, 0, q * grow, (1 - grow) * sh.width / 2, (1 - grow) * sh.height);
    s.strokeStyle = s.fillStyle = C.bg;
    var n = Math.round(2 + P.crowd * 8), seqBase = Math.floor(B.b / 8);
    for (var i = 0; i < n; i++) {
      var x = W * (n === 1 ? 0.5 : 0.12 + i * (0.76 / (n - 1))), hh = H * (0.56 + 0.12 * ((i * 37) % 5) / 4);
      figure(s, x, H * (0.93 + 0.015 * (i % 2)), hh, poseAt(B.b, seqBase + i, (i % 3) * 0.12), B.k);
    }
    c.save(); c.globalAlpha = 0.6 + 0.35 * P.shadow; c.imageSmoothingQuality = 'high'; c.drawImage(sh, 0, 0, W, H); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter';
    var fy = H * 1.1, fg = c.createRadialGradient(CX, fy, 20, CX, fy, H * 0.95);
    var amt = (0.35 + 0.25 * flick + 0.3 * B.k) * P.glow;
    fg.addColorStop(0, rgba(C.fire, amt)); fg.addColorStop(0.4, rgba(C.accent, amt * 0.45)); fg.addColorStop(1, rgba(C.glow, 0));
    c.fillStyle = fg; c.fillRect(0, 0, W, H); c.restore();
  }

  // =====================================================================
  //  3 · EL ECLIPSE: la luna cruza el sol y la gente lo festeja (ciclo de 8 compases)
  // =====================================================================
  function sceneTransito(c, t, B) {
    bg(c);
    var r = S * 0.2, sx = CX, sy = H * 0.4, sc = r / R;
    var L = 32, p = (((B.b - st.transitBeat) % L) + L) % L / L;
    var u = p * 2 - 1, au = Math.max(0, Math.abs(u) - 0.25) / 0.75, dx = r * 2.6 * (u < 0 ? -1 : 1) * Math.pow(au, 1.3), dy = dx * 0.22;
    var d = Math.hypot(dx, dy), mr = r * 1.04, visible = Math.min(1, d / (r + mr)), total = d < mr - r + r * 0.01;
    var edge = d - (mr - r), diamond = edge > -r * 0.01 && edge < r * 0.14 ? 1 - Math.max(0, edge) / (r * 0.14) : 0;
    ambient(c, sx, sy, (0.15 + 0.5 * visible + 0.25 * B.k) * P.glow);
    if (total) {
      eclipseAt(c, sx, sy, r, t, B);
    } else {
      c.save(); c.globalAlpha = 0.85 + 0.15 * B.k; c.translate(sx, sy); c.scale(sc, sc); c.drawImage(TX.sun, -TX.sun.width / 2, -TX.sun.height / 2); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; var sg = c.createRadialGradient(sx, sy, r, sx, sy, r * (1.8 + visible));
      sg.addColorStop(0, rgba(C.fire, 0.35 * visible)); sg.addColorStop(1, rgba(C.glow, 0)); c.fillStyle = sg; c.fillRect(0, 0, W, H); c.restore();
      c.fillStyle = C.bg; c.beginPath(); c.arc(sx + dx, sy + dy, mr, 0, Math.PI * 2); c.fill();
      c.strokeStyle = rgba(C.cream, 0.12); c.lineWidth = 1.2; c.stroke();
    }
    if (diamond > 0) { var a = Math.atan2(-dy, -dx); glint(c, sx + Math.cos(a) * r, sy + Math.sin(a) * r, r * (0.25 + 0.45 * diamond), diamond); }
    // suelo y público: dos filas de personajes que miran el cielo y festejan la totalidad
    var gr = c.createLinearGradient(0, H * 0.72, 0, H);
    gr.addColorStop(0, rgba(C.bg, 0)); gr.addColorStop(0.5, rgba(C.bg, 0.9)); gr.addColorStop(1, C.bg);
    c.fillStyle = gr; c.fillRect(0, H * 0.72, W, H * 0.28);
    var hype = total || diamond > 0.3, n = Math.round(5 + P.crowd * 9), seq = Math.floor(B.b / 8);
    [[0.86, 0.22, 0.55], [1.02, 0.34, 0]].forEach(function (row, ri) {
      var m = n + (ri ? 0 : 3);
      for (var i = 0; i < m; i++) {
        var x = W * ((i + 0.5 + (ri ? 0 : 0.5)) / m), h = H * row[1] * (0.9 + 0.2 * (((i * 53) % 7) / 6));
        var pose = poseAt(B.b, seq + i + ri, ((i * 0.13) % 0.5), hype ? (Math.floor(B.b) % 2 ? 'jump' : 'up') : null);
        silhouette(c, x, H * row[0], h, pose, B.k, rgba(C.fire, 0.9 * (0.3 + visible) + (total ? 0.4 : 0)));
      }
    });
  }
  function drop() {   // salta al anillo de diamante y la totalidad
    if (st.scene !== 2) setScene(2, true);
    st.transitBeat = beatInfo(now()).b - 32 * 0.33; toast('drop · totalidad');
  }

  // =====================================================================
  //  4 · SOLARIS: el logo, con un personaje bailando arriba de cada letra
  // =====================================================================
  function sceneLogo(c, t, B) {
    bg(c);
    ambient(c, CX, CY, (0.2 + 0.3 * B.k) * P.glow);
    huella(c, CX, CY, S * 0.55, t * 0.5, B, 0.12);
    var size = Math.min(W * 0.12, H * 0.22) * (1 + 0.02 * B.k), base = CY + size * 0.45;
    var total = wordmark(c, CX, base, size, B.k, 1);
    c.font = size + 'px ' + BRAND;
    var cap = c.measureText('h').actualBoundingBoxAscent, chars = 'solaris'.split(''), sp = size * 0.06, x = CX - total / 2, seq = Math.floor(B.b / 8);
    chars.forEach(function (ch, i) {
      var w = c.measureText(ch).width;
      c.save(); c.strokeStyle = c.fillStyle = C.cream; c.shadowColor = C.accent; c.shadowBlur = 16 + 24 * B.k;
      figure(c, x + w / 2, base - cap - size * 0.04, size * 0.62, poseAt(B.b, seq, i * 0.1), B.k);   // ola de izquierda a derecha
      c.restore();
      x += w + sp;
    });
    slogan(c, CX, base + size * 0.5, Math.max(14, size * 0.14), 0.95);
    somosUno(c, CX, H * 0.88, S * 0.08, B.k);
  }

  // =====================================================================
  //  5 · EL GIGANTE: un personaje enorme hecho de líneas de grabado, con el sol de aureola
  // =====================================================================
  function sceneGrabado(c, t, B) {
    bg(c);
    // máscara del gigante (y su sombra) en baja resolución
    var mk = TX.mask, mx = mk.getContext('2d'), q = mk.width / W;
    mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, mk.width, mk.height);
    mx.setTransform(q, 0, 0, q, 0, 0);
    var gh = H * 0.8, pose = poseAt(B.b, Math.floor(B.b / 8) + 1, 0);
    mx.strokeStyle = mx.fillStyle = 'rgba(0,0,255,1)'; figure(mx, CX + W * 0.07, H * 0.98, gh * 0.96, pose, B.k);   // sombra: canal azul
    mx.globalCompositeOperation = 'lighter';
    mx.strokeStyle = mx.fillStyle = 'rgba(255,0,0,1)'; figure(mx, CX, H * 0.95, gh, pose, B.k);                  // gigante: canal rojo
    mx.globalCompositeOperation = 'source-over';
    var md = mx.getImageData(0, 0, mk.width, mk.height).data, mw = mk.width, mh = mk.height;
    function m(x, y, ch) { var ix = (x * q) | 0, iy = (y * q) | 0; if (ix < 0 || iy < 0 || ix >= mw || iy >= mh) return 0; return md[(iy * mw + ix) * 4 + ch] / 255; }
    var headY = H * 0.95 - gh * 0.91 + B.k * gh * 0.03, rr = gh * 0.17 * (1 + 0.08 * B.k);   // aureola detrás de la cabeza
    var L = TX.layer, lg = L.getContext('2d');
    lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, W, H);
    var NB = 8, paths = []; for (var i = 0; i < NB; i++) paths.push(new Path2D());
    var sp = Math.max(5, S / 160), step = Math.max(4, W / 380), spd = 0.3 + P.speed * 1.4, wob = S * 0.004 * (1 + B.k * 2.5);
    for (var y = sp / 2; y < H; y += sp) {
      var prev = null;
      for (var x = 0; x <= W + step; x += step) {
        var yy = y + Math.sin(x * 0.004 + t * 0.8 * spd + y * 0.01) * wob;
        var giant = m(x, yy, 0), shadow = m(x, yy, 2) * (1 - giant);
        var dd = Math.hypot(x - CX, yy - headY) / rr, rd = (dd - 1) * 6;
        var l = 0.05 + 0.04 * B.off + giant * (0.85 + 0.3 * B.k) + shadow * 0.28 + Math.exp(-rd * rd) * (0.7 + 0.4 * B.k) * (1 - giant);
        if (dd > 1 && giant < 0.5) l += 0.35 * Math.exp(-(dd - 1) * 2.4) * P.glow;
        if (l < 0.07) { prev = null; continue; }
        var bi = Math.min(NB - 1, Math.floor(Math.min(1, l) * NB));
        if (prev) { paths[bi].moveTo(prev[0], prev[1]); paths[bi].lineTo(x, yy); }
        prev = [x, yy];
      }
    }
    lg.lineCap = 'round'; lg.strokeStyle = C.cream;
    paths.forEach(function (p, i) { lg.lineWidth = sp * 0.6 * (i + 0.5) / NB; lg.stroke(p); });
    lg.globalCompositeOperation = 'source-atop';
    var tg = lg.createRadialGradient(CX, headY, rr * 0.8, CX, H * 0.6, H * 0.9);
    tg.addColorStop(0, rgba(C.accent, 0.9)); tg.addColorStop(0.5, rgba(C.fire, 0.35)); tg.addColorStop(1, rgba(C.accent, 0.15));
    lg.fillStyle = tg; lg.fillRect(0, 0, W, H);
    c.drawImage(L, 0, 0);
  }

  // =====================================================================
  //  6 · LA MULTITUD: filas de personajes bailando hacia el sol, con olas
  // =====================================================================
  function sceneMultitud(c, t, B) {
    c.drawImage(TX.sky, 0, 0);
    var sy = H * 0.34, r = S * 0.13;
    ambient(c, CX, sy, (0.2 + 0.35 * B.k) * P.glow);
    eclipseAt(c, CX, sy, r, t, B);
    var bar = Math.floor(B.b / 4), wave = bar % 4 === 3;   // cada 4 compases, ola de brazos de izquierda a derecha
    var rows = 4, seq = Math.floor(B.b / 8);
    for (var ri = 0; ri < rows; ri++) {
      var depth = ri / (rows - 1);                        // 0 = fondo, 1 = adelante
      var h = H * (0.13 + depth * 0.3), feet = H * (0.63 + depth * 0.44), n = Math.round((5 + P.crowd * 6) * (1.5 - depth * 0.6));
      var rimC = rgba(C.fire, 0.35 + 0.5 * (1 - depth));
      for (var i = 0; i < n; i++) {
        var fx = (i + 0.5 + (ri % 2) * 0.5) / n, x = W * (fx * 1.1 - 0.05);
        var force = null, delay = ((i * 7 + ri * 3) % 5) * 0.06;
        if (wave) { var wb = (B.b % 4) * 1.2 - fx * 3.2; force = wb > 0 && wb < 1.1 ? 'up' : null; }
        silhouette(c, x, feet, h * (0.92 + 0.16 * (((i * 31 + ri) % 5) / 4)), poseAt(B.b, seq + i + ri, delay, force), B.k * (0.4 + depth * 0.6), rimC);
      }
    }
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
    if (st.text) {   // nombres y frases en pantalla
      var ta = Math.min(1, (t - st.textAt) / 0.6), ts = Math.min(W * 0.075, H * 0.13);
      c.save(); c.globalAlpha = ta; c.font = ts + 'px ' + BRAND; c.textAlign = 'center'; c.letterSpacing = ts * 0.06 + 'px';
      c.shadowColor = C.accent; c.shadowBlur = 24 + 30 * B.k; c.fillStyle = C.cream;
      var ty = st.scene === 3 ? H * 0.2 : H * 0.8;
      while (ts > 20 && c.measureText(st.text.toLowerCase()).width > W * 0.9) { ts -= 4; c.font = ts + 'px ' + BRAND; c.letterSpacing = ts * 0.06 + 'px'; }
      c.fillText(st.text.toLowerCase(), CX, ty);
      if (st.textSub) { c.shadowBlur = 0; c.font = '700 ' + Math.round(Math.max(16, ts * 0.3)) + 'px ' + MONO; c.letterSpacing = ts * 0.06 + 'px'; c.fillStyle = C.accent; c.fillText(st.textSub, CX, ty + ts * 0.6); }
      c.restore();
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
    var sr = st.strobeHold ? 1 : P.strobe;
    if (sr > 0.05) {   // strobe al tempo: negras, corcheas o semicorcheas
      var sub = sr < 0.34 ? 1 : sr < 0.67 ? 2 : 4;
      if (Math.floor(B.b * sub * 2) % 2) { c.fillStyle = 'rgba(0,0,0,0.92)'; c.fillRect(0, 0, W, H); }
      else if (st.strobeHold) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rgba(C.cream, 0.25); c.fillRect(0, 0, W, H); c.restore(); }
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
    if (st.lineupAuto) {
      var slot = ((B.bar % 32) + 32) % 32, cs = currentSet();
      if (slot === 0 && cs && st.text !== cs[1]) { st.text = cs[1]; st.textSub = cs[2]; st.textAt = t; st.autoText = true; }
      if (slot === 4 && st.autoText) { st.text = null; st.autoText = false; }
    }
    if (st.freeze) { hud(B); requestAnimationFrame(frame); return; }   // congelado: queda la última imagen
    var fadeDur = 0.2 + P.fade * 1.8, f = (t - st.fadeStart) / fadeDur;
    var a = TX.buf[0].getContext('2d'), comp = TX.buf[0];
    SCENES[st.scene].draw(a, t, B);
    if (f < 1 && st.prev >= 0) {
      var b = TX.buf[1].getContext('2d');
      SCENES[st.prev].draw(b, t, B);
      b.globalAlpha = f * f * (3 - 2 * f); b.drawImage(TX.buf[0], 0, 0); b.globalAlpha = 1;
      comp = TX.buf[1];
    }
    // cámara: zoom + golpe en el beat; estela = el cuadro anterior se desvanece de a poco
    var z = (0.6 + P.zoom * 0.8) * (1 + P.punch * 0.07 * B.k), alpha = 1 - P.trail * 0.88;
    g.globalAlpha = alpha;
    if (z < 1) { g.fillStyle = C.bg; g.fillRect(0, 0, W, H); }
    g.setTransform(z, 0, 0, z, (1 - z) * CX, (1 - z) * CY); g.drawImage(comp, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    if (st.mirror) {   // espejo: izquierda → derecha (y arriba → abajo en el modo 2)
      g.save(); g.translate(W, 0); g.scale(-1, 1); g.drawImage(cv, 0, 0, W / 2, H, 0, 0, W / 2, H); g.restore();
      if (st.mirror === 2) { g.save(); g.translate(0, H); g.scale(1, -1); g.drawImage(cv, 0, 0, W, H / 2, 0, 0, W, H / 2); g.restore(); }
    }
    var gl = P.glitch * B.k;
    if (gl > 0.04) {   // glitch: franjas que se corren en cada golpe
      for (var gi = 0; gi < 7; gi++) {
        var sy = Math.random() * H, sh = H * (0.02 + Math.random() * 0.08), sx = (Math.random() - 0.5) * W * 0.12 * gl;
        g.drawImage(cv, 0, sy, W, sh, sx, sy, W, sh);
      }
    }
    var tp = P.temp - 0.5;
    if (Math.abs(tp) > 0.04) {   // color: hacia carmesí o hacia oro
      g.save(); g.globalCompositeOperation = 'color'; g.globalAlpha = Math.min(1, Math.abs(tp) * 1.8);
      g.fillStyle = tp < 0 ? '#9b0d1f' : '#e9a23b'; g.fillRect(0, 0, W, H); g.restore();
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

  // ---------- avisos ----------
  var toastEl = document.getElementById('toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.remove('fade');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.add('fade'); }, 1400);
  }

  // ---------- acciones (teclado y MIDI) ----------
  var ACTIONS = {
    scene1: ['escena 1 · el ritual', function () { setScene(0); }],
    scene2: ['escena 2 · la pared', function () { setScene(1); }],
    scene3: ['escena 3 · el eclipse', function () { setScene(2); }],
    scene4: ['escena 4 · solaris', function () { setScene(3); }],
    scene5: ['escena 5 · el gigante', function () { setScene(4); }],
    scene6: ['escena 6 · la multitud', function () { setScene(5); }],
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
  ACTIONS.next = ['escena siguiente', function () { setScene((st.scene + 1) % SCENES.length); }];
  ACTIONS.prev = ['escena anterior', function () { setScene((st.scene + SCENES.length - 1) % SCENES.length); }];
  ACTIONS.mirror = ['espejo (no · 2 · 4)', function () { st.mirror = (st.mirror + 1) % 3; toast(['espejo: no', 'espejo: 2 lados', 'espejo: 4 lados'][st.mirror]); }];
  ACTIONS.freeze = ['congelar imagen', function () { st.freeze = !st.freeze; toast(st.freeze ? 'congelado' : 'en vivo'); }];
  ACTIONS.half = ['pulso a la mitad', function () { st.tempoMul = st.tempoMul === 0.5 ? 1 : 0.5; toast(st.tempoMul === 0.5 ? 'pulso ½' : 'pulso normal'); }];
  ACTIONS.double = ['pulso al doble', function () { st.tempoMul = st.tempoMul === 2 ? 1 : 2; toast(st.tempoMul === 2 ? 'pulso ×2' : 'pulso normal'); }];
  ACTIONS.strobeHold = ['strobe (mientras apretás)', function () { st.strobeHold = true; }, function () { st.strobeHold = false; }];
  ACTIONS.resetFx = ['reset de efectos', function () {
    PARAMS.forEach(function (p) { if (['master', 'pulse', 'glow', 'logo', 'speed', 'grain', 'shadow', 'fade'].indexOf(p[0]) < 0) P[p[0]] = p[2]; });
    st.mirror = 0; st.freeze = false; st.tempoMul = 1; st.text = null; toast('efectos en cero');
  }];
  // Textos en pantalla: un toque lo muestra, otro toque lo saca. Line up oficial con horarios.
  var TEXTS = [
    ['txtCoco', 'COCO', '18:00 — 19:30', 18], ['txtGremora', 'GREMORA B2B SANDMAN', '19:30 — 21:00', 19.5], ['txtOda', 'ODA', '21:00 — 22:30', 21],
    ['txtEvo', 'EVO + DAMIAN', '22:30 — 00:00', 22.5], ['txtLucila', 'LUCILA', '00:00 — 01:30', 24], ['txtRuf', 'RUF', '01:30 — 03:00', 25.5],
    ['txtSun', 'THE SUN', '', null], ['txtSolar', 'FOR THE SOLAR PEOPLE', '', null]
  ];
  function showText(tx) { st.text = st.text === tx[1] ? null : tx[1]; st.textSub = tx[2]; st.textAt = now(); }
  TEXTS.forEach(function (tx) { ACTIONS[tx[0]] = ['texto: ' + tx[1].toLowerCase(), function () { showText(tx); }]; });
  // Line up automático: según la hora, muestra quién está tocando 4 compases cada 32
  function currentSet() {
    var d = new Date(), h = d.getHours() + d.getMinutes() / 60; if (h < 12) h += 24;
    var cur = null; TEXTS.forEach(function (tx) { if (tx[3] !== null && h >= tx[3]) cur = tx; });
    return cur;
  }
  ACTIONS.lineupAuto = ['line up automático (por hora)', function () { st.lineupAuto = !st.lineupAuto; toast(st.lineupAuto ? 'line up automático: sí' : 'line up automático: no'); }];
  ACTIONS.txtOff = ['texto: sacar', function () { st.text = null; }];
  ACTIONS.bpmKnob = ['BPM fino (encoder)', function () {}];
  var SHIFT_KEYS = { Digit1: 'txtCoco', Digit2: 'txtGremora', Digit3: 'txtOda', Digit4: 'txtEvo', Digit5: 'txtLucila', Digit6: 'txtRuf', Digit7: 'txtSun', Digit8: 'txtSolar', Digit0: 'txtOff' };
  var KEYS = { '6': 'scene6', n: 'next', p: 'prev', e: 'mirror', c: 'freeze', '-': 'txtOff', t: 'lineupAuto', r: 'resetFx', q: 'quality', '1': 'scene1', '2': 'scene2', '3': 'scene3', '4': 'scene4', '5': 'scene5', ' ': 'tap', s: 'sync', f: 'flash', b: 'blackout', l: 'logoToggle', d: 'drop', a: 'auto', ArrowUp: 'bpmUp', ArrowDown: 'bpmDown' };
  addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (e.shiftKey && SHIFT_KEYS[e.code]) { e.preventDefault(); if (!e.repeat) ACTIONS[SHIFT_KEYS[e.code]][1](); return; }
    if (k === 'x') { if (!e.repeat) ACTIONS.strobeHold[1](); return; }
    if (KEYS[k]) { e.preventDefault(); if (!e.repeat || KEYS[k] === 'bpmUp' || KEYS[k] === 'bpmDown') ACTIONS[KEYS[k]][1](); return; }
    if (k === 'h') toggleUI();
    if (k === 'm') toggleMidi();
    if (k === 'Enter') fullscreen();
  });
  addEventListener('keyup', function (e) { if (e.key.toLowerCase() === 'x') ACTIONS.strobeHold[2](); });
  addEventListener('dblclick', function (e) { if (!e.target.closest('.panel')) fullscreen(); });
  function fullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen(); }
  // Controles en pantalla: se esconden solos a los 3 s sin mover el mouse (salvo que el mouse esté encima)
  var idleT, overUI = false;
  function wake() {
    document.body.classList.remove('idle'); clearTimeout(idleT);
    idleT = setTimeout(function () { if (!overUI) document.body.classList.add('idle'); }, 3000);
  }
  ['mousemove', 'mousedown', 'touchstart'].forEach(function (ev) { addEventListener(ev, wake, { passive: true }); });
  function toggleUI() { document.body.classList.toggle('ui-off'); if (!document.body.classList.contains('ui-off')) wake(); }

  // ---------- MIDI ----------
  // Mapeo de fábrica pensado para el Xone:K2 (capa 1): faders = CC 16–19, fila de perillas de arriba = CC 4–7. Cualquier canal.
  var DEFAULT_MAP = {
    master: { type: 'cc', num: 16 }, pulse: { type: 'cc', num: 17 }, glow: { type: 'cc', num: 18 }, logo: { type: 'cc', num: 19 },
    speed: { type: 'cc', num: 4 }, grain: { type: 'cc', num: 5 }, shadow: { type: 'cc', num: 6 }, fade: { type: 'cc', num: 7 },
    zoom: { type: 'cc', num: 8 }, temp: { type: 'cc', num: 9 }, trail: { type: 'cc', num: 10 }, punch: { type: 'cc', num: 11 },
    rings: { type: 'cc', num: 12 }, crowd: { type: 'cc', num: 13 }, glitch: { type: 'cc', num: 14 }, strobe: { type: 'cc', num: 15 },
    rotate: { type: 'cc', num: 0, rel: true }, bpmKnob: { type: 'cc', num: 1, rel: true }, corona: { type: 'cc', num: 2, rel: true }
  };
  var STORE = 'solaris-midi-v1', map = load();
  function load() { try { var m = JSON.parse(localStorage.getItem(STORE)); if (m && typeof m === 'object') return m; } catch (e) {} return JSON.parse(JSON.stringify(DEFAULT_MAP)); }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(map)); } catch (e) {} }
  var midi = null, learning = null, queue = [], ccState = {}, midiLabel = 'MIDI: sin conectar';
  function matches(b, type, ch, num) { return b && b.type === type && b.num === num && (b.ch === undefined || b.ch === null || b.ch === ch); }
  function onMidi(ev) {
    var d = ev.data, s = d[0];
    if (s === 0xF8) { clockTick(); return; }
    if (s === 0xFA || s === 0xFB) { st.beat0 = now(); st.clock = []; return; }
    if (s >= 0xF0) return;
    var type = s & 0xF0, ch = s & 0x0F, num = d[1], val = d[2];
    var kind = type === 0xB0 ? 'cc' : (type === 0x90 && val > 0) ? 'note' : (type === 0x80 || type === 0x90) ? 'off' : null;
    if (!kind) return;
    if (learning) {
      if (kind === 'off') return;
      Object.keys(map).forEach(function (k) { if (matches(map[k], kind, ch, num)) delete map[k]; });   // un control, una función
      var wasRel = map[learning] && map[learning].rel;
      map[learning] = { type: kind, ch: ch, num: num }; if (kind === 'cc' && (wasRel || learning === 'bpmKnob')) map[learning].rel = true; save();
      toast('asignado: ' + labelOf(learning) + ' → ' + bindLabel(map[learning]));
      if (queue.length) { queue.shift(); learning = queue[0] || null; if (!learning) toast('listo: botones asignados'); }
      else learning = null;
      renderMidi(); ledFeedback(); return;
    }
    Object.keys(map).forEach(function (k) {
      var bnd = map[k];
      if (kind === 'off') { if (matches(bnd, 'note', ch, num) && ACTIONS[k] && ACTIONS[k][2]) ACTIONS[k][2](); return; }
      if (!matches(bnd, kind, ch, num)) return;
      if (kind === 'cc' && bnd.rel) {   // encoder: 1 = un paso a la derecha, 127 = un paso a la izquierda
        var delta = val < 64 ? val : val - 128;
        if (k === 'bpmKnob') { st.bpm = Math.round(Math.max(60, Math.min(200, st.bpm + delta * 0.1)) * 10) / 10; toast('BPM ' + st.bpm.toFixed(1)); return; }
        if (P.hasOwnProperty(k)) { var v = P[k] + delta / 64; P[k] = WRAP[k] ? ((v % 1) + 1) % 1 : Math.max(0, Math.min(1, v)); }
        return;
      }
      if (P.hasOwnProperty(k)) { if (kind === 'cc') P[k] = val / 127; else P[k] = P[k] > 0.5 ? 0 : 1; }
      else if (ACTIONS[k]) {
        if (kind === 'note') ACTIONS[k][1]();
        else {
          var key = ch + ':' + num, was = ccState[key] || 0;
          if (val >= 64 && was < 64) ACTIONS[k][1]();
          if (val < 64 && was >= 64 && ACTIONS[k][2]) ACTIONS[k][2]();
          ccState[key] = val;
        }
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
  function initMidi() {
    if (midi) return;
    if (!navigator.requestMIDIAccess) { midiLabel = 'MIDI: este navegador no soporta (usá Chrome)'; document.getElementById('midi-status').textContent = 'Este navegador no tiene MIDI. Abrilo con Google Chrome.'; return; }
    navigator.requestMIDIAccess({ sysex: false }).then(function (m) {
      midi = m; connectInputs(); ledFeedback();
      m.onstatechange = function () { connectInputs(); ledFeedback(); };
    }).catch(function () { midiLabel = 'MIDI: permiso denegado'; document.getElementById('midi-status').textContent = 'Chrome no dio permiso para usar MIDI. Tocá el ícono a la izquierda de la dirección (arriba) y permití "Dispositivos MIDI". Después recargá la página.'; });
  }

  // Panel de mapeo
  var midiEl = document.getElementById('midi'), table = document.getElementById('midi-table');
  function labelOf(k) { var p = PARAMS.filter(function (x) { return x[0] === k; })[0]; return p ? p[1] : ACTIONS[k][0]; }
  function bindLabel(b) { return b ? (b.type === 'cc' ? 'CC ' : 'nota ') + b.num + (b.ch !== undefined && b.ch !== null ? ' · canal ' + (b.ch + 1) : '') + (b.rel ? ' · encoder' : '') : '—'; }
  function renderMidi() {
    document.getElementById('midi-seqinfo').textContent = queue.length ? 'asignando en orden: apretá el botón para «' + labelOf(queue[0]) + '» (' + (Object.keys(ACTIONS).length - 1 - queue.length + 1) + ' de ' + (Object.keys(ACTIONS).length - 1) + ')' : '';
    var rows = PARAMS.map(function (p) { return p[0]; }).concat(Object.keys(ACTIONS));
    table.innerHTML = rows.map(function (k) {
      return '<tr><td>' + labelOf(k) + '</td><td>' + bindLabel(map[k]) + '</td><td style="text-align:right">' +
        (map[k] && map[k].type === 'cc' ? '<button data-rel="' + k + '" title="perilla común o encoder sin fin">' + (map[k].rel ? 'encoder' : 'perilla') + '</button> ' : '') +
        '<button data-learn="' + k + '" class="' + (learning === k ? 'learning' : '') + '">' + (learning === k ? 'mové un control…' : 'aprender') + '</button> ' +
        (map[k] ? '<button data-clear="' + k + '">×</button>' : '') + '</td></tr>';
    }).join('');
  }
  table.addEventListener('click', function (e) {
    var l = e.target.getAttribute('data-learn'), c = e.target.getAttribute('data-clear');
    var rl = e.target.getAttribute('data-rel');
    if (l) { queue = []; learning = learning === l ? null : l; renderMidi(); }
    if (c) { delete map[c]; save(); renderMidi(); }
    if (rl && map[rl]) { map[rl].rel = !map[rl].rel; save(); renderMidi(); }
  });
  document.getElementById('midi-reset').addEventListener('click', function () { map = JSON.parse(JSON.stringify(DEFAULT_MAP)); save(); renderMidi(); toast('mapeo de fábrica'); });
  document.getElementById('midi-close').addEventListener('click', toggleMidi);
  document.getElementById('midi-seq').addEventListener('click', function () {   // asignar todos los botones seguidos
    queue = Object.keys(ACTIONS).filter(function (k) { return k !== 'bpmKnob'; });
    learning = queue[0]; renderMidi(); toast('apretá los botones del K2 en orden · "saltear" pasa al siguiente');
  });
  document.getElementById('midi-skip').addEventListener('click', function () { if (!queue.length) return; queue.shift(); learning = queue[0] || null; renderMidi(); });
  document.getElementById('midi-export').addEventListener('click', function () {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(map, null, 1)], { type: 'application/json' }));
    a.download = 'solaris-mapeo-midi.json'; document.body.appendChild(a); a.click(); a.remove();
  });
  document.getElementById('midi-import').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    f.text().then(function (txt) { var m = JSON.parse(txt); if (m && typeof m === 'object') { map = m; save(); renderMidi(); ledFeedback(); toast('mapeo cargado'); } }).catch(function () { toast('ese archivo no es un mapeo'); });
    e.target.value = '';
  });
  function toggleMidi() { initMidi(); learning = null; queue = []; midiEl.classList.toggle('hidden'); renderMidi(); }

  // ---------- barra de controles ----------
  var bar = document.getElementById('bar'), bpmIn = document.getElementById('bpm'), ajustes = document.getElementById('ajustes'), helpEl = document.getElementById('help');
  bar.addEventListener('mouseenter', function () { overUI = true; }); bar.addEventListener('mouseleave', function () { overUI = false; wake(); });
  ajustes.addEventListener('mouseenter', function () { overUI = true; }); ajustes.addEventListener('mouseleave', function () { overUI = false; wake(); });
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]'), k = b && b.getAttribute('data-action');
    if (k && ACTIONS[k] && !ACTIONS[k][2]) { ACTIONS[k][1](); b.blur(); }
  });
  bar.addEventListener('pointerdown', function (e) { var b = e.target.closest('[data-action]'), k = b && b.getAttribute('data-action'); if (k && ACTIONS[k] && ACTIONS[k][2]) ACTIONS[k][1](); });
  addEventListener('pointerup', function () { ACTIONS.strobeHold[2](); });
  bpmIn.addEventListener('change', function () { var v = parseFloat(bpmIn.value); if (v >= 60 && v <= 200) { st.bpm = Math.round(v * 10) / 10; toast('BPM ' + st.bpm.toFixed(1)); } bpmIn.blur(); });
  bpmIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') bpmIn.blur(); });
  document.getElementById('b-midi').addEventListener('click', toggleMidi);
  document.getElementById('b-full').addEventListener('click', fullscreen);
  document.getElementById('b-help').addEventListener('click', function () { helpEl.classList.toggle('hidden'); });
  document.getElementById('help-close').addEventListener('click', function () { helpEl.classList.add('hidden'); });
  document.getElementById('b-hide').addEventListener('click', function () { toggleUI(); toast('controles escondidos · H para volver'); });
  document.getElementById('b-ajustes').addEventListener('click', function () { ajustes.classList.toggle('hidden'); });
  ajustes.innerHTML = '<h2 style="font:400 20px \'Major Mono Display\',monospace;margin:0 0 6px">ajustes</h2>' + PARAMS.map(function (p) {
    return '<label>' + p[1] + '<input type="range" min="0" max="100" data-param="' + p[0] + '"></label>';
  }).join('') + '<p style="font-size:11px;color:rgba(239,226,214,.55);margin:8px 0 0">También se mueven con los faders y perillas del K2.</p>';
  ajustes.addEventListener('input', function (e) { var k = e.target.getAttribute('data-param'); if (k) P[k] = e.target.value / 100; });
  var dotEls = document.querySelectorAll('#dots i'), uiTick = 0;
  function hud(B) {
    if (++uiTick % 3) return;
    var beat = ((B.n % 4) + 4) % 4;
    for (var i = 0; i < 4; i++) dotEls[i].className = i === beat ? 'on' : '';
    if (document.activeElement !== bpmIn) bpmIn.value = st.bpm.toFixed(1);
    document.getElementById('clock').textContent = now() - st.clockAt < 1 ? 'MIDI clock' : '';
    var on = { scene1: st.scene === 0, scene2: st.scene === 1, scene3: st.scene === 2, scene4: st.scene === 3, scene5: st.scene === 4, blackout: st.blackout, logoToggle: st.logoOn, auto: st.auto, quality: !!st.lowres,
      mirror: st.mirror > 0, freeze: st.freeze, half: st.tempoMul === 0.5, double: st.tempoMul === 2, strobeHold: st.strobeHold };
    TEXTS.forEach(function (tx) { on[tx[0]] = st.text === tx[1]; });
    on.lineupAuto = !!st.lineupAuto; on.scene6 = st.scene === 5;
    bar.querySelectorAll('[data-action]').forEach(function (b) { b.classList.toggle('on', !!on[b.getAttribute('data-action')]); });
    document.getElementById('midi-dot').classList.toggle('ok', /XONE|K2|MIDI:\s\S/i.test(midiLabel) && !/sin |denegado|no soporta/.test(midiLabel));
    document.getElementById('b-midi').title = midiLabel;
    ajustes.querySelectorAll('input[data-param]').forEach(function (r) { if (document.activeElement !== r) r.value = Math.round(P[r.getAttribute('data-param')] * 100); });
  }

  // ---------- arranque ----------
  var wakeLock = null;
  function keepAwake() { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wakeLock = w; }).catch(function () {}); }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') keepAwake(); });
  var resizeT;
  addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(build, 300); });
  var fonts = ['40px "Major Mono Display"', '700 20px "Space Mono"', '400 20px "Space Mono"'];
  Promise.all(fonts.map(function (f) { return document.fonts.load(f); })).catch(function () {}).then(function () {
    build();
    window.SOLARIS = { setScene: setScene, P: P, st: st, drop: drop, midi: function (d) { onMidi({ data: d }); }, map: function () { return map; } };   // para probar desde la consola
    requestAnimationFrame(frame);
    var startEl = document.getElementById('start'), full = document.getElementById('go-full'), win = document.getElementById('go-window');
    document.getElementById('start-msg').textContent = 'listo.';
    full.disabled = win.disabled = false;
    function begin(fs) {
      startEl.classList.add('hidden'); bar.classList.remove('hidden');
      if (fs) document.documentElement.requestFullscreen().catch(function () {});
      initMidi(); keepAwake(); wake();
      toast('mové el mouse para ver los controles · H los esconde');
    }
    full.addEventListener('click', function () { begin(true); });
    win.addEventListener('click', function () { begin(false); });
  });
})();
