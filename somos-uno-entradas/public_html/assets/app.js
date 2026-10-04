(function () {
  'use strict';

  // Cuenta regresiva
  var cd = document.querySelector('.countdown');
  if (cd) {
    var start = new Date(cd.getAttribute('data-start')).getTime();
    var tick = function () {
      var s = Math.floor((start - Date.now()) / 1000);
      if (isNaN(s)) return;
      if (s <= 0) { cd.textContent = 'ya empezó. ¿qué hacés acá?'; return; }
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
