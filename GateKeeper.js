const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3000;

// SQLite setup
const db = new sqlite3.Database("./ZooDB.sqlite", (err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to the ZooDB!");
});

app.use(express.static("public"));
app.use(express.json());

// Get all groups and rooms (for frontend dropdowns)
app.get("/api/zoo", (req, res) => {
  res.json({
    groups: [
      "Admin Assistants",
      "Admissions",
      "Athletics",
      "Board",
      "Board of Trustees",
      "Coach",
      "Discipleship",
      "Elementary Teachers",
      "Secondary Teachers",
      "Facilities",
      "Finance",
      "GFLC",
      "Guidance",
      "Information Technology",
      "Kids Connect",
      "Kitchen Manager",
      "Music",
      "Pastor",
      "President",
      "Principals",
      "School Security",
      "Security Volunteer",
      "Staff",
      "Substitute",
      "Summer Work",
      "Teacher Assistants",
      "Trustee",
      "Tutor",
      "Vendor",
    ],
    rooms: [
      "110",
      "140",
      "140A",
      "141A",
      "146A",
      "146B",
      "146D",
      "147A",
      "147B",
      "148-A",
      "148A",
      "148-B",
      "148B",
      "149A",
      "149B",
      "149C",
      "149D",
      "150A",
      "150B",
      "151",
      "153A",
      "153B",
      "154A",
      "154B",
      "155A",
      "155B",
      "156",
      "157A",
      "157B",
      "158",
      "159A",
      "159C",
      "161",
      "162",
      "163A",
      "163B",
      "164",
      "165",
      "166",
      "167",
      "168",
      "169A",
      "169B",
      "170",
      "171",
      "172",
      "173",
      "174",
      "244",
      "245",
      "246",
      "247A",
      "247B",
      "247C",
      "248A",
      "248B",
      "249A",
      "249B",
      "250",
      "252A",
      "252B",
      "253",
      "255",
      "256",
      "257",
      "259",
      "260",
      "261",
    ],
  });
});

// Get rooms for a group
app.get("/api/group/:group", (req, res) => {
  const group = req.params.group;
  db.all(
    "SELECT room_id FROM RoomGroupAccess WHERE group_name = ?",
    [group],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map((row) => row.room_id));
    }
  );
});

// Update rooms for a group
app.post("/api/group/:group", (req, res) => {
  const group = req.params.group;
  const rooms = req.body.rooms || [];

  db.run("DELETE FROM RoomGroupAccess WHERE group_name = ?", [group], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const stmt = db.prepare(
      "INSERT INTO RoomGroupAccess (group_name, room_id) VALUES (?, ?)"
    );
    rooms.forEach((room) => stmt.run(group, room));
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

app.listen(port, () =>
  console.log(`KeyZookeeper roaring at http://localhost:${port}`)
);
