document.addEventListener("DOMContentLoaded", async () => {
  const groupSelect = document.getElementById("group");
  const roomCheckboxes = document.getElementById("roomCheckboxes");
  const censusTbody = document.querySelector("#censusTable tbody");

  // Fetch groups and rooms
  const response = await fetch("/api/zoo");
  const { groups, rooms } = await response.json();

  // Populate group dropdown
  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupSelect.appendChild(option);
  });

  // Populate room checkboxes
  rooms.forEach((room) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="room" value="${room}"> ${room}`;
    roomCheckboxes.appendChild(label);
  });

  // Update checkboxes when group changes
  groupSelect.addEventListener("change", async () => {
    const group = groupSelect.value;
    const response = await fetch(`/api/group/${group}`);
    const assignedRooms = await response.json();
    document.querySelectorAll('input[name="room"]').forEach((cb) => {
      cb.checked = assignedRooms.includes(cb.value);
    });
    updateCensus();
  });

  // Handle form submission
  document.getElementById("zooForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const group = groupSelect.value;
    const rooms = Array.from(
      document.querySelectorAll('input[name="room"]:checked')
    ).map((cb) => cb.value);

    await fetch(`/api/group/${group}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rooms }),
    });
    updateCensus();
  });

  // Export to CSV
  document.getElementById("exportBtn").addEventListener("click", () => {
    const rows = Array.from(censusTbody.querySelectorAll("tr"));
    if (rows.length === 0) {
      alert("No critters in the census yet!");
      return;
    }

    let csvContent = "Group,Room\n";
    rows.forEach((row) => {
      const cols = row.querySelectorAll("td");
      const group = cols[0].textContent;
      const room = cols[1].textContent;
      csvContent += `"${group}","${room}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "zoo_census.csv";
    link.click();
  });

  // Update census table
  async function updateCensus() {
    censusTbody.innerHTML = "";
    const response = await fetch("/api/zoo");
    const { groups } = await response.json();
    for (const group of groups) {
      const res = await fetch(`/api/group/${group}`);
      const rooms = await res.json();
      rooms.forEach((room) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${group}</td><td>${room}</td>`;
        censusTbody.appendChild(row);
      });
    }
  }

  updateCensus(); // Initial load
});
