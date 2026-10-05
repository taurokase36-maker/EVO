(function () {
  'use strict';

  // Las secciones de más abajo aparecen en fade al llegar a ellas
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('main > section, main .tier, main .pillar, .guest, .intl').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('reveal'); io.observe(el); }
    });
  }

  // Música: arranca con el primer toque (los navegadores no dejan que suene sola); el sol la silencia.
  var audio = document.getElementById('bg-music'), btn = document.getElementById('sound');
  if (audio && btn) {
    var target = Math.min(1, Math.max(0, Number(audio.getAttribute('data-volume')) || 0.6));
    var muted = false, fadeT = null;
    try { muted = sessionStorage.getItem('su_mute') === '1'; } catch (e) {}
    var show = function (on) {
      btn.classList.toggle('is-on', on); btn.classList.toggle('is-off', !on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'silenciar música' : 'activar música');
    };
    var fadeTo = function (v, done) {
      clearInterval(fadeT);
      fadeT = setInterval(function () {
        var d = v - audio.volume;
        if (Math.abs(d) < 0.03) { audio.volume = v; clearInterval(fadeT); if (done) done(); return; }
        audio.volume = Math.min(1, Math.max(0, audio.volume + d * 0.12));
      }, 60);
    };
    var play = function () {
      audio.volume = 0;
      var p = audio.play();
      if (p && p.then) p.then(function () { show(true); fadeTo(target); }).catch(function () { show(false); });
      else { show(true); fadeTo(target); }
    };
    var stop = function () { show(false); fadeTo(0, function () { audio.pause(); }); };
    var first = function (ev) {
      off();
      if (muted || btn.contains(ev.target)) return;   // el botón se maneja aparte
      play();
    };
    var off = function () { ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.removeEventListener(t, first, true); }); };
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.addEventListener(t, first, true); });
    btn.addEventListener('click', function () {
      off();
      muted = !audio.paused && btn.classList.contains('is-on');
      try { sessionStorage.setItem('su_mute', muted ? '1' : '0'); } catch (e) {}
      if (muted) stop(); else play();
    });
  }

  // Cuenta regresiva
  var cd = document.querySelector('.countdown');
  if (cd) {
    var start = new Date(cd.getAttribute('data-start')).getTime();
    var tick = function () {
      var s = Math.floor((start - Date.now()) / 1000);
      if (isNaN(s)) return;
      if (s <= 0) { cd.textContent = 'ya empezó. te esperamos abajo.'; return; }
      var parts = [[Math.floor(s / 86400), 'días'], [Math.floor(s % 86400 / 3600), 'horas'], [Math.floor(s % 3600 / 60), 'min']];
      cd.innerHTML = parts.map(function (p) { return '<div><b>' + p[0] + '</b><span>' + p[1] + '</span></div>'; }).join('');
    };
    tick();
    setInterval(tick, 30000);
  }

  // Total al cambiar la cantidad
  var fmt = function (n) { return '$' + Math.round(n).toLocaleString('es-AR'); };
  document.querySelectorAll('select[data-price]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var sub = Number(sel.value) * Number(sel.getAttribute('data-price'));
      var fee = Math.round(sub * Number(sel.getAttribute('data-fee') || 0) / 100);
      var out = sel.closest('form').querySelector('[data-total]');
      if (out) out.textContent = fmt(sub + fee);
    });
  });

  // Evita doble envío de formularios
  document.querySelectorAll('form.buy').forEach(function (f) {
    f.addEventListener('submit', function () {
      var b = f.querySelector('button[type=submit], button:not([type])');
      if (b) { b.disabled = true; b.textContent = 'un segundo…'; }
    });
  });

  // QR de la entrada
  var qrBox = document.querySelector('[data-qr]');
  if (qrBox && window.qrcode) {
    var qr = qrcode(0, 'M');
    qr.addData(qrBox.getAttribute('data-qr'));
    qr.make();
    qrBox.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  }

  // Copiar links de invitación (panel)
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var txt = el.getAttribute('data-copy');
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { el.textContent = 'copiado ✓'; });
    });
  });
})();
