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
    'site_url' => 'https://tudominio.com',

    'timezone' => 'America/Argentina/Buenos_Aires',

    // ---------------------------------------------------------------
    //  MARCA
    // ---------------------------------------------------------------
    'brand' => [
        'name'          => 'Somos Uno',
        'logo'          => 'assets/logo.svg',   // Reemplazalo por tu logo real (png o svg) y cambiá el nombre acá.
        'instagram'     => 'somos.uno._',
        'contact_email' => 'evo.evomusic@gmail.com',
        'colors' => [
            'bg'     => '#0b0930',  // fondo
            'glow'   => '#3a2cf0',  // brillo azul del centro
            'accent' => '#9d8cff',  // detalles
            'cream'  => '#f3e6cf',  // texto principal
        ],
    ],

    // ---------------------------------------------------------------
    //  EVENTO
    // ---------------------------------------------------------------
    'event' => [
        'title'      => 'Somos Uno × Melt Underground',
        'kicker'     => 'somos uno × melt underground',
        'headline'   => 'bajo tierra.',
        'date_label' => 'domingo 11·10',
        'time_label' => '[HORARIO]',            // ej: 23:00 a 06:00
        'starts_at'  => '2026-10-11 23:00',     // para la cuenta regresiva
        'venue'      => 'Melt Underground',
        'address'    => 'Laprida 1423, Recoleta',
        'maps_url'   => 'https://maps.google.com/?q=Laprida+1423,+Buenos+Aires',
        'genres'     => 'minimal · house · techno',
        'lineup'     => ['EVO', 'ODA', 'Sandman'],
        'tagline'    => 'somos uno y estamos en una. esta vez, bajo tierra.',
        'joke'       => 'el lunes es feriado. tu excusa, no.',
        'age'        => '+18 con DNI',
        'door_price' => 10000,                  // precio en puerta (solo informativo)
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
        ['id' => 'early',   'name' => 'Early bird', 'price' => 5000,  'anchor' => 10000, 'stock' => 50,  'until' => '2026-10-09 23:59', 'note' => 'cupo limitado'],
        ['id' => 'general', 'name' => 'General',    'price' => 10000, 'anchor' => 0,     'stock' => 250, 'until' => null,               'note' => 'mismo precio que en puerta'],
    ],
    'max_per_order'       => 4,
    'service_fee_percent' => 0,    // ej: 5 = se le suma 5% al comprador como "cargo por servicio"
    'reserve_minutes'     => 30,   // cuánto se reserva el cupo mientras la persona paga

    // ---------------------------------------------------------------
    //  LISTA PÚBLICA (gratis anotarse, beneficio en puerta)
    // ---------------------------------------------------------------
    'lista' => [
        'enabled'  => true,
        'benefit'  => '$7.000 en puerta hasta la 1:00',
        'capacity' => 150,
        'closes'   => '2026-10-11 20:00',
    ],

    // ---------------------------------------------------------------
    //  INVITACIONES (gratis, privadas, con cupo por persona)
    //  Cada código es un link: tudominio.com/invitacion.php?c=CODIGO
    //  CAMBIÁ LOS CÓDIGOS por otros difíciles de adivinar.
    // ---------------------------------------------------------------
    'invitations' => [
        'valid_until' => '2026-10-12 01:00',
        'rules'       => 'Nominal, con DNI. Válida hasta la 1:00: después se paga la general.',
        'codes' => [
            'evo-k7m2q'     => ['owner' => 'EVO',     'quota' => 15],
            'oda-r4t8w'     => ['owner' => 'ODA',     'quota' => 15],
            'sandman-p9x3v' => ['owner' => 'Sandman', 'quota' => 15],
            'melt-h2n6z'    => ['owner' => 'Melt',    'quota' => 10],
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
        ['¿hay dress code?', 'venir.'],
        ['¿es en un sótano?', 'sí, y suena hermoso.'],
        ['¿es una secta?', 'no, es minimal.'],
        ['¿a qué hora termina?', 'el lunes es feriado. no preguntes eso.'],
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
