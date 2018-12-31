<?php

    class NmeaSentence
    {
        public $fields, $validCRC;

        function __construct ($sentence)
        {
            $this->fields   = explode (',', $sentence);
            $this->validCRC = $this->checkCRC ($sentence);
        }

        static function calcCRC ($sentence)
        {
            if ($sentence [0] === '$')
            {
                for ($i = 2, $checkingLen = strlen ($sentence) - 3, $checksum = ord ($sentence [1]); $i < $checkingLen; ++ $i)
                    $checksum ^= ord ($sentence [$i]);
            }
            else
            {
                $checksum = FALSE;
            }

            return $checksum;
        }

        function checkCRC ($sentence)
        {
            $result = FALSE;
            $length = strlen ($sentence);

            if ($length > 2)
            {
                if ($sentence [0] === '$' && $sentence [$length-3] === '*')
                {
                    $checkingLen  = $length - 3;
                    $crc          = hexdec (substr ($sentence, $length - 2, 2));

                    for ($i = 2, $checksum = ord ($sentence [1]); $i < $checkingLen; ++ $i)
                        $checksum ^= ord ($sentence [$i]);

                    $result = $checksum === $crc;
                }
            }

            return $result;
        }

        function omitted ($index)
        {
            return $index >= count ($this->fields) || $this->fields [$index] === NULL || $this->fields [$index] === '';
        }

        function getField ($index)
        {
            return $this->omitted ($index) ? NULL : $this->fields [$index];
        }

        function getIntField ($index, $paranoyaCheck = FALSE)
        {
            if ($this->omitted ($index))
                $result = NULL;
            else if ($paranoyaCheck && !ctype_digit ($this->fields [$index]))
                $result = NULL;
            else
                $result = intval ($this->fields [$index]);

            return $result;
        }

        function getDblField ($index, $paranoyaCheck = FALSE)
        {
            if ($this->omitted ($index))
                $result = NULL;
            else if ($paranoyaCheck && !is_numeric ($this->fields [$index]))
                $result = NULL;
            else
                $result = doubleval ($this->fields [$index]);

            return $result;
        }

        function getLat ($index, $paranoyaCheck = FALSE)
        {
            return $this->parseAngle ($index, 2, 'N', $paranoyaCheck);
        }

        function getLon ($index, $paranoyaCheck = FALSE)
        {
            return $this->parseAngle ($index, 3, 'E', $paranoyaCheck);
        }

        function parseAngle ($index, $numOfDegDigits, $posWS, $paranoyaCheck = FALSE)
        {
            $result = NULL;

            if (!$this->omitted ($index) && !$this->omitted ($index + 1))
            {
                if (!$paranoyaCheck || is_numeric ($this->fields [$index]))
                {
                    $coord  = $this->fields [$index];
                    $deg    = intval (substr ($coord, 0, $numOfDegDigits));
                    $min    = doubleval (substr ($coord, $numOfDegDigits));
                    $result = $deg + $min / 60.0;

                    if ($posWS === 'N' && $this->fields [$index+1] !== 'N' && $this->fields [$index+1] !== 'S')
                        $result = NULL;
                    else if ($posWS === 'E' && $this->fields [$index+1] !== 'E' && $this->fields [$index+1] !== 'W')
                        $result = NULL;
                    else if ($this->fields [$index+1] !== $posWS)
                        $result = - $result;
                }
            }

            return $result;
        }

        function getUTC ($index, $paranoyaCheck = FALSE)
        {
            //$dateInfo = getdate ($date);

            if ($this->omitted ($index))
            {
                $result = NULL;
            }
            else if ($paranoyaCheck && !is_numeric ($this->fields [$index]))
            {
                $result = NULL;
            }
            else
            {
                $utc    = $this->fields [$index];
                $hours  = intval (substr ($utc, 0, 2));
                $mins   = intval (substr ($utc, 2, 2));
                $secs   = intval (substr ($utc, 4, 2));
                $result = $hours * 10000 + $mins * 100 + $secs;
            }

            return $result;
        }
    }
