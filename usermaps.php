<?php
    require_once 'data.php';
?>
<?php 
    $users_map = get_user_by_ids($_GET['ids']); 
    foreach($users_map as $user) :?>
    <div class="col-xs-12 item-popup">
        <div class="col-xs-2">
            <a href="profile.php?id=<?=$user['id']?>">
                <img src="<?=$user['thumb']?>" style="height: 50px;"/>
            </a>
        </div>
        <div class="col-xs-8"><?= $user['name'];?></div>
        <div class="col-xs-2">
            <a class="btn btn-success" href="profile.php?id=<?=$user['id']?>">Click me!</a>
        </div>
    </div>     
<?php endforeach;?>
<div style="clear: both"></div>