<?php
// =====================================================================
//  SOMOS UNO · ENTRADAS: CONFIGURACIÓN
//
//  1. Copiá este archivo como config.php (en esta misma carpeta app/).
//  2. Completá los datos. Todo lo que se ve en la página sale de acá.
//  3. Nunca compartas config.php: tiene tus claves.
// =====================================================================

return [

    // Modo demo: true = los pagos se aprueban solos, para probar el sitio SIN Mercado Pago.
    // Antes de vender de verdad, cambialo a false.
    'demo_mode' => true,

    // Dirección de tu sitio, con https y sin barra al final.
    // Si lo dejás vacío se detecta solo. Ej: 'https://somosuno.com.ar'
    'site_url' => '',

    'timezone' => 'America/Argentina/Buenos_Aires',

    // ---------------------------------------------------------------
    //  MARCA
    // ---------------------------------------------------------------
    'brand' => [
        'name'          => 'Somos Uno',
        'logo'          => 'assets/logo.svg',
        'partner_logo'  => 'assets/melt.webp',  // logo de Melt (aparece junto al de Somos Uno). '' = no mostrar.
        'instagram'     => 'somos.uno._',
        'contact_email' => 'evo.evomusic@gmail.com',
        'colors' => [
            'bg'     => '#070202',  // fondo: negro eclipse
            'glow'   => '#6b0d07',  // corona: rojo oscuro
            'accent' => '#d9482c',  // detalles: rojo brasa
            'cream'  => '#efe2d6',  // texto principal
        ],
    ],

    // ---------------------------------------------------------------
    //  EVENTO
    // ---------------------------------------------------------------
    'event' => [
        'title'      => 'Somos Uno × Melt Underground presentan THE ECLIPSE · release party de THE SUN',
        'kicker'     => 'somos uno × melt underground presentan',
        'headline'   => 'THE ECLIPSE',
        'subhead'    => 'release party de THE SUN',
        'date_label' => 'domingo 11·10',
        'time_label' => '18:00 a 03:00',
        'starts_at'  => '2026-10-11 18:00',     // para la cuenta regresiva
        'capacity'   => 160,                    // capacidad total del lugar
        'venue'      => 'Melt Underground',
        'address'    => 'Laprida 1423, Recoleta',
        'maps_url'   => 'https://maps.google.com/?q=Laprida+1423,+Buenos+Aires',
        'genres'     => 'minimal · house · techno',
        'lineup'     => ['EVO', 'ODA', 'Sandman'],
        'motto'      => 'todos bajo el mismo sol.',
        'age'        => '+18 con DNI',
        'door_price' => 10000,                  // precio en puerta (solo informativo)
    ],

    // Bloque del lanzamiento en la landing. '' en title = no mostrar.
    'release' => [
        'label' => 'el lanzamiento',
        'title' => 'THE SUN',
        'text'  => 'El nuevo álbum de EVO no sale de una vez: sale de a un single. La corona del sol solo se ve '
                 . 'durante un eclipse: esa noche, en el sótano de Melt, suena el primero. Entrás con el ocaso y salís con otra luz.',
    ],

    'pillars' => [
        ['Unidad',      'Público, artistas y espacio somos una sola cosa. La fiesta la hacemos entre todos.'],
        ['Conexión',    'Groove largo para que la pista viaje junta durante horas.'],
        ['Consciencia', 'Una noche cuidada: que cada persona se vaya mejor de lo que llegó.'],
    ],

    // ---------------------------------------------------------------
    //  ENTRADAS PAGAS (se muestran en este orden)
    //  price  = precio real
    //  anchor = precio tachado de referencia (0 = no mostrar)
    //  stock  = cuántas hay
    //  until  = hasta cuándo se vende ('AAAA-MM-DD HH:MM') o null
    // ---------------------------------------------------------------
    'tickets' => [
        ['id' => 'early',   'name' => 'Early bird', 'price' => 5000,  'anchor' => 10000, 'stock' => 30,  'until' => '2026-10-09 23:59', 'note' => 'cupo limitado'],
        ['id' => 'general', 'name' => 'General',    'price' => 10000, 'anchor' => 0,     'stock' => 65,  'until' => null,               'note' => 'mismo precio que en puerta'],
    ],
    'max_per_order'       => 4,
    'service_fee_percent' => 0,    // ej: 5 = se le suma 5% al comprador como "cargo por servicio"
    'reserve_minutes'     => 30,   // cuánto se reserva el cupo mientras la persona paga

    // ---------------------------------------------------------------
    //  LISTA PÚBLICA (gratis anotarse, beneficio en puerta hasta valid_until de invitaciones)
    // ---------------------------------------------------------------
    'lista' => [
        'enabled'  => true,
        'benefit'  => '$7.000 en puerta hasta las 00:00',
        'note'     => 'Sujeto a capacidad del lugar.',
        'capacity' => 40,
        'closes'   => '2026-10-11 20:00',
    ],

    // ---------------------------------------------------------------
    //  INVITACIONES (gratis, privadas, con cupo por persona)
    //  Cada código es un link: tudominio.com/invitacion.php?c=CODIGO
    //  CAMBIÁ LOS CÓDIGOS por otros difíciles de adivinar.
    // ---------------------------------------------------------------
    'invitations' => [
        // Desde esta hora el QR de invitación deja de servir y el beneficio de la lista vence.
        'valid_until' => '2026-10-12 00:00',
        'rules'       => 'Nominal, con DNI. Válida hasta las 00:00: después se paga la general.',
        'codes' => [
            'evo-k7m2q'     => ['owner' => 'EVO',     'quota' => 15],
            'oda-r4t8w'     => ['owner' => 'ODA',     'quota' => 5],
            'sandman-p9x3v' => ['owner' => 'Sandman', 'quota' => 5],
        ],
    ],

    // Embajadores: links de difusión para saber quién trae más gente.
    // tudominio.com/?ref=oda  → las compras y la lista quedan a nombre de ODA.
    'ambassadors' => [
        'evo'     => 'EVO',
        'oda'     => 'ODA',
        'sandman' => 'Sandman',
    ],

    'faq' => [
        ['¿qué es THE SUN?', 'el nuevo álbum de EVO. sale de a un single y el primero se estrena esa noche.'],
        ['¿por qué THE ECLIPSE?', 'el 10 hay luna nueva: la luna pasa entre la tierra y el sol. el 11 se esconde a las 20:26 y queda la noche más oscura del mes. adentro, sale el sol.'],
        ['¿hay dress code?', 'negro. venir.'],
        ['¿es en un sótano?', 'sí, y suena hermoso.'],
        ['¿es una secta?', 'no, es minimal.'],
        ['¿a qué hora termina?', 'a las 3:00.'],
        ['¿hasta qué hora valen la lista y las invitaciones?', 'hasta las 00:00. después, entrada general.'],
        ['¿hay edad mínima?', '+18 con DNI.'],
        ['¿puedo comprar en puerta?', 'sí, a precio general. online sale menos si llegás a la early bird.'],
    ],

    // ---------------------------------------------------------------
    //  MERCADO PAGO
    //  Mercado Pago Developers → Tus integraciones → Credenciales de producción → Access Token
    // ---------------------------------------------------------------
    'mercadopago' => [
        'access_token'         => '',          // APP_USR-... (o TEST-... para probar)
        'webhook_secret'       => '',          // opcional: "clave secreta" de Webhooks
        'statement_descriptor' => 'SOMOSUNO',  // lo que aparece en el resumen de tarjeta
        'fee_percent'          => 5.31,        // solo para el cálculo del neto en el panel (4,39% + IVA a 10 días)
    ],

    // ---------------------------------------------------------------
    //  MAIL (para mandar las entradas). Usá una casilla de Hostinger.
    //  Si lo dejás vacío, la entrada igual se muestra en pantalla después de pagar.
    // ---------------------------------------------------------------
    'mail' => [
        'from_email' => '',                   // ej: entradas@tudominio.com
        'from_name'  => 'Somos Uno',
        'smtp_host'  => 'smtp.hostinger.com',
        'smtp_port'  => 465,
        'smtp_user'  => '',                   // la misma casilla
        'smtp_pass'  => '',                   // su contraseña
    ],

    // ---------------------------------------------------------------
    //  ACCESO AL PANEL (tudominio.com/admin)
    //  password      = acceso completo
    //  door_password = solo escáner de la puerta
    // ---------------------------------------------------------------
    'admin' => [
        'password'      => '',
        'door_password' => '',
    ],

    // Base de datos: SQLite por defecto (no hay que configurar nada).
    // Si tu hosting no tiene SQLite, creá una base MySQL en hPanel y usá:
    // 'dsn' => 'mysql:host=localhost;dbname=NOMBRE_BASE;charset=utf8mb4', 'user' => 'USUARIO', 'pass' => 'CLAVE'
    'db' => [
        'dsn'  => 'sqlite:' . __DIR__ . '/../data/somosuno.sqlite',
        'user' => null,
        'pass' => null,
    ],
];
