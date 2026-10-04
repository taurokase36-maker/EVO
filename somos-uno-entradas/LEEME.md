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

## 1. Subir los archivos a Hostinger (10 minutos)

1. Entrá a **hPanel → Sitios web → Administrar → Administrador de archivos**.
2. Abrí la carpeta **`public_html`** de tu dominio.
3. Subí **todo el contenido** de la carpeta `public_html/` de este proyecto: `index.php`, `app/`, `admin/`, `assets/`, `data/`, `.htaccess`, etc.
   - Lo más fácil es comprimir la carpeta en un `.zip`, subir el zip y usar **Extraer**.
   - Los archivos `.htaccess` empiezan con un punto. Si no los ves, activá "mostrar archivos ocultos".
4. En hPanel → **Avanzado → Configuración de PHP**, elegí **PHP 8.1 o superior**.
5. Activá el **SSL** (https) del dominio en hPanel → Seguridad → SSL. Mercado Pago lo necesita.

## 2. Configurar (5 minutos)

1. Dentro de `public_html/app/`, duplicá `config.example.php` y llamá a la copia **`config.php`**.
2. Editá `config.php` y completá:
   - `site_url`: tu dominio con https y sin barra al final, por ejemplo `https://somosuno.com.ar`.
   - `admin.password`: la contraseña del panel completo.
   - `admin.door_password`: otra contraseña, solo para el escáner de la puerta.
   - Los datos del evento: horario, line up, precios, cupos y fechas de cierre.
   - **Los códigos de invitación.** Cambialos por otros difíciles de adivinar.
3. Dejá `demo_mode => true` y entrá a tu dominio. Probá comprar: en modo demo el pago se aprueba solo, sin cobrar.
4. Entrá a `tudominio.com/admin` con tu contraseña y mirá que la compra de prueba aparezca.

## 3. Conectar Mercado Pago (10 minutos)

1. Entrá a **https://www.mercadopago.com.ar/developers** con tu cuenta de vendedor.
2. Ir a **Tus integraciones → Crear aplicación**. Elegí "Pagos online" y "Checkout Pro".
3. Para probar primero sin plata real:
   - Copiá el **Access Token de prueba** (empieza con `TEST-`) en `mercadopago.access_token`.
   - Poné `demo_mode => false`.
   - Pagá con las tarjetas de prueba que Mercado Pago muestra en "Cuentas de prueba".
4. Para vender de verdad: copiá el **Access Token de producción** (empieza con `APP_USR-`).
5. Opcional, para más seguridad: en tu aplicación, en **Webhooks**, cargá la URL `https://tudominio.com/webhook.php`, marcá el evento **Pagos** y copiá la **clave secreta** en `mercadopago.webhook_secret`.
6. **Plazo de cobro:** en la app de Mercado Pago, en **Tu negocio → Costos → Checkout**, elegí cuándo recibís la plata. Cuanto más tarde, menos comisión:

| Cuándo cobrás | Comisión + IVA | De una entrada de $10.000 te quedan |
|---|---|---|
| Al instante | ~7,6% | $9.239 |
| A 10 días | ~5,3% | $9.469 |
| A 18 días | ~4,1% | $9.590 |
| A 35 días | ~1,8% | $9.820 |

Si querés que la comisión la pague el comprador, poné por ejemplo `service_fee_percent => 5`.

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
- Si la entrada es para varias personas, elegís cuántas entran.
- Si alguien no tiene el QR, buscalo por nombre o código.
- Las invitaciones fuera de horario aparecen en amarillo.

**Después del evento:** desde el panel podés descargar el CSV con todos los mails. Es tu base de público para la próxima fecha.

## 6. Personalizar

- **Textos, precios, preguntas frecuentes y colores:** `app/config.php`.
- **Logo:** reemplazá `assets/logo.svg` por el logo real, o subí un png y cambiá `brand.logo`.
- **Estilos:** `assets/style.css`.
- **Base de datos:** se crea sola en `data/somosuno.sqlite`. Si tu plan no tiene SQLite, creá una base MySQL en hPanel y cambiá `db` en la configuración (las instrucciones están ahí).

## Seguridad

- `app/` y `data/` están bloqueadas desde la web por `.htaccess`.
- Cada pago se verifica directamente con la API de Mercado Pago (estado y monto), así que nadie puede falsificar una aprobación.
- **Nunca compartas `config.php`:** tiene tu Access Token.

Créditos: generador de QR [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT) y lector de QR [jsQR](https://github.com/cozmo/jsQR) (Apache-2.0).
