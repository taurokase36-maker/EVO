# Crew del domingo 11/10: propuestas personalizadas

Una propuesta en PDF por amigo, según su rol en Somos Uno × Melt:

| Rol (`rol` en amigos.json) | Para quién | Qué le ofrecés |
|---|---|---|
| `embajador` | Amigos con muchos amigos | Entrada libre, link propio, $1.000 por entrada vendida y niveles: 5 personas, 10 personas y "el que más trae" |
| `productora` | Productoras audiovisuales | Crédito y posteo collab, material libre para su reel, música tuya sin problemas de derechos, el equipo entra como crew |
| `fotografia` | Fotógrafos | Crédito en cada foto, su foto como portada del próximo flyer, entrada +1 |
| `redes` | Gente de redes y creadores | Posteos collab con alcance doble, contenido exclusivo, link con comisión |
| `escenografia` | El arquitecto o la persona de producción artística | Crédito de dirección de arte, la obra registrada para su portfolio, materiales a tu cargo |
| `vj` | VJs | Aparecen en el line up como artistas, su set grabado, el mapa de tus sets y la pantalla en vivo |

Además, a toda la crew: crédito en todo, prioridad (y paga) en las próximas fechas, y un favor tuyo a elección (clase de Ableton, música para un video o un set).

## Cómo personalizar

1. Abrí `amigos.json` y escribí una línea por amigo:
   ```json
   { "nombre": "Juli", "rol": "productora", "marca": "Kiwi Films", "nota": "Desde lo que filmaron en Kiany Fest quería hacer algo juntos." }
   ```
   - `nombre` vacío: la propuesta dice "para vos".
   - `marca`: el nombre de la productora (solo para el rol `productora`).
   - `nota`: una o dos líneas tuyas, aparecen arriba del "¿Por qué vos?". Es lo que más personaliza la propuesta.
   - `invitaciones`: opcional, cambia la cantidad de invitaciones de ese amigo.
2. Generá los PDFs: `node propuestas/crew_11_10/generar.mjs` (necesita Playwright).
3. Quedan en `propuestas/crew_11_10/pdf/`.

Los textos de cada rol están en `contenido.mjs`, por si querés cambiar algo.

## Antes de mandarlos

- **Links de embajador:** agregá a cada embajador (y a la gente de redes) en `config.php` → `ambassadors`, por ejemplo `'juli' => 'Juli'`. Su link es `tudominio.com/?ref=juli` y el panel muestra el ranking.
- **Invitaciones:** cada propuesta promete 1 o 2 invitaciones, que salen de tus 15. Contá cuántas comprometés antes de mandar todo.
- **Crew en puerta:** la crew entra sin invitación, así que pasale a la puerta una lista con los nombres.
- **Melt:** antes de confirmar al VJ y al arquitecto, confirmá con Melt el proyector, la visita del miércoles 7 y el armado desde las 14:00.

## Mensaje para acompañar el PDF (WhatsApp)

> Hola [nombre]! El domingo 11 hago la primera fecha de Somos Uno en Melt y quiero armar una crew de amigos que la hagan conmigo. Pensé en vos para [rol]. Te paso la propuesta: es concreta, es para esta semana y tiene cosas para vos también. Si te copa, hablamos mañana 15 minutos y lo cerramos 🙌
