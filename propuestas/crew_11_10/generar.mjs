// Genera una propuesta en PDF por cada amigo de amigos.json.
// Uso: node propuestas/crew_11_10/generar.mjs
// Requiere Playwright (con Chromium). Los PDFs quedan en propuestas/crew_11_10/pdf/.

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { evento, paraTodos, roles } from './contenido.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright')));
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
const asset = (f) => pathToFileURL(join(aqui, 'assets', f)).href;

function rellenar(texto, a) {
  const inv = a.invitaciones;
  return esc(texto)
    .replaceAll('{nombre}', esc(a.nombre || 'tu nombre'))
    .replaceAll('{marca}', esc(a.marca || a.nombre || 'la productora'))
    .replaceAll('{inv}', `${inv}`)
    .replace(/(\d) invitaciones/, (m, n) => (n === '1' ? '1 invitación' : m));
}

const lista = (items, a, numerada) => items.map(([t, d], i) => `
  <li>${numerada ? `<span class="n">0${i + 1}</span>` : ''}
    <div><strong>${rellenar(t, a)}</strong><p>${rellenar(d, a)}</p></div></li>`).join('');

function destacado(r, a) {
  if (r.niveles) {
    return `<div class="destacado"><div class="label">${esc(r.destacadoTitulo)}</div>
      <div class="niveles">${r.niveles.map(([t, d]) => `<div><div class="nivel">${esc(t)}</div><p>${rellenar(d, a)}</p></div>`).join('')}</div></div>`;
  }
  if (r.ideas) {
    return `<div class="destacado"><div class="label">${esc(r.destacadoTitulo)}</div>
      <div class="niveles">${r.ideas.map(([t, d]) => `<div><div class="nivel serif">${esc(t)}</div><p>${rellenar(d, a)}</p></div>`).join('')}</div></div>`;
  }
  return `<div class="destacado"><div class="label">${esc(r.destacadoTitulo)}</div><p class="grande">${rellenar(r.destacado, a)}</p></div>`;
}

const fuente = (familia, archivo, estilo, peso) =>
  `@font-face { font-family:'${familia}'; src:url('${asset('fonts/' + archivo)}') format('woff2'); font-style:${estilo}; font-weight:${peso}; font-display:block; }`;
const fuentes = [
  fuente('DM Sans', 'DMSans.woff2', 'normal', '100 1000'),
  fuente('Instrument Serif', 'InstrumentSerif.woff2', 'normal', 400),
  fuente('Instrument Serif', 'InstrumentSerif-Italic.woff2', 'italic', 400),
  fuente('Space Mono', 'SpaceMono.woff2', 'normal', 400),
  fuente('Space Mono', 'SpaceMono-Bold.woff2', 'normal', 700),
].join('\n');

function html(a) {
  const r = roles[a.rol];
  const para = a.nombre || 'vos';
  const pie = `<footer><span>Somos Uno × Melt Underground · ${esc(evento.fechaCorta)}</span><img src="${asset('marca.png')}" alt=""></footer>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Somos Uno · Propuesta para ${esc(para)}</title>
<style>
${fuentes}
</style>
<style>
@page { size: A4; margin: 0; }
:root { --bg:#0b0930; --glow:#3a2cf0; --accent:#9d8cff; --cream:#f3e6cf; --ink:#14112e; --paper:#f4eee3;
  --serif:'Instrument Serif',Georgia,serif; --sans:'DM Sans',system-ui,sans-serif; --mono:'Space Mono',monospace; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:var(--sans); background:var(--bg); color:var(--cream); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.page { width:210mm; height:297mm; position:relative; overflow:hidden; page-break-after:always; padding:18mm 18mm 0; display:flex; flex-direction:column; }
.page:last-child { page-break-after:auto; }
.dark { background:var(--bg) radial-gradient(120% 55% at 20% 0%, rgba(58,44,240,.55), transparent 70%); }
.light { background:var(--paper); color:var(--ink); }
.label { font-family:var(--mono); font-size:8.5pt; letter-spacing:.22em; text-transform:uppercase; color:var(--accent); }
.light .label { color:#4b3fd6; }
h1 { font-family:var(--serif); font-style:italic; font-weight:400; font-size:38pt; line-height:1; margin:4mm 0 4mm; letter-spacing:-.01em; }
p { font-size:10.5pt; line-height:1.55; }
.lead { font-size:11.5pt; line-height:1.55; max-width:155mm; }
.muted { opacity:.72; }
footer { margin-top:auto; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(243,230,207,.18); padding:5mm 0 8mm; font-family:var(--mono); font-size:7.5pt; letter-spacing:.2em; text-transform:uppercase; opacity:.8; }
.light footer { border-color:rgba(20,17,46,.18); }
footer img { height:6mm; }
.light footer img { filter:invert(1) brightness(.3); }

/* Portada */
.cover { padding:0; flex-direction:row; background:var(--bg); }
.cover .foto { position:absolute; inset:0 0 0 42%; overflow:hidden; background:var(--glow); }
.cover .foto img { width:100%; height:100%; object-fit:cover; object-position:60% 30%; filter:grayscale(1) contrast(1.2) brightness(.95); mix-blend-mode:luminosity; display:block; }
.cover .velo { position:absolute; top:0; bottom:0; left:40%; right:0; z-index:1; background:linear-gradient(90deg, var(--bg) 0%, var(--bg) 5%, rgba(11,9,48,.55) 30%, rgba(11,9,48,0) 60%), linear-gradient(0deg, rgba(11,9,48,.85), transparent 35%); }
.cover .texto { position:relative; z-index:2; padding:18mm; width:100%; display:flex; flex-direction:column; }
.cover .marca { width:17mm; }
.cover .display { font-family:var(--serif); font-style:italic; font-size:62pt; line-height:.92; margin-top:46mm; max-width:120mm; }
.cover .sub { margin-top:8mm; font-size:13pt; line-height:1.5; max-width:96mm; }
.cover .sub strong { color:var(--accent); font-weight:500; }
.cover .chips { display:flex; gap:2.5mm; margin-top:8mm; flex-wrap:wrap; max-width:140mm; }
.chip { font-family:var(--mono); font-size:8pt; letter-spacing:.14em; text-transform:uppercase; border:1px solid rgba(243,230,207,.45); border-radius:99px; padding:2mm 3.5mm; background:rgba(11,9,48,.5); }
.cover .firma { margin-top:auto; }
.cover .firma img { height:13mm; margin-bottom:5mm; }
.cover .firma div { font-family:var(--mono); font-size:7.5pt; letter-spacing:.22em; text-transform:uppercase; line-height:2.1; opacity:.85; }
.cover .firma b { color:var(--accent); font-weight:700; }

/* Página 2 */
.datos { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid rgba(243,230,207,.2); border-bottom:1px solid rgba(243,230,207,.2); margin:6mm 0; }
.datos div { padding:3.5mm 4mm 3.5mm 0; }
.datos div:nth-child(n+4) { border-top:1px solid rgba(243,230,207,.12); }
.datos .v { font-family:var(--serif); font-size:15pt; line-height:1.1; margin-top:1mm; }
.datos .d { font-size:8.5pt; line-height:1.35; opacity:.7; margin-top:.8mm; }
.fotos { display:grid; grid-template-columns:1fr 1.45fr; gap:4mm; height:46mm; flex-shrink:0; }
.fotos img { width:100%; height:46mm; object-fit:cover; border-radius:3mm; }
.porque { margin-top:6mm; display:grid; grid-template-columns:38mm 1fr; gap:6mm; padding:6mm; border:1px solid rgba(157,140,255,.45); border-radius:4mm; background:rgba(58,44,240,.12); }
.porque h2 { font-family:var(--serif); font-style:italic; font-weight:400; font-size:24pt; line-height:1; }
.porque .nota { font-family:var(--serif); font-style:italic; font-size:15pt; line-height:1.3; margin-bottom:3mm; }

/* Página 3 */
.cols { display:grid; grid-template-columns:1fr 1fr; gap:9mm; margin-top:4mm; }
.cols h3 { font-family:var(--mono); font-size:8.5pt; letter-spacing:.2em; text-transform:uppercase; padding-bottom:2.5mm; border-bottom:2px solid var(--ink); margin-bottom:1mm; }
.cols ul { list-style:none; }
.cols li { display:flex; gap:3mm; padding:4mm 0; border-bottom:1px solid rgba(20,17,46,.14); }
.cols li strong { font-size:12pt; display:block; margin-bottom:.8mm; }
.cols li p { font-size:10.4pt; line-height:1.5; opacity:.85; }
.cols .n { font-family:var(--serif); font-style:italic; font-size:19pt; color:#4b3fd6; line-height:1; min-width:8mm; }
.destacado { margin-top:7mm; background:var(--bg); color:var(--cream); border-radius:4mm; padding:6mm 7mm; }
.destacado .label { color:var(--accent); }
.destacado .grande { font-size:12pt; margin-top:2.5mm; }
.niveles { display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; margin-top:3.5mm; }
.nivel { font-family:var(--mono); font-size:9.5pt; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--accent); margin-bottom:1.5mm; }
.nivel.serif { font-family:var(--serif); font-style:italic; font-weight:400; font-size:16pt; letter-spacing:0; text-transform:none; color:var(--cream); }
.niveles p { font-size:10.4pt; line-height:1.45; }

/* Página 4 */
.agenda { margin-top:3mm; }
.agenda div { display:grid; grid-template-columns:40mm 1fr; gap:5mm; padding:3.4mm 0; border-bottom:1px solid rgba(243,230,207,.15); align-items:baseline; }
.agenda .dia { font-family:var(--mono); font-size:8.5pt; letter-spacing:.14em; text-transform:uppercase; color:var(--accent); }
.agenda p { font-size:11.5pt; }
.todos { display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; margin-top:4mm; }
.todos div { border-top:2px solid var(--accent); padding-top:3mm; }
.todos strong { font-family:var(--serif); font-style:italic; font-weight:400; font-size:17pt; line-height:1.1; display:block; margin-bottom:1.5mm; }
.todos p { font-size:10pt; line-height:1.45; opacity:.85; }
.cierre { margin-top:auto; margin-bottom:6mm; display:flex; justify-content:space-between; align-items:flex-end; gap:8mm; }
.cierre .pregunta { font-family:var(--serif); font-style:italic; font-size:34pt; line-height:1; }
.cierre p { margin-top:3mm; max-width:100mm; }
.cierre .firma { text-align:right; font-family:var(--mono); font-size:7.5pt; letter-spacing:.14em; line-height:2; opacity:.9; }
.cierre .firma img { height:11mm; margin-bottom:2mm; }
.sec { margin-top:8mm; }
</style></head><body>

<section class="page dark cover">
  <div class="foto"><img src="${asset('portada.jpg')}" alt=""></div><div class="velo"></div>
  <div class="texto">
    <img class="marca" src="${asset('marca.png')}" alt="Somos Uno">
    <div class="display">Nadie baila solo.</div>
    <p class="sub">Una propuesta para <strong>${esc(para)}</strong>: sumarte a la crew de Somos Uno × Melt ${esc(r.comoRol)}.</p>
    <div class="chips"><span class="chip">${esc(evento.fechaCorta)}</span><span class="chip">${esc(evento.horario)}</span><span class="chip">Melt · Recoleta</span></div>
    <div class="firma">
      <img src="${asset('evo.png')}" alt="EVO">
      <div>Para <b>${esc(para)}</b> · ${esc(r.rol)}<br>De <b>EVO</b> · Somos Uno<br>Buenos Aires · Octubre 2026</div>
    </div>
  </div>
</section>

<section class="page dark">
  <div class="label">01 · La fiesta</div>
  <h1>Somos Uno baja a Melt</h1>
  <p class="lead">Somos Uno es mi productora de fiestas de minimal, house y techno; ya juntamos 200 personas en una fecha. El domingo 11 hacemos nuestra primera noche en Melt Underground, un sótano de Recoleta pensado para bailar. Es víspera de feriado, así que nadie mira el reloj.</p>
  <div class="datos">
    <div><div class="label">Cuándo</div><div class="v">${esc(evento.fecha)}</div><div class="d">${esc(evento.vispera)}</div></div>
    <div><div class="label">Horario</div><div class="v">${esc(evento.horario)}</div><div class="d">Invitaciones y lista hasta las 00:00</div></div>
    <div><div class="label">Dónde</div><div class="v">${esc(evento.lugar)}</div><div class="d">${esc(evento.direccion)}</div></div>
    <div><div class="label">Line up</div><div class="v">${esc(evento.lineup)}</div><div class="d">${esc(evento.generos)}</div></div>
    <div><div class="label">Capacidad</div><div class="v">${esc(evento.capacidad)}</div><div class="d">Early bird a $5.000 hasta el viernes 9</div></div>
    <div><div class="label">La idea</div><div class="v">Unidad · conexión · consciencia</div><div class="d">La fiesta la hacemos entre todos</div></div>
  </div>
  <div class="fotos"><img src="${asset('cabina.jpg')}" alt=""><img src="${asset('pista.jpg')}" alt=""></div>
  <div class="porque">
    <h2>¿Por qué vos?</h2>
    <div>${a.nota ? `<p class="nota">“${esc(a.nota)}”</p>` : ''}<p>${esc(r.porque)}</p></div>
  </div>
  ${pie}
</section>

<section class="page light">
  <div class="label">02 · La propuesta</div>
  <h1>${esc(r.rol)}</h1>
  <p class="lead">Una propuesta concreta para una semana. Si algo no te cierra, lo ajustamos.</p>
  <div class="cols">
    <div><h3>Lo que te pido</h3><ul>${lista(r.pedido, a, true)}</ul></div>
    <div><h3>Lo que te llevás</h3><ul>${lista(r.valor, a, false)}</ul></div>
  </div>
  ${destacado(r, a)}
  ${pie}
</section>

<section class="page dark">
  <div class="label">03 · La semana</div>
  <h1>Siete días, un plan</h1>
  <div class="agenda">${r.agenda.map(([d, t]) => `<div><span class="dia">${esc(d)}</span><p>${esc(t)}</p></div>`).join('')}</div>
  <div class="sec label">Para toda la crew</div>
  <div class="todos">${paraTodos.map(([t, d]) => `<div><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join('')}</div>
  <div class="cierre">
    <div><div class="pregunta">¿Te sumás?</div><p>Respondeme por WhatsApp, idealmente el lunes 5, así arrancamos la semana con todo.</p></div>
    <div class="firma"><img src="${asset('evo.png')}" alt="EVO"><br>EVO · Somos Uno<br>${esc(evento.contacto)}<br>${esc(evento.instagram)}</div>
  </div>
  ${pie}
</section>
</body></html>`;
}

const { amigos } = JSON.parse(readFileSync(join(aqui, 'amigos.json'), 'utf8'));
const salida = join(aqui, 'pdf');
mkdirSync(salida, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
for (const amigo of amigos) {
  const r = roles[amigo.rol];
  if (!r) { console.error(`Rol desconocido: "${amigo.rol}" (${amigo.nombre})`); continue; }
  const a = { ...amigo, invitaciones: amigo.invitaciones ?? r.invitaciones };
  const archivo = join(salida, `Somos_Uno_11-10_${slug(r.rol)}${a.nombre ? '_' + slug(a.nombre) : ''}.pdf`);
  const tmp = join(aqui, '.preview.html');
  writeFileSync(tmp, html(a));
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: archivo, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log('✓', archivo);
}
await browser.close();
