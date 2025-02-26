document.addEventListener("DOMContentLoaded", async () => {
  let groups, roomGroups;
  const groupForm = document.getElementById("groupForm");
  const roomForm = document.getElementById("roomForm");
  const groupSelect = document.getElementById("group");
  const roomSelect = document.getElementById("room");
  const roomCheckboxes = document.getElementById("roomCheckboxes");
  const groupCheckboxes = document.getElementById("groupCheckboxes");

  // Load initial data
  async function loadJungle() {
    const response = await fetch("/api/jungle");
    const data = await response.json();
    groups = data.groups;
    roomGroups = data.roomGroups;

    // Populate group dropdown
    groupSelect.innerHTML =
      '<option value="" disabled selected>Choose a group</option>';
    groups.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      groupSelect.appendChild(opt);
    });

    // Populate room dropdown
    roomSelect.innerHTML =
      '<option value="" disabled selected>Choose a room</option>';
    Object.entries(roomGroups).forEach(([name, doors]) => {
      const opt = document.createElement("option");
      opt.value = doors[0]; // Use first door as key
      opt.textContent = `${name} (${doors.join(", ")})`;
      roomSelect.appendChild(opt);
    });

    // Populate room checkboxes
    roomCheckboxes.innerHTML = "";
    Object.entries(roomGroups).forEach(([name, doors]) => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${name}:</strong>`;
      doors.forEach((door) => {
        div.innerHTML += ` <label><input type="checkbox" name="room" value="${door}"> ${door}</label>`;
      });
      roomCheckboxes.appendChild(div);
    });

    // Populate group checkboxes
    groupCheckboxes.innerHTML = "";
    groups.forEach((group) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" name="group" value="${group}"> ${group}`;
      groupCheckboxes.appendChild(label);
    });
  }

  await loadJungle();

  // Toggle views
  document.getElementById("groupViewBtn").addEventListener("click", () => {
    groupForm.style.display = "block";
    roomForm.style.display = "none";
  });

  document.getElementById("roomViewBtn").addEventListener("click", () => {
    groupForm.style.display = "none";
    roomForm.style.display = "block";
  });

  // Group view: update checkboxes
  groupSelect.addEventListener("change", async () => {
    const group = groupSelect.value;
    const response = await fetch(`/api/group/${group}`);
    const assigned = await response.json();
    document.querySelectorAll('input[name="room"]').forEach((cb) => {
      cb.checked = assigned.some((entry) => entry.door_id === cb.value);
    });
  });

  // Room view: update checkboxes
  roomSelect.addEventListener("change", async () => {
    const door = roomSelect.value;
    const response = await fetch(`/api/room/${door}`);
    const assigned = await response.json();
    document.querySelectorAll('input[name="group"]').forEach((cb) => {
      cb.checked = assigned.includes(cb.value);
    });
  });

  // Group form submission
  groupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const group = groupSelect.value;
    const rooms = Array.from(
      document.querySelectorAll('input[name="room"]:checked')
    ).map((cb) => cb.value);

    await fetch(`/api/group/${group}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doors: rooms }),
    });
  });

  // Room form submission
  roomForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const door = roomSelect.value;
    const groups = Array.from(
      document.querySelectorAll('input[name="group"]:checked')
    ).map((cb) => cb.value);

    await fetch(`/api/room/${door}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups }),
    });
  });

  // Add new group
  document.getElementById("addGroupBtn").addEventListener("click", async () => {
    const newGroup = prompt("Enter a new group name:");
    if (!newGroup) return;
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: newGroup }),
    });
    if (response.ok) {
      const { groups: updatedGroups } = await response.json();
      groups = updatedGroups;
      groupSelect.innerHTML =
        '<option value="" disabled selected>Choose a group</option>';
      groups.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        groupSelect.appendChild(opt);
      });
      groupCheckboxes.innerHTML += `<label><input type="checkbox" name="group" value="${newGroup}"> ${newGroup}</label>`;
    }
  });
});
