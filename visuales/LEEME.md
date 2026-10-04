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

## Las cinco escenas
| Tecla | Escena | Qué hace |
|---|---|---|
| 1 | **eclipse** | El sol grabado con la huella adentro. Cada 4 compases, destello del anillo de diamante |
| 2 | **la pared** | Sombras de gente bailando sobre la roca, con luz de fuego. Bailan al beat |
| 3 | **tránsito** | La luna cruza el sol en 8 compases: anillo de diamante, totalidad (unos 2 compases) y vuelta |
| 4 | **solaris** | El logo con la O eclipsada, "for the solar people" y el logo de Somos Uno |
| 5 | **grabado** | Todo el cuadro como un grabado de líneas que respira con el beat |

## Teclado
| Tecla | Acción |
|---|---|
| `Espacio` | **tap tempo**: tocá 4 veces en el beat |
| `S` | **sync**: el próximo golpe es el 1 del compás (apretalo en el 1) |
| `↑` `↓` | BPM ±0,5 |
| `D` | **drop**: salta al anillo de diamante y la totalidad (ideal para el drop del track) |
| `F` | flash |
| `B` | blackout (fundido a negro, de nuevo para volver) |
| `L` | logo SOLARIS encima de cualquier escena |
| `A` | automático: cambia de escena cada 16 compases |
| `Q` | calidad baja o alta (si la compu va lenta) |
| `H` | ayuda y estado (BPM, escena, MIDI) |
| `M` | mapeo MIDI |

**MIDI clock:** si tu software de DJ manda MIDI clock a esa compu, las visuales toman el BPM solas (el estado muestra "MIDI clock").

## Xone:K2

**De fábrica ya funcionan los faders y la fila de perillas de arriba** (en la capa 1, la roja):

| Control del K2 | Función |
|---|---|
| Fader 1 | brillo general (abajo = negro) |
| Fader 2 | cuánto pulsa con el beat |
| Fader 3 | fuego / corona |
| Fader 4 | logo encima |
| Perilla 1 (fila de arriba) | velocidad de giro y de baile |
| Perilla 2 | grano |
| Perilla 3 | sombras más suaves o más duras |
| Perilla 4 | duración del fundido entre escenas |

**Los botones se asignan una vez (2 minutos):**
1. Tocá **midi** en la barra de abajo (o `M`). Arriba tiene que decir "conectado: XONE:K2", y en la barra el punto de midi se pone verde.
2. En la fila de una función, tocá **aprender** y apretá el botón del K2 que quieras. Queda guardado en ese Chrome.
3. Sugerencia: los 4 botones de una fila para las escenas 1 a 4, y otra fila para escena 5, **drop**, **flash** y **tap**. Si te sobra, **blackout** y **sync**.

Con las escenas asignadas a botones, **se prende la luz del botón de la escena activa**.

**Si algún fader o perilla no responde:** asignalo con *aprender* igual que los botones. Pasa si el K2 está en otra capa o se cambió su configuración. Los **encoders** (las perillas infinitas de arriba de todo) mandan valores relativos: mejor usá faders y perillas comunes.

**Si el K2 también controla tu software de DJ:** en Mac, Chrome y el software pueden usarlo a la vez. En **Windows** suele poder usarlo **un solo programa por vez**. Lo más simple es un K2 para las visuales enchufado a la compu del proyector.

## Antes de la fiesta
- [ ] Probar en la compu del proyector: escenas, `Q` si va lenta y mapeo de los botones.
- [ ] Desactivar el modo de suspensión y las notificaciones de esa compu (la página pide no apagar la pantalla, pero mejor asegurarse).
- [ ] Al empezar el set: tap tempo o MIDI clock, y `S` en un 1.
