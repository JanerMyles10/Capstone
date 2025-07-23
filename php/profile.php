<?php
session_start();
require_once 'connect.php'; // adjust path if needed

// Redirect if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$success = "";
$error = "";

// Handle profile update form
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['username'])) {
    $new_name = trim($_POST['username']);
    $new_email = trim($_POST['email']);
    $new_number = trim($_POST['number']);
    $new_address = trim($_POST['address']);
    $new_city = trim($_POST['city']);
    $new_postal_code = trim($_POST['postal_code']);

    // Validate required fields
    if (empty($new_name) || empty($new_email) || empty($new_number) || empty($new_address)) {
        $error = "Please fill in all required fields.";
    } else {
        $stmt = $conn->prepare("UPDATE data SET username = ?, email = ?, number = ?, address = ?, city = ?, postal_code = ? WHERE id = ?");
        if (!$stmt) {
            die('Query preparation failed: ' . $conn->error);
        }
        $stmt->bind_param("ssssssi", $new_name, $new_email, $new_number, $new_address, $new_city, $new_postal_code, $user_id);

        if ($stmt->execute()) {
            $_SESSION['username'] = $new_name;
            $success = "Profile updated successfully.";
        } else {
            $error = "Update failed. Please try again. " . $stmt->error;
        }
    }
}

// Handle profile image upload
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['profile_image'])) {
    $target_dir = "../uploads/";
    $target_file = $target_dir . basename($_FILES["profile_image"]["name"]);
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    // Validate image
    $check = getimagesize($_FILES["profile_image"]["tmp_name"]);
    if ($check !== false) {
        if (move_uploaded_file($_FILES["profile_image"]["tmp_name"], $target_file)) {
            $stmt = $conn->prepare("UPDATE data SET profile_image = ? WHERE id = ?");
            $stmt->bind_param("si", $target_file, $user_id);
            $stmt->execute();
            $success = "Profile image updated.";
        } else {
            $error = "There was an error uploading your file.";
        }
    } else {
        $error = "File is not an image.";
    }
}

// Fetch current user data
$stmt = $conn->prepare("SELECT username, email, number, address, city, postal_code, profile_image FROM data WHERE id = ?");
if (!$stmt) {
    die('Query preparation failed: ' . $conn->error);
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email, $number, $address, $city, $postal_code, $profile_image);
$stmt->fetch();
$profile_image_url = $profile_image ? $profile_image : '../images/default-profile.png';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Profile</title>
    <link rel="stylesheet" href="../css/profile.css">
</head>
<body>
    <div class="container">
        <div class="profile-container">
            <div class="profile-header">
                <h2>Edit Profile</h2>
                <div class="profile-image-container">
                    <img src="<?= htmlspecialchars($profile_image_url) ?>" alt="Profile Image" class="profile-image">
                    <form action="" method="POST" enctype="multipart/form-data" class="image-upload-form">
                        <input type="file" name="profile_image" id="profile_image" accept="image/*">
                        <button type="submit" class="upload-btn">Update Image</button>
                    </form>
                </div>
            </div>

            <?php if (!empty($error)): ?>
                <div class="error-message"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <?php if (!empty($success)): ?>
                <div class="success-message"><?= htmlspecialchars($success) ?></div>
            <?php endif; ?>

            <form method="POST" class="profile-form">
                <div class="form-group">
                    <label for="username">Full Name <span class="required">*</span></label>
                    <input type="text" id="username" name="username" value="<?= htmlspecialchars($username) ?>" required>
                </div>

                <div class="form-group">
                    <label for="email">Email <span class="required">*</span></label>
                    <input type="email" id="email" name="email" value="<?= htmlspecialchars($email) ?>" required>
                </div>

                <div class="form-group">
                    <label for="number">Phone Number <span class="required">*</span></label>
                    <input type="tel" id="number" name="number" value="<?= htmlspecialchars($number) ?>" required>
                </div>

                <div class="form-group">
                    <label for="address">Address <span class="required">*</span></label>
                    <input type="text" id="address" name="address" value="<?= htmlspecialchars($address) ?>" required>
                </div>

                <div class="form-group">
                    <label for="city">City</label>
                    <input type="text" id="city" name="city" value="<?= htmlspecialchars($city) ?>" placeholder="Enter your city (optional)">
                </div>

                <div class="form-group">
                    <label for="postal_code">Postal Code</label>
                    <input type="text" id="postal_code" name="postal_code" value="<?= htmlspecialchars($postal_code) ?>" placeholder="Enter your postal code (optional)">
                </div>

                <div class="form-actions">
                    <button type="submit" class="save-btn">Save Changes</button>
                    <a href="../index.html" class="cancel-btn">Cancel</a>
                </div>
            </form>

            <div class="back-home">
                <a href="../homepage.html" class="back-home-btn">Back to Home</a>
            </div>
        </div>
    </div>
</body>
</html>