<?php
// Runs once the SDK is installed: the install check for the Get started page.
require __DIR__ . '/vendor/autoload.php';

use Docuconf\Env;

$env = Env::declare('app');
$env->ifPresent('PORT')->isInteger()->between(1, 65535)->default(8080)->describe('HTTP listen port');

echo $env->load([])->int('PORT') === 8080 ? "ok\n" : "PORT is not 8080\n";
