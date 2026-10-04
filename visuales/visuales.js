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
    { name: 'la caverna', draw: sceneCaverna },
    { name: 'solaris', draw: sceneLogo },
    { name: 'el gigante', draw: sceneGrabado },
    { name: 'polvo solar', draw: scenePolvo }
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
    TX.half = document.createElement('canvas'); TX.half.width = Math.round(W / 2); TX.half.height = Math.round(H / 2);
    TX.dust = document.createElement('canvas'); TX.dust.width = Math.round(W / 2); TX.dust.height = Math.round(H / 2);
    TX.dust.getContext('2d').fillStyle = C.bg; TX.dust.getContext('2d').fillRect(0, 0, TX.dust.width, TX.dust.height); DUST = null;
    var stp = document.createElement('canvas'); stp.width = stp.height = 256;   // grano: puntitos blancos con transparencia al azar
    var sx2 = stp.getContext('2d'), si = sx2.createImageData(256, 256), sr = M.rng(31);
    for (var j = 0; j < si.data.length; j += 4) { si.data[j] = si.data[j + 1] = si.data[j + 2] = 255; si.data[j + 3] = Math.pow(sr(), 1.6) * 255; }
    sx2.putImageData(si, 0, 0); TX.stipple = stp;
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
  var MELT = new Image(); if (window.MELT_LOGO) MELT.src = window.MELT_LOGO;
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
  // Movimiento fluido y sutil: una pose cada 2 beats con transición continua, y encima un balanceo suave.
  function poseAt(b, seq, delay, force) {
    var db = b - (delay || 0), bb = db / 2, n = Math.floor(bb), ph = bb - n;
    var list = CHOREO[((seq % CHOREO.length) + CHOREO.length) % CHOREO.length];
    var A = POSES[force || list[((n - 1) % 8 + 8) % 8]], Bp = POSES[force || list[(n % 8 + 8) % 8]];
    var e = ph * ph * (3 - 2 * ph);
    var out = { ph: ph };
    POSE_KEYS.forEach(function (k) { out[k] = A[k] + (Bp[k] - A[k]) * e; });
    var w = db * Math.PI, sp = 0.6 + P.speed * 0.8;
    out.la += 0.22 * sp * Math.sin(w + seq); out.ra += 0.22 * sp * Math.sin(w + seq + 1.7);
    out.le += 0.16 * sp * Math.sin(w * 0.5 + seq * 2); out.re += 0.16 * sp * Math.sin(w * 0.5 + seq * 2 + 1);
    out.lean += 0.06 * sp * Math.sin(w * 0.5 + seq); out.kn = Math.max(0, out.kn + 0.08 * Math.sin(w));
    out.jump *= 0.45;
    return out;
  }
  // Dibuja un personaje. (x, feet) = pies, h = altura. Usa el strokeStyle/fillStyle que ya tenga c.
  function figure(c, x, feet, h, p, k) {
    var jump = p.jump * Math.sin(Math.min(1, p.ph) * Math.PI) * h * 0.2;
    var bounce = (k || 0) * h * 0.018 + p.kn * h * 0.12;
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
  //  3 · LA CAVERNA: un cubo de grano que gira y respira; en su pared del fondo baila la sombra del personaje
  // =====================================================================
  var CUBE_V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  var CUBE_F = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]];
  var CUBE_E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  function sceneCaverna(c, t, B) {
    bg(c);
    var hl = TX.half, h = hl.getContext('2d'), hw = hl.width, hh = hl.height, q = hw / W;
    h.globalCompositeOperation = 'source-over'; h.globalAlpha = 1; h.clearRect(0, 0, hw, hh);
    var spd = 0.3 + P.speed * 1.2, boom = st.dropAt ? Math.exp(-(t - st.dropAt) * 0.9) : 0;
    var ax = 0.45 * Math.sin(t * 0.11 * spd) + 0.35, ay = t * 0.17 * spd + (P.rotate - 0.5) * Math.PI * 2, az = 0.12 * Math.sin(t * 0.07);
    var size = S * 0.25 * (0.8 + P.corona * 0.4) * (1 + 0.03 * B.k), f = 4.2;
    var L = [-0.55, -0.6, -0.58];   // la luz (el sol) viene de arriba a la izquierda, adelante
    var V = CUBE_V.map(function (v, i) {   // el cubo respira: cada vértice se mueve un poco, como el de la referencia
      var m = 1 + 0.07 * Math.sin(t * 0.8 + i * 1.7) + 0.05 * B.k;
      var x = v[0] * m, y = v[1] * m, z = v[2] * m;
      var cy = Math.cos(ay), sy = Math.sin(ay), x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      var cx = Math.cos(ax), sx = Math.sin(ax), y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      var cz = Math.cos(az), sz = Math.sin(az), x2 = x1 * cz - y1 * sz, y2 = x1 * sz + y1 * cz;
      return [x2, y2, z2];
    });
    function proj(p, off) { var z = p[2] + (off ? off[2] : 0), k = f / (f + z); return [CX + (p[0] + (off ? off[0] : 0)) * size * k, CY + (p[1] + (off ? off[1] : 0)) * size * k, z]; }
    var faces = CUBE_F.map(function (fc) {
      var a = V[fc[0]], b = V[fc[1]], d = V[fc[3]];
      var u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
      var n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], nl = Math.hypot(n[0], n[1], n[2]) || 1;
      n = [n[0] / nl, n[1] / nl, n[2] / nl];
      var z = fc.reduce(function (acc, i) { return acc + V[i][2]; }, 0) / 4;
      var off = [n[0] * boom * 0.7, n[1] * boom * 0.7, n[2] * boom * 0.7];   // drop: las caras se abren
      return { fc: fc, n: n, z: z, lit: Math.max(0, -(n[0] * L[0] + n[1] * L[1] + n[2] * L[2])), off: off };
    }).sort(function (a, b) { return b.z - a.z; });   // de atrás hacia adelante
    // caras: degradé de luz, se acumulan como si fueran translúcidas
    faces.forEach(function (F, idx) {
      var P2 = F.fc.map(function (i) { var p = proj(V[i], F.off); return [p[0] * q, p[1] * q]; });
      var bright = (0.3 + 0.7 * F.lit) * (0.6 + 0.4 * P.glow) * (1 + boom);
      var gr = h.createLinearGradient(P2[0][0], P2[0][1], P2[2][0], P2[2][1]);
      gr.addColorStop(0, rgba(C.cream, Math.min(1, bright))); gr.addColorStop(0.5, rgba(C.cream, bright * 0.45)); gr.addColorStop(1, rgba(C.fire, bright * 0.2));
      h.globalCompositeOperation = idx === 0 ? 'source-over' : 'lighter'; h.globalAlpha = idx === 0 ? 1 : 0.6;
      h.fillStyle = gr; h.beginPath(); P2.forEach(function (p, i) { i ? h.lineTo(p[0], p[1]) : h.moveTo(p[0], p[1]); }); h.closePath(); h.fill();
      if (idx === 0) F.P2 = P2;
    });
    // las sombras de los personajes en la pared del fondo (se ven a través de las caras). Cantidad: perilla "cantidad de personajes"
    var back = faces[0].P2, ns = 1 + Math.floor(P.crowd * 5.99);
    h.save(); h.globalCompositeOperation = 'destination-out'; h.globalAlpha = 0.6;
    var o = back[0], ex = [back[1][0] - o[0], back[1][1] - o[1]], ey = [back[3][0] - o[0], back[3][1] - o[1]];
    h.transform(ex[0], ex[1], ey[0], ey[1], o[0], o[1]);
    h.strokeStyle = h.fillStyle = '#000';
    for (var si = 0; si < ns; si++) {
      var fx = ns === 1 ? 0.5 : 0.14 + 0.72 * si / (ns - 1), fh = ns === 1 ? 0.82 : 0.78 - 0.12 * (si % 2) - Math.min(0.2, ns * 0.03);
      figure(h, fx, 0.95, fh, poseAt(B.b, Math.floor(B.b / 8) + 2 + si, si * 0.15), B.k);
    }
    h.restore();
    h.globalAlpha = 1;
    // grano: la imagen se arma con puntitos que titilan
    h.globalCompositeOperation = 'destination-in';
    var ox = Math.floor(Math.random() * 256), oy = Math.floor(Math.random() * 256);
    h.save(); h.translate(-ox, -oy); h.fillStyle = h.createPattern(TX.stipple, 'repeat'); h.fillRect(ox, oy, hw, hh); h.restore();
    h.globalCompositeOperation = 'source-over';
    c.save(); c.imageSmoothingEnabled = false; c.globalCompositeOperation = 'lighter'; c.drawImage(hl, 0, 0, W, H); c.globalAlpha = 0.5; c.drawImage(hl, 0, 0, W, H); c.restore();
    // aristas finas y luminosas
    c.save(); c.lineCap = 'round'; c.globalCompositeOperation = 'lighter';
    CUBE_E.forEach(function (e) {
      var a = proj(V[e[0]]), b = proj(V[e[1]]), front = (a[2] + b[2]) / 2 < 0;
      c.strokeStyle = rgba(C.cream, (front ? 0.55 : 0.18) * (0.7 + 0.3 * B.k + boom)); c.lineWidth = (front ? 1.6 : 1) * S / 1080;
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
    });
    // la fuga de luz: un pequeño sol eclipsado en la esquina más iluminada
    // la luz se desliza entre las esquinas: promedio pesado por cuánto mira cada esquina al sol, suavizado en el tiempo
    var sw = 0, tx = 0, ty = 0;
    V.forEach(function (v) { var d = -(v[0] * L[0] + v[1] * L[1] + v[2] * L[2]), wgt = Math.exp(d * 2.2), pp = proj(v); sw += wgt; tx += pp[0] * wgt; ty += pp[1] * wgt; });
    tx /= sw; ty /= sw;
    if (!st.leak || st.leakW !== W) { st.leak = [tx, ty]; st.leakW = W; }
    st.leak[0] += (tx - st.leak[0]) * 0.06; st.leak[1] += (ty - st.leak[1]) * 0.06;
    var lp = st.leak, lr = S * 0.2 * (1 + 0.25 * B.k + boom);
    var lg = c.createRadialGradient(lp[0], lp[1], 0, lp[0], lp[1], lr * 2.2);
    lg.addColorStop(0, rgba(C.cream, 0.7)); lg.addColorStop(0.15, rgba(C.fire, 0.6 * P.glow)); lg.addColorStop(0.45, rgba(C.accent, 0.3 * P.glow)); lg.addColorStop(1, rgba(C.glow, 0));
    c.fillStyle = lg; c.fillRect(lp[0] - lr * 2.2, lp[1] - lr * 2.2, lr * 4.4, lr * 4.4);
    c.restore();
    c.save(); c.fillStyle = C.bg; c.beginPath(); c.arc(lp[0], lp[1], lr * 0.18, 0, Math.PI * 2); c.fill();
    c.strokeStyle = rgba(C.cream, 0.9); c.lineWidth = 1.5 * S / 1080; c.shadowColor = C.accent; c.shadowBlur = 14; c.stroke(); c.restore();
  }
  function drop() {   // la caverna se abre y se ilumina
    if (st.scene !== 2) setScene(2, true);
    st.dropAt = now(); st.flash = Math.max(st.flash, 0.5); toast('drop · la caverna se abre');
  }

  // =====================================================================
  //  4 · SOLARIS: el logo, solo
  // =====================================================================
  function sceneLogo(c, t, B) {
    bg(c);
    ambient(c, CX, CY, (0.2 + 0.3 * B.k) * P.glow);
    huella(c, CX, CY, S * 0.55, t * 0.5, B, 0.12);
    var size = Math.min(W * 0.12, H * 0.22) * (1 + 0.02 * B.k), base = CY + size * 0.45;
    wordmark(c, CX, base, size, B.k, 1);
    slogan(c, CX, base + size * 0.5, Math.max(14, size * 0.14), 0.95);
    // abajo: Somos Uno × Melt Underground
    var ly = H * 0.875, ls = S * 0.065;
    if (MELT.complete && MELT.naturalWidth) {
      // los dos logos con el mismo peso visual (misma superficie aprox.) y el grupo centrado
      var sw = ls * 0.63, mh = ls * 0.4, mw = mh * MELT.naturalWidth / MELT.naturalHeight, gap = ls * 0.45, xw = ls * 0.2;
      var x0 = CX - (sw + gap + xw + gap + mw) / 2;
      somosUno(c, x0 + sw / 2, ly, ls, B.k * 0.4);
      c.save(); c.font = '400 ' + Math.round(ls * 0.28) + 'px ' + MONO; c.fillStyle = rgba(C.cream, 0.45); c.textAlign = 'center'; c.fillText('×', x0 + sw + gap + xw / 2, ly + ls * 0.09); c.restore();
      c.save(); c.globalAlpha = 0.8; c.drawImage(MELT, x0 + sw + gap + xw + gap, ly - mh / 2, mw, mh); c.restore();
    } else {
      somosUno(c, CX, ly, ls, B.k);
    }
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
  //  6 · POLVO SOLAR: fibras de partículas que fluyen y dibujan al personaje bailando
  // =====================================================================
  var DUST = null;
  function makeDust() {
    var r = M.rng(77), n = 3600, arr = new Float32Array(n * 6);   // x, y, hueso, t, desvío, fase
    for (var i = 0; i < n; i++) {
      var o = i * 6, g = (r() + r() + r() - 1.5) / 1.5;   // desvío con forma de campana: más denso en el centro del hueso
      arr[o] = r() * W * 0.5; arr[o + 1] = r() * H * 0.5; arr[o + 2] = Math.floor(r() * 10); arr[o + 3] = r(); arr[o + 4] = g; arr[o + 5] = r() * 6.283;
    }
    DUST = { n: n, a: arr };
  }
  // huesos del personaje (mismas proporciones que figure): [x1, y1, x2, y2, grosor]
  function skeleton(x, feet, h, p, k) {
    var jump = p.jump * Math.sin(Math.min(1, p.ph) * Math.PI) * h * 0.2, bounce = (k || 0) * h * 0.018 + p.kn * h * 0.12;
    var cs = Math.cos(p.lean), sn = Math.sin(p.lean);
    function T(px, py) { return [x + px * cs - py * sn, feet - jump + px * sn + py * cs]; }
    var hipY = -h * 0.47 + bounce, neckY = -h * 0.82 + bounce * 1.1, bones = [];
    var hip = T(0, hipY), neck = T(0, neckY);
    bones.push([hip, neck, h * 0.07]);
    var head = T(0, neckY - h * 0.09);
    bones.push([[head[0] - h * 0.02, head[1] - h * 0.04], [head[0] + h * 0.02, head[1] + h * 0.04], h * 0.075]);
    [-1, 1].forEach(function (sd) {
      var ta = p.lg + p.kn * 0.7, sa = p.lg - p.kn * 0.5;
      var kx = sd * Math.sin(ta) * h * 0.25, ky = hipY + Math.cos(ta) * h * 0.25, kn = T(kx, ky);
      bones.push([hip, kn, h * 0.04]); bones.push([kn, T(kx + sd * Math.sin(sa) * h * 0.24, ky + Math.cos(sa) * h * 0.24), h * 0.035]);
    });
    [[-1, p.la, p.le], [1, p.ra, p.re]].forEach(function (a) {
      var sd = a[0], sx = sd * h * 0.06, sy = neckY + h * 0.03, ex = sx + sd * Math.sin(a[1]) * h * 0.2, ey = sy + Math.cos(a[1]) * h * 0.2, fa = a[1] + a[2];
      var sh = T(sx, sy), el = T(ex, ey);
      bones.push([sh, el, h * 0.032]); bones.push([el, T(ex + sd * Math.sin(fa) * h * 0.19, ey + Math.cos(fa) * h * 0.19), h * 0.028]);
    });
    return bones;   // 10 huesos: torso, cabeza, 4 de piernas, 4 de brazos
  }
  function scenePolvo(c, t, B) {
    var dl = TX.dust, d = dl.getContext('2d'), hw = dl.width, hh = dl.height;
    if (!DUST) makeDust();
    // el cuadro anterior se desvanece despacio: así quedan las fibras
    d.globalCompositeOperation = 'source-over'; d.fillStyle = 'rgba(7,2,2,0.14)'; d.fillRect(0, 0, hw, hh);
    var spd = 0.3 + P.speed * 1.2, bones = skeleton(hw * 0.5, hh * 0.95, hh * 0.86, poseAt(B.b, Math.floor(B.b / 8) + 3, 0), B.k * 0.6);
    var count = Math.round(DUST.n * (0.35 + P.crowd * 0.65)), a = DUST.a;
    var paths = [new Path2D(), new Path2D(), new Path2D()], spread = 1 + 0.5 * B.k, flow = t * 0.35 * spd;
    for (var i = 0; i < count; i++) {
      var o = i * 6, x = a[o], y = a[o + 1], bone = bones[a[o + 2] | 0], tt = a[o + 3], dev = a[o + 4], ph = a[o + 5];
      tt += 0.0015 * spd; if (tt > 1) tt -= 1; a[o + 3] = tt;   // las fibras corren a lo largo de los brazos y piernas
      var p0 = bone[0], p1 = bone[1], bx = p1[0] - p0[0], by = p1[1] - p0[1], bl = Math.hypot(bx, by) || 1;
      var nx = -by / bl, ny = bx / bl, off = dev * bone[2] * 2.2 * spread;
      var tx = p0[0] + bx * tt + nx * off, ty = p0[1] + by * tt + ny * off;
      // campo de flujo suave (humo)
      tx += Math.sin(ty * 0.03 + flow + ph) * hh * 0.012 * (1 + Math.abs(dev) * 2);
      ty += Math.cos(tx * 0.03 - flow + ph) * hh * 0.012 * (1 + Math.abs(dev) * 2);
      var nx2 = x + (tx - x) * 0.09, ny2 = y + (ty - y) * 0.09;
      var bi = Math.abs(dev) < 0.25 ? 0 : Math.abs(dev) < 0.6 ? 1 : 2;
      paths[bi].moveTo(x, y); paths[bi].lineTo(nx2, ny2);
      a[o] = nx2; a[o + 1] = ny2;
    }
    d.globalCompositeOperation = 'lighter'; d.lineWidth = 1;
    d.strokeStyle = rgba(C.cream, 0.5); d.stroke(paths[0]);
    d.strokeStyle = rgba(C.fire, 0.4 * (0.5 + P.glow * 0.7)); d.stroke(paths[1]);
    d.strokeStyle = rgba(C.accent, 0.35 * (0.5 + P.glow * 0.7)); d.stroke(paths[2]);
    // un anillo de sol muy tenue detrás de la cabeza
    var hd = bones[1][0]; d.strokeStyle = rgba(C.accent, 0.08 + 0.1 * B.k); d.lineWidth = 2;
    d.beginPath(); d.arc(hd[0], hd[1] + hh * 0.04, hh * 0.13 * (1 + 0.06 * B.k), 0, Math.PI * 2); d.stroke();
    d.globalCompositeOperation = 'source-over';
    bg(c);
    c.save(); c.imageSmoothingQuality = 'high'; c.drawImage(dl, 0, 0, W, H); c.restore();
    // grano por encima, para que se sienta como polvo
    c.save(); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 0.35;
    var ox = Math.floor(Math.random() * 256), oy = Math.floor(Math.random() * 256);
    c.translate(-ox, -oy); c.fillStyle = c.createPattern(TX.stipple, 'repeat'); c.fillRect(ox, oy, W, H); c.restore();
    c.save(); c.globalCompositeOperation = 'destination-over'; c.fillStyle = C.bg; c.fillRect(0, 0, W, H); c.restore();
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
      c.restore();
    }
    if (st.guest) {   // invitado especial: arriba a la izquierda, aparte del line up
      var ga = Math.min(1, (t - st.guestAt) / 0.8), gs = Math.min(W * 0.045, H * 0.075), gx = W * 0.05, gy = H * 0.12;
      c.save(); c.globalAlpha = ga; c.textAlign = 'left';
      c.font = '700 ' + Math.round(gs * 0.3) + 'px ' + MONO; c.letterSpacing = gs * 0.12 + 'px'; c.fillStyle = C.accent; c.fillText('INVITADO ESPECIAL', gx, gy);
      c.font = gs + 'px ' + BRAND; c.letterSpacing = gs * 0.06 + 'px'; c.fillStyle = C.cream; c.shadowColor = C.accent; c.shadowBlur = 18 + 20 * B.k;
      c.fillText('damian santos', gx, gy + gs * 1.15);
      c.shadowBlur = 0; c.font = '400 ' + Math.round(gs * 0.32) + 'px ' + MONO; c.letterSpacing = gs * 0.08 + 'px'; c.fillStyle = rgba(C.cream, 0.7);
      c.fillText('SAXO EN VIVO', gx, gy + gs * 1.75);
      c.strokeStyle = rgba(C.accent, 0.6); c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx, gy + gs * 2.05); c.lineTo(gx + gs * 3, gy + gs * 2.05); c.stroke();
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
      if (slot === 0 && cs && st.text !== cs[1]) { st.text = cs[1]; st.textAt = t; st.autoText = true; if (cs[0] === 'txtEvo') { st.guest = true; st.guestAt = t; } }
      if (slot === 4 && st.autoText) { st.text = null; st.guest = false; st.autoText = false; }
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
    scene3: ['escena 3 · la caverna', function () { setScene(2); }],
    scene4: ['escena 4 · solaris', function () { setScene(3); }],
    scene5: ['escena 5 · el gigante', function () { setScene(4); }],
    scene6: ['escena 6 · polvo solar', function () { setScene(5); }],
    tap: ['tap tempo', tap],
    sync: ['sync (beat 1)', sync],
    flash: ['flash', function () { st.flash = 1; }],
    blackout: ['blackout', function () { st.blackout = !st.blackout; toast(st.blackout ? 'blackout' : 'luz'); }],
    logoToggle: ['logo encima (prende/apaga)', function () { st.logoOn = !st.logoOn; toast(st.logoOn ? 'logo: sí' : 'logo: no'); }],
    drop: ['drop (la caverna se abre)', drop],
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
    st.mirror = 0; st.freeze = false; st.tempoMul = 1; st.text = null; st.guest = false; toast('efectos en cero');
  }];
  // Textos en pantalla: un toque lo muestra, otro toque lo saca. Line up oficial con horarios.
  var TEXTS = [
    ['txtCoco', 'COCO', '18:00 — 19:30', 18], ['txtGremora', 'GREMORA B2B SANDMAN', '19:30 — 21:00', 19.5], ['txtOda', 'ODA', '21:00 — 22:30', 21],
    ['txtEvo', 'EVO THE SUN', '22:30 — 00:00', 22.5], ['txtLucila', 'LUCILA', '00:00 — 01:30', 24], ['txtRuf', 'RUF', '01:30 — 03:00', 25.5],
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
  ACTIONS.txtOff = ['texto: sacar', function () { st.text = null; st.guest = false; }];
  ACTIONS.txtDamian = ['invitado especial: damian santos', function () { st.guest = !st.guest; st.guestAt = now(); }];
  ACTIONS.bpmKnob = ['BPM fino (encoder)', function () {}];
  var SHIFT_KEYS = { Digit1: 'txtCoco', Digit2: 'txtGremora', Digit3: 'txtOda', Digit4: 'txtEvo', Digit5: 'txtLucila', Digit6: 'txtRuf', Digit7: 'txtSun', Digit8: 'txtSolar', Digit9: 'txtDamian', Digit0: 'txtOff' };
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
    on.lineupAuto = !!st.lineupAuto; on.scene6 = st.scene === 5; on.txtDamian = !!st.guest;
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
