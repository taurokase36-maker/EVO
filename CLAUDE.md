# EVO · contexto del proyecto

## Quién
- **Nombre público del artista: EVO THE SUN** (ya no "EVO" solo). DJ y productor ecuatoriano en Buenos Aires.
- Productora: **Somos Uno** (`@somos.uno._`). Contacto: evo.evomusic@gmail.com.
- Álbum en curso: **THE SUN** (sale de a un single). En la fiesta se menciona solo como detalle, nunca en el título.

## La fiesta: SOLARIS · for the solar people
- Serie de fiestas de Somos Uno (sin número). Primera fecha: **domingo 11/10/2026, 18:00–03:00, Melt Underground** (Laprida 1423, Recoleta). Presentan **Somos Uno × Melt Underground**.
- Slogan bilingüe: **FOR THE SOLAR PEOPLE** / para la gente del sol. La gente es la "solar people".
- Concepto: la caverna de Platón, contada de forma sutil. Entrás con el ocaso, salís a las 3 con otra luz. La música es el sol. No se nombra a Platón.
- Line up oficial: 18:00 COCO · 19:30 GREMORA B2B SANDMAN · 21:00 ODA · 22:30 EVO THE SUN · 00:00 LUCILA · 01:30 RUF.
- **Invitado especial: Damian Santos**, saxo en vivo sobre base electrónica, durante el set de EVO THE SUN. Siempre aparte de EVO THE SUN, como invitado especial.

## Estética
- Eclipse: negro `#070202`, corona rojo oscuro `#6b0d07`, acento `#d9482c`, crema `#efe2d6`, fuego `#e8803a`.
- Logo: **"solaris" en Major Mono Display, siempre en minúscula** (todas las letras del mismo grosor). La O puede ser un sol eclipsado. Textos chicos en Space Mono, prosa en Cormorant Garamond italic, inscripciones en griego con GFS Didot.
- Grabado antiguo (líneas), sombras sobre la pared de la caverna, fuego, números romanos (XVIII → III).
- La mascota: el muñeco de palitos que baila (las sombras de la pared). Animación fluida y sutil.

## Dónde está cada cosa
- `somos-uno-entradas/`: web de entradas en PHP para Hostinger (modo simple con links de Mercado Pago). Guía: `GUIA-WEB.md`. Zip para subir: `somos-uno-entradas/somos-uno-entradas.zip`.
- `contenido/`: piezas de redes (`piezas.html` + `motor.js`, se exportan con `node contenido/render.js`), textos y calendario en `copys.md`.
- `visuales/`: visuales en vivo para Chrome con MIDI (Xone:K2). `python3 visuales/empaquetar.py` genera el archivo único y la copia de la web.
- `teaser/`: animación del eclipse a 127 BPM (`node teaser/render.js`).
- `fuentes/`: tipografías locales. Al exportar con Chromium headless usarlas siempre, porque Google Fonts no carga en este entorno.
- `PENDIENTES.md`: lo que falta.
