<?php

    require_once '../db/database.php';
    require_once 'global_func.php';

    $result   = [];
    $database = new Database ();
    $day      = getKeyValue ($_REQUEST, 'd');
    $tank     = getKeyValue ($_REQUEST, 't');

    if ($tank && $day)
    {
        $day = intval ($day);

        if ($day > 3000000000)
           $day /= 1000;

        $beginStr = localTimeStringToUTCString (dateToStr ($day).' 00:00:00');
        $endStr   = localTimeStringToUTCString (dateToStr ($day).' 23:59:59');

        $cb = function ($row) use (&$result)
              {
                  array_push ($result,
                              ['id' => intval ($row ['id']), 'time' => getTimestamp ($row ['time']) * 1000, 'type' => intval ($row ['type']), 
                               'amount' => doubleval ($row ['amnt']), 'subject' => intval ($row ['subj']), 'subjName' => $row ['sbnm']]);
              };

        $query = "select o.id id,o.time time,o.type type,o.amount amnt,o.subject subj,t.name sbnm ".
                 "from fuel_operations o left join tanks t on o.subject=t.id ".
                 "where o.tank=$tank and o.time between '$beginStr' and '$endStr' order by o.time";
//echo "$query<br/>";
        $database->enumResult ($query, $cb);
        $database->close ();
    }

    echo json_encode ($result);
