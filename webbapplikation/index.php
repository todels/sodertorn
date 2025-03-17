<?php
require_once 'databaskoppling.php';

// Hantera AJAX-förfrågningar baserat på ?action=
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    switch ($action) {

        // 1) Lista alla tasks med användare (JOIN)
        case 'list':
            $sql = "SELECT tasks.*, users.full_name FROM tasks 
                    LEFT JOIN users ON tasks.user_id = users.id";
            $result = $mysqli->query($sql);
            $tasks = [];
            while ($row = $result->fetch_assoc()) {
                $tasks[] = $row;
            }
            echo json_encode($tasks);
            exit;

        // 2) Lägg till en ny task med default-värden (default user_id = 1, dvs. Ludvig Möller)
        case 'add':
            $name = 'Namn';
            $due_date = date('Y-m-d');
            $completed = 0;
            $user_id = 1; // Standardanvändare: Ludvig Möller
            $stmt = $mysqli->prepare("INSERT INTO tasks (name, due_date, completed, user_id) VALUES (?, ?, ?, ?)");
            if (!$stmt) {
                echo json_encode(['success' => false, 'error' => $mysqli->error]);
                exit;
            }
            $stmt->bind_param("ssii", $name, $due_date, $completed, $user_id);
            $stmt->execute();
            echo json_encode(['success' => $stmt->affected_rows > 0]);
            $stmt->close();
            exit;

        // 3) Uppdatera en task (inklusive user_id)
        case 'update':
            $id       = $_POST['id'] ?? null;
            $name     = $_POST['name'] ?? '';
            $due_date = $_POST['due_date'] ?? date('Y-m-d');
            $completed = (($_POST['completed'] ?? 'false') === 'true') ? 1 : 0;
            $user_id  = $_POST['user_id'] ?? 1;
            if ($id) {
                $stmt = $mysqli->prepare("UPDATE tasks SET name=?, due_date=?, completed=?, user_id=? WHERE id=?");
                if (!$stmt) {
                    echo json_encode(['success' => false, 'error' => $mysqli->error]);
                    exit;
                }
                $stmt->bind_param("ssiii", $name, $due_date, $completed, $user_id, $id);
                $stmt->execute();
                echo json_encode(['success' => true]);
                $stmt->close();
            } else {
                echo json_encode(['success' => false]);
            }
            exit;

        // 4) Radera en task
        case 'delete':
            $id = $_POST['id'] ?? null;
            if ($id) {
                $stmt = $mysqli->prepare("DELETE FROM tasks WHERE id=?");
                if (!$stmt) {
                    echo json_encode(['success' => false, 'error' => $mysqli->error]);
                    exit;
                }
                $stmt->bind_param("i", $id);
                $stmt->execute();
                echo json_encode(['success' => $stmt->affected_rows > 0]);
                $stmt->close();
            } else {
                echo json_encode(['success' => false]);
            }
            exit;

        // 5) Lista alla användare
        case 'list_users':
            $result = $mysqli->query("SELECT * FROM users");
            
            if (!$result) {
                echo json_encode(['error' => 'Query failed: ' . $mysqli->error]);
                exit;
            }
            
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            echo json_encode($users);
            exit;
    }
}
?>
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Task Manager</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="table-container">
        <header>
            <div class="header-container">
                <h1>Task Manager</h1>
                <p class="subtitle">Ludvig Möller</p>
            </div>
            <button id="addTaskBtn">Add Task</button>
        </header>
        <table>
            <thead>
                <tr>
                    <th>Task name</th>
                    <th>Due date</th>
                    <th>Completed</th>
                    <th>Responsible</th>
                    <th>Remove</th>
                </tr>
            </thead>
            <tbody id="taskTableBody">
                <!-- Dynamiskt innehåll genereras av script.js -->
            </tbody>
        </table>
        <script src="script.js"></script>
    </div>
</body>
</html>
