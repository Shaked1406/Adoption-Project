<?php
// quiz_results.php

$server_name   = "127.0.0.1";
$user_name     = "zloofma_mayazloof2012";
$password      = "mayazloof123123";
$database_name = "zloofma_Final_Project";

$conn = new mysqli($server_name, $user_name, $password, $database_name);

if ($conn->connect_error) {
    http_response_code(500);
    die("Connection failed: " . htmlspecialchars($conn->connect_error, ENT_QUOTES, 'UTF-8'));
}

function fail($msg, $httpCode = 400) {
    http_response_code($httpCode);
    $safe = htmlspecialchars($msg, ENT_QUOTES, 'UTF-8');
    echo "<!doctype html><html><head><meta charset='utf-8'><title>Error</title></head>";
    echo "<body style='font-family:Segoe UI,Arial,sans-serif;padding:30px;'>";
    echo "<h2>❌ Error</h2><p>{$safe}</p></body></html>";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail("Invalid request method.", 405);
}

// ---- Read POST ----
$full_name        = trim($_POST['full_name'] ?? '');
$email            = trim($_POST['email'] ?? '');
$phone            = preg_replace('/[^\d]/', '', $_POST['phone'] ?? '');
$age              = (int)($_POST['age'] ?? 0);
$experience_level = trim($_POST['experience_level'] ?? '');
$consent          = $_POST['consent'] ?? '';
$total_questions  = (int)($_POST['total_questions'] ?? 0);
$score            = (int)($_POST['score'] ?? 0);

// ---- Validations ----

// Name: letters only (Hebrew/English), spaces, ' and -
if (
    $full_name === '' ||
    mb_strlen($full_name) < 2 ||
    mb_strlen($full_name) > 60 ||
    !preg_match("/^[A-Za-z\x{0590}-\x{05FF}\s'-]+$/u", $full_name)
) {
    fail("Name must contain letters only (Hebrew/English), spaces, ' or - (2–60 chars).");
}

if ($email === '' || mb_strlen($email) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail("Invalid email address.");
}

if ($phone === '' || strlen($phone) < 9 || strlen($phone) > 10) {
    fail("Phone must be 9-10 digits (Israel format).");
}
if (strpos($phone, "0") !== 0) {
    fail("Phone must start with 0.");
}
if (strpos($phone, "05") === 0 && strlen($phone) !== 10) {
    fail("Mobile phone starting with 05 must be 10 digits.");
}

if ($age < 12 || $age > 120) {
    fail("Age must be between 12 and 120.");
}

$allowed = ["beginner", "intermediate", "advanced"];
if (!in_array($experience_level, $allowed, true)) {
    fail("Invalid experience level.");
}

if ($consent !== "1") {
    fail("Consent is required.");
}

if ($total_questions !== 5) {
    fail("Invalid total questions.");
}
if ($score < 0 || $score > $total_questions) {
    fail("Invalid score value.");
}

// ---- Insert ----
$sql = "INSERT INTO quiz_results
        (full_name, email, phone, age, experience_level, consent, total_questions, score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    fail("Prepare failed: " . $conn->error, 500);
}

$consent_int = 1;

$stmt->bind_param(
    "sssisiii",
    $full_name,
    $email,
    $phone,
    $age,
    $experience_level,
    $consent_int,
    $total_questions,
    $score
);

if (!$stmt->execute()) {
    fail("Error saving quiz result: " . $stmt->error, 500);
}

$stmt->close();
$conn->close();
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Result Saved</title>

  <style>
    body{
      font-family: "Segoe UI", Arial, sans-serif;
      text-align: center;
      padding: 40px;
      background: #fff;
    }

    .pf-header-strip{ margin-bottom: 18px; }
    .pf-site-logo{ max-width: 200px; height: auto; }

    .pf-top-nav{ margin: 10px 0 22px; }
    .pf-top-nav a{
      text-decoration: none;
      display: inline-block;
      padding: 10px 14px;
      border-radius: 12px;
      background: #e9e4dc;
      color: #2b241f;
      font-weight: 600;
    }

    .box{
      display: inline-block;
      padding: 28px 40px;
      border-radius: 20px;
      background-color: #fffaf3;
      border: 2px solid #c4a484;
      color: #4a3f35;
      font-size: 18px;
      font-weight: 500;
      box-shadow: 0 8px 20px rgba(0,0,0,0.06);
      line-height: 1.6;
      min-width: 320px;
    }

    .subtitle{ margin-top: 8px; opacity: 0.85; font-weight: 400; }
    .small{ margin-top: 12px; font-size: 14px; opacity: 0.85; }
  </style>
</head>

<body>

  <header class="pf-header-strip">
    <div class="pf-header-inner">
      <img src="logo.png" alt="PawFinder Logo" class="pf-site-logo" width="200" height="200">
    </div>
  </header>

  <nav class="pf-top-nav">
    <a href="http://vmedu437.mtacloud.co.il:3000/">Back to Home</a>
  </nav>

  <main>
    <div class="box">
      ✅ Quiz result saved successfully!
      <div class="subtitle">Your result has been recorded successfully.</div>

      <div style="margin-top:14px;">
        <strong>Score:</strong>
        <?php echo htmlspecialchars((string)$score, ENT_QUOTES, 'UTF-8'); ?>
        /
        <?php echo htmlspecialchars((string)$total_questions, ENT_QUOTES, 'UTF-8'); ?>
      </div>

      <div class="small">
        Saved for:
        <?php echo htmlspecialchars($full_name, ENT_QUOTES, 'UTF-8'); ?>
        (<?php echo htmlspecialchars($email, ENT_QUOTES, 'UTF-8'); ?>)
      </div>
    </div>
  </main>

</body>
</html>
