<?php
declare(strict_types=1);

/** Rol de la sesión actual: 'admin', 'door' o null. */
function current_role(): ?string
{
    start_session();
    return $_SESSION['role'] ?? null;
}

function try_login(string $password): ?string
{
    $admin = (string) cfg('admin.password', '');
    $door = (string) cfg('admin.door_password', '');
    $role = null;
    if ($admin !== '' && hash_equals($admin, $password)) {
        $role = 'admin';
    } elseif ($door !== '' && hash_equals($door, $password)) {
        $role = 'door';
    }
    if ($role) {
        start_session();
        session_regenerate_id(true);
        $_SESSION['role'] = $role;
        $_SESSION['csrf'] = new_token();
    } else {
        sleep(1);  // frena intentos por fuerza bruta
    }
    return $role;
}

/** Corta la ejecución si el rol no alcanza. $json = respuesta para la API. */
function require_role(string $needed, bool $json = false): string
{
    $role = current_role();
    $ok = $role === 'admin' || ($needed === 'door' && $role === 'door');
    if ($ok) {
        return $role;
    }
    if ($json) {
        http_response_code(401);
        header('Content-Type: application/json');
        exit(json_encode(['ok' => false, 'error' => 'Sesión vencida. Volvé a entrar.']));
    }
    redirect('index.php');
    return '';
}
