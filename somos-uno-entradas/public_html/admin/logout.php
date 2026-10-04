<?php
declare(strict_types=1);
require __DIR__ . '/../app/lib.php';

start_session();
$_SESSION = [];
session_destroy();
redirect('index.php');
