# Guía: dejar lista la web de SOLARIS

Tiempo: unos 30 minutos. Necesitás entrar a **hPanel de Hostinger** y a tu cuenta de **Mercado Pago**.
Archivo a subir: `somos-uno-entradas/somos-uno-entradas.zip`.

---

## Paso 0 · Elegí cómo cobrar

| | **Simple: link de pago** (recomendado para esta fecha) | **Completo: compra en la web** |
|---|---|---|
| Qué hace el botón | Lleva directo a un link de pago de Mercado Pago | Pide nombre y mail, cobra y manda una entrada con QR |
| Configuración | Pegar dos links | Cargar el Access Token de Mercado Pago |
| En la puerta | Revisás la lista de pagos en Mercado Pago (nombre + DNI) | Escaneás el QR con el celular |
| Cupo y early bird | El botón de early bird se cierra solo el viernes a las 23:59. El cupo lo controlás vos en Mercado Pago | Todo automático |
| Pizarra y "solar people nº" | Solo para quienes están en lista o tienen invitación | Para todos |

**La lista y las invitaciones funcionan igual en los dos modos**, con QR.
Si más adelante querés el modo completo, se pasa borrando los links. Los pasos están en `somos-uno-entradas/LEEME.md`, sección 3.

---

## Paso 1 · Crear los links en Mercado Pago (5 min)

Creá **dos links**, uno por entrada. En Mercado Pago buscá **"Link de pago"** (en la app: *Cobrar → Link de pago*; en la web: *Tu negocio → Link de pago*).

| Título | Precio |
|---|---|
| `SOLARIS · Early bird` | $5.000 |
| `SOLARIS · General` | $10.000 |

- Si te deja elegir, que el link sirva para **muchos pagos** (no un solo uso).
- Si te deja **limitar unidades**, poné 30 en la early bird y 65 en la general.
- Si te deja pedir datos al comprador, pedí **nombre completo y DNI**. Es lo que vas a mirar en la puerta.
- Copiá los dos links (empiezan con `https://`).

---

## Paso 2 · Subir los archivos a Hostinger (5 min)

1. **hPanel → Sitios web → Administrar → Administrador de archivos** → abrí `public_html`.
2. Si hay un `default.php` o un `index.html` viejo, borralo. **Si ya habías subido la web antes, no borres `app/config.php` ni la carpeta `data`.**
3. **Subir** → elegí `somos-uno-entradas.zip` → clic derecho sobre el zip → **Extraer** en la misma carpeta `public_html`. Si pregunta, **reemplazá** los archivos.
4. Revisá que `index.php` quede directamente dentro de `public_html`. Después borrá el zip.
5. **Avanzado → Configuración de PHP** → PHP **8.1 o más**.
6. **Seguridad → SSL** → activalo (la web tiene que abrir con `https://`).

---

## Paso 3 · Configurar (10 min)

En `public_html/app/`:
- **Si no existe `config.php`:** duplicá `config.example.php` y nombrá la copia `config.php`.
- **Si ya existía:** abrí los dos y copiá de `config.example.php` a tu `config.php` los bloques `brand`, `event`, `release`, `about`, `faq` y `tickets` (más la línea `link_note`).

Editá `config.php` (clic derecho → Editar) y cambiá solo esto:

```php
'demo_mode' => false,                          // línea 1: apagá el modo demo
'site_url'  => 'https://tudominio.com',        // tu dominio, sin barra al final
```

En `tickets`, pegá cada link en su entrada:

```php
['id' => 'early',   ... 'link' => 'https://mpago.la/xxxxx'],
['id' => 'general', ... 'link' => 'https://mpago.la/yyyyy'],
```

En `admin`, poné dos contraseñas:

```php
'password'      => 'una-clave-larga',          // panel completo
'door_password' => 'otra-clave',               // solo el escáner de la puerta
```

En `invitations → codes`, **cambiá los códigos** por otros difíciles de adivinar (por ejemplo `evo-` + letras y números al azar). Cada código es un link que mandás: `tudominio.com/invitacion.php?c=CODIGO`.

Guardá.

---

## Paso 4 · Mail (opcional, 5 min, recomendado)

Sirve para que la lista y las invitaciones reciban su QR por mail. Sin esto igual se muestra en pantalla al anotarse.

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
- [ ] Dice **SOLARIS · for the solar people**, el line up y Damian Santos como invitado especial.
- [ ] Los dos botones "comprar en mercado pago" abren **tu** link, con el precio correcto.
- [ ] Anotate en la **lista** con tu mail: te muestra el QR y, si configuraste el mail, te llega.
- [ ] Abrí uno de tus links de **invitación** y pedí una.
- [ ] Entrá a `tudominio.com/admin` con tu contraseña y fijate que aparezcan esas dos personas.
- [ ] Entrá a `tudominio.com/admin/scan.php` con la contraseña de la puerta y escaneá tu QR.
- [ ] Desde el panel, borrá las pruebas antes de difundir.

---

## El día de la fiesta

- **Puerta:** un celular con `tudominio.com/admin/scan.php` para lista e invitaciones, y otro con la actividad de Mercado Pago (o una lista impresa) para quienes pagaron con link. La lista y las invitaciones valen hasta las 00:00.
- **Proyector:** abrí `tudominio.com/pantalla.php` en Chrome y tocá "pantalla completa".
- **Después del viernes a las 23:59:** desactivá el link de la early bird en Mercado Pago. El botón de la web ya se cierra solo, pero el link sigue funcionando si alguien lo tiene guardado.
