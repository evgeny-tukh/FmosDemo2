<?php

    require_once 'database.php';
    require_once 'fuel_mon.php';

    $database = new Database ();
    $data     = array ();
    $tanks    = array ();

    $callback = function ($row) use (&$tanks)
                {
                    $tanks [$row ['name']] = intval ($row ['id']);
                };

    $database->enumResult ("select * from vessel_tanks", $callback);

    $query = "select dh.id did,v.id vid,v.code vcd,`timestamp` ts,f.name fnm,fd.`value` vol from source_data dh ".
             "left join vessels v on dh.vessel=v.id ".
             "left join source_data_floats fd on fd.source_data=dh.id ".
             "left join source_data_fields f on f.id=fd.`field` ".
             "where v.code like 'INOK_%' and `value` is not null and f.name like 'tank%height' ".
             "order by `timestamp` desc,f.name asc limit 200";

    $callback = function ($row, $database) use (&$data, &$tanks)
                {
                    $vesselCode = trim ($row ['vcd']);
                    $tank       = intval (substr ($row ['fnm'], 4));
                    $tankName   = "tank$tank";
                    $level      = doubleval ($row ['vol']);
                    $volume     = calcFuelVolume ($vesselCode, $tankName, $level);

                    if (array_key_exists ($tankName, $tanks))
                    {
                        $tankID = $tanks [$tankName];
                    }
                    else
                    {
                        $database->execute ("insert into vessel_tanks(name) values('$tankName')");

                        $tankID = $database->insertID ();

                        $tanks [$tankName] = $tankID;
                    }

                    array_push ($data, array ('vessel' => intval ($row ['vid']),
                                              'tank'   => $tankID,
                                              'time'   => $row ['ts'],
                                              'source' => intval ($row ['did']),
                                              'volume' => $volume));
                };

    $database->enumResult ($query, $callback);

    $baseQuery = "insert into vessel_tanks_volume(vessel,tank,volume,data_source,`timestamp`) values ";
    $values    = array ();

    foreach ($data as $item)
    {
        $value = '('.$item ['vessel'].','.$item ['tank'].','.$item ['volume'].','.$item ['source'].",'".$item ['time']."')";

        array_push ($values, $value);

        if (count ($values) > 500)
        {
            $database->execute ($baseQuery.implode (',', $values));

            $values = array ();
        }
    }

    if (count ($values) > 0)
        $database->execute ($baseQuery.implode (',', $values));

    $database->close ();
