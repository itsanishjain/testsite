// const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");
// const app = express();
// const port = 3001;

// // Set up EJS as the view engine
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// // Connect to SQLite database
// const db = new sqlite3.Database(":memory:");

// // Initialize counters
// let readCount = 0;
// let writeCount = 0;

// // Function to generate random string
// function generateRandomString(length) {
//   return Math.random()
//     .toString(36)
//     .substring(2, length + 2);
// }

// // Automated write operation
// function automatedWrite() {
//   const value = generateRandomString(10);
//   db.run("INSERT INTO items (value) VALUES (?)", [value], (err) => {
//     if (err) {
//       console.error("Write error:", err);
//     } else {
//       writeCount++;
//     }
//   });
// }

// // Automated read operation
// function automatedRead() {
//   db.get("SELECT * FROM items ORDER BY RANDOM() LIMIT 1", (err, row) => {
//     if (err) {
//       console.error("Read error:", err);
//     } else {
//       readCount++;
//     }
//   });
// }

// // Create table and start operations
// db.serialize(() => {
//   db.run(
//     "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT)",
//     (err) => {
//       if (err) {
//         console.error("Table creation error:", err);
//       } else {
//         console.log("Table created successfully");
//         // Start automated operations only after table is created
//         setInterval(automatedWrite, 10); // Write every 10ms
//         setInterval(automatedRead, 5); // Read every 5ms

//         // Reset counters every second
//         setInterval(() => {
//           console.log(`Reads/sec: ${readCount}, Writes/sec: ${writeCount}`);
//           readCount = 0;
//           writeCount = 0;
//         }, 1000);
//       }
//     }
//   );
// });

// // Serve the EJS page
// app.get("/", (req, res) => {
//   res.render("index");
// });

// // API endpoint for current metrics
// app.get("/metrics", (req, res) => {
//   res.json({ reads: readCount, writes: writeCount });
// });

// app.listen(port, () => {
//   console.log(`Express + SQLite app listening at http://localhost:${port}`);
// });

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3001;

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

// Serve the HTML page
app.get("/", (req, res) => {
  res.render("index");
});

// API endpoint for current metrics
app.get("/metrics", (req, res) => {
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - lastResetTime) / 1000;
  const readsPerSecond = Math.round(readCount / elapsedSeconds);
  const writesPerSecond = Math.round(writeCount / elapsedSeconds);

  res.json({ reads: readsPerSecond, writes: writesPerSecond });
});

app.listen(port, () => {
  console.log(`Express + SQLite app listening at http://localhost:${port}`);
});
