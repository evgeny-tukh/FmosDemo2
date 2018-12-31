<?php

    require_once 'database.php';
    require_once 'nmea.php';
    require_once 'util.php';

    $database = new Database ();
    $data     = array ();

    /*$callback = function ($row) use (&$data)
                {
                    $vesselID  = intval ($row ['vessel']);
                    $timestamp = $row ['timestamp'];

                    if (!array_key_exists ($vesselID, $data))
                        $data [$vesselID] = array ();

                    $data [$vesselID][$timestamp] = array ('lat' => doubleval ($row ['lat']), 'lon' => doubleval ($row ['lon']));
                };

    $database->enumResult ("select * from vessel_tracks", $callback);*/

    $gen1powerID = 0;
    $gen2powerID = 0;
    $ggaID       = 0;

    $callback = function ($row) use (&$gen1powerID, &$gen2powerID, &$ggaID)
                {
                    if ($row ['name'] === 'gen1.power')
                        $gen1powerID = intval ($row ['id']);
                    else if ($row ['name'] === 'gen2.power')
                        $gen2powerID = intval ($row ['id']);
                    else if ($row ['name'] === 'GPGGA')
                        $ggaID = intval ($row ['id']);
                };

    $database->enumResult ("select * from source_data_fields where name like 'gen%.power' or name='GPGGA'", $callback);

    $query = "select d.id did,`field` fid,f.value val,d.timestamp ts,d.vessel vid from source_data_integers f ".
             "left join source_data d on d.id=f.source_data left join vessels v on d.vessel=v.id ".
             "where field in ($gen1powerID,$gen2powerID) and v.code like 'INOK_%'";

    $callback = function ($row) use (&$data, &$gen1powerID, &$gen2powerID)
                {
                    $vesselID  = intval ($row ['vid']);
                    $timestamp = $row ['ts'];
                    $fieldID   = intval ($row ['fid']);
                    $value     = doubleval ($row ['val']);
                    $sourceID  = intval ($row ['did']);

                    if (!array_key_exists ($vesselID, $data))
                        $data [$vesselID] = array ();

                    if (!array_key_exists ($timestamp, $data [$vesselID]))
                        $data [$vesselID][$timestamp] = array ();

                    $data [$vesselID][$timestamp]['sourceID'] = $sourceID;

                    if ($fieldID === $gen1powerID)
                    {
                        $data [$vesselID][$timestamp]['gen1power'] = $value;
                    }
                    else if ($fieldID === $gen2powerID)
                    {
                        $data [$vesselID][$timestamp]['gen2power'] = $value;
                    }
                };

    $database->enumResult ($query, $callback);

    $query = "select d.id,`field` fid,f.value val,d.timestamp ts,d.vessel vid from source_data_strings f ".
             "left join source_data d on d.id=f.source_data left join vessels v on d.vessel=v.id ".
             "where `field`=$ggaID and v.code like 'INOK_%'";

    $callback = function ($row) use (&$data, &$ggaID)
                {
                    $vesselID  = intval ($row ['vid']);
                    $timestamp = $row ['ts'];
                    $fieldID   = intval ($row ['fid']);
                    $value     = $row ['val'];

                    if (!array_key_exists ($vesselID, $data))
                        $data [$vesselID] = array ();

                    if (!array_key_exists ($timestamp, $data [$vesselID]))
                        $data [$vesselID][$timestamp] = array ();

                    if ($fieldID === $ggaID)
                    {
                        if ($value [0] !== '$')
                            $value = correctCorruptedGGA ($value);

                        $gga = new NmeaSentence ($value);

                        if ($gga->validCRC)
                        {
                            $utc  = $gga->getUTC (1, TRUE);
                            $lat  = $gga->getLat (2, TRUE);
                            $lon  = $gga->getLon (4, TRUE);
                            $qual = $gga->getIntField (6, TRUE);

                            if ($lat !== NULL && $lon !== NULL && (abs ($lat) > 0.001 || abs ($lon) > 0.001) && $utc !== NULL)
                            {
                                $data [$vesselID][$timestamp]['lat'] = $lat;
                                $data [$vesselID][$timestamp]['lon'] = $lon;
                                $data [$vesselID][$timestamp]['utc'] = $utc;
                            }
                        }
                    }
                };

    $database->enumResult ($query, $callback);

    $values = array ();

    foreach ($data as $vesselID => $vesselData)
    {
        foreach ($vesselData as $timestamp => $record)
        {
            $sourceID  = getArrayValue ($record, 'sourceID');
            $lat       = getArrayValue ($record, 'lat');
            $lon       = getArrayValue ($record, 'lon');
            $utc       = getArrayValue ($record, 'utc');
            $gen1power = getArrayValue ($record, 'gen1power');
            $gen2power = getArrayValue ($record, 'gen2power');

            array_push ($values, "($vesselID,$sourceID,'$timestamp',$lat,$lon,$gen1power,$gen2power,$utc)");

            if (count ($values) > 200)
            {
                $query = "insert into vessel_data(vessel,data_source,time,lat,lon,gen1_power,gen2_power,gps_time) values ".implode (',', $values);

                $database->execute ($query);

                $values = array ();
            }
        }
    }

    if (count ($values) > 0)
    {
        $query = "insert into vessel_data(vessel,data_source,time,lat,lon,gen1_power,gen2_power,gps_time) values ".implode (',', $values);

        $database->execute ($query);
    }

    function correctCorruptedGGA ($string)
    {
        $fake = '$GPGGA,'.$string.'*00';
        $crc  = NmeaSentence::calcCRC ($fake);

        return '$GPGGA,'.$string.sprintf ('*%02X', $crc);
    }

