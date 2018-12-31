<?php

    function mysqlTime ($time, $useQuote = TRUE)
    {
        $time = doubleval ($time);

        if ($time > 3000000000)
            $time = intval ($time * 0.001);
        else
            $time = intval ($time);

        $quote = $useQuote ? "'" : '';

        return $time ? $quote.gmstrftime ('%Y-%m-%d %H:%M:%S', $time).$quote : "null";
    }

    function getArrayValue ($array, $key, $default = 'null')
    {
        return array_key_exists ($key, $array) ? $array [$key] : $default;
    }

    function getTimestamp ($dateTimeStr)
    {
        if ($dateTimeStr)
        {
            $dateTime = new DateTime ($dateTimeStr, new DateTimeZone ('UTC'));

            $timestamp = $dateTime->getTimestamp ();

            $result = $timestamp ? $timestamp : NULL;
        }
        else
        {
            $result = NULL;
        }

        return $result;
    }

    function getTimestamp2 ($dateTime)
    {
        return $dateTime ? strtotime ($dateTime.".0Z") : NULL;
    }

