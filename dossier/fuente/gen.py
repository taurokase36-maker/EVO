#!/usr/bin/env python3
"""Genera index.html del Press Kit EVO 2026 (12 páginas, 1440x810)."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

L = {
    'ig': 'https://www.instagram.com/evo.evo.evo._/',
    'yt': 'https://www.youtube.com/@evo_evo_evo_evo',
    'sc': 'https://soundcloud.com/evo-shajt/tracks',
    'su': 'https://www.instagram.com/somos.uno._/',
    'mail': 'mailto:evo.evomusic@gmail.com',
    'vault': 'https://untitled.stream/library/project/AnGiOc69Oqa9m9Y9GVXAI',
    'rel_sunsetin': 'https://youtu.be/w7BneYAm4M8',
    'rel_heaven': 'https://youtu.be/r9fTJpZdeLQ',
    'rel_journeyman': 'https://youtu.be/1axuxfN9Ots',
    'set_minimal': 'https://youtu.be/Uc0V9M3YooU',
    'set_corrupt': 'https://www.youtube.com/watch?v=IofnaGj2EvM&t=1770s',
    'set_toxic': 'https://youtu.be/uRg1gnH2AHA',
}
TOTAL = 12


def spark(x, y, w, op=1):
    return (f'<svg class="spark" viewBox="0 0 100 100" style="left:{x}px;top:{y}px;width:{w}px;opacity:{op}">'
            '<path d="M50 0C52.5 37 63 47.5 100 50C63 52.5 52.5 63 50 100C47.5 63 37 52.5 0 50C37 47.5 47.5 37 50 0Z"/></svg>')


def folio(n, label):
    return (f'<div class="folio"><img src="img/symbol.png" alt=""><span>EVO · Press Kit 2026</span>'
            f'<span class="rule"></span><span>{label}</span><span class="num">{n:02d} / {TOTAL}</span></div>')


def fx():
    return '<div class="vignette"></div><div class="grain"></div>'


ICON = {
    'ig': '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4"><rect x="5" y="5" width="38" height="38" rx="11"/><circle cx="24" cy="24" r="9"/><circle cx="35.5" cy="12.5" r="2.2" fill="currentColor" stroke="none"/></svg>',
    'yt': '<svg viewBox="0 0 48 48"><rect x="2" y="9" width="44" height="30" rx="9" fill="#c4473b"/><path d="M20 17v14l12-7z" fill="#fff"/></svg>',
    'sc': '<svg viewBox="0 0 64 36" fill="currentColor"><path d="M40 6a13 13 0 0 1 12.6 10A9 9 0 1 1 55 34H40zM36 7v27h-2.4V8.2zM31 10v24h-2.4V10zM26 12v22h-2.4V12zM21 13v21h-2.4V13zM16 16v18h-2.4V16zM11 18v16H8.6V18zM6 22v11H3.6V22z"/></svg>',
}

pages = []

# 01 ─ PORTADA ─────────────────────────────────────────────
pages.append(f'''
<section class="page cover" id="p1">
  <img src="img/cover_bg.jpg" style="position:absolute;left:-1px;top:-162px;width:1960px;height:1117px;object-fit:cover">
  <img src="img/cover_photo.jpg" style="position:absolute;left:0;top:-139px;width:612px;height:1088px;object-fit:cover">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.25) 70%,rgba(0,0,0,.7) 100%)"></div>
  <div style="position:absolute;left:600px;top:150px;width:820px;height:520px;background:radial-gradient(ellipse at center,rgba(150,255,180,.16),transparent 65%)"></div>
  <div class="beams" style="position:absolute;inset:0"></div>
  <div class="z" style="position:absolute;top:58px;right:72px"><span class="kicker" style="color:var(--ink)">Dossier de prensa</span></div>
  <img src="img/logo_evo.png" class="z" style="position:absolute;left:580px;top:236px;width:790px;filter:drop-shadow(0 0 26px rgba(255,255,255,.28)) drop-shadow(0 10px 24px rgba(0,0,0,.5))">
  <img src="img/presskit2026.png" class="z" style="position:absolute;left:1028px;top:516px;width:245px">
  <img src="img/symbol.png" class="z" style="position:absolute;left:776px;top:461px;width:300px;filter:drop-shadow(0 0 18px rgba(255,255,255,.25))">
  {spark(503, 478, 78)}{spark(556, 468, 26, .9)}
  <div class="z" style="position:absolute;left:690px;right:72px;bottom:56px;display:flex;align-items:center;gap:18px;font:700 12px/1 var(--sans);letter-spacing:.34em;text-transform:uppercase;color:var(--muted)">
    <span>DJ · Productor · Compositor</span><span style="flex:1;height:1px;background:var(--line)"></span><span>Buenos Aires · Argentina</span>
  </div>
  {fx()}
</section>''')

# 02 ─ BIOGRAFÍA ───────────────────────────────────────────
facts = [('Origen', 'Guayaquil, Ecuador'), ('Base', 'Buenos Aires, desde 2024'), ('Rol', 'DJ · Productor · Compositor'),
         ('Proyecto', 'Fundador de Somos Uno'), ('Estudio', 'Ableton Live, desde 2022'), ('Escenarios', '4 países')]
facts_html = ''.join(
    f'<div style="padding:13px 0;border-top:1px solid var(--line)"><div style="font:700 10.5px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">{k}</div>'
    f'<div style="margin-top:7px;font:600 15px/1.3 var(--sans);color:var(--white)">{v}</div></div>' for k, v in facts)
pages.append(f'''
<section class="page" id="p2" style="background:#000">
  <img src="img/foto_verde.jpg" style="position:absolute;left:0;top:-170px;width:650px;height:1156px;object-fit:cover">
  <div style="position:absolute;left:330px;top:0;width:340px;height:100%;background:linear-gradient(90deg,transparent,#000 92%)"></div>
  <div style="position:absolute;left:0;bottom:0;width:700px;height:200px;background:linear-gradient(0deg,rgba(0,0,0,.8),transparent)"></div>
  <div style="position:absolute;left:660px;top:-100px;width:900px;height:700px;background:radial-gradient(ellipse at center,rgba(12,122,51,.28),transparent 65%)"></div>
  <div class="z" style="position:absolute;left:730px;top:64px;width:620px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="kicker">01 — Biografía</span>
      <img src="img/logo_evo.png" style="width:250px;filter:drop-shadow(0 0 18px rgba(255,255,255,.22))">
    </div>
    <p class="lead" style="margin-top:22px">EVO es <b>DJ, productor y compositor</b> de música electrónica. Nacido en Guayaquil, Ecuador, y radicado en Buenos Aires desde 2024, es el fundador de la productora <b>Somos Uno</b>.</p>
    <p class="body" style="margin-top:14px">Su historia con la música empezó en 2022, cuando dejó la carrera de <b>Ingeniería en Sistemas</b> para dedicarse por completo a la producción y a la cabina. Desde entonces compone en <b>Ableton Live</b>, herramienta que hoy también enseña con su propio curso de producción en <b>Melt Akademy</b>.</p>
    <p class="body" style="margin-top:12px">Su sonido baila sobre la delgada línea de los subgéneros: de la energía del <b>techno</b> y el <b>garage</b> a la emoción del <b>house</b> y el <b>minimal</b>.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;column-gap:26px;margin-top:24px">{facts_html}</div>
  </div>
  {folio(2, 'Biografía')}{fx()}
</section>''')

# 03 ─ HISTORIA ────────────────────────────────────────────
miles = [
    ('2022', 'El comienzo', 'Deja Ingeniería en Sistemas y empieza a producir en Ableton Live.'),
    ('2023', 'Quito', 'Toca en la sala electrónica de Club La Catedral junto a Alejandro Soria y Jose Coo.'),
    ('2024', 'Buenos Aires', 'Se instala en la capital argentina y funda Somos Uno, su productora de minimal, house y techno.'),
    ('2024 — 25', 'La escena porteña', 'Kiany Fest, Lumina Fest, Spiral Rave y las fiestas de Somos Uno, que llegan a reunir 200 personas.'),
    ('Dic 2025', 'Primera gira internacional', 'Con Under City Productions encabeza Narnia Sessions 2 en Tegucigalpa, ante más de 300 personas.'),
    ('2026', 'Toronto y Melt', 'Chotto Matte en Toronto (agosto), Somos Uno × Melt Underground y su curso en Melt Akademy.'),
]
mh = ''.join(
    f'<div style="display:grid;grid-template-columns:150px 22px 1fr;column-gap:18px;align-items:start;padding:11px 0">'
    f'<div style="font:700 italic 25px/1.1 var(--serif);color:var(--white);text-align:right">{y}</div>'
    f'<div style="width:14px;height:14px;margin:6px auto 0;border-radius:50%;background:#e9f5ea;box-shadow:0 0 0 5px rgba(169,228,182,.16),0 0 16px rgba(169,228,182,.8)"></div>'
    f'<div><div style="font:700 12px/1.3 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--mint)">{t}</div>'
    f'<p class="body" style="margin-top:5px;font-size:15px;line-height:1.5">{x}</p></div></div>' for y, t, x in miles)
pages.append(f'''
<section class="page lattice beams" id="p3">
  <img src="img/foto_ventana.jpg" style="position:absolute;right:0;top:-40px;width:520px;height:890px;object-fit:cover;object-position:50% 40%;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 45%);mask-image:linear-gradient(90deg,transparent 0%,#000 45%)">
  <div class="z" style="position:absolute;left:96px;top:62px;width:830px">
    <span class="kicker">02 — Historia</span>
    <h1 class="title" style="margin-top:16px">Historia</h1>
    <p class="lead" style="margin-top:12px;font-size:18px;color:var(--muted)">De Guayaquil a Buenos Aires, de las fiestas propias a su primera gira internacional.</p>
    <div style="position:relative;margin-top:20px">
      <div style="position:absolute;left:184px;top:22px;bottom:22px;width:2px;background:linear-gradient(180deg,rgba(233,245,234,.75),rgba(233,245,234,.12))"></div>
      {mh}
    </div>
  </div>
  {folio(3, 'Historia')}{fx()}
</section>''')

# 04 ─ SONIDO / GÉNEROS ────────────────────────────────────
pages.append(f'''
<section class="page" id="p4" style="background:linear-gradient(90deg,#03702a 0%,#055d22 40%,#011a08 70%,#000 100%)">
  <img src="img/foto_bn.jpg" style="position:absolute;right:0;top:-120px;width:620px;height:1102px;object-fit:cover;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 38%);mask-image:linear-gradient(90deg,transparent 0%,#000 38%)">
  <div class="z" style="position:absolute;left:96px;top:70px;width:720px">
    <span class="kicker" style="color:var(--white)">03 — Sonido y géneros</span>
    <div style="margin-top:36px;filter:drop-shadow(0 0 16px rgba(255,255,255,.18)) drop-shadow(0 8px 14px rgba(0,0,0,.35))">
      <img src="img/g_minimal.png" style="width:610px"><img src="img/g_house.png" style="width:610px;margin-top:30px"><img src="img/g_techno.png" style="width:610px;margin-top:30px">
    </div>
    <p class="lead" style="margin-top:38px;width:600px;font-size:18.5px">Su sonido baila sobre la delgada línea de los subgéneros: de la energía y el ritmo del <b>techno</b> y el <b>garage</b> a la emoción y el sentimiento del <b>house</b> y el <b>minimal</b>. Sets de groove largo, pensados para que la pista viaje junta.</p>
    <div style="display:flex;gap:30px;margin-top:34px;align-items:center">
      <a href="{L['yt']}" style="display:block;width:82px">{ICON['yt']}</a>
      <a href="{L['ig']}" style="display:block;width:62px;color:#fff">{ICON['ig']}</a>
      <a href="{L['sc']}" style="display:block;width:118px;color:#fff">{ICON['sc']}</a>
    </div>
  </div>
  {folio(4, 'Sonido')}{fx()}
</section>''')

# 05 ─ SOMOS UNO ───────────────────────────────────────────
pillars = [('01', 'Unidad', 'Público, artistas y espacio son una sola cosa. Sin distancia entre la cabina y la pista.'),
           ('02', 'Conexión', 'Minimal, house y techno de groove largo, con un line up que cuenta una sola historia.'),
           ('03', 'Consciencia', 'Una noche cuidada: respeto entre todos y por el lugar que los recibe.')]
ph = ''.join(f'<div class="glass" style="padding:20px 20px 18px"><div style="font:400 italic 30px/1 var(--serif);color:var(--mint)">{n}</div>'
             f'<div style="margin-top:10px;font:700 21px/1 var(--serif);text-transform:uppercase;color:var(--white);letter-spacing:.04em">{t}</div>'
             f'<p class="body" style="margin-top:10px;font-size:14px;line-height:1.5">{x}</p></div>' for n, t, x in pillars)
pages.append(f'''
<section class="page lattice" id="p5">
  <div class="z" style="position:absolute;left:96px;top:62px;width:780px">
    <span class="kicker">04 — Productora</span>
    <h1 class="title" style="margin-top:16px">Somos Uno</h1>
    <p class="lead" style="margin-top:18px;font-size:19.5px">En 2024 EVO fundó <b>Somos Uno</b>, una productora de fiestas de minimal, house y techno en Buenos Aires que nace de una idea simple: <i>en la pista nadie baila solo.</i></p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px">{ph}</div>
    <div style="display:flex;gap:44px;margin-top:26px">
      <div class="stat"><div class="n">4</div><div class="l">Eventos oficiales</div></div>
      <div class="stat"><div class="n">200</div><div class="l">Personas</div><div class="d">Pico en una fecha</div></div>
      <div class="stat"><div class="n">1</div><div class="l">Colaboración</div><div class="d">Con Under City</div></div>
      <div class="stat"><div class="n" style="font-size:34px;padding-top:18px">ODA · Sandman</div><div class="l">Crew estable</div></div>
    </div>
    <div style="margin-top:24px;display:flex;align-items:center;gap:16px;padding:14px 20px;border-radius:14px;background:linear-gradient(90deg,rgba(169,228,182,.16),rgba(169,228,182,.02));border:1px solid rgba(169,228,182,.35)">
      <span class="chip" style="border-color:var(--mint);color:var(--mint)">Nueva casa</span>
      <span style="font-size:15px;color:var(--ink)"><b style="color:#fff">Somos Uno × Melt Underground</b> · desde el domingo 11 de octubre de 2026</span>
    </div>
  </div>
  <div class="z" style="position:absolute;left:965px;top:92px;width:360px">
    <div class="card" style="width:360px;height:450px;transform:rotate(2.2deg)"><img src="img/fl_secret.jpg"></div>
    <img class="flare" src="img/flare.png" style="right:-80px;top:-50px">
    <p style="margin-top:26px;font:700 12px/1.5 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--muted);text-align:center">Secret Party · EVO, ODA, Sandman</p>
    <div style="text-align:center;margin-top:14px"><a href="{L['su']}" class="chip" style="display:inline-block">Instagram · @somos.uno._ ↗</a></div>
  </div>
  {folio(5, 'Somos Uno')}{fx()}
</section>''')


# 06 ─ MÚSICA (releases + live sets) ──────────────────────
def row(items):
    return ''.join(
        f'<div style="width:330px"><a href="{u}" class="card" style="display:block;width:330px;height:186px"><img src="img/{img}"><span class="play"></span></a>'
        f'<a href="{u}" style="display:block;margin-top:13px;font:700 18px/1.2 var(--serif);color:var(--white)">{t}</a>'
        f'<div style="margin-top:4px;font-size:13px;color:var(--muted)">{s}</div></div>' for img, u, t, s in items)


rel = [('rel_sunsetin.jpg', L['rel_sunsetin'], 'sunsetIN un planeta muy lejos', 'EVO · Single'),
       ('rel_heaven.jpg', L['rel_heaven'], 'Heaven Beyond', 'EVO · Single'),
       ('rel_journeyman.jpg', L['rel_journeyman'], '★彡 Journeyman Letter 彡★', 'EVO ft. Kta · Single')]
sets = [('set_minimal.jpg', L['set_minimal'], 'Minimal House Electro Mix', 'DJ set'),
        ('set_corrupt.jpg', L['set_corrupt'], 'Corrupt the House', 'DJ set'),
        ('set_toxic.jpg', L['set_toxic'], 'this set feels like a toxic relationship', 'DJ set')]
lab = 'font:700 38px/1 var(--serif);text-transform:uppercase;color:var(--white);text-shadow:0 0 22px rgba(255,255,255,.25)'
pages.append(f'''
<section class="page lattice" id="p6">
  <div class="z" style="position:absolute;left:80px;right:80px;top:52px;display:flex;justify-content:space-between;align-items:flex-end">
    <div><span class="kicker">05 — Discografía y sets</span><h1 class="title" style="margin-top:14px">Música</h1></div>
    <div class="glass" style="padding:16px 22px;max-width:520px">
      <div style="font:700 11px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">Próximamente</div>
      <div style="margin-top:9px;font-size:15.5px;line-height:1.45;color:var(--ink)">Nuevo tema de EVO en <b style="color:#fff">Lovely</b>, el sello de <b style="color:#fff">Nic Fakie</b>.</div>
    </div>
  </div>
  <div class="z" style="position:absolute;left:80px;right:80px;top:200px;display:flex;justify-content:space-between">
    <div style="width:190px;padding-top:30px"><div style="{lab}">Releases</div><div style="margin-top:12px;font-size:14px;color:var(--muted);line-height:1.5">Singles propios<br>2025 — 2026</div></div>
    {row(rel)}
  </div>
  <div class="z" style="position:absolute;left:80px;right:80px;top:458px;display:flex;justify-content:space-between">
    <div style="width:190px;padding-top:30px"><div style="{lab}">Live<br>sets</div><div style="margin-top:12px;font-size:14px;color:var(--muted);line-height:1.5">Sets completos<br>en YouTube</div></div>
    {row(sets)}
  </div>
  {spark(1350, 170, 30, .7)}
  {folio(6, 'Música')}{fx()}
</section>''')

# 07 ─ unRELEASED ──────────────────────────────────────────
pages.append(f'''
<section class="page lattice" id="p7">
  <div class="z center" style="position:absolute;left:0;right:0;top:58px">
    <span class="kicker center">06 — Exclusivo</span>
    <h1 class="title" style="margin-top:14px;text-transform:none">un<span style="text-transform:uppercase">RELEASED</span></h1>
    <p style="margin-top:16px;font:700 19px/1.4 var(--sans);color:var(--white)">Dale click para tener un acceso exclusivo al baúl de EVO *</p>
  </div>
  <div style="position:absolute;left:520px;top:250px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,170,90,.28),transparent 65%)"></div>
  <a href="{L['vault']}" class="card z" style="position:absolute;left:546px;top:262px;width:348px;height:348px;border-radius:10px"><img src="img/vault.png" style="image-rendering:pixelated"></a>
  <div style="position:absolute;left:560px;top:624px;width:320px;height:26px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.6),transparent 70%)"></div>
  <img class="flare" src="img/flare.png" style="left:800px;top:200px">
  {spark(470, 300, 40, .85)}{spark(930, 560, 28, .7)}
  <p class="z center" style="position:absolute;left:0;right:0;top:676px;font:400 italic 17px/1.4 var(--sans);color:var(--ink)">*Contenido privado y con derechos de autor. Por favor, manejar con absoluta discreción.</p>
  {folio(7, 'unRELEASED')}{fx()}
</section>''')

# 08 ─ GIRAS Y SHOWS ───────────────────────────────────────
countries = [
    ('AR', 'Argentina', 'Buenos Aires', [
        ('Somos Uno', '4 eventos oficiales · Secret Party'), ('Kiany Fest · Lumina Fest · Spiral Rave', '2024 — 2025'),
        ('Melt Underground', 'Somos Uno × Melt · 11.10.2026')]),
    ('EC', 'Ecuador', 'Quito', [('Club La Catedral', '13 de junio de 2023')]),
    ('HN', 'Honduras', 'Tegucigalpa', [('Narnia Sessions 2', 'Under City · 27.12.2025'), ('Primera gira internacional', '+300 personas')]),
    ('CA', 'Canadá', 'Toronto', [('Chotto Matte', 'Agosto de 2026')]),
]
ch = ''
for code, name, city, shows in countries:
    rows = ''.join(f'<div style="padding:11px 0;border-top:1px solid var(--line)"><div style="font:700 15.5px/1.3 var(--sans);color:var(--white)">{v}</div>'
                   f'<div style="margin-top:4px;font-size:13px;color:var(--muted)">{w}</div></div>' for v, w in shows)
    ch += (f'<div class="glass" style="padding:22px 22px 14px">'
           f'<div style="display:flex;align-items:center;gap:12px"><span style="width:42px;height:42px;border-radius:50%;border:1.5px solid var(--mint);display:grid;place-items:center;font:700 13px/1 var(--sans);letter-spacing:.1em;color:var(--mint);box-shadow:0 0 14px rgba(169,228,182,.35)">{code}</span>'
           f'<div><div style="font:700 22px/1 var(--serif);text-transform:uppercase;color:var(--white)">{name}</div><div style="margin-top:5px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)">{city}</div></div></div>'
           f'<div style="margin-top:16px">{rows}</div></div>')
pages.append(f'''
<section class="page lattice beams" id="p8">
  <div class="z" style="position:absolute;left:96px;top:62px;right:96px">
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div><span class="kicker">07 — En escena</span><h1 class="title" style="margin-top:16px">Giras y shows</h1></div>
      <div style="display:flex;gap:56px;padding-bottom:6px">
        <div class="stat"><div class="n">4</div><div class="l">Países</div></div>
        <div class="stat"><div class="n">+300</div><div class="l">Personas · Tegucigalpa</div></div>
        <div class="stat"><div class="n">200</div><div class="l">Personas · Somos Uno</div></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:18px;margin-top:38px;align-items:stretch">{ch}</div>
    <div style="margin-top:22px;display:flex;align-items:center;gap:22px;padding:18px 26px;border-radius:14px;background:linear-gradient(90deg,rgba(169,228,182,.16),rgba(169,228,182,.02));border:1px solid rgba(169,228,182,.35)">
      <span class="chip" style="border-color:var(--mint);color:var(--mint)">Próxima fecha</span>
      <span style="font:700 italic 24px/1 var(--serif);color:var(--white)">Somos Uno × Melt Underground</span>
      <span style="color:var(--muted);font-size:15px">Domingo 11 de octubre de 2026 · Laprida 1423, Buenos Aires</span>
    </div>
  </div>
  {folio(8, 'Giras y shows')}{fx()}
</section>''')

# 09 ─ EVENTOS (flyers) ────────────────────────────────────
fl = [('fl_catedral.jpg', 'Quito, Ecuador', 'Club La Catedral · 2023'), ('fl_kiany.jpg', 'Buenos Aires, Argentina', 'Kiany Fest'),
      ('fl_secret.jpg', 'Buenos Aires, Argentina', 'Somos Uno · Secret Party'), ('fl_narnia.jpg', 'Tegucigalpa, Honduras', 'Under City · Narnia Sessions 2')]
fh = ''.join(f'<div style="width:300px;text-align:center"><div class="card" style="width:300px;height:375px;border-width:2px;border-radius:12px"><img src="img/{f}"></div>'
             f'<div style="margin-top:20px;font:600 17px/1.35 var(--sans);color:var(--white)">{a}</div><div style="font-size:15px;color:var(--muted)">{b}</div></div>' for f, a, b in fl)
pages.append(f'''
<section class="page lattice" id="p9">
  <div style="position:absolute;left:0;right:0;top:300px;height:260px;background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(190,220,60,.22),transparent 70%)"></div>
  <div class="z center" style="position:absolute;left:0;right:0;top:56px">
    <span class="kicker center">08 — Flyers</span>
    <h1 class="title" style="margin-top:14px">Eventos</h1>
  </div>
  <div class="z" style="position:absolute;left:84px;right:84px;top:226px;display:flex;justify-content:space-between">{fh}</div>
  <img class="flare" src="img/flare.png" style="left:-10px;top:170px;width:230px">
  <img class="flare" src="img/flare.png" style="right:-20px;top:170px;width:230px">
  {folio(9, 'Eventos')}{fx()}
</section>''')

# 10 ─ COLABORACIONES ──────────────────────────────────────
collabs = [
    ('Kta', 'Featuring', 'Productor de música urbana de Ramos Mejía. Featuring en <b>★彡 Journeyman Letter 彡★</b>.', L['rel_journeyman']),
    ('Lovely · Nic Fakie', 'Sello', 'Próximo lanzamiento: un nuevo tema de EVO saldrá por Lovely, el sello de Nic Fakie.', None),
    ('Under City Productions', 'Alianza', 'Productora hondureña de minimal con base en Argentina. Lo llevó a su primera gira internacional y realizó una colaboración con Somos Uno.', None),
    ('Melt Underground', 'Buenos Aires', 'Nueva casa de Somos Uno desde el 11 de octubre de 2026. EVO dicta además su curso de producción en Ableton Live 12 en Melt Akademy.', None),
    ('ODA · Sandman', 'Crew Somos Uno', 'El equipo estable de la productora. Comparten line up en la Secret Party y en Narnia Sessions 2.', None),
    ('ZOEN', 'Kiany Fest', 'Comparten el capítulo «Techno Journey» del line up de Kiany Fest (EVO || ZOEN).', None),
]
cc = ''.join(f'<div class="glass" style="padding:30px 28px 26px;min-height:222px">'
             f'<div style="font:700 11px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">{r}</div>'
             f'<div style="margin-top:14px;font:700 32px/1.05 var(--serif);color:var(--white)">{n}</div>'
             f'<p class="body" style="margin-top:14px;font-size:16px;line-height:1.6">{t}</p>'
             + (f'<a href="{u}" style="display:inline-block;margin-top:12px;font:700 11px/1 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--mint)">Escuchar ↗</a>' if u else '')
             + '</div>' for n, r, t, u in collabs)
pages.append(f'''
<section class="page lattice" id="p10">
  <div class="z" style="position:absolute;left:96px;top:62px;right:96px">
    <span class="kicker">09 — Featuring y alianzas</span>
    <h1 class="title" style="margin-top:16px">Colaboraciones</h1>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:30px">{cc}</div>
  </div>
  {spark(1290, 80, 40, .8)}
  {folio(10, 'Colaboraciones')}{fx()}
</section>''')

# 11 ─ TECH RIDER ──────────────────────────────────────────
gear = ['1x Pioneer DJM 900 o A9', '2x CDJ 3000 / 2000 / NXS2 linkeadas y con la última actualización', 'Monitoreo de cabina']
gh = ''.join(f'<div style="display:flex;align-items:center;gap:12px;justify-content:center;padding:3px 0;font:700 16px/1.3 var(--sans);text-transform:uppercase;color:var(--white);letter-spacing:.03em">'
             f'<span style="width:7px;height:7px;transform:rotate(45deg);background:var(--mint);box-shadow:0 0 8px var(--mint)"></span>{g}</div>' for g in gear)
sh = 'filter:drop-shadow(0 18px 18px rgba(0,0,0,.55))'
pages.append(f'''
<section class="page" id="p11">
  <img src="img/techrider.png" class="z" style="position:absolute;left:363px;top:30px;width:714px;filter:drop-shadow(0 0 18px rgba(255,255,255,.25))">
  <img src="img/techrider.png" style="position:absolute;left:363px;top:88px;width:714px;transform:scaleY(-1);opacity:.22;-webkit-mask-image:linear-gradient(0deg,#000,transparent 85%);mask-image:linear-gradient(0deg,#000,transparent 85%)">
  <div class="z" style="position:absolute;left:0;right:0;top:136px">{gh}</div>
  <div style="position:absolute;left:300px;right:300px;top:482px;height:60px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.65),transparent 70%)"></div>
  <img src="img/monitor.png" class="z" style="position:absolute;left:107px;top:300px;width:204px;{sh}">
  <img src="img/cdj.png" class="z" style="position:absolute;left:345px;top:272px;width:326px;{sh}">
  <img src="img/mixer.png" class="z" style="position:absolute;left:548px;top:254px;width:353px;{sh}">
  <img src="img/cdj.png" class="z" style="position:absolute;left:786px;top:272px;width:326px;{sh}">
  <img src="img/monitor.png" class="z" style="position:absolute;left:1129px;top:300px;width:204px;transform:scaleX(-1);{sh}">
  <p class="z center" style="position:absolute;left:0;right:0;top:530px;font:700 17px/1.4 var(--sans);color:var(--white)">En caso de necesitar, el artista cuenta con controladora profesional <span style="color:var(--mint)">XDJ-AERO</span></p>
  <img src="img/xdj.png" class="z" style="position:absolute;left:545px;top:568px;width:350px;filter:drop-shadow(0 16px 16px rgba(0,0,0,.6))">
  {folio(11, 'Tech rider')}{fx()}
</section>''')

# 12 ─ CONTACTO + REDES ────────────────────────────────────
plats = [('ig', 'Instagram', '@evo.evo.evo._', 'qr_ig', L['ig']), ('yt', 'YouTube', '@evo_evo_evo_evo', 'qr_yt', L['yt']),
         ('sc', 'SoundCloud', 'evo-shajt', 'qr_sc', L['sc']), ('ig', 'Somos Uno', '@somos.uno._', 'qr_su', L['su'])]
pp = ''.join(f'<a href="{u}" class="glass" style="display:block;padding:18px 14px;text-align:center">'
             f'<div style="width:{56 if k == "sc" else 36}px;height:36px;margin:0 auto;color:#fff;display:flex;align-items:center;justify-content:center">{ICON[k]}</div>'
             f'<div style="margin-top:10px;font:700 17px/1 var(--serif);text-transform:uppercase;color:var(--white)">{n}</div>'
             f'<div style="margin-top:6px;font-size:12.5px;color:var(--muted)">{h}</div>'
             f'<div style="margin:14px auto 0;width:112px;height:112px;padding:9px;background:#eef3ec;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.45)"><img src="img/{q}.svg" style="width:100%;height:100%"></div></a>'
             for k, n, h, q, u in plats)
pages.append(f'''
<section class="page" id="p12">
  <img src="img/foto_roja.jpg" style="position:absolute;left:0;top:-120px;width:540px;height:960px;object-fit:cover">
  <div style="position:absolute;left:240px;top:0;width:320px;height:100%;background:linear-gradient(90deg,transparent,#011a09 90%)"></div>
  <div style="position:absolute;left:540px;top:0;right:0;height:100%;background:radial-gradient(ellipse 70% 80% at 55% 50%,#0a6b2e 0%,#04431b 40%,#011a09 85%)"></div>
  <div class="z" style="position:absolute;left:610px;right:80px;top:56px">
    <span class="kicker">Booking</span>
    <h1 style="margin-top:12px;font:400 84px/1 var(--serif);color:var(--white);letter-spacing:.02em;text-shadow:0 0 28px rgba(255,255,255,.3),0 6px 20px rgba(0,0,0,.5)">CONTACTO</h1>
    <a href="{L['mail']}" style="display:inline-block;margin-top:22px;font:700 46px/1 var(--sans);color:var(--white);text-shadow:0 0 22px rgba(255,255,255,.22)">evo.evomusic@gmail.com</a>
    <div class="hair" style="margin:28px 0 24px;width:100%"></div>
    <div style="font:700 11px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">Plataformas y redes · escaneá o hacé click</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:18px">{pp}</div>
  </div>
  {spark(1330, 70, 34, .8)}
  {folio(12, 'Contacto')}{fx()}
</section>''')

html = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>EVO · Press Kit 2026</title>
<link rel="stylesheet" href="fonts.css"><link rel="stylesheet" href="style.css"></head><body>
{''.join(pages)}
</body></html>'''
open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(html)
print('ok', len(pages), 'páginas')
