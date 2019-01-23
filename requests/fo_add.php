<?php

    require_once '../db/database.php';
    require_once 'global_func.php';

    const beginAmount = 0;
    const bunkering   = 1;
    const consumption = 2;
    const unloading   = 3;
    const transferOut = 4;
    const transferIn  = 5;
    const loss        = 6;
    const endAmount   = 7;

    $data   = json_decode (file_get_contents ("php://input"), true);
    $result = 0;

    if ($data)
    {
        $database = new Database ();
        $id       = getKeyValue ($data, 'id');
        $time     = getKeyValue ($data, 'time');
        $tank     = getKeyValue ($data, 'tank');
        $type     = getKeyValue ($data, 'type');
        $amount   = getKeyValue ($data, 'amount');
        $subject  = getKeyValue ($data, 'subject');
        $affOper  = getKeyValue ($data, 'affectedOper');

        if (!$subject)
            $subject = 'null';

        if ($time && $tank && $type && $amount)
        {
            $time = mysqlTime ($time, FALSE);

            if ($id > 0)
                $query = "update fuel_operations set `time`='$time',tank=$tank,`type`=$type,amount=$amount,`subject`=$subject,affected_oper=$affOper where id=$id";
            else
                $query = "insert into fuel_operations(`time`,tank,`type`,amount,`subject`) values('$time',$tank,$type,$amount,$subject)";
echo "1: $query\n";
            $database->execute ($query);

            if (!$id)
                $id = $database->insertID ();

            if ($type === transferOut || $type === transferIn)
            {
                if ($type === transferOut)
                    $affType = transferIn;
                else
                    $affType = transferOut;

                if (!$affOper)
                {
                    $query = "insert into fuel_operations(`time`,tank,`type`,amount,`subject`,affected_oper) values('$time',$subject,$affType,$amount,$tank,$id)";
echo "2: $query\n";
                    $database->execute ($query);

                    $affOper = $database->insertID ();
                }
                else
                {
                    $query = "update fuel_operations set `time`='$time',tank=$subject,`type`=$affType,amount=$amount,`subject`=$tank,affected_oper=$id where id=$affOper";
echo "3: $query\n";
                    $database->execute ($query);
                }

                $query = "update fuel_operations set `time`='$time',`type`=$type,tank=$tank,amount=$amount,affected_oper=$affOper where id=$id";

                $database->execute ($query);
echo "$query\n";
            }

            $result = $id > 0 ? $id : 0;
        }

        $database->close ();
    }

    echo $result;
