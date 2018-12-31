<?php

    require 'nmea.php';

    $nmea = '$GPGGA,004810.00,6930.2585,N,05613.5882,E,1,10,1.6,33,M,,M,,*57';

    $sentence = new NmeaSentence ($nmea);

    echo $sentence->validCRC ? 'OK' : 'Invalid';
    echo '; Lat: '.$sentence->getLat (2, TRUE);