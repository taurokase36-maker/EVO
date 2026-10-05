// Exporta ../EVO_Press_Kit_2026.pdf rápido de abrir:
// 1) captura cada página SIN texto como JPG (todos los efectos aplanados)
// 2) imprime un PDF SOLO con el texto y los links (vectorial)
// 3) merge.py los superpone página por página
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
(async () => {
  const exe = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  await page.evaluate(() => document.body.classList.add('mode-bg'));
  const secs = await page.$$('section.page');
  for (let i = 0; i < secs.length; i++) {
    await secs[i].screenshot({ path: path.join(__dirname, 'out', `bg${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 80 });
  }
  await page.evaluate(() => { document.body.classList.remove('mode-bg'); document.body.classList.add('mode-text'); document.documentElement.style.background = 'transparent'; });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(__dirname, 'out', 'text.pdf'), width: '1440px', height: '810px', printBackground: true });
  await browser.close();
  console.log('capturas:', secs.length);
})();
