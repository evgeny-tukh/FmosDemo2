<?php

    const UN_DECODED = 'П.Транско';
    const UN_ENCODED = '400d63875dcb456ca61d4549c773a8e50b0a69d2';
    const PW_DECODED = '12345';
    const PW_ENCODED = '8cb2237d0679ca88db6464eac60da96345513964';

    require_once 'database.php';
    require_once 'util.php';

    $pattern = getArrayValue ($_REQUEST, 'pt', NULL);

    $fleet = [];

    checkAccess ();
//echo "UM:'".sha1($userName)."', P:'".sha1($password)."'<br/>";
    $db = new Database ();

    $callback = function ($row, $db, &$fleet)
                {
                    $item = ['name' => $row ['name'], 
                             'imo'  => intval ($row ['imo']), 
                             'id'   => intval ($row ['id']), 
                             'code' => $row ['code'],
                             'lat'  => doubleval ($row ['lat']),
                             'lon'  => doubleval ($row ['lon']),
                             'last' => getTimestamp2 ($row ['last_report'])];

                    array_push ($fleet, $item);
                };

    $query = 'select * from vessels order by name';

    if ($pattern)
        $query.= " where code like '$pattern%'";

    $db->enumResult ($query, $callback, $fleet);
    $db->close ();

    reportAndExit (TRUE, 'OK', $fleet, FALSE);

    function reportAndExit ($result, $error, $data = [], $exit = TRUE)
    {
        echo json_encode (['result' => $result, 'error' => $error, 'data' => $data]);

        if ($exit)
            exit (0);
    }

    function checkAccess ()
    {
        $userName = getArrayValue ($_REQUEST, 'un', NULL);
        $password = getArrayValue ($_REQUEST, 'p', NULL);

        if (sha1 ($userName) !== UN_ENCODED)
            reportAndExit (FALSE, 'User non found');
            
        if (sha1 ($password) !== PW_ENCODED)
            reportAndExit (FALSE, 'Invalid password');
    }
