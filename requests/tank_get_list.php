<?php

    require_once '../db/database.php';
    require_once 'global_func.php';

    $result   = [];
    $database = new Database ();
    $vessel   = getKeyValue ($_REQUEST, 'v');

    if ($vessel)
    {
        $cb = function ($row) use (&$result)
              {
                  array_push ($result,
                              ['id' => intval ($row ['id']), 'name' => $row ['name'], 'depth' => doubleval ($row ['depth']),
                               'volume' => doubleval ($row ['volume'])]);
              };

        $database->enumResult ("select * from tanks where vessel=$vessel order by id", $cb);
        $database->close ();
    }

    echo json_encode ($result);
