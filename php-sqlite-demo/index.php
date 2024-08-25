<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Connect to SQLite database
$db = new SQLite3(':memory:');

// Create table
$db->exec('CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)');

// Initialize counters and timestamp
$readCount = 0;
$writeCount = 0;
$startTime = microtime(true);

// Function to generate random string
function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

// Perform operations
function performOperations($db, &$readCount, &$writeCount, $duration = 1.0) {
    $endTime = microtime(true) + $duration;
    
    while (microtime(true) < $endTime) {
        // Write operation
        $value = generateRandomString();
        $db->exec("INSERT INTO items (value) VALUES ('$value')");
        $writeCount++;

        // Read operation
        $db->querySingle("SELECT * FROM items ORDER BY RANDOM() LIMIT 1");
        $readCount++;
    }
}

// Check if it's an AJAX request for metrics
if (isset($_GET['metrics'])) {
    // Perform operations for a short duration
    performOperations($db, $readCount, $writeCount, 0.1); // 100ms of operations

    $elapsedTime = microtime(true) - $startTime;
    $readsPerSecond = round($readCount / $elapsedTime);
    $writesPerSecond = round($writeCount / $elapsedTime);

    header('Content-Type: application/json');
    echo json_encode(['reads' => $readsPerSecond, 'writes' => $writesPerSecond]);
    exit;
}

// Perform initial operations
performOperations($db, $readCount, $writeCount, 0.1); // 100ms of initial operations

// HTML output
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP + SQLite Performance</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
    <div class="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 class="text-3xl font-bold mb-6">PHP + SQLite Performance</h1>
        <div class="space-y-4">
            <div>
                <h2 class="text-xl font-semibold">Reads per second</h2>
                <p id="readCount" class="text-4xl font-bold text-blue-600">0</p>
            </div>
            <div>
                <h2 class="text-xl font-semibold">Writes per second</h2>
                <p id="writeCount" class="text-4xl font-bold text-green-600">0</p>
            </div>
        </div>
    </div>

    <script>
        function updateMetrics() {
            fetch('?metrics')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('readCount').textContent = data.reads;
                    document.getElementById('writeCount').textContent = data.writes;
                });
        }

        // Update metrics every second
        setInterval(updateMetrics, 1000);
    </script>
</body>
</html>