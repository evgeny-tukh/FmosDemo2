<?php

    require_once '../db/database.php';
    require_once 'global_func.php';

    $result   = [];
    $database = new Database ();
    $id       = getKeyValue ($_REQUEST, 'id');
    $affected = 0;

    if ($id)
    {
        $database->execute ("delete from tanks where id=$id");

        $affected = $database->affectedRows ();

        $database->close ();
    }

    echo $affected;
