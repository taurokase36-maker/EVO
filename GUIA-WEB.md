# Guía: dejar lista la web de SOLARIS

Tiempo: unos 20 minutos. Necesitás entrar a **hPanel de Hostinger** y a tu cuenta de **Mercado Pago**.
Archivo a subir: `somos-uno-entradas/somos-uno-entradas.zip`.

---

## Cómo cobra la web: links de pago de Mercado Pago

Cada entrada tiene su botón, que lleva directo a su link de pago. **Los tres links ya están cargados** en `app/config.example.php`:

| Entrada | Precio | Link | Se cierra sola en la web |
|---|---|---|---|
| Lista amigos (entrás hasta las 22:00) | $5.000 | https://mpago.la/1JExs82 | domingo 11 a las 22:00 |
| Early bird | $7.000 | https://mpago.la/13HtgZh | viernes 9 a las 23:59 |
| General | $10.000 | https://mpago.la/19N795Q | no se cierra |

- **En la puerta:** revisás la lista de pagos en Mercado Pago, por nombre y DNI. Quien pagó la lista amigos tiene que entrar antes de las 22:00; después de esa hora corre la entrada general.
- **El cupo** (40 lista, 30 early bird, 65 general) se controla en Mercado Pago, limitando las unidades de cada link. La web no ve las ventas de los links.
- **Las invitaciones** (EVO THE SUN, ODA, Sandman) siguen con QR, válidas hasta las 00:00.
- **La lista gratis** con mail quedó apagada: la lista de esta fecha es la lista amigos paga. Se prende con `'enabled' => true` en el bloque `lista`.

Si más adelante querés la compra completa dentro de la web (con QR y mail), se pasa borrando los links. Los pasos están en `somos-uno-entradas/LEEME.md`, sección 3.

---

## Paso 1 · Revisar los links en Mercado Pago (5 min)

En la app: *Cobrar → Link de pago*. En cada uno de los tres:
- Que sirva para **muchos pagos** (no un solo uso).
- Si te deja **limitar unidades**: 40 en la lista amigos, 30 en la early bird y 65 en la general.
- Si te deja pedir datos al comprador: **nombre completo y DNI**. Es lo que vas a mirar en la puerta.

---

## Paso 2 · Subir los archivos a Hostinger (5 min)

1. **hPanel → Sitios web → Administrar → Administrador de archivos** → abrí `public_html`.
2. Si hay un `default.php` o un `index.html` viejo, borralo. **Si ya habías subido la web antes, no borres `app/config.php` ni la carpeta `data`.**
3. **Subir** → elegí `somos-uno-entradas.zip` → clic derecho sobre el zip → **Extraer** en la misma carpeta `public_html`. Si pregunta, **reemplazá** los archivos.
4. Revisá que `index.php` quede directamente dentro de `public_html`. Después borrá el zip.
5. **Avanzado → Configuración de PHP** → PHP **8.1 o más**.
6. **Seguridad → SSL** → activalo (la web tiene que abrir con `https://`).

---

## Paso 3 · Configurar (5 min)

En `public_html/app/`:
- **Si no existe `config.php`:** duplicá `config.example.php` y nombrá la copia `config.php`. Ya trae los links, los precios, RUF y la pizarra.
- **Si ya existía:** el sitio sigue usando tu `config.php` viejo, con los precios y links viejos. Lo más simple es borrarlo y hacer una copia nueva de `config.example.php` (después volvés a poner tus contraseñas). Si preferís editarlo, copiá de `config.example.php` los bloques `event` (incluye `lineup` e `intl_guest`), `tickets`, `link_note`, `lista`, `wall` y `faq`.

Editá `config.php` (clic derecho → Editar) y cambiá solo esto:

```php
'demo_mode' => false,                          // apagá el modo demo
'site_url'  => 'https://tudominio.com',        // tu dominio, sin barra al final
```

En `admin`, poné dos contraseñas:

```php
'password'      => 'una-clave-larga',          // panel completo
'door_password' => 'otra-clave',               // solo el escáner de la puerta
```

En `invitations → codes`, **cambiá los códigos** por otros difíciles de adivinar (por ejemplo `evo-` + letras y números al azar). Cada código es un link que mandás: `tudominio.com/invitacion.php?c=CODIGO`.

Guardá.

---

## Paso 4 · Mail (opcional, 5 min)

Sirve para que las invitaciones reciban su QR por mail. Sin esto igual se muestra en pantalla.

1. hPanel → **Emails** → creá `entradas@tudominio.com`.
2. En `config.php`, en `mail`:
```php
'from_email' => 'entradas@tudominio.com',
'smtp_user'  => 'entradas@tudominio.com',
'smtp_pass'  => 'la contraseña de esa casilla',
```

---

## Paso 5 · Probar (5 min)

Abrí `https://tudominio.com` desde el celular:

- [ ] Arriba **no** aparece la franja "modo demo".
- [ ] Se ven los logos de **Somos Uno × Melt Underground**, con sus nombres.
- [ ] El line up muestra a **RUF** como invitado internacional, con el logo de Kankari y el link a @kankariclub.
- [ ] Los tres botones "comprar en mercado pago" abren **tu** link, con el precio correcto ($5.000, $7.000 y $10.000).
- [ ] Los botones de Instagram abren **@somos.uno._**.
- [ ] Escribí un mensaje en **la pizarra**. Entrá a `tudominio.com/admin` → tarjeta **pizarra** → **publicar**, y fijate que aparezca en la portada.
- [ ] Abrí uno de tus links de **invitación** y pedí una.
- [ ] Entrá a `tudominio.com/admin/scan.php` con la contraseña de la puerta y escaneá ese QR.
- [ ] Desde el panel, ocultá o borrá las pruebas antes de difundir.

---

## La pizarra

Cualquiera puede dejar un mensaje desde la portada (nombre + hasta 120 caracteres). **Nada se publica solo:** cada mensaje llega al panel como "por revisar" y aparece en la web y en la pantalla del proyector recién cuando tocás **publicar**. Desde una misma conexión se pueden mandar hasta 3 mensajes por hora (`wall.per_hour`). Para cerrarla: `'public' => false` en el bloque `wall`.

---

## El día de la fiesta

- **Puerta:** un celular con `tudominio.com/admin/scan.php` para las invitaciones, y otro con la actividad de Mercado Pago (o una lista impresa) para quienes pagaron con link. La lista amigos entra hasta las 22:00; las invitaciones, hasta las 00:00.
- **Proyector:** abrí `tudominio.com/pantalla.php` en Chrome y tocá "pantalla completa" (los mensajes de la pizarra).
- **Visuales en vivo:** `tudominio.com/visuales` en Chrome (ver `visuales/LEEME.md`). Ese link es el que le pasás a quien maneje las visuales.
- **Después del viernes a las 23:59:** desactivá el link de la early bird en Mercado Pago. El botón de la web ya se cierra solo, pero el link sigue funcionando si alguien lo tiene guardado. Lo mismo con la lista amigos después de las 22:00 del domingo.
