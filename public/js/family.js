function getState(states, entity) {
  return entity && states[entity] ? states[entity].state : null;
}

function statusInfo(state) {
  if (state === "home") {
    return { text: "Home", class: "home", icon: "●" };
  }

  if (state === "not_home") {
    return { text: "Away", class: "away", icon: "●" };
  }

  if (!state || state === "unknown" || state === "unavailable") {
    return { text: "Unknown", class: "unknown", icon: "●" };
  }

  return {
    text: state,
    class: "away",
    icon: "●"
  };
}

function batteryInfo(level, state) {
  if (!level || level === "unknown" || level === "unavailable") {
    return { text: "🔋 —", class: "" };
  }

  if (state === "charging") {
    return { text: `⚡ ${level}%`, class: "charging" };
  }

  if (state === "full") {
    return { text: `✅ ${level}%`, class: "" };
  }

  const value = Number(level);

  if (value <= 20) return { text: `🪫 ${level}%`, class: "" };
  if (value <= 60) return { text: `🔋 ${level}%`, class: "" };

  return { text: `🔋 ${level}%`, class: "" };
}

function renderFamily(snapshot) {
  const list = document.getElementById("family-list");
  if (!list) return;

  const family = snapshot.config?.family || [];
  const states = snapshot.states || {};

  if (!family.length) {
    list.innerHTML = `
      <div class="person">
        <div class="avatar-circle">👥</div>
        <div class="person-main">
          <div class="person-top">
            <strong>No family configured</strong>
            <span class="status-badge unknown">● Unknown</span>
          </div>
          <div class="person-bottom">
            <span class="family-device">Add family in config.json</span>
            <span class="battery">🔋 —</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  list.innerHTML = family.map(person => {
    const presence = getState(states, person.personEntity);
    const batteryLevel = getState(states, person.batteryEntity);
    const batteryState = getState(states, person.batteryStateEntity);

    const status = statusInfo(presence);
    const battery = batteryInfo(batteryLevel, batteryState);

    return `
      <div class="person">
        <div class="avatar-circle">
          ${
            person.photo
              ? `<img src="${person.photo}" alt="${person.name}">`
              : person.emoji || "👤"
          }
        </div>

        <div class="person-main">
          <div class="person-top">
            <strong>${person.name}</strong>
            <span class="status-badge ${status.class}">
              ${status.icon} ${status.text}
            </span>
          </div>

          <div class="person-bottom">
            <span class="family-device">
              📱 ${person.device || "Phone"}
            </span>

            <span class="battery ${battery.class}">
              ${battery.text}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.addEventListener("snapshot", e => {
  renderFamily(e.detail);
});