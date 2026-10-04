<?php
declare(strict_types=1);
require __DIR__ . '/app/lib.php';

// Datos públicos para la pantalla del proyector: solo mensajes aprobados y el contador de gente adentro.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

echo json_encode([
    'inside'   => people_inside(),
    'capacity' => (int) cfg('event.capacity', 0),
    'messages' => approved_messages(80),
], JSON_UNESCAPED_UNICODE);
