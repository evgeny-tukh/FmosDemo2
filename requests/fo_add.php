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

        if ($id && $time && $tank && $type && $amount)
        {
            $time = mysqlTime ($time);

            if ($id > 0)
                $query = "update fuel_operations set time='$time',tank=$tank,type=$type,amount=$amount,subject=$subject,affected_oper=$affOper where id=$id";
            else
                $query = "insert into fuel_operations(time,tank,type,amount,subject) values('$time',$tank,$type,$amount,$subject)";

            $database->execute ($query);

            if ($id === 0)
                $id = $database->insertID ();

            if ($type === transferOut || $type === transferIn)
            {
                if ($type === transferOut)
                    $affType = transferIn;
                else
                    $affType = transferOut;

                if ($affOper === 0)
                {
                    $query = "insert into fuel_operations(time,tank,type,amount,subject,affected_oper) values('$time',$subject,$affType,$amount,$tank,$id)";

                    $database->execute ($query);

                    $affOper = $database->insertID ();
                }
                else
                {
                    $query = "update fuel_operations set time='$time',tank=$subject,type=$affType,amount=$amount,subject=$tank,affected_oper=$id where id=$affOper";

                    $database->execute ($query);
                }

                $database->execute ("update fuel_operations set affected_oper=$affOper where id=$id");
            }

            $result = $id > 0 ? $id : 0;
        }

        $database->close ();
    }

    echo $result;
