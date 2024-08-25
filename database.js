const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./meetings.db", (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id TEXT,
      name TEXT,
      timezone TEXT,
      start_time TEXT,
      end_time TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings (id)
    )`);
  }
});

module.exports = db;
