# SOLARIS · visuales en vivo

Visuales para proyectar en Melt desde **Chrome**, con la estética de SOLARIS. Pulsan al BPM (127 por defecto) y se controlan con el teclado o con un **Xone:K2** por MIDI. **Funcionan sin internet**: las fuentes están en `fuentes/`.

## Abrirlas (en una computadora, no en el celular)
**Opción A · link (la más fácil):** las visuales van dentro de la web. Con la web subida a Hostinger, se abren en Chrome en **`https://tudominio.com/visuales`**. Una vez cargadas siguen andando aunque se corte internet.

**Opción B · archivo:** mandá **`visuales/SOLARIS-visuales.html`** como documento (WhatsApp Web, Drive, mail o pendrive). En la PC: descargalo, clic derecho → *Abrir con* → **Google Chrome**. En el celular se ve como texto: eso es normal, es para abrir en una computadora.

Después:
1. Tocá **empezar en pantalla completa** (o en ventana).
2. Si Chrome pregunta por **dispositivos MIDI**, tocá *Permitir*.
3. **Mové el mouse y aparecen los controles abajo**: escenas, efectos, tempo (−, BPM, +, tap, sync), ajustes, MIDI, pantalla completa. Se esconden solos a los 3 segundos.

Si cambiás el código, regeneralo con `python3 visuales/empaquetar.py` (actualiza los dos). Para trabajar sobre el código, usá `visuales/index.html`.

## Las seis escenas (la mascota de SOLARIS)
El muñeco que baila es la mascota. Se mueve **fluido y sutil**: cambia de pose cada 2 beats con transiciones suaves y se balancea todo el tiempo.

| Tecla | Escena | Qué hace |
|---|---|---|
| 1 | **el ritual** | Ronda de personajes alrededor del sol eclipsado, como sus rayos. Gira y baila en ola |
| 2 | **la pared** | La pared de la caverna, limpia, con las sombras de los personajes y la luz del fuego. En la roca, pinturas rupestres sutiles |
| 3 | **la caverna** | Un cubo de grano que gira y respira, con aristas de luz y un pequeño sol que se desliza suave por la zona iluminada. Adentro, en la pared del fondo, baila la sombra de la mascota. **Drop**: el cubo se abre y se ilumina. Muy liviana |
| 4 | **solaris** | Solo el logo, con "for the solar people" y abajo Somos Uno × Melt Underground |
| 5 | **el gigante** | Un personaje enorme hecho de líneas de grabado, con el sol de aureola y su sombra |
| 6 | **polvo solar** | Fibras de partículas que fluyen como humo y dibujan a la mascota bailando, con un anillo de sol tenue. Liviana |

## Controles

Todo está en la **barra de abajo** (aparece al mover el mouse), en el teclado y en el K2.

| Grupo | En la barra | Tecla |
|---|---|---|
| Escenas | 1 a 6, ◀ ▶ | `1`…`6`, `N` `P` |
| Tempo | −, BPM (se puede escribir), +, tap, sync · 1 | `↑` `↓`, `Espacio`, `S` |
| Efectos | drop (abre la caverna), flash, blackout, logo, auto | `D` `F` `B` `L` `A` |
| FX | espejo (2 o 4 lados), congelar, pulso ½, pulso ×2, strobe (mientras lo apretás), reset fx | `E` `C` · `X` (mantener) · `R` |
| Line up | coco, gremora b2b sandman, oda, evo the sun, lucila, ruf (solo el nombre, abajo), the sun, for the solar people. Un toque lo muestra, otro lo saca. **auto**: muestra quién toca según la hora, 4 compases cada 32 | `⇧`+`1`…`6`, `⇧`+`7` `⇧`+`8` · `-` saca · `T` auto |
| Invitado especial | **★ damian santos**: aparece aparte, arriba a la izquierda ("invitado especial · saxo en vivo"). Se puede mostrar junto con EVO THE SUN. En modo auto aparece solo durante el set de EVO THE SUN | `⇧`+`9` |
| Sistema | ajustes (todos los sliders), midi, calidad baja, pantalla completa, ?, esconder | `M` `Q` `Enter` `H` |

**Ajustes** (sliders, faders o perillas): brillo, pulso, fuego/corona, logo encima, velocidad, grano, sombras, fundido entre escenas, zoom, color (de carmesí a oro), estela, golpe de cámara en el beat, anillos de la huella, **cantidad de personajes** (en todas las escenas), glitch, strobe al tempo (negras, corcheas o semicorcheas), rotación y tamaño de la corona.

**MIDI clock:** si tu software de DJ manda MIDI clock a esa compu, las visuales toman el BPM solas.

## Xone:K2

**Configuración de fábrica** (capa 1, la roja; cualquier canal):

| Control del K2 | Función |
|---|---|
| Faders 1–4 | brillo · pulso · fuego/corona · logo encima |
| Perillas, fila 1 | velocidad · grano · sombras · fundido |
| Perillas, fila 2 | zoom · color · estela · golpe de cámara |
| Perillas, fila 3 | anillos · cantidad de personajes · glitch · strobe |
| Encoders de arriba 1–3 | rotación (sin tope) · BPM fino (±0,1 por paso) · tamaño de la corona |

**Botones (2 minutos):** tocá **midi** → **asignar todos los botones en orden** y apretá los botones del K2 uno tras otro. El panel te dice qué función toca en cada paso; **saltear** pasa a la siguiente. Orden: escenas 1–6, tap, sync, flash, blackout, logo, drop, auto, BPM +, BPM −, calidad, siguiente, anterior, espejo, congelar, pulso ½, pulso ×2, strobe, reset fx, los seis nombres del line up, the sun, for the solar people, line up automático, sacar texto e invitado especial. También podés asignar uno solo con **aprender**.

- El **strobe** funciona mientras mantenés apretado el botón.
- Con las escenas asignadas, **se prende la luz del botón de la escena activa**.
- Cualquier función se puede pasar a otro control con **aprender**. En las perillas, el botón **perilla / encoder** cambia el modo: *encoder* es para las perillas sin fin, que mandan pasos en lugar de una posición.
- **Guardar mapeo en archivo** baja un `.json`. Con **cargar mapeo** lo usás en otra compu (por ejemplo, la de tu amigo) sin volver a asignar todo.

**Si algún control no responde:** asignalo con *aprender*. Pasa si el K2 está en otra capa o se cambió su configuración.

**Si el K2 también controla tu software de DJ:** en Mac, Chrome y el software pueden usarlo a la vez. En **Windows** suele poder usarlo **un solo programa por vez**. Lo más simple es un K2 para las visuales enchufado a la compu del proyector.

## Antes de la fiesta
- [ ] Probar en la compu del proyector: escenas, `Q` si va lenta y mapeo de los botones.
- [ ] Desactivar el modo de suspensión y las notificaciones de esa compu (la página pide no apagar la pantalla, pero mejor asegurarse).
- [ ] Al empezar el set: tap tempo o MIDI clock, y `S` en un 1.
