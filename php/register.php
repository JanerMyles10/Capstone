<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'connect.php';

$error = "";
$success = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name     = trim($_POST['name']);
    $email    = trim($_POST['email']);
    $password = $_POST['password'];

    if (empty($name) || empty($email) || empty($password)) {
        $error = "Please fill in all required fields.";
    } else {
        $stmt = $conn->prepare("SELECT id FROM data WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $error = "Email already registered.";
        } else {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO data (username, email, password) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $name, $email, $hashed_password);
            if ($stmt->execute()) {
                $success = "Registration successful! You can now log in</a>.";
            } else {
                $error = "Registration failed. Please try again.";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Register Form</title>
  <link rel="stylesheet" href="../css/register.css" />
</head>
<body>
  <div class="container">
    <div class="form-wrapper">
      <h2>Create Your Account</h2>

      <?php if (!empty($error)): ?>
        <div style="color: red; background-color: #ffe6e6; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
          <?= htmlspecialchars($error) ?>
        </div>
      <?php endif; ?>

      <?php if (!empty($success)): ?>
        <div style="color: green; background-color: #e6ffe6; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
          <?= $success ?>
        </div>
      <?php endif; ?>

      <form action="register.php" method="POST">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit" class="submit-btn">Register</button>
      </form>
      <p class="login-text">
        Already have an account? <a href="login.php">Log in</a>
      </p>
    </div>
  </div>
</body>
</html>
