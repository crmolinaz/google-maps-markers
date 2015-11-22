<?php

/**
 * Global user data. Just for the example.
 */
$users = array(
    array(
        'id' => '1',
        'name' => 'Homer Simpson',
        'thumb' => 'img/homero.jpg',
        'location_latitude' => '38.787297',
        'location_longitude' => '-77.195259'
    ),
    array(
        'id' => '2',
        'name' => 'Lisa Simpson',
        'thumb' => 'img/lisa.png',
        'location_latitude' => '38.7767926',
        'location_longitude' => '-77.2117386'
    ),
    array(
        'id' => '3',
        'name' => 'Marge Simpson',
        'thumb' => 'img/marge.jpg',
        'location_latitude' => '38.786695',
        'location_longitude' => '-77.168137'
    ),
    array(
        'id' => '4',
        'name' => 'Bart Simpson',
        'thumb' => 'img/bart.png',
        'location_latitude' => '38.801385',
        'location_longitude' => '-77.156199'
    ),
    array(
        'id' => '5',
        'name' => 'Santa Helper',
        'thumb' => 'img/santas_little_helper.jpg',
        'location_latitude' => '38.798980',
        'location_longitude' => '-77.157173'
    ),
    array(
        'id' => '6',
        'name' => 'Apú Market',
        'thumb' => 'img/apu.png',
        'location_latitude' => '38.764891',
        'location_longitude' => '-77.226489'
    )
);

/**
 * Return a user that coincide with the id
 * @global array $users global for the example
 * @param integer $id
 * @return array user data, if is not found a empty array
 */
function get_user_by_id($id) {
    global $users;
    foreach($users as $user) {
        if($user['id'] == $id) {
            return $user;
        }
    }
    return array();
}

/**
 * Search by ids into user array
 * @global array $users
 * @param type $ids
 * @return type
 */
function get_user_by_ids($ids) {
    global $users;
    
    $_ids = explode('-', $ids);
    $return = array();
    foreach($users as $user) {
        foreach($_ids as $_id) {
            if($user['id'] == $_id) {
                $return[] = $user;
                break;
            }
        }
    }
    return $return;
}

function printArray($array) {
    echo '<pre>';
    print_r($array);
    echo '</pre>';
}