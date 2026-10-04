// Exporta todas las piezas de piezas.html a PNG en contenido/semana/.
// Uso: node render.js [id-de-pieza]   (sin id, exporta todas)
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const base = 'file://' + path.join(__dirname, 'piezas.html');
  await page.goto(base + '?export=1&p=none');
  const ids = process.argv[2] ? [process.argv[2]] : await page.evaluate(() => window.PIEZAS);
  fs.mkdirSync(path.join(__dirname, 'semana'), { recursive: true });
  for (const id of ids) {
    const errs = [];
    page.removeAllListeners('pageerror'); page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(base + '?export=1&p=' + id);
    await page.waitForFunction(() => window.DONE === true, null, { timeout: 120000 });
    const data = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
    fs.writeFileSync(path.join(__dirname, 'semana', id + '.png'), Buffer.from(data.split(',')[1], 'base64'));
    console.log(id, errs.length ? errs : 'ok');
  }
  await browser.close();
})();
