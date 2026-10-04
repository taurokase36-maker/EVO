# Somos Uno · Entradas

Plataforma propia de venta de entradas para Somos Uno. Tiene:
- landing de la marca,
- compra con **Mercado Pago**,
- lista con beneficio,
- invitaciones con cupo por persona,
- entradas con **QR** que llegan por mail,
- panel de administración,
- escáner de QR para la puerta desde el celular.

Está hecha en PHP puro, sin instalar nada, y funciona en el hosting compartido de Hostinger.

---

## 1. Subir los archivos a Hostinger (5 minutos)

> **Importante:** el zip ya trae `index.php` en la raíz. No uses la herramienta "Importar / migrar sitio web": usá el **Administrador de archivos**.

1. Entrá a **hPanel → Sitios web → Administrar → Administrador de archivos**.
2. Entrá a la carpeta **`public_html`** de tu dominio. Si tiene un `default.php` o un `index.html` viejo, borralo.
3. Tocá **Subir**, elegí `somos-uno-entradas.zip` y, cuando termine, hacé clic derecho sobre el zip → **Extraer** → en "extraer a" dejá **la misma carpeta `public_html`** (no crees una carpeta nueva).
4. Revisá que **`index.php` quede directamente dentro de `public_html`**, junto a las carpetas `app`, `admin`, `assets` y `data`. Después podés borrar el zip.
5. En hPanel → **Avanzado → Configuración de PHP**, elegí **PHP 8.1 o superior**.
6. Activá el **SSL** (https) en hPanel → Seguridad → SSL. Mercado Pago lo necesita.

Listo: entrá a tu dominio. El sitio ya funciona en **modo demo**, donde los pagos se aprueban solos y no se cobra nada.

## 2. Configurar (5 minutos)

1. Dentro de `public_html/app/`, duplicá `config.example.php` y llamá a la copia **`config.php`**. Mientras no exista, el sitio usa el ejemplo en modo demo.
2. Editá `config.php` y completá:
   - `site_url`: tu dominio, por ejemplo `https://somosuno.com.ar`. Si lo dejás vacío se detecta solo, pero es mejor escribirlo.
   - `admin.password`: la contraseña del panel completo.
   - `admin.door_password`: otra contraseña, solo para el escáner de la puerta.
   - **Los códigos de invitación.** Cambialos por otros difíciles de adivinar.
3. Entrá a `tudominio.com/admin` con tu contraseña y probá una compra en modo demo.

### Cómo viene configurado el 11/10
- **Concepto:** *Somos Uno × Melt Underground presentan SOLARIS · for the solar people*. Estética eclipse y caverna: negro con corona roja, logos de Somos Uno y Melt en la portada, invitado especial (Damian Santos, saxo en vivo) y, como detalle, el estreno del primer single de THE SUN.
  > **Si ya creaste tu `config.php` antes de este cambio**, no se actualiza solo: copiá de `config.example.php` los bloques `brand` (colores y `partner_logo`), `event` (`title`, `kicker`, `headline`, `subhead`, `guest`, `motto`), `release`, `about` y `faq`.
- **Horario:** de 18:00 a 03:00. **Capacidad: 160 personas.**
- **Early bird:** 30 entradas a $5.000 (con $10.000 tachado), hasta el viernes 9 a las 23:59.
- **General:** 65 entradas online a $10.000.
- **Invitaciones:** 25 en total (EVO 15, ODA 5, Sandman 5). Son nominales y el **QR deja de servir a las 00:00**.
- **Lista:** cupo de 40, con $7.000 en puerta hasta las 00:00 y sujeto a capacidad.
- **Tope total:** la venta online y las invitaciones nunca pasan de 160. Se dejan unos 40 lugares para la lista y la puerta.

**Números con casa llena** (cobrando a 10 días en Mercado Pago):

| | Personas | Bruto |
|---|---|---|
| Early bird | 30 × $5.000 | $150.000 |
| General online | 65 × $10.000 | $650.000 |
| Invitaciones | 25 × $0 | $0 |
| Lista o puerta | 40 × $7.000 a $10.000 | $280.000 a $400.000 |
| **Total** | **160** | **$1.080.000 a $1.200.000** |

Mercado Pago descuenta unos $42.480 de lo online. **Neto: entre $1.037.520 y $1.157.520.**

## 3. Conectar Mercado Pago y cobrar de verdad (10 minutos)

> Hostinger no tiene pasarela de pagos para sitios propios. El cobro lo hace **Mercado Pago**, que ya está programado: solo falta conectar tu cuenta.

**Paso 1: sacar el Access Token**
1. Entrá a **https://www.mercadopago.com.ar/developers/panel** con tu cuenta de vendedor.
2. Tocá **Crear aplicación**. Nombre: "Somos Uno entradas". Elegí **Pagos online → CheckoutPro**.
3. Dentro de la aplicación, en el menú de la izquierda:
   - **Credenciales de prueba → Access Token**: empieza con `TEST-` y sirve para probar sin plata real.
   - **Credenciales de producción → Access Token**: empieza con `APP_USR-` y es para cobrar de verdad. Puede pedirte completar datos del negocio antes de mostrarlo.

**Paso 2: pegarlo en el panel (no hace falta tocar archivos)**
1. Entrá a `tudominio.com/admin` → tarjeta **pagos**.
2. Pegá el token y tocá **guardar**. El panel prueba la conexión y te dice "Conectado como TU_CUENTA".
3. Tocá **apagar demo y cobrar**. Desde ese momento, cada compra pasa por Mercado Pago.

**Paso 3: probar antes de vender (recomendado)**
1. Primero usá el token `TEST-`. En el panel de Mercado Pago, en **Cuentas de prueba**, creá un comprador de prueba.
2. Abrí tu sitio en una ventana privada, iniciá sesión en Mercado Pago con ese comprador y comprá. Usá las tarjetas de prueba que figuran en la documentación de Mercado Pago (Checkout Pro → Tarjetas de prueba).
3. Si la entrada aparece, cambiá al token `APP_USR-` y listo.
4. Antes de lanzar, en el panel tocá **borrar compras de prueba**, así los números arrancan en cero.

**Prender y apagar el modo demo:** es el botón de la tarjeta **pagos** del panel. Arriba de todo se ve el estado: amarillo "modo demo · no se cobra" o verde "cobrando de verdad". El panel no te deja apagar el demo si el token no conecta.

**Webhook (opcional, más seguro):** en tu aplicación de Mercado Pago → **Webhooks**, cargá `https://tudominio.com/webhook.php`, marcá **Pagos** y copiá la **clave secreta** en `config.php` → `mercadopago.webhook_secret`. Igual funciona sin esto: el sitio ya avisa a Mercado Pago a dónde notificar en cada compra.

**Plazo de cobro:** en la app de Mercado Pago, en **Tu negocio → Costos → Checkout**, elegí cuándo recibís la plata. Cuanto más tarde, menos comisión:

| Cuándo cobrás | Comisión + IVA | De una entrada de $10.000 te quedan |
|---|---|---|
| Al instante | ~7,6% | $9.239 |
| A 10 días | ~5,3% | $9.469 |
| A 18 días | ~4,1% | $9.590 |
| A 35 días | ~1,8% | $9.820 |

## La pizarra, el arte y la pantalla

- **Pizarra:** cada persona con entrada, lista o invitación puede dejar **un mensaje** de hasta 120 caracteres desde su entrada. Llega al panel como "por revisar". Lo publicás o lo ocultás, y los publicados aparecen en la portada, en la sección **la pizarra**.
- **Huella:** cada entrada tiene un arte único, que siempre es el mismo para esa entrada, y el número de asistente ("somos el nº 7"). El botón **compartir en historias** arma una imagen vertical lista para Instagram, **sin el QR**.
- **Pantalla para el proyector de Melt:** `tudominio.com/pantalla.php`, también enlazada desde el panel. Muestra "somos X" (la gente que ya ingresó) y los mensajes publicados en rotación. Tocá "pantalla completa" en la compu del proyector.

## 4. Mails con la entrada (5 minutos)

1. En hPanel → **Emails**, creá una casilla, por ejemplo `entradas@tudominio.com`.
2. En `config.php`, completá en `mail`:
   - `from_email` y `smtp_user`: esa casilla.
   - `smtp_pass`: su contraseña.

Si no configurás el mail, la entrada igual aparece en pantalla después de pagar, y la persona puede hacerle captura.

## 5. Usarlo

| Para qué | Link |
|---|---|
| Página pública | `tudominio.com` |
| Link de embajador | `tudominio.com/?ref=oda` (las compras y la lista quedan a nombre de ODA) |
| Invitación personal | `tudominio.com/invitacion.php?c=CODIGO` (cada código tiene su cupo) |
| Panel | `tudominio.com/admin` |
| Puerta | `tudominio.com/admin/scan.php`, entrando con la contraseña de puerta |

**En la puerta:**
- Abrí el escáner en el celular, tocá "activar cámara" y apuntá al QR.
- **Verde:** puede pasar. Si la entrada es para varias personas, elegís cuántas entran.
- **Rojo:** no puede pasar. Ya ingresó, la entrada no es válida o es una **invitación después de las 00:00**.
- **Amarillo:** es de la lista pero pasó las 00:00. Puede entrar pagando la general.
- Si alguien no tiene el QR, buscalo por nombre o código.

**Después del evento:** desde el panel podés descargar el CSV con todos los mails. Es tu base de público para la próxima fecha.

## 6. Personalizar

- **Textos, precios, preguntas frecuentes y colores:** `app/config.php`.
- **Logos:** `assets/logo.svg` (Somos Uno) y `assets/melt.webp` (Melt, en `brand.partner_logo`; dejalo vacío para no mostrarlo).
- **Textos de la landing:** el bloque "for the solar people" sale de `about`, la nota del estreno de `release` y el invitado de `event.guest`.
- **Estilos:** `assets/style.css`.
- **Base de datos:** se crea sola en `data/somosuno.sqlite`. Si tu plan no tiene SQLite, creá una base MySQL en hPanel y cambiá `db` en la configuración (las instrucciones están ahí).

## Seguridad

- `app/` y `data/` están bloqueadas desde la web por `.htaccess`.
- Cada pago se verifica directamente con la API de Mercado Pago (estado y monto), así que nadie puede falsificar una aprobación.
- **Nunca compartas `config.php`:** tiene tu Access Token.

Créditos: generador de QR [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT) y lector de QR [jsQR](https://github.com/cozmo/jsQR) (Apache-2.0).
