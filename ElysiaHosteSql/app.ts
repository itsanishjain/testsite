import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { Database } from "bun:sqlite";

const db = new Database(":memory:");

// Initialize counters and timestamp
let readCount = 0;
let writeCount = 0;
let lastResetTime = Date.now();

// Function to generate random string
function generateRandomString(length: number): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

// Create table with a limit of 1000 rows
db.run("CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)");

// Perform database operations
function performOperations() {
  const currentTime = Date.now();

  // Perform a write operation
  const value = generateRandomString(10);
  db.run("INSERT INTO items (value) VALUES (?)", [value]);
  writeCount++;

  // Limit the number of rows to 1000
  db.run("DELETE FROM items WHERE id <= (SELECT MAX(id) - 1000 FROM items)");

  // Perform a read operation
  db.query("SELECT * FROM items ORDER BY RANDOM() LIMIT 1");
  readCount++;

  // Check if a second has passed
  if (currentTime - lastResetTime >= 1000) {
    console.log(`Reads/sec: ${readCount}, Writes/sec: ${writeCount}`);
    readCount = 0;
    writeCount = 0;
    lastResetTime = currentTime;
  }

  // Schedule the next operation
  setTimeout(performOperations, 0);
}

// Start automated operations
performOperations();

const app = new Elysia()
  .use(html())
  .get("/", () => indexHTML)
  .get("/metrics", () => {
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - lastResetTime) / 1000;
    const readsPerSecond = Math.round(readCount / elapsedSeconds);
    const writesPerSecond = Math.round(writeCount / elapsedSeconds);

    return { reads: readsPerSecond, writes: writesPerSecond };
  })
  .listen(process.env.PORT || 3002);

console.log(
  `Elysia + SQLite app is running at ${app.server?.hostname}:${app.server?.port}`
);

const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elysia + SQLite Performance</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
    <div class="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 class="text-3xl font-bold mb-6">Elysia + SQLite Performance</h1>
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
            fetch('/metrics')
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
`;
