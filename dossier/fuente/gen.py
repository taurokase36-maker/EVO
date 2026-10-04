#!/usr/bin/env python3
"""Genera index.html del Press Kit EVO 2026. Todo dato no confirmado va en tbd()."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = json.load(open(os.path.join(HERE, 'data.json'), encoding='utf-8'))

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
TOTAL = 16


LABELS = {
    'origen': 'ciudad de origen', 'llegada_bsas': 'año de llegada', 'inicios': 'cómo empezó en la música',
    'anio_inicio': 'año', 'anio_somos_uno': 'año', 'fechas_somos_uno': 'cantidad',
    'anio_catedral': 'año', 'fecha_kiany': 'fecha', 'fecha_lumina': 'fecha', 'fecha_spiral': 'fecha',
    'quien_es_kta': 'quién es Kta', 'seguidores_ig': 'número', 'subs_yt': 'número', 'seguidores_sc': 'número',
    'seguidores_somos_uno': 'número',
}


def d(key):
    """Dato del data.json; si está vacío, marca PENDIENTE."""
    v = DATA.get(key, '')
    if v:
        return v
    if key.startswith(('anio_', 'plays_', 'views_')) and key not in LABELS:
        return tbd('año' if key.startswith('anio_') else 'número')
    return tbd(LABELS.get(key, key.replace('_', ' ')))


def tbd(label):
    return f'<span class="tbd">PENDIENTE · {label}</span>'


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
    'mail': '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.5"><rect x="4" y="9" width="40" height="30" rx="5"/><path d="M5 12l19 14 19-14"/></svg>',
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
  <div style="position:absolute;top:58px;right:72px;display:flex;gap:26px;align-items:center" class="z">
    <span class="kicker" style="color:var(--ink)">Dossier de prensa</span>
  </div>
  <img src="img/logo_evo.png" class="z" style="position:absolute;left:580px;top:236px;width:790px;filter:drop-shadow(0 0 26px rgba(255,255,255,.28)) drop-shadow(0 10px 24px rgba(0,0,0,.5))">
  <img src="img/presskit2026.png" class="z" style="position:absolute;left:1028px;top:516px;width:245px">
  <img src="img/symbol.png" class="z" style="position:absolute;left:776px;top:461px;width:300px;filter:drop-shadow(0 0 18px rgba(255,255,255,.25))">
  {spark(503, 478, 78)}{spark(556, 468, 26, .9)}
  <div class="z" style="position:absolute;left:690px;right:72px;bottom:56px;display:flex;align-items:center;gap:18px;font:700 12px/1 var(--sans);letter-spacing:.34em;text-transform:uppercase;color:var(--muted)">
    <span>DJ · Productor · Compositor</span><span class="rule" style="flex:1;height:1px;background:var(--line)"></span><span>Buenos Aires · Argentina</span>
  </div>
  {fx()}
</section>''')

# 02 ─ ÍNDICE ──────────────────────────────────────────────
toc = [
    ('Biografía', 3), ('Historia', 4), ('Sonido y géneros', 5), ('Somos Uno', 6), ('Discografía', 7),
    ('Live sets', 8), ('unRELEASED', 9), ('Giras y shows', 10), ('Eventos', 11), ('Colaboraciones', 12),
    ('Prensa', 13), ('Plataformas y redes', 14), ('Tech rider', 15), ('Contacto', 16),
]
toc_html = ''.join(
    f'<a href="#p{p}" style="display:flex;align-items:baseline;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08)">'
    f'<span style="font:700 12px/1 var(--sans);letter-spacing:.2em;color:var(--mint);width:30px">{i+1:02d}</span>'
    f'<span style="font:600 21px/1.2 var(--sans);color:var(--ink)">{t}</span>'
    f'<span style="flex:1;border-bottom:1px dotted rgba(255,255,255,.22);transform:translateY(-4px)"></span>'
    f'<span style="font:400 italic 18px/1 var(--serif);color:var(--muted)">{p:02d}</span></a>'
    for i, (t, p) in enumerate(toc))
pages.append(f'''
<section class="page lattice" id="p2">
  <div class="z" style="position:absolute;left:96px;top:78px;width:560px">
    <span class="kicker">Contenido</span>
    <h1 class="title" style="margin:22px 0 34px">Índice</h1>
    <div style="column-count:2;column-gap:48px;width:680px">{toc_html}</div>
  </div>
  <img src="img/symbol.png" style="position:absolute;right:-90px;top:120px;width:620px;opacity:.06">
  <div class="z" style="position:absolute;left:880px;top:200px;width:460px">
    <div style="font:400 italic 120px/0.6 var(--serif);color:var(--mint);opacity:.8">“</div>
    <p style="font:400 italic 50px/1.12 var(--serif);color:var(--white);text-shadow:0 0 30px rgba(255,255,255,.2)">En la pista nadie baila solo.</p>
    <div class="hair" style="margin:30px 0 18px;width:180px"></div>
    <p class="body" style="font-size:15.5px">La idea que da origen a <b>Somos Uno</b>, la productora que EVO fundó en Buenos Aires, y que atraviesa cada uno de sus sets.</p>
  </div>
  {spark(1300, 120, 46, .8)}{spark(820, 610, 30, .6)}
  {folio(2, 'Índice')}{fx()}
</section>''')

# 03 ─ BIOGRAFÍA ───────────────────────────────────────────
facts = [
    ('Origen', d('origen')), ('Base', 'Buenos Aires, Argentina'), ('Rol', 'DJ · Productor · Compositor'),
    ('Proyecto', 'Fundador de Somos Uno'), ('Estudio', 'Ableton Live · +3 años'), ('Escenarios', '4 países'),
]
facts_html = ''.join(
    f'<div style="padding:13px 0;border-top:1px solid var(--line)"><div style="font:700 10.5px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">{k}</div>'
    f'<div style="margin-top:7px;font:600 15px/1.3 var(--sans);color:var(--white)">{v}</div></div>' for k, v in facts)
pages.append(f'''
<section class="page left-glow" id="p3">
  <img src="img/bio_photo.png" style="position:absolute;left:0;top:-250px;width:620px;height:1102px;object-fit:cover">
  <div style="position:absolute;left:380px;top:0;width:340px;height:100%;background:linear-gradient(90deg,transparent,#000 92%)"></div>
  <div style="position:absolute;left:700px;top:0;right:0;height:100%;background:#000"></div>
  <div class="z" style="position:absolute;left:740px;top:64px;width:600px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="kicker">01 — Biografía</span>
      <img src="img/logo_evo.png" style="width:250px;filter:drop-shadow(0 0 18px rgba(255,255,255,.22))">
    </div>
    <p class="lead" style="margin-top:22px">EVO es <b>DJ, productor y compositor</b> de música electrónica. Ecuatoriano radicado en Buenos Aires, es el fundador de la productora <b>Somos Uno</b>.</p>
    <p class="body" style="margin-top:14px">Nació en {d('origen')} y llegó a Buenos Aires en {d('llegada_bsas')}. {d('inicios')}</p>
    <p class="body" style="margin-top:12px">Lleva más de tres años produciendo en <b>Ableton Live</b>, herramienta que domina al punto de haber diseñado su propio curso de producción, <i>De la idea al track de club</i>, pensado para Melt Akademy. Su sonido baila sobre la delgada línea de los subgéneros: de la energía del <b>techno</b> y el <b>garage</b> a la emoción del <b>house</b> y el <b>minimal</b>.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;column-gap:26px;margin-top:22px">{facts_html}</div>
  </div>
  {folio(3, 'Biografía')}{fx()}
</section>''')

# 04 ─ HISTORIA ────────────────────────────────────────────
miles = [
    (d('anio_inicio'), 'Primeros pasos', 'Comienza a producir en Ableton Live y a construir su identidad como DJ.'),
    (d('anio_somos_uno'), 'Nace Somos Uno', 'Funda en Buenos Aires su productora de minimal, house y techno. Sus fechas llegan a reunir 200 personas.'),
    ('Dic 2025', 'Primera gira internacional', 'De la mano de Under City Productions, encabeza Narnia Sessions 2 en Tegucigalpa ante más de 300 personas.'),
    ('Ago 2026', 'Toronto', 'Se presenta en Chotto Matte y lleva su música a Canadá.'),
    ('Oct 2026', 'Somos Uno × Melt', 'La productora lleva su concepto a Melt Underground, en Buenos Aires. ' + tbd('confirmar')),
]
mh = ''
for i, (y, t, txt) in enumerate(miles):
    mh += (f'<div style="position:relative;padding-top:46px">'
           f'<div style="position:absolute;top:0;left:0;width:20px;height:20px;border-radius:50%;background:#e9f5ea;box-shadow:0 0 0 6px rgba(169,228,182,.18),0 0 22px rgba(169,228,182,.8)"></div>'
           f'<div style="font:700 italic 26px/1.1 var(--serif);color:var(--white)">{y}</div>'
           f'<div style="margin-top:10px;font:700 12px/1.3 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--mint)">{t}</div>'
           f'<p class="body" style="margin-top:10px;font-size:15px">{txt}</p></div>')
pages.append(f'''
<section class="page lattice beams" id="p4">
  <div class="z" style="position:absolute;left:96px;top:72px;width:1248px">
    <span class="kicker">02 — Historia</span>
    <div style="display:flex;gap:70px;align-items:flex-end;margin-top:20px">
      <h1 class="title" style="flex:none">Historia</h1>
      <p class="lead" style="font-size:19px;color:var(--muted);padding-bottom:6px">De Ecuador a Buenos Aires, de las fiestas propias a su primera gira internacional: el recorrido de un artista que construye escena desde la pista.</p>
    </div>
    <div style="position:relative;margin-top:56px">
      <div style="position:absolute;left:10px;right:0;top:9px;height:2px;background:linear-gradient(90deg,rgba(233,245,234,.8),rgba(233,245,234,.15))"></div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:34px">{mh}</div>
    </div>
    <div class="glass" style="margin-top:46px;padding:24px 40px;display:flex;justify-content:space-between;align-items:center">
      <div class="stat"><div class="n" style="font-size:52px">4</div><div class="l">Países</div></div>
      <div class="stat"><div class="n" style="font-size:52px">+300</div><div class="l">Personas en Tegucigalpa</div></div>
      <div class="stat"><div class="n" style="font-size:52px">200</div><div class="l">Pico en Somos Uno</div></div>
      <div class="stat"><div class="n" style="font-size:52px">+3</div><div class="l">Años produciendo</div></div>
      <div class="stat"><div class="n" style="font-size:52px">3</div><div class="l">Releases propios</div></div>
    </div>
  </div>
  {spark(1310, 70, 40, .8)}
  {folio(4, 'Historia')}{fx()}
</section>''')

# 05 ─ SONIDO / GÉNEROS ────────────────────────────────────
pages.append(f'''
<section class="page" id="p5" style="background:linear-gradient(90deg,#03702a 0%,#055d22 40%,#011a08 70%,#000 100%)">
  <img src="img/genres_photo.png" style="position:absolute;left:-94px;top:-124px;width:1621px;height:1058px;object-fit:cover">
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
  {folio(5, 'Sonido')}{fx()}
</section>''')

# 06 ─ SOMOS UNO ───────────────────────────────────────────
pillars = [('01', 'Unidad', 'Público, artistas y espacio son una sola cosa. Sin distancia entre la cabina y la pista.'),
           ('02', 'Conexión', 'Minimal, house y techno de groove largo, con un line up que cuenta una sola historia.'),
           ('03', 'Consciencia', 'Una noche cuidada: respeto entre todos y por el lugar que los recibe.')]
ph = ''.join(f'<div class="glass" style="padding:20px 20px 18px"><div style="font:400 italic 30px/1 var(--serif);color:var(--mint)">{n}</div>'
             f'<div style="margin-top:10px;font:700 21px/1 var(--serif);text-transform:uppercase;color:var(--white);letter-spacing:.04em">{t}</div>'
             f'<p class="body" style="margin-top:10px;font-size:14px;line-height:1.5">{x}</p></div>' for n, t, x in pillars)
pages.append(f'''
<section class="page lattice" id="p6">
  <div class="z" style="position:absolute;left:96px;top:66px;width:760px">
    <span class="kicker">04 — Productora</span>
    <h1 class="title" style="margin-top:18px">Somos Uno</h1>
    <p class="lead" style="margin-top:20px;font-size:19.5px">En {d('anio_somos_uno')} EVO fundó <b>Somos Uno</b>, una productora de fiestas de minimal, house y techno en Buenos Aires que nace de una idea simple: <i>en la pista nadie baila solo.</i></p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px">{ph}</div>
    <div style="display:flex;gap:46px;margin-top:30px">
      <div class="stat"><div class="n">200</div><div class="l">Personas</div><div class="d">Pico de asistencia<br>en una fecha</div></div>
      <div class="stat"><div class="n" style="font-size:40px;padding-top:14px">ODA · Sandman</div><div class="l">Crew estable</div><div class="d">Alianza con Under City<br>Productions</div></div>
      <div class="stat"><div class="n" style="font-size:40px;padding-top:14px">{d('fechas_somos_uno')}</div><div class="l">Fechas realizadas</div></div>
    </div>
  </div>
  <div class="z" style="position:absolute;left:960px;top:96px;width:360px">
    <div class="card" style="width:360px;height:450px;transform:rotate(2.2deg)"><img src="img/fl_secret.jpg"></div>
    <img class="flare" src="img/flare.png" style="right:-80px;top:-50px">
    <p style="margin-top:26px;font:700 12px/1.5 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--muted);text-align:center">Secret Party · EVO, ODA, Sandman</p>
    <a href="{L['su']}" style="display:block;text-align:center;margin-top:14px"><span class="chip">Instagram · @somos.uno._ ↗</span></a>
  </div>
  {folio(6, 'Somos Uno')}{fx()}
</section>''')


# 07/08 ─ DISCOGRAFÍA + LIVE SETS ─────────────────────────
def media_row(items):
    out = ''
    for it in items:
        big = it.get('big')
        w, h = (470, 264) if big else (360, 203)
        flare = '<img class="flare" src="img/flare.png" style="left:-70px;top:-58px">' if big else ''
        meta = ''.join(f'<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--line);font-size:13.5px">'
                       f'<span style="font-weight:700;letter-spacing:.2em;text-transform:uppercase;font-size:10.5px;color:var(--mint);padding-top:2px">{k}</span>'
                       f'<span style="color:var(--white);text-align:right">{v}</span></div>' for k, v in it['meta'])
        out += (f'<div style="width:{w}px;position:relative">{flare}'
                f'<a href="{it["url"]}" class="card" style="display:block;width:{w}px;height:{h}px"><img src="img/{it["img"]}"><span class="play"></span></a>'
                f'<div style="margin-top:18px;font:700 {"23" if big else "19"}px/1.2 var(--serif);color:var(--white)">{it["title"]}</div>'
                f'<div style="margin:4px 0 12px;font-size:13px;color:var(--muted)">{it["sub"]}</div>{meta}'
                f'<a href="{it["url"]}" style="display:inline-block;margin-top:10px;font:700 11px/1 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--mint)">Ver en YouTube ↗</a></div>')
    return out


rel = [
    dict(img='rel_sunsetin.jpg', url=L['rel_sunsetin'], title='sunsetIN un planeta muy lejos', sub='EVO · Single',
         meta=[('Año', d('anio_sunsetin')), ('Reprod.', d('plays_sunsetin'))]),
    dict(img='rel_heaven.jpg', url=L['rel_heaven'], title='Heaven Beyond', sub='EVO · Single', big=True,
         meta=[('Año', d('anio_heaven')), ('Reprod.', d('plays_heaven'))]),
    dict(img='rel_journeyman.jpg', url=L['rel_journeyman'], title='★彡 Journeyman Letter 彡★', sub='EVO ft. Kta · Single',
         meta=[('Año', d('anio_journeyman')), ('Reprod.', d('plays_journeyman'))]),
]
pages.append(f'''
<section class="page lattice" id="p7">
  <div class="z center" style="position:absolute;left:0;right:0;top:58px">
    <span class="kicker center">05 — Releases</span>
    <h1 class="title" style="margin-top:14px">Discografía</h1>
  </div>
  <div class="z" style="position:absolute;left:80px;right:80px;top:214px;display:flex;justify-content:space-between;align-items:flex-start">{media_row(rel)}</div>
  {spark(1240, 92, 34, .8)}{spark(176, 120, 22, .6)}
  {folio(7, 'Discografía')}{fx()}
</section>''')

sets = [
    dict(img='set_minimal.jpg', url=L['set_minimal'], title='Minimal House Electro Mix', sub='DJ set · YouTube',
         meta=[('Vistas', d('views_minimal'))]),
    dict(img='set_corrupt.jpg', url=L['set_corrupt'], title='Corrupt the House', sub='DJ set · YouTube', big=True,
         meta=[('Vistas', d('views_corrupt'))]),
    dict(img='set_toxic.jpg', url=L['set_toxic'], title='this set feels like a toxic relationship', sub='DJ set · YouTube',
         meta=[('Vistas', d('views_toxic'))]),
]
pages.append(f'''
<section class="page lattice" id="p8">
  <div class="z center" style="position:absolute;left:0;right:0;top:58px">
    <span class="kicker center">06 — En vivo</span>
    <h1 class="title" style="margin-top:14px">Live sets</h1>
  </div>
  <div class="z" style="position:absolute;left:80px;right:80px;top:214px;display:flex;justify-content:space-between;align-items:flex-start">{media_row(sets)}</div>
  {spark(1240, 92, 34, .8)}{spark(176, 120, 22, .6)}
  {folio(8, 'Live sets')}{fx()}
</section>''')

# 09 ─ unRELEASED ──────────────────────────────────────────
pages.append(f'''
<section class="page lattice" id="p9">
  <div class="z center" style="position:absolute;left:0;right:0;top:58px">
    <span class="kicker center">07 — Exclusivo</span>
    <h1 class="title" style="margin-top:14px;text-transform:none">un<span style="text-transform:uppercase">RELEASED</span></h1>
    <p style="margin-top:16px;font:700 19px/1.4 var(--sans);color:var(--white)">Dale click para tener un acceso exclusivo al baúl de EVO *</p>
  </div>
  <div style="position:absolute;left:520px;top:250px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,170,90,.28),transparent 65%)"></div>
  <a href="{L['vault']}" class="card z" style="position:absolute;left:546px;top:262px;width:348px;height:348px;border-radius:10px"><img src="img/vault.png" style="image-rendering:pixelated"></a>
  <div style="position:absolute;left:560px;top:624px;width:320px;height:26px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.6),transparent 70%)"></div>
  <img class="flare" src="img/flare.png" style="left:800px;top:200px">
  {spark(470, 300, 40, .85)}{spark(930, 560, 28, .7)}
  <p class="z center" style="position:absolute;left:0;right:0;top:676px;font:400 italic 17px/1.4 var(--sans);color:var(--ink)">*Contenido privado y con derechos de autor. Por favor, manejar con absoluta discreción.</p>
  {folio(9, 'unRELEASED')}{fx()}
</section>''')

# 10 ─ GIRAS Y SHOWS ───────────────────────────────────────
countries = [
    ('AR', 'Argentina', 'Buenos Aires', [
        ('Somos Uno', 'Fechas propias · Secret Party'), ('Kiany Fest', d('fecha_kiany')), ('Lumina Fest', d('fecha_lumina')),
        ('Spiral Rave', d('fecha_spiral')), ('Melt Underground', 'Próxima fecha · 11.10.2026')]),
    ('EC', 'Ecuador', 'Quito', [('Club La Catedral', '13 de junio · ' + d('anio_catedral'))]),
    ('HN', 'Honduras', 'Tegucigalpa', [('Narnia Sessions 2', 'Under City · 27.12.2025'), ('Primera gira internacional', '+300 personas')]),
    ('CA', 'Canadá', 'Toronto', [('Chotto Matte', 'Agosto 2026')]),
]
ch = ''
for code, name, city, shows in countries:
    rows = ''.join(f'<div style="padding:10px 0;border-top:1px solid var(--line)"><div style="font:700 15.5px/1.25 var(--sans);color:var(--white)">{v}</div>'
                   f'<div style="margin-top:4px;font-size:13px;color:var(--muted)">{w}</div></div>' for v, w in shows)
    ch += (f'<div class="glass" style="padding:22px 22px 14px">'
           f'<div style="display:flex;align-items:center;gap:12px"><span style="width:42px;height:42px;border-radius:50%;border:1.5px solid var(--mint);display:grid;place-items:center;font:700 13px/1 var(--sans);letter-spacing:.1em;color:var(--mint);box-shadow:0 0 14px rgba(169,228,182,.35)">{code}</span>'
           f'<div><div style="font:700 22px/1 var(--serif);text-transform:uppercase;color:var(--white)">{name}</div><div style="margin-top:5px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)">{city}</div></div></div>'
           f'<div style="margin-top:16px">{rows}</div></div>')
pages.append(f'''
<section class="page lattice beams" id="p10">
  <div class="z" style="position:absolute;left:96px;top:62px;right:96px">
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div><span class="kicker">08 — En escena</span><h1 class="title" style="margin-top:16px">Giras y shows</h1></div>
      <div style="display:flex;gap:56px;padding-bottom:6px">
        <div class="stat"><div class="n">4</div><div class="l">Países</div></div>
        <div class="stat"><div class="n">+300</div><div class="l">Personas · Tegucigalpa</div></div>
        <div class="stat"><div class="n">200</div><div class="l">Personas · Somos Uno</div></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;gap:18px;margin-top:38px;align-items:stretch">{ch}</div>
    <div style="margin-top:22px;display:flex;align-items:center;gap:22px;padding:18px 26px;border-radius:14px;background:linear-gradient(90deg,rgba(169,228,182,.16),rgba(169,228,182,.02));border:1px solid rgba(169,228,182,.35)">
      <span class="chip" style="border-color:var(--mint);color:var(--mint)">Próxima fecha</span>
      <span style="font:700 italic 24px/1 var(--serif);color:var(--white)">Somos Uno × Melt Underground</span>
      <span style="color:var(--muted);font-size:15px">Domingo 11 de octubre de 2026 · Laprida 1423, Buenos Aires</span>
      <span style="flex:1"></span>{tbd('confirmar')}
    </div>
  </div>
  {folio(10, 'Giras y shows')}{fx()}
</section>''')

# 11 ─ EVENTOS (flyers) ────────────────────────────────────
fl = [('fl_catedral.jpg', 'Quito, Ecuador', 'Club La Catedral'), ('fl_kiany.jpg', 'Buenos Aires, Argentina', 'Kiany Fest'),
      ('fl_secret.jpg', 'Buenos Aires, Argentina', 'Somos Uno · Secret Party'), ('fl_narnia.jpg', 'Tegucigalpa, Honduras', 'Under City · Narnia Sessions 2')]
fh = ''.join(f'<div style="width:300px;text-align:center"><div class="card" style="width:300px;height:375px;border-width:2px;border-radius:12px"><img src="img/{f}"></div>'
             f'<div style="margin-top:20px;font:600 17px/1.35 var(--sans);color:var(--white)">{a}</div><div style="font-size:15px;color:var(--muted)">{b}</div></div>' for f, a, b in fl)
pages.append(f'''
<section class="page lattice" id="p11">
  <div style="position:absolute;left:0;right:0;top:300px;height:260px;background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(190,220,60,.22),transparent 70%)"></div>
  <div class="z center" style="position:absolute;left:0;right:0;top:56px">
    <span class="kicker center">09 — Flyers</span>
    <h1 class="title" style="margin-top:14px">Eventos</h1>
  </div>
  <div class="z" style="position:absolute;left:84px;right:84px;top:226px;display:flex;justify-content:space-between">{fh}</div>
  <img class="flare" src="img/flare.png" style="left:-10px;top:170px;width:230px">
  <img class="flare" src="img/flare.png" style="right:-20px;top:170px;width:230px">
  {folio(11, 'Eventos')}{fx()}
</section>''')

# 12 ─ COLABORACIONES ──────────────────────────────────────
collabs = [
    ('Kta', 'Featuring', f'Featuring en <b>★彡 Journeyman Letter 彡★</b>. {d("quien_es_kta")}', L['rel_journeyman']),
    ('ZOEN', 'Kiany Fest', f'Comparten el capítulo «Techno Journey» del line up (EVO || ZOEN). {tbd("¿fue b2b?")}', None),
    ('ODA', 'Crew Somos Uno', 'Parte del equipo estable de la productora. Line up en Secret Party y Narnia Sessions 2.', None),
    ('Sandman', 'Crew Somos Uno', 'Parte del equipo estable de la productora. Line up en Secret Party y Narnia Sessions 2.', None),
    ('Under City Productions', 'Alianza', 'Productora hondureña de minimal con base en Argentina. Lo llevó a su primera gira internacional.', None),
    ('Melt Underground', 'Buenos Aires', f'Fechas Somos Uno × Melt y curso de producción en Ableton Live 12 para Melt Akademy. {tbd("estado")}', None),
]
cc = ''.join(f'<div class="glass" style="padding:26px 26px 24px;position:relative;min-height:196px">'
             f'<div style="font:700 11px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">{r}</div>'
             f'<div style="margin-top:12px;font:700 30px/1.05 var(--serif);color:var(--white)">{n}</div>'
             f'<p class="body" style="margin-top:12px;font-size:14.5px;line-height:1.55">{t}</p>'
             + (f'<a href="{u}" style="display:inline-block;margin-top:12px;font:700 11px/1 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--mint)">Escuchar ↗</a>' if u else '')
             + '</div>' for n, r, t, u in collabs)
pages.append(f'''
<section class="page lattice" id="p12">
  <div class="z" style="position:absolute;left:96px;top:62px;right:96px">
    <span class="kicker">10 — Featuring y alianzas</span>
    <h1 class="title" style="margin-top:16px">Colaboraciones</h1>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:38px">{cc}</div>
  </div>
  {spark(1290, 80, 40, .8)}
  {folio(12, 'Colaboraciones')}{fx()}
</section>''')

# 13 ─ PRENSA ──────────────────────────────────────────────
press = DATA.get('prensa') or []
if press:
    pc = ''.join(f'<a href="{p["url"]}" class="glass" style="display:block;padding:26px">'
                 f'<div style="font:700 11px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">{p["medio"]} · {p["fecha"]}</div>'
                 f'<div style="margin-top:14px;font:700 24px/1.2 var(--serif);color:var(--white)">{p["titulo"]}</div>'
                 f'<p class="body" style="margin-top:12px;font-size:14.5px">{p.get("bajada","")}</p>'
                 f'<div style="margin-top:14px;font:700 11px/1 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--mint)">Leer nota ↗</div></a>' for p in press)
else:
    pc = ''.join(f'<div class="glass" style="padding:26px;border-style:dashed;min-height:250px">'
                 f'<div style="font:700 11px/1 var(--sans);letter-spacing:.3em;text-transform:uppercase;color:var(--mint)">Medio · fecha</div>'
                 f'<div style="margin-top:16px">{tbd("nota / entrevista " + str(i))}</div>'
                 f'<p class="body" style="margin-top:14px;font-size:14px">Título, bajada y link a la nota, entrevista, radio o podcast.</p></div>' for i in (1, 2, 3))
pages.append(f'''
<section class="page lattice beams" id="p13">
  <div class="z" style="position:absolute;left:96px;top:62px;right:96px">
    <span class="kicker">11 — Medios</span>
    <h1 class="title" style="margin-top:16px">Prensa</h1>
    <p class="lead" style="margin-top:16px;width:760px;font-size:19px;color:var(--muted)">Notas, entrevistas y apariciones en medios.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:36px">{pc}</div>
  </div>
  {folio(13, 'Prensa')}{fx()}
</section>''')

# 14 ─ PLATAFORMAS Y REDES ─────────────────────────────────
plats = [
    ('ig', 'Instagram', '@evo.evo.evo._', d('seguidores_ig'), 'Seguidores', L['ig']),
    ('yt', 'YouTube', '@evo_evo_evo_evo', d('subs_yt'), 'Suscriptores', L['yt']),
    ('sc', 'SoundCloud', 'evo-shajt', d('seguidores_sc'), 'Seguidores', L['sc']),
    ('ig', 'Somos Uno', '@somos.uno._', d('seguidores_somos_uno'), 'Seguidores', L['su']),
]
qr = {'Instagram': 'qr_ig', 'YouTube': 'qr_yt', 'SoundCloud': 'qr_sc', 'Somos Uno': 'qr_su'}
pp = ''.join(f'<a href="{u}" class="glass" style="display:block;padding:24px;text-align:center">'
             f'<div style="width:{70 if k == "sc" else 50}px;height:50px;margin:0 auto;color:#fff;display:flex;align-items:center;justify-content:center">{ICON[k]}</div>'
             f'<div style="margin-top:14px;font:700 24px/1 var(--serif);text-transform:uppercase;color:var(--white)">{n}</div>'
             f'<div style="margin-top:8px;font-size:14px;color:var(--muted)">{h}</div>'
             f'<div style="margin:16px auto 0;width:128px;height:128px;padding:10px;background:#eef3ec;border-radius:12px;box-shadow:0 10px 24px rgba(0,0,0,.45)"><img src="img/{qr[n]}.svg" style="width:100%;height:100%"></div>'
             f'<div style="margin-top:16px;font:700 26px/1 var(--serif);color:var(--white)">{c}</div>'
             f'<div style="margin-top:6px;font:700 10.5px/1 var(--sans);letter-spacing:.28em;text-transform:uppercase;color:var(--mint)">{lbl}</div></a>'
             for k, n, h, c, lbl, u in plats)
pages.append(f'''
<section class="page lattice" id="p14">
  <div class="z" style="position:absolute;left:96px;top:62px;right:96px">
    <span class="kicker">12 — Online</span>
    <h1 class="title" style="margin-top:16px">Plataformas y redes</h1>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:36px">{pp}</div>
  </div>
  {spark(1290, 80, 40, .8)}
  {folio(14, 'Plataformas')}{fx()}
</section>''')

# 15 ─ TECH RIDER ──────────────────────────────────────────
gear = ['1x Pioneer DJM 900 o A9', '2x CDJ 3000 / 2000 / NXS2 linkeadas y con la última actualización', 'Monitoreo de cabina']
gh = ''.join(f'<div style="display:flex;align-items:center;gap:12px;justify-content:center;padding:3px 0;font:700 16px/1.3 var(--sans);text-transform:uppercase;color:var(--white);letter-spacing:.03em">'
             f'<span style="width:7px;height:7px;transform:rotate(45deg);background:var(--mint);box-shadow:0 0 8px var(--mint)"></span>{g}</div>' for g in gear)
pages.append(f'''
<section class="page" id="p15">
  <img src="img/techrider.png" class="z" style="position:absolute;left:363px;top:30px;width:714px;filter:drop-shadow(0 0 18px rgba(255,255,255,.25))">
  <img src="img/techrider.png" style="position:absolute;left:363px;top:88px;width:714px;transform:scaleY(-1);opacity:.22;-webkit-mask-image:linear-gradient(0deg,#000,transparent 85%);mask-image:linear-gradient(0deg,#000,transparent 85%)">
  <div class="z" style="position:absolute;left:0;right:0;top:136px">{gh}</div>
  <div style="position:absolute;left:300px;right:300px;top:482px;height:60px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.65),transparent 70%)"></div>
  <img src="img/monitor.png" class="z" style="position:absolute;left:107px;top:300px;width:204px;filter:drop-shadow(0 18px 18px rgba(0,0,0,.55))">
  <img src="img/cdj.png" class="z" style="position:absolute;left:345px;top:272px;width:326px;filter:drop-shadow(0 18px 18px rgba(0,0,0,.55))">
  <img src="img/mixer.png" class="z" style="position:absolute;left:548px;top:254px;width:353px;filter:drop-shadow(0 18px 18px rgba(0,0,0,.55))">
  <img src="img/cdj.png" class="z" style="position:absolute;left:786px;top:272px;width:326px;filter:drop-shadow(0 18px 18px rgba(0,0,0,.55))">
  <img src="img/monitor.png" class="z" style="position:absolute;left:1129px;top:300px;width:204px;transform:scaleX(-1);filter:drop-shadow(0 18px 18px rgba(0,0,0,.55))">
  <p class="z center" style="position:absolute;left:0;right:0;top:530px;font:700 17px/1.4 var(--sans);color:var(--white)">En caso de necesitar, el artista cuenta con controladora profesional <span style="color:var(--mint)">XDJ-AERO</span></p>
  <img src="img/xdj.png" class="z" style="position:absolute;left:545px;top:568px;width:350px;filter:drop-shadow(0 16px 16px rgba(0,0,0,.6))">
  {folio(15, 'Tech rider')}{fx()}
</section>''')

# 16 ─ CONTACTO ────────────────────────────────────────────
links = [('ig', 'Instagram', '@evo.evo.evo._', L['ig']), ('yt', 'YouTube', '@evo_evo_evo_evo', L['yt']),
         ('sc', 'SoundCloud', 'evo-shajt', L['sc'])]
lh = ''.join(f'<a href="{u}" style="display:flex;align-items:center;gap:18px;padding:16px 6px;border-bottom:1.5px solid rgba(255,255,255,.8)">'
             f'<span style="width:{44 if k == "sc" else 30}px;color:#fff;display:flex">{ICON[k]}</span>'
             f'<span style="font:800 28px/1 var(--sans);color:var(--white);letter-spacing:.02em">{n.upper()}</span>'
             f'<span style="flex:1"></span><span style="font-size:15px;color:var(--muted)">{h} ↗</span></a>' for k, n, h, u in links)
pages.append(f'''
<section class="page" id="p16">
  <img src="img/symbol.png" style="position:absolute;left:-120px;top:170px;width:560px;opacity:.05">
  <div class="z center" style="position:absolute;left:0;right:0;top:52px">
    <span class="kicker center">Booking y prensa</span>
    <h1 style="margin-top:14px;font:400 90px/1 var(--serif);color:var(--white);letter-spacing:.02em;text-shadow:0 0 28px rgba(255,255,255,.3),0 6px 20px rgba(0,0,0,.5)">CONTACTO</h1>
  </div>
  <div class="z" style="position:absolute;left:400px;width:640px;top:232px">{lh}</div>
  <div class="z center" style="position:absolute;left:0;right:0;top:500px"><a href="{L['mail']}" style="display:inline-block;font:700 62px/1 var(--sans);color:var(--white);text-shadow:0 0 26px rgba(255,255,255,.25)">evo.evomusic@gmail.com</a></div>
  <img src="img/logo_evo.png" class="z" style="position:absolute;left:620px;top:612px;width:200px;opacity:.9">
  {spark(380, 470, 34, .8)}{spark(1050, 600, 26, .7)}
  {folio(16, 'Contacto')}{fx()}
</section>''')

html = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>EVO · Press Kit 2026</title>
<link rel="stylesheet" href="fonts.css"><link rel="stylesheet" href="style.css"></head><body>
{''.join(pages)}
</body></html>'''
open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(html)
print('ok', len(pages), 'páginas')
