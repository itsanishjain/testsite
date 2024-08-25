const http = require("http");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;

// Connect to SQLite database
const db = new sqlite3.Database(":memory:");

// Initialize counters and timestamp
let readCount = 0;
let writeCount = 0;
let lastResetTime = Date.now();

// Function to generate random string
function generateRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

// Create table and start operations
db.serialize(() => {
  db.run(
    "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)",
    (err) => {
      if (err) {
        console.error("Table creation error:", err);
      } else {
        console.log("Table created successfully");
        // Start automated operations
        setImmediate(performOperations);
      }
    }
  );
});

// Perform database operations
function performOperations() {
  const currentTime = Date.now();

  // Perform a write operation
  const value = generateRandomString(10);
  db.run("INSERT INTO items (value) VALUES (?)", [value], (err) => {
    if (err) {
      console.error("Write error:", err);
    } else {
      writeCount++;
    }
  });

  // Perform a read operation
  db.get("SELECT * FROM items ORDER BY RANDOM() LIMIT 1", (err, row) => {
    if (err) {
      console.error("Read error:", err);
    } else {
      readCount++;
    }
  });

  // Check if a second has passed
  if (currentTime - lastResetTime >= 1000) {
    console.log(`Reads/sec: ${readCount}, Writes/sec: ${writeCount}`);
    readCount = 0;
    writeCount = 0;
    lastResetTime = currentTime;
  }

  // Schedule the next operation
  setImmediate(performOperations);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    // Serve HTML page
    fs.readFile(path.join(__dirname, "index.html"), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading index.html");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      }
    });
  } else if (req.url === "/metrics") {
    // Calculate operations per second
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - lastResetTime) / 1000;
    const readsPerSecond = Math.round(readCount / elapsedSeconds);
    const writesPerSecond = Math.round(writeCount / elapsedSeconds);

    // Serve metrics as JSON
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ reads: readsPerSecond, writes: writesPerSecond }));
  } else {
    // Handle 404
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Node.js + SQLite app listening at http://localhost:${port}`);
});
