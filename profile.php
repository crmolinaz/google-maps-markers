<?php

require_once 'data.php';

$profile_id = $_GET['id'];
printArray(get_user_by_id($profile_id));
