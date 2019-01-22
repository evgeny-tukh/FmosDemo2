<?php

    require_once '../db/database.php';
    require_once 'global_func.php';

    $data   = json_decode (file_get_contents ("php://input"), true);
    $result = 0;

    if ($data)
    {
        $database = new Database ();
        $id       = getKeyValue ($data, 'id');
        $name     = getKeyValue ($data, 'name');
        $depth    = getKeyValue ($data, 'depth', 'null');
        $volume   = getKeyValue ($data, 'volume', 'null');
        $vessel   = getKeyValue ($data, 'vessel');

        if ($vessel)
        {
            if ($id > 0)
                $query = "update tanks set name='$name',depth=$depth,volume=$volume where id=$id";
            else
                $query = "insert into tanks(name,depth,volume,vessel) values('$name',$depth,$volume,$vessel)";

            $database->execute ($query);

            $result = $id > 0 ? $id : $database->insertID ();
        }

        $database->close ();
    }

    echo $result;
