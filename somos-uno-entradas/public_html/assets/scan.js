(function () {
  'use strict';

  var root = document.querySelector('.scan');
  var csrf = root.getAttribute('data-csrf');
  var video = document.getElementById('video');
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  var startBtn = document.getElementById('start');
  var result = document.getElementById('result');
  var matches = document.getElementById('matches');
  var paused = false;
  var lastKey = '';

  function api(body) {
    return fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF': csrf },
      body: JSON.stringify(body),
      credentials: 'same-origin'
    }).then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'Sin conexión. Probá de nuevo.' }; });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function beep(ok) {
    if (navigator.vibrate) navigator.vibrate(ok ? 80 : [60, 60, 60]);
  }

  function show(state, title, entry, extra) {
    result.hidden = false;
    result.className = 'result ' + state;
    var labels = { good: 'puede pasar', bad: 'no puede pasar', warn: 'revisar' };
    var html = '<p class="status">' + labels[state] + '</p><h2>' + esc(title) + '</h2>';
    if (entry) {
      html += '<p>' + esc(entry.kind) + ' · ' + esc(entry.code) + '</p>';
      html += '<p>ingresaron ' + entry.used + ' de ' + entry.total + '</p>';
      if (entry.warning) html += '<p><b>' + esc(entry.warning) + '</b></p>';
    }
    html += extra || '';
    html += '<div class="row"><button class="btn btn-ghost" data-act="next">siguiente</button></div>';
    result.innerHTML = html;
  }

  function lookup(key) {
    paused = true;
    api({ action: 'lookup', key: key }).then(function (r) {
      if (!r.ok) { beep(false); show('bad', r.error || 'No válida'); return; }
      var en = r.entry;
      var left = en.total - en.used;
      if (!en.valid || left <= 0) {
        beep(false);
        show('bad', en.name, en, left <= 0 && en.valid ? '<p><b>Ya ingresó.</b></p>' : '');
        return;
      }
      var opts = '';
      for (var i = 1; i <= left; i++) opts += '<option value="' + i + '">' + i + '</option>';
      var extra = '<div class="row"><select id="n">' + opts + '</select>' +
        '<button class="btn btn-solid" data-act="in" data-key="' + esc(en.token) + '">dar ingreso</button></div>';
      beep(true);
      show(en.warning ? 'warn' : 'good', en.name, en, extra);
    });
  }

  result.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.getAttribute('data-act') === 'next') {
      result.hidden = true; paused = false; lastKey = '';
    }
    if (b.getAttribute('data-act') === 'in') {
      b.disabled = true;
      var n = Number((document.getElementById('n') || {}).value || 1);
      api({ action: 'checkin', key: b.getAttribute('data-key'), n: n }).then(function (r) {
        if (r.ok) { beep(true); show('good', '✓ ' + r.entry.name, r.entry); }
        else { beep(false); show('bad', r.error, r.entry); }
      });
    }
  });

  function scan() {
    if (video.readyState === video.HAVE_ENOUGH_DATA && !paused) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data && code.data !== lastKey) {
        lastKey = code.data;
        lookup(code.data);
      }
    }
    requestAnimationFrame(scan);
  }

  startBtn.addEventListener('click', function () {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
        startBtn.hidden = true;
        requestAnimationFrame(scan);
      })
      .catch(function () {
        startBtn.textContent = 'sin acceso a la cámara: usá la búsqueda';
      });
  });

  document.getElementById('manual').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var q = document.getElementById('manual-q').value.trim();
    if (!q) return;
    if (/^(SU|LI|IN)-/i.test(q)) { matches.innerHTML = ''; lookup(q); return; }
    api({ action: 'search', q: q }).then(function (r) {
      if (!r.ok || !r.results.length) { matches.innerHTML = '<p class="muted">Sin resultados.</p>'; return; }
      matches.innerHTML = r.results.map(function (en) {
        return '<div class="match"><div>' + esc(en.name) + '<small>' + esc(en.kind) + ' · ' + esc(en.code) + ' · ' + en.used + '/' + en.total + '</small></div>' +
          '<button class="btn btn-ghost" data-key="' + esc(en.token) + '">ver</button></div>';
      }).join('');
    });
  });

  matches.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-key]');
    if (b) { lookup(b.getAttribute('data-key')); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
})();
