<?php

    require_once '../db/database.php';
    require_once 'global_func.php';

    $database = new Database ();

    $vessels     = [];
    $curVesselID = -1;
    $curVessel   = [ 'sensors' => [] ];

    $callback = function ($row, $db) use (&$vessels, &$curVesselID, &$curVessel)
    {
        $vesselID = intval ($row ['vid']);

        if ($curVesselID != $vesselID)
        {
            if (count ($curVessel ['sensors']) > 0)
            {
                array_push ($vessels, $curVessel);

                $curVessel = [ 'sensors' => [] ];
            }

            $curVesselID = $vesselID;

            $curVessel ['id']      = $vesselID;
            $curVessel ['name']    = $row ['vname']; //mb_convert_encoding ($row ['vname'], 'Windows-1251', 'UTF-8');
            $curVessel ['device']  = $row ['vdev'];
            $curVessel ['sensors'] = [];
        }

        array_push ($curVessel ['sensors'],
                    [
                      'id'     => intval ($row ['sid']),
                      'num'    => intval ($row ['snum']),
                      'analog' => intval ($row ['sanl']) != 0,
                      'descr'  => $row ['sdsc'], //mb_convert_encoding ($row ['sdsc'], 'UTF-8', 'Windows-1251'),
                      'minOut' => doubleval ($row ['smino']),
                      'maxOut' => doubleval ($row ['smaxo']),
                      'minAct' => doubleval ($row ['smina']),
                      'maxAct' => doubleval ($row ['smaxa'])
                    ]);
//echo "Sensors: ".count($curVessel ['sensors'])."<br/>";
    };

    $query = 'select v.id vid,v.name vname,v.device vdev,s.id sid,s.sensor_num snum,s.analog sanl,s.description sdsc,s.min_output smino,'.
             's.max_output smaxo,s.min_actual smina,s.max_actual smaxa from vessels v left join sensors s on v.id=s.vessel order by v.id,s.sensor_num';

    $database->enumResult ($query, $callback);

    if (count ($curVessel ['sensors']) > 0)
        array_push ($vessels, $curVessel);

    for ($i = 0; $i < count ($vessels); ++ $i)
    {
        $lat         = NULL;
        $lon         = NULL;
        $firstReport = NULL;
        $lastReport  = NULL;

        $callback = function ($row) use (&$lat, &$lon)
                    {
                        $lat = doubleval ($row ['lat']);
                        $lon = doubleval ($row ['lon']);
                    };

        $database->processResult ('select lat,lon from tracks where vessel='.$vessels [$i]['id'].' order by timestamp desc limit 1', $callback);

        $vessels [$i]['lat'] = $lat;
        $vessels [$i]['lon'] = $lon;

        $callback = function ($row) use (&$firstReport, &$lastReport)
                    {
                        if ($row ['tmin'] && $row ['tmax'])
                        {
                            $firstReport = getTimestamp ($row ['tmin'], TRUE);
                            $lastReport  = getTimestamp ($row ['tmax'], TRUE);
                        }
                    };

        $database->processResult ('select max(timestamp) tmax,min(timestamp) tmin from tracks where timestamp is not null and vessel='.$vessels [$i]['id'], $callback);

        $vessels [$i]['firstReport'] = $firstReport;
        $vessels [$i]['lastReport']  = $lastReport;
    }

    $database->close ();

    echo json_encode ($vessels);
