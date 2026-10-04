// Exporta eclipse.html a MP4 1080x1920 cuadro por cuadro.
// Uso: node render.js [salida.mp4] [seed]
// Necesita Playwright (con Chromium) y ffmpeg instalados.
const path = require('path');
const { spawn, execSync } = require('child_process');
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

const FPS = 30;
const out = process.argv[2] || path.join(__dirname, 'the-sun-teaser.mp4');
const seed = process.argv[3] || 'the-sun';

(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'eclipse.html') + '?export=1&seed=' + encodeURIComponent(seed));
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let i = 0; i < frames; i++) {
    const data = await page.evaluate((t) => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png'); }, i / FPS);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`\r${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log(`\nlisto: ${out}`);
})();
