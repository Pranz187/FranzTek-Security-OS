function getState(states, entity) {
  return entity && states[entity] ? states[entity].state : null;
}

function formatPresence(value) {
  if (!value) return "Unknown";
  if (value === "home") return "Home";
  if (value === "not_home") return "Away";
  return value;
}

function formatAlarm(value) {
  if (!value || value === "unknown" || value === "unavailable") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `<br>⏰ ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function renderFamily(snapshot) {
  const list = document.getElementById("family-list");
  if (!list) return;

  const family = snapshot.config?.family || [];
  const states = snapshot.states || {};

  list.innerHTML = family.map(person => {
    const presence = getState(states, person.personEntity);
    const battery = getState(states, person.batteryEntity);
    const batteryState = getState(states, person.batteryStateEntity);
    const alarm = getState(states, person.alarmEntity);

    const status = formatPresence(presence);
    const batteryText = battery ? `🔋 ${battery}%` : "🔋 —";
    const chargeText = batteryState ? ` · ${batteryState}` : "";
    const alarmText = formatAlarm(alarm);

    return `
      <div class="person">
        <span class="avatar">${person.emoji || "👤"}</span>
        <div>
          <strong>${person.name}</strong>
          <p>${batteryText}${chargeText} · ${person.device || "Phone"}${alarmText}</p>
        </div>
        <b>${status}</b>
      </div>
    `;
  }).join("");
}

async function loadFamily() {
  const response = await fetch("/api/snapshot");
  const snapshot = await response.json();
  renderFamily(snapshot);
}

loadFamily();
setInterval(loadFamily, 7000);
