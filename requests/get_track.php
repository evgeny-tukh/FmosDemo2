<?php

    require_once '../db/database.php';
    require_once '../session/session_mgr.php';
    require_once '../util/util.php';

    $vessel = getArrayValue ($_REQUEST, 'v', NULL);
    $end    = getArrayValue ($_REQUEST, 'e', time ());
    $begin  = getArrayValue ($_REQUEST, 'b', NULL);

    if (!$begin)
    {
        $parts = getdate ($end);
        $year  = $parts ['year'];
        $month = $parts ['mon'];
        $day   = $parts ['mday'];
        $hours = $parts ['hours'];
        $min   = $parts ['minutes'];
        $sec   = $parts ['seconds'];

        if ($month > 1)
        {
            -- $month;
        }
        else
        {
            $month = 12;

            -- $year;
        }

        $begin = gmmktime ($hours, $min, $sec, $month, $day, $year);
    }

    $beginTime = mysqlTime ($begin, TRUE);
    $endTime   = mysqlTime ($end, TRUE);

    $track = [];

    $sessionMgr = new SessionManager ();

    $curTime = time ();
    
    if (!$sessionMgr->isAuthenticated () || $sessionMgr->isSessionExpired ())
    {
        include ('../login.html');

        exit (0);
    }
    else
    {
        $sessionMgr->setAccessTime ();
    }

    $db = new Database ();

    $callback = function ($row, $db, &$track)
                {
                    $item = ['time' => getTimestamp ($row ['timestamp'], TRUE), 'lat' => doubleval ($row ['lat']), 'lon' => doubleval ($row ['lon'])];

                    array_push ($track, $item);
                };

    $query = "select `timestamp`,lat,lon from tracks where vessel=$vessel and timestamp between $beginTime and $endTime order by `timestamp`";

    $db->enumResult ($query, $callback, $track);
    $db->close ();

    reportAndExit (TRUE, 'OK', $track, FALSE);
