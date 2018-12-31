<?php
    require 'db/database.php';
    require_once 'session/session_mgr.php';
    
    $sessionMgr = new SessionManager ();
    $authorized = FALSE;
    $message    = "Invalid user name.";
    $userID     = NULL;
    $isAdmin    = FALSE;
    $features   = 0;

    $database = new Database ();
    
    if ($database)
    {
        $userInfo = $database->checkCredentials ($_POST ["un"], $_POST ["p"]);
        $userID   = array_key_exists ('id', $userInfo) ? $userInfo ['id'] : NULL;

        if ($userID == NULL)
        {
            $message = "Authorization failed";
        }
        else
        {
            $message    = "Authorization passed";
            $authorized = TRUE;
            $isAdmin    = $database->isAdmin ($userID);
            $features   = $database->getFeatures ($userID);
        }
        
        $database->close ();
    }

    if ($authorized)
    {
        $sessionMgr->setAuthenticationStatus (TRUE);
        $sessionMgr->setUserID ($userID);
        $sessionMgr->setUserFeatures ($features);
        $sessionMgr->setAccessTime ();

        header ('Location: index.php');
    }
    else
    {
        $sessionMgr->setAuthenticationStatus (FALSE);
        
        header ('Location: login.html');
    }
?>
