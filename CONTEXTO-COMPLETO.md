# EVO THE SUN · SOLARIS · Contexto completo para seguir trabajando

> **Para el asistente que lea esto:** este documento resume todo lo que se hizo y se decidió hasta el **5 de octubre de 2026**, trabajando con EVO en Claude Code (nube). Leelo entero antes de responder. Tiene los datos del artista, del evento, de la web, lo pendiente, cómo le gusta trabajar y los errores que ya pasaron, para no repetirlos.

---

## 0. Cómo usar este archivo

- **En el chat de Claude (app o web):** creá un **Proyecto** ("EVO THE SUN") y subí este archivo a sus **archivos o conocimiento**. En las instrucciones del proyecto pegá: *"Leé CONTEXTO-COMPLETO.md antes de responder. Hablame en español rioplatense, paso a paso y simple."*
- **En Claude Code en tu computadora:** cloná el repo (ver sección 9) y este archivo y `CLAUDE.md` ya quedan dentro. Claude Code los lee solo.
- **Límite del chat normal:** no puede tocar tus archivos ni tu Hostinger. Te va a dar el código o el texto y vos lo subís. Para cambios grandes en la web conviene Claude Code local, con el repo clonado.

---

## 1. El artista: EVO THE SUN

- **Nombre público: EVO THE SUN.** Antes era "EVO" solo; ya no se usa así.
- **DJ, productor y compositor** de música electrónica. Nacido en **Guayaquil, Ecuador**. Vive en **Buenos Aires desde 2024**.
- **Sonido:** minimal, house y techno (también garage). "Baila sobre la delgada línea de los subgéneros". Sets de groove largo, para que la pista viaje junta.
- **Fundador de la productora Somos Uno** (2024).
- **Contacto:** evo.evomusic@gmail.com
- **Redes:**
  - Instagram: `@evo.evo.evo._` (pendiente renombrar a EVO THE SUN)
  - YouTube: `@evo_evo_evo_evo`
  - SoundCloud: `evo-shajt`
  - Somos Uno: `@somos.uno._`
- **Trayectoria (del press kit):**
  - 2023, Quito: Club La Catedral (13/6/2023), sala electrónica, junto a Alejandro Soria y Jose Coo.
  - 2024, Buenos Aires: se instala y funda Somos Uno.
  - Buenos Aires 2024–2025: Kiany Fest (capítulo "Techno Journey", EVO || ZOEN), Lumina Fest, Spiral Rave, Somos Uno Secret Party.
  - Honduras, Tegucigalpa: Under City · Narnia Sessions 2 (primera gira internacional, con Under City Productions, productora hondureña de minimal con base en Argentina).
  - Somos Uno: 4 eventos oficiales, pico de 200 personas en una fecha.
  - Sello: próximo tema en **Lovely**, el sello de **Nic Fakie**.
  - Melt Underground: nueva casa de Somos Uno desde el 11/10/2026. EVO da un curso de producción en **Ableton Live 12** en **Melt Akademy**.
- **Álbum en curso: THE SUN.** Sale de a un single. En la fiesta se menciona **solo como detalle**, nunca en el título: "esa noche EVO THE SUN estrena el primer single de THE SUN".

## 2. Somos Uno

- Productora de fiestas de minimal, house y techno en Buenos Aires. Idea base: *"en la pista nadie baila solo"*.
- Instagram **`@somos.uno._`**.
- **Logo:** una onda (como una S acostada) con una barra que la cruza al medio y dos puntos en las puntas. **Siempre en vertical.** El archivo correcto es `somos-uno-entradas/public_html/assets/logo.svg`, con el mismo trazo que usan las visuales (`visuales/visuales.js`). El logo viejo, parecido a un signo `$`, está mal: no usarlo.

## 3. La fiesta: SOLARIS · for the solar people

| | |
|---|---|
| Nombre | **SOLARIS · for the solar people** (para la gente del sol). Primero se llamó THE SUN y después THE ECLIPSE; los dos nombres se descartaron |
| Presentan | **Somos Uno × Melt Underground** |
| Fecha | **Domingo 11/10/2026, de 18:00 a 03:00** |
| Lugar | **Melt Underground**, Laprida 1423, Recoleta, Buenos Aires (es un sótano) |
| Capacidad | 160 personas |
| Edad | +18 con DNI |
| Géneros | minimal · house · techno |
| Slogan | **FOR THE SOLAR PEOPLE** / para la gente del sol. Al público se le dice "solar people" |
| Serie | Serie de fiestas de Somos Uno, sin número. "Y va a volver" |

**Line up oficial:**
- 18:00 — 19:30 **COCO**
- 19:30 — 21:00 **GREMORA B2B SANDMAN**
- 21:00 — 22:30 **ODA**
- 22:30 — 00:00 **EVO THE SUN**
- 00:00 — 01:30 **LUCILA**
- 01:30 — 03:00 **RUF**, *dj invitado internacional*, de la mano de **Kankari Music Lab**, productora de música electrónica de Guayaquil, Ecuador. Instagram **`@kankarimusiclab`**. Antes se usaba `@kankariclub`, que ya no va.

**Invitado especial: Damian Santos**, saxofón en vivo, durante el set de EVO THE SUN. Siempre aparece **aparte** de EVO THE SUN, como invitado especial. En la web solo dice "Saxofón en vivo", sin horario. Pendiente confirmar si se escribe Damián, con tilde, y su Instagram.

**Concepto:** la caverna de Platón contada de forma sutil, **sin nombrar a Platón**. Entrás con el ocaso, te quedás en la oscuridad del sótano y salís a las 3 con otra luz. La música es el sol. El 10/10 hay luna nueva; el 11 la luna se esconde a las 20:26, detrás del sol, y queda la noche más oscura del mes ("adentro, sale el sol").

**Los tres pilares (textos exactos de EVO):**
1. **Unidad:** "Aquí creemos en la empatía y el disfrute con respeto. Cuida del espacio y de quien baila a tu lado."
2. **Conexión:** "Promovemos el no uso del celular con el objetivo de aumentar tu presencia en la pista." Va con un ícono de celular tachado.
3. **Consciencia:** "Una selección musical y un lineup construido pensando en la energía de la pista y en una progresión natural de energía."

**Preguntas frecuentes (respuestas en minúscula, tono corto y con humor):**
- ¿qué es SOLARIS? → la nueva fiesta de somos uno. for the solar people: para la gente del sol. y va a volver.
- ¿hay show en vivo? → sí: damian santos toca saxo en vivo sobre base electrónica.
- ¿por qué ese día? → el 10 hay luna nueva. el 11 la luna se esconde a las 20:26, detrás del sol, y queda la noche más oscura del mes. adentro, sale el sol.
- ¿hay dress code? → **usar lo que te haga sentir más libre.**
- ¿es en un sótano? → **sí, y suena increíble.**
- ¿es una secta? → no, es minimal.
- ¿a qué hora termina? → a las 3:00.
- ¿hasta qué hora vale la lista amigos? → entrás hasta las 22:00. después, entrada general.
- ¿hasta qué hora valen las invitaciones? → hasta las 00:00. después, entrada general.
- ¿quién es RUF? → nuestro dj invitado internacional: llega desde Guayaquil de la mano de Kankari Music Lab y cierra la noche de 01:30 a 03:00.
- ¿hay edad mínima? → +18 con DNI.
- ¿puedo comprar en puerta? → sí, a precio general ($10.000). online sale menos con la lista amigos o la early bird.

## 4. Entradas (pesos argentinos)

Se cobra con **links de pago de Mercado Pago**. No hay integración por API: EVO eligió los links por ser más simples.

| Entrada | Precio | Cupo | Se cierra en la web | Link |
|---|---|---|---|---|
| **Lista amigos**: para amigos y conocidos, hay que **entrar antes de las 22:00**; después, entrada general | **$5.000** (con $10.000 tachado) | 40 | dom 11/10 22:00 | https://mpago.la/1JExs82 |
| **Early bird** | **$7.000** (con $10.000 tachado) | 30 | vie 9/10 23:59 | https://mpago.la/13HtgZh |
| **General** | **$10.000**, igual que en puerta | 65 | no se cierra | https://mpago.la/19N795Q |

- **Invitaciones** (gratis, nominales, con QR, valen **hasta las 00:00**): 25 en total, EVO THE SUN 15, ODA 5 y Sandman 5. Links: `somosuno.fun/invitacion.php?c=CODIGO`. Los códigos actuales son **los de ejemplo** (`evo-k7m2q`, `oda-r4t8w`, `sandman-p9x3v`) y están a la vista en el repo: **conviene cambiarlos**.
- **Lista gratis con mail:** existe en la web pero está **apagada** (`lista.enabled => false`), porque la lista de esta fecha es la "lista amigos" paga.
- **Embajadores:** `somosuno.fun/?ref=NOMBRE` (evo, oda, sandman, coco, gremora, lucila, ruf). Hoy solo marca quién trajo a quién en la lista y las invitaciones; las ventas por link de Mercado Pago no se rastrean.
- **En la puerta:** las invitaciones se escanean con QR; las compras por link se chequean en la actividad de Mercado Pago, por nombre y DNI.
- Con los links, **la web no ve las ventas**. El cupo se controla limitando unidades en cada link de Mercado Pago (pendiente hacerlo).
- Casa llena: unos $1.060.000 brutos y unos $1.003.700 netos (comisión de Mercado Pago del 5,31% cobrando a 10 días).

## 5. La web de entradas: somosuno.fun

**Hosting:** Hostinger, plan compartido. Se maneja desde **hPanel → Administrador de archivos → `public_html`**. Es PHP puro con SQLite, sin instalar nada.

**Direcciones:**
| Para qué | URL |
|---|---|
| Página pública | https://somosuno.fun |
| Panel (moderar la pizarra, invitaciones, CSV) | https://somosuno.fun/admin |
| Escáner de la puerta | https://somosuno.fun/admin/scan.php (con la misma contraseña del panel) |
| Pantalla del proyector (mensajes de la pizarra y "somos X") | https://somosuno.fun/pantalla.php |
| Visuales en vivo | https://somosuno.fun/visuales |

**Contraseña del panel:** la eligió EVO y está en `public_html/app/config.php` del servidor. **No está en el repo, a propósito.**

**Qué tiene la portada, de arriba hacia abajo:**
1. Los logos de **Somos Uno** (vertical) **× Melt Underground**, con sus nombres debajo. El logo de Melt es un webp con fondo transparente.
2. El título **"solaris"** en Major Mono Display, donde **la O es un sol eclipsado**: disco negro, aro crema, corona roja que respira y un punto de luz arriba a la derecha. Las letras **aparecen en fade una por una y después flotan apenas**.
3. "for the solar people", la fecha, "para la gente del sol.", la cuenta regresiva y los botones "comprar entrada" y "@somos.uno._" (Instagram).
4. Cuándo, dónde y qué suena. El line up, con RUF marcado como "invitado internacional". **Damian Santos** con un saxofón en vector al lado y "Saxofón en vivo". Un bloque de **RUF** con el logo de **Kankari Music Lab** (blanco con un triángulo verde de play) y un link a `@kankarimusiclab`.
5. El texto "for the solar people" y la nota del single de THE SUN.
6. Los tres pilares; el de Conexión con el celular tachado.
7. **LA PIZARRA** (título en mayúsculas): mensajes **anónimos**, de hasta 120 caracteres, que se publican **solo cuando EVO los aprueba** en el panel. Máximo 3 por hora desde una misma conexión, y un campo trampa para bots.
8. Las entradas: tres tarjetas, cada una con su botón "comprar en mercado pago".
9. Un bloque "seguir a @somos.uno._", las preguntas y el pie de página con Instagram.
10. **Música:** el track de EVO **"puro pad"** (`assets/musica.mp3`, 1 minuto, en loop, 160 kbps). **Arranca con el primer toque** en la página, porque los navegadores no permiten que suene sola, y sube de a poco. Un **sol abajo a la derecha** la silencia y la vuelve a prender: apagado se ve eclipsado y sonando, encendido y girando. En iPhone suena a volumen completo, porque iPhone no deja que la página lo controle.
11. Todo se anima con CSS liviano y se apaga si el celular tiene activado "reducir movimiento".

**Cómo moderar la pizarra (explicado a EVO):** entrar a `somosuno.fun/admin` → tarjeta "pizarra · X por revisar" → **publicar** u **ocultar**. Los ya publicados se pueden ocultar desde "publicados".

**Archivos clave (`somos-uno-entradas/public_html/`):**
- `index.php`: la portada. `app/view.php`: la cabecera, el pie y los íconos (saxo, celular tachado, Instagram, el logo "solaris").
- `app/config.example.php`: **todos los textos, precios, links, line up, preguntas, pilares y música**.
- `app/config.php` (solo en el servidor, se crea copiando el ejemplo): **si existe, manda este** y el ejemplo se ignora.
- `app/lib.php`: la lógica. Tiene `asset()`, que agrega `?v=huella` a los archivos para que el navegador y la caché de Hostinger no muestren versiones viejas.
- `mensaje.php`: guarda los mensajes de la pizarra. `pizarra.php`: los datos para la pantalla del proyector.
- `assets/style.css`, `assets/app.js` (cuenta regresiva, fades al bajar, música), `assets/logo.svg`, `assets/melt.webp`, `assets/kankari.png`, `assets/musica.mp3`.
- `data/somosuno.sqlite`: **la base de datos, con los mensajes de la pizarra, las invitaciones y la lista. NO SE BORRA NUNCA.**
- El zip para subir es `somos-uno-entradas/somos-uno-entradas.zip`. Se arma con los archivos del repo: `cd somos-uno-entradas/public_html && git ls-files . | zip -X -q ../somos-uno-entradas.zip -@`. **Nunca incluye `config.php` ni `data/somosuno.sqlite`.**

**Cómo actualizar la web sin perder nada:**
1. Descargar antes `public_html/data/somosuno.sqlite` como respaldo.
2. Subir el zip a `public_html` → clic derecho → Extraer en `public_html` → **reemplazar** los archivos. No borrar nada.
3. Si cambiaron textos, precios, links o la música, **subir también un `config.php` nuevo** a `public_html/app/`: el ejemplo con `demo_mode => false` y la contraseña de EVO. Ver la sección 8.
4. Si se ve algo viejo: limpiar la caché en hPanel (Caché o CDN → Purgar) y recargar.

## 6. Estética y marca

- **Colores:** negro eclipse `#070202`, corona rojo oscuro `#6b0d07`, acento rojo brasa `#d9482c`, crema `#efe2d6`, fuego `#e8803a`.
- **Logo "solaris":** **Major Mono Display, siempre en minúscula**, con todas las letras del mismo grosor. La O puede ser un sol eclipsado. Ojo: en Major Mono las **mayúsculas** salen con letras desparejas (algunas en negrita). Para que algo se vea "en mayúsculas" con esa tipografía, se escribe en minúscula y se ve como mayúsculas parejas.
- **Tipografías:** textos chicos en Space Mono; prosa en Cormorant Garamond italic o Instrument Serif; inscripciones en griego con GFS Didot. Hay copias locales en `fuentes/`.
- **Imaginario:** grabado antiguo (líneas), sombras en la pared de la caverna, fuego, números romanos (XVIII → III, XI · X).
- **Mascota:** el muñeco de palitos que baila (las sombras de la pared). Animación fluida y sutil.
- **Animaciones:** sutiles y livianas (CSS), sin librerías.

## 7. Otros materiales del proyecto (en el repo)

- **`contenido/`:** las piezas de redes de la semana (`contenido/semana/*.png`, historias de 1080×1920 y posts de 1080×1350), generadas con `piezas.html` + `motor.js` y exportadas con `node contenido/render.js [id]`. Textos y calendario en `copys.md`:
  - Lun 5: anuncio y teaser.
  - Mar 6: la pared.
  - Mié 7: invitado y la noche.
  - Jue 8: early bird.
  - Vie 9: line up y último aviso.
  - Sáb 10: luna nueva.
  - Dom 11: hoy.
  - Lun 12: gracias.
  - La historia de early bird ya dice $7.000.
- **`teaser/`:** animación del eclipse a 127 BPM, `solaris-teaser.mp4` (1080×1920). Falta ponerle el track con el primer beat en el 0:00.
- **`visuales/`:** las visuales en vivo para Chrome, controladas con un **Allen & Heath Xone:K2** por MIDI. Seis escenas: el ritual, la pared, la caverna, solaris, el gigante y polvo solar. Muestran el line up, incluye a Damian aparte y el logo de Somos Uno × Melt. `python3 visuales/empaquetar.py` genera `SOLARIS-visuales.html` (un archivo único) y la copia de la web. Instrucciones en `visuales/LEEME.md`.
- **`propuestas/`:**
  - `Somos_Uno_x_Melt_Underground.pdf`: la propuesta de alianza con Melt.
  - `Curso_Produccion_Ableton_Live_12_Melt_Akademy.pdf`: el curso de Ableton.
  - `caverna/`: tres láminas en estilo grabado (la pared, el sol grabado, la lámina).
  - `tipografias/`: pruebas de tipografía.
- **`mailer/`:** una planilla de contactos (`evo_contactos_mailer.xlsx`) y los templates de mail (`templates_evo.md`) para venues y booking. Límite de 25 mails por día, con pausa de 60 s entre cada uno y seguimiento a los 10 días.
- **En otras ramas del repo** (ver la sección 9):
  - **Press kit 2026** (`dossier/EVO_Press_Kit_2026.pdf` y su fuente).
  - **Propuestas para la crew del 11/10** (`propuestas/crew_11_10/`): un PDF por rol (embajador, productora audiovisual, fotografía, redes, escenografía, VJ), generados desde `amigos.json` con `node propuestas/crew_11_10/generar.mjs`.

## 8. Cómo trabajar con EVO (muy importante)

**Comunicación**
- Escribe en **español**. Responderle en **español rioplatense (vos)**, claro y **paso a paso**, como para alguien que no es programador. Cuando hay que hacer algo en Hostinger, decir **exactamente dónde tocar**: "hPanel → Administrador de archivos → `public_html` → carpeta `app` → Subir".
- Respuestas **cortas y concretas**. Si algo depende de una decisión suya, dar una recomendación y preguntar una sola cosa.
- Trabaja mucho **desde el celular** y manda **capturas de pantalla**. Mirarlas con atención: muchas veces el problema está en la captura.
- Cuida los **créditos o consumo** ("animá lo que puedas sin usar tantos créditos"): preferir soluciones livianas y no hacer trabajo de más.

**Cómo pide las cosas**
- Pide varias cosas en un mismo mensaje y a veces suma otras a mitad de camino. Hacer todas y confirmarlas una por una al final.
- Cuando pasa **textos exactos** ("que diga: …"), usarlos **tal cual**, solo corrigiendo tildes. No reescribirlos ni "mejorarlos".
- Cuando pasa **logos, imágenes o música**, usarlos **exactamente** (recortar o limpiar el fondo si hace falta) y verificar el resultado.
- Valora mucho que **los logos se vean bien y claros**. Nota enseguida cuando un logo está mal.
- Prefiere que **las cosas se las hagas vos** ("ponémelo vos") en lugar de explicarle cómo hacerlas: entregarle los archivos listos para subir (el zip, el `config.php`).
- No cambiar textos ni respuestas que no pidió. Si algo extra parece útil, proponerlo en una línea.

**Errores que ya pasaron (evitarlos)**
- **Borró `app/config.php` y la carpeta `data` sin querer** y el sitio dio 403, porque `index.php` no estaba en la raíz de `public_html`. Siempre recordarle: **no borrar `data`**, descargar `somosuno.sqlite` antes de actualizar y extraer el zip **directo** en `public_html`.
- **El `config.php` del servidor pisa al ejemplo.** Si se cambian textos, precios, links o el Instagram de alguien en `config.example.php`, **hay que darle un `config.php` nuevo** (el ejemplo con `demo_mode => false` y su contraseña). Si no, sigue viendo lo viejo.
- **Caché:** subió archivos nuevos y seguía viendo los logos viejos. Ya está resuelto con `asset()` (`?v=`), pero si pasa de nuevo: limpiar la caché de Hostinger y revisar que los archivos se hayan reemplazado al extraer.
- **El logo de Melt con fondo negro:** el truco `mix-blend-mode: screen` deja de funcionar si algún contenedor tiene animación. Se resolvió con un webp transparente. No volver a usar ese truco.
- Antes se usó un logo de Somos Uno equivocado (parecido a `$`). El correcto es el vertical de `assets/logo.svg`.
- **Nunca guardar contraseñas en el repo** (puede no ser privado). El `config.php` con su contraseña se le entrega como archivo aparte.

**Cómo probar antes de entregar** (en Claude Code, local o nube)
- `cd somos-uno-entradas/public_html && php -S 127.0.0.1:8099` y abrir con Playwright o Chromium. **Google Fonts no carga en el entorno de prueba**: para capturas fieles, cargar `fuentes/fuentes.css` local.
- Después de probar, **borrar** `data/somosuno.sqlite` y cualquier `app/config.php` de prueba antes de armar el zip.
- Mirar las capturas en **celular (390 px)** y en **computadora (1280 px)**.

## 9. Repositorio y ramas

- GitHub: **`taurokase36-maker/EVO`**.
- **Rama con la web más nueva y todo lo de SOLARIS:** `claude/laughing-hawking-v390c8`, que incluye todo lo de `claude/charming-tesla-usnpt7`.
- **Otras ramas con material propio:**
  - `claude/practical-babbage-c76tqy`: **Press kit EVO 2026** (versión final, `dossier/`).
  - `claude/modest-turing-pug7j2`: **propuestas para la crew del 11/10** (`propuestas/crew_11_10/`).
  - `claude/modest-curie-a4e4lj`: el cambio de nombre a THE ECLIPSE. Reemplazado por SOLARIS: **no usar**.
  - `claude/gracious-meitner-kylc9t` y `claude/nice-pasteur-635pjh`: herramientas para Claude Code (graphify, guías de diseño). No son contenido.
- No hay una rama principal unificada. Si se trabaja en local, conviene **juntar todo en una sola rama** (empezar por `laughing-hawking` y traer `dossier/` y `propuestas/crew_11_10/`).
- `CLAUDE.md`, en la raíz, tiene el resumen corto que Claude Code lee solo. Este archivo es la versión completa.

## 10. Pendientes

**Antes del domingo 11**
- [ ] Subir la última versión de la web (el zip y el `config.php` nuevo) y comprobar: los logos, la música, la pizarra, las tres entradas y RUF con Kankari Music Lab.
- [ ] En Mercado Pago, **limitar las unidades** de cada link (40 / 30 / 65) y pedir **nombre y DNI**.
- [ ] Desactivar el link de early bird después del viernes 9 a las 23:59, y el de la lista amigos después del domingo a las 22:00.
- [ ] **Cambiar los códigos de invitación** (los actuales son públicos en el repo) y mandar los links nuevos.
- [ ] Opcional: una contraseña aparte para la puerta (`door_password`).
- [ ] **Primer single de THE SUN:** subirlo a la distribuidora. Si no llega, se estrena en Melt y sale después.
- [ ] **Renombrar a EVO THE SUN:** Instagram, Spotify, SoundCloud y el press kit. Los PDFs de `propuestas/` todavía dicen EVO.
- [ ] **Teaser:** ponerle el track con el primer beat en el 0:00 y subirlo a historias.
- [ ] Pasarle a quien hace las visuales: el concepto, el teaser, las láminas y las piezas, y avisarle del nombre SOLARIS.
- [ ] Publicar el contenido de la semana según `contenido/copys.md`, con el **sticker de link** a somosuno.fun en las historias.
- [ ] Confirmar cómo se escribe "Damian/Damián Santos" y su Instagram.
- [ ] Pedir los Instagram de COCO, Gremora, Sandman, ODA, Lucila y RUF, y mandarles su link de embajador.

**Con Melt, para la noche**
- [ ] Probar las visuales en la computadora del proyector y mapear el K2.
- [ ] La pantalla del proyector con `somosuno.fun/pantalla.php`, y moderar la pizarra durante la noche desde el celular.
- [ ] Luces: oscuridad total y una sola luz cálida que crece, con el pico a las 00:00 con el estreno del track.

**Después**
- [ ] Bajar el CSV del panel (es la base de público para la próxima fecha).
- [ ] Nombres o subtítulos para los singles de THE SUN, siguiendo la caverna. El segundo single sale la semana siguiente.
- [ ] Idea: un SOLARIS con el **eclipse anular real del 6 de febrero de 2027**, visible en Argentina, que podría ser también el cierre del álbum THE SUN.
