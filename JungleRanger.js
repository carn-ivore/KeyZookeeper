const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3000;

const db = new sqlite3.Database("./KeyJungle.sqlite", (err) => {
  if (err) console.error("Jungle gate’s stuck:", err);
  else console.log("Jungle’s open for business!");
});

app.use(express.static("public"));
app.use(express.json());

// Groups and rooms data
const groups = [
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
];

// Room groups with doors
const roomGroups = {
  "Main Office": ["110"],
  "Cafeteria/Atrium": ["141A", "149A", "150B", "153A", "157A", "159C"],
  "President’s Office": ["163A", "163B"],
  "Work Area": ["164"],
  "Principal’s Office": ["165"],
  "Business Director’s Office": ["166"],
  "Accounting Office": ["167"],
  Gymnasium: ["147A"],
  "Performance Hall": ["149B", "149C", "149D"],
  "Stage Area": ["148-A", "148A", "148-B", "148B"],
  "Classrooms Lower": ["170", "171", "172"],
  "Work Rooms Lower": ["173", "174"],
  "Restrooms Lower": ["154A", "154B", "155A", "155B", "156"],
  "Storage Lower": ["140A", "146A", "146B", "146D", "150A"],
  "Halls Lower": ["147B", "151", "168", "169A", "169B"],
  "Admissions Office": ["158"],
  "Registrar’s Office": ["161"],
  "Project Manager’s Office": ["162"],
  "Board Room": ["157B"],
  "Music Rooms Upper": ["246", "249A", "249B", "252A", "252B"],
  "Music Storage Upper": ["247A", "247B", "247C", "248A", "248B", "255"],
  "Art Spaces Upper": ["256", "257", "259", "261"],
  "Work Room Upper": ["260"],
  "Restrooms Upper": ["244", "245"],
  "Halls Upper": ["250", "253"],
};

// Flatten rooms for API
const rooms = Object.entries(roomGroups).reduce((acc, [name, doors]) => {
  doors.forEach((door) => (acc[door] = name));
  return acc;
}, {});

app.get("/api/jungle", (req, res) => {
  res.json({ groups, roomGroups });
});

// Get rooms for a group
app.get("/api/group/:group", (req, res) => {
  const group = req.params.group;
  db.all(
    "SELECT door_id, room_name FROM RoomGroupAccess WHERE group_name = ?",
    [group],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get groups for a room
app.get("/api/room/:door", (req, res) => {
  const door = req.params.door;
  db.all(
    "SELECT group_name FROM RoomGroupAccess WHERE door_id = ?",
    [door],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map((row) => row.group_name));
    }
  );
});

// Update rooms for a group
app.post("/api/group/:group", (req, res) => {
  const group = req.params.group;
  const doors = req.body.doors || [];

  db.run("DELETE FROM RoomGroupAccess WHERE group_name = ?", [group], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const stmt = db.prepare(
      "INSERT INTO RoomGroupAccess (group_name, door_id, room_name) VALUES (?, ?, ?)"
    );
    doors.forEach((door) => stmt.run(group, door, rooms[door]));
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Update groups for a room
app.post("/api/room/:door", (req, res) => {
  const door = req.params.door;
  const groups = req.body.groups || [];

  db.run("DELETE FROM RoomGroupAccess WHERE door_id = ?", [door], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const stmt = db.prepare(
      "INSERT INTO RoomGroupAccess (group_name, door_id, room_name) VALUES (?, ?, ?)"
    );
    groups.forEach((group) => stmt.run(group, door, rooms[door]));
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Add or edit group
app.post("/api/groups", (req, res) => {
  const newGroup = req.body.group;
  if (!newGroup || groups.includes(newGroup))
    return res.status(400).json({ error: "Group exists or invalid" });
  groups.push(newGroup);
  res.json({ success: true, groups });
});

app.listen(port, () =>
  console.log(`JungleRanger prowling at http://localhost:${port}`)
);
