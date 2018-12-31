<?php

    $fuelCfg = array ();

    function loadFMConfig ($configPath = 'fm_cfg')
    {
        global $fuelCfg;

        $entries = scandir ($configPath);

        foreach ($entries as $entry)
        {
            $path = "$configPath/$entry";

            if (is_dir ($path) && $path [0] !== '.')
                array_push ($fuelCfg, array ('name' => $entry, 'tanks' => loadVesselConfig ($path)));
        }
    }

    function loadScale ($scaleCfg)
    {
        $xml   = simplexml_load_string (file_get_contents ($scaleCfg), 'SimpleXMLElement', LIBXML_COMPACT | LIBXML_NOERROR | LIBXML_NOWARNING);
        $attrs = $xml->attributes ();
        $dif1  = intval ($attrs ['different1']);
        $dif2  = intval ($attrs ['different2']);
        $tbl   = explode (';', $attrs ['table']);
        $items = array ();

        foreach ($tbl as $line)
        {
            $item = explode (':', $line);

            if (count ($item) > 2)
            {
                foreach ($item as $index => $part)
                    $item [$index] = doubleval ($part);

                array_push ($items, $item);
            }
        }

        return array ('dif1' => $dif1, 'dif2' => $dif2, 'items' => $items);
    }

    function loadVesselConfig ($cfgPath)
    {
        $entries = scandir ($cfgPath);
        $config  = array ();

        foreach ($entries as $entry)
        {
            $path = "$cfgPath/$entry";

            if (!is_dir ($path))
            {
                $extPos = stripos ($entry, '.xml');

                if ($extPos > 0)
                    array_push ($config, array ('name' => substr ($entry, 0, $extPos), 'scale' => loadScale ($path)));
            }
        }

        return $config;
    }

    function findTankTable ($vessel, $tank)
    {
        global $fuelCfg;

        foreach ($fuelCfg as $vesselConfig)
        {
            if ($vesselConfig ['name'] === $vessel)
            {
                foreach ($vesselConfig ['tanks'] as $tankConfig)
                {
                    if ($tankConfig ['name'] === $tank)
                        return $tankConfig ['scale'];
                }
            }
        }

        return array ();
    }

    function calcFuelVolume ($vessel, $tank, $level)
    {
        global $fuelCfg;

        $result = NULL;
        $table  = findTankTable ($vessel, $tank);
//echo "Look for tank table (vessel: $vessel, tank $tank<br/>";
//var_dump($fuelCfg);
//echo "<br/>";
        $scale  = $table ['items'];
        $found  = FALSE;
        $count  = count ($scale);

        for ($i = 1; $i < $count && !$found; ++ $i)
        {
            if ($level >= $scale [$i-1][0] && $level < $scale [$i][0])
            {
                $found  = TRUE;
                $result = $scale [$i-1][1] + ($level - $scale [$i-1][0]) / ($scale [$i][0] - $scale [$i-1][0]) * ($scale [$i][1] - $scale [$i-1][1]);
            }
        }

        if (!$found)
        {
            $lastLevel  = $scale [$count-1][0];
            $lastVolume = $scale [$count-1][1];
            $result     = doubleval ($level) / $scale [$count-1][0] * $scale [$count-1][1];
        }

        return $result;
    }
