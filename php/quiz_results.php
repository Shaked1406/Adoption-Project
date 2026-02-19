<?php
$server_name="127.0.0.1";
$user_name="zloofma_mayazloof2012";
$password="mayazloof123123";
$database_name="zloofma_Final_Project";

//create connection
$conn=new mysqli($server_name,$user_name,$password,$database_name);

//check the connection
if ($conn->connect_error){
    die("Connection failed: ".$conn->connect_error);
}

// Get data from quiz form
$full_name       = $_POST['full_name'] ?? '';
$email           = $_POST['email'] ?? '';
$total_questions = (int)($_POST['total_questions'] ?? 0);
$score            = (int)($_POST['score'] ?? 0);

// Prepare SQL
$sql = "INSERT INTO quiz_results
        (full_name, email, total_questions, score)
        VALUES (?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssii",
    $full_name,
    $email,
    $total_questions,
    $score
);

// Execute
if (!$stmt->execute()) {
    die("Error saving quiz result: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="general.css">
  <title>Quiz Result Saved</title>


  <style>
    body{
      font-family: "Segoe UI", Arial, sans-serif;
      text-align: center;
      padding: 40px;
    }
   .box {
  display: inline-block;
  padding: 28px 40px;
  border-radius: 20px;

  background-color:  #fffaf3;       
  border: 2px solid #c4a484;         
  
  color: #4a3f35;                     
  font-size: 18px;
  font-weight: 500;
  
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}
  </style>
</head>
<body>
   <header class="pf-header-strip">
    <div class="pf-header-inner">
        <img src="logo.png" alt="PawFinder Logo" class="pf-site-logo" width="200" height="200">
    </div>
</header>

  <nav class="pf-top-nav">
    <a href="http://localhost:3000/">Back to Home</a>
</nav>


<main>

  <div class="box">
    ✅ Quiz result saved successfully!<br><br>
    <strong>Score:</strong> <?php echo htmlspecialchars($score); ?>
    /
    <?php echo htmlspecialchars($total_questions); ?>
  </div>
</main>
</body>
</html>