<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'connect.php'; // adjust the path as needed

$error = "";

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    if (empty($username) || empty($password)) {
        $error = "Please fill in all required fields.";
    } else {
        $stmt = $conn->prepare("SELECT id, username, password FROM data WHERE email = ? OR username = ?");
        if (!$stmt) {
            $error = "Database error: " . $conn->error;
        } else {
            $stmt->bind_param("ss", $username, $username);  
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows == 0) {
                $error = "Wrong username or password.";
            } else {
                $stmt->bind_result($id, $db_username, $db_password);
                $stmt->fetch();

                if (!password_verify($password, $db_password)) {
                    $error = "Wrong username or password.";
                } else {
                    $_SESSION['user_id'] = $id;
                    $_SESSION['username'] = $db_username;
                    header("Location: ../homepage.html");
                    exit();
                }
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/login.css">
    <title>Login Form</title>
</head>
<body>
    <div class="container">
        <div class="left">
            <img src="../images/handcraft.png" alt="Lovebird Icon" class="bird-icon">
            <h1>Welcome to Maker's Magic</h1>
            <p>Short messages here!</p>
        </div>
        <div class="right">
            <h2>Login</h2>

            <!-- Display error if exists -->
            <?php if (!empty($error)): ?>
                <div style="color: red; background-color: #ffe6e6; padding: 10px; margin-bottom: 15px; border-radius: 5px; text-align: center;">
                    <?= htmlspecialchars($error) ?>
                </div>
            <?php endif; ?>

            <form action="login.php" method="POST">
                <label for="username">Users name or Email</label>
                <input type="text" id="username" name="username" required>

                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>

                <button type="submit">Sign in</button>
                <p><a href="#">Forgot password?</a></p>
            </form>
            <p>or</p>
            <button class="google-signin">Sign in with Google</button>
            <p>Newbie? <a href="register.php">Create Account</a></p>
        </div>
    </div>
</body>
</html>
