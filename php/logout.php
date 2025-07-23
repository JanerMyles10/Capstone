<?php
// Start the session
session_start();

// Destroy all session variables (log the user out)
session_unset();

// Destroy the session
session_destroy();

// Redirect to login page
header("Location: login.php");
exit();
?>
