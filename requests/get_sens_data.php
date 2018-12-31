<?php

    require_once '../db/database.php';
    require_once '../session/session_mgr.php';
    require_once '../util/util.php';

    $sensor = getArrayValue ($_REQUEST, 's', NULL);
    $end    = getArrayValue ($_REQUEST, 'e', time ());
    $begin  = getArrayValue ($_REQUEST, 'b', NULL);
    $interv = getArrayValue ($_REQUEST, 'i', 3600);

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
    $data      = [];

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

    $callback = function ($row, $db, &$data)
                {
                    $item = ['time' => getTimestamp ($row ['timestamp'], TRUE), 'measuredVal' => doubleval ($row ['mval']), 'actualVal' => doubleval ($row ['aval'])];

                    array_push ($data, $item);
                };

    $query = "select floor (time_to_sec(timediff(`timestamp`,$beginTime))/$interv) td,".
             "`timestamp`,measured_val mval,actual_val aval from `values` where sensor=$sensor and timestamp between $beginTime and $endTime ".
             "group by td order by `timestamp`";

    $db->enumResult ($query, $callback, $data);
    $db->close ();

    reportAndExit (TRUE, 'OK', $data, FALSE);
