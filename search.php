<?php

require_once 'data.php';

header('Content-type: application/json');
global $users;
echo json_encode($users);
exit;
