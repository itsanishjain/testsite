const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");
const db = require("./database");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/submit-availability", (req, res) => {
  const { name, timezone, startTime, endTime } = req.body;
  const meetingId = uuidv4();

  db.run("INSERT INTO meetings (id) VALUES (?)", [meetingId], function (err) {
    if (err) {
      return res.status(500).json({ error: "Error creating meeting" });
    }
    db.run(
      "INSERT INTO participants (meeting_id, name, timezone, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
      [meetingId, name, timezone, startTime, endTime],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "Error adding participant" });
        }
        res.json({ meetingId });
      }
    );
  });
});

app.get("/meeting/:id", (req, res) => {
  const meetingId = req.params.id;
  db.all(
    "SELECT * FROM participants WHERE meeting_id = ?",
    [meetingId],
    (err, participants) => {
      if (err) {
        return res
          .status(500)
          .render("error", { message: "Error fetching meeting data" });
      }
      res.render("meeting", { meetingId, participants });
    }
  );
});

// Add this new route in app.js
app.get("/join/:id", (req, res) => {
  const meetingId = req.params.id;
  res.render("join", { meetingId });
});

app.post("/add-availability/:id", (req, res) => {
  const meetingId = req.params.id;
  const { name, timezone, startTime, endTime } = req.body;

  db.run(
    "INSERT INTO participants (meeting_id, name, timezone, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
    [meetingId, name, timezone, startTime, endTime],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error adding participant" });
      }
      res.json({ success: true });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
