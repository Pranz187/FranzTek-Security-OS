function countEvents(events, type) {
  return (events || []).filter(e =>
    e.eventKind === type || e.label === type
  ).length;
}

function familyHome(snapshot) {
  const family = snapshot.config?.family || [];
  const states = snapshot.states || {};

  return family.filter(p => states[p.personEntity]?.state === "home").length;
}

function lastEventText(events) {
  if (!events || !events.length) return "No recent events";

  const last = events[0];
  const time = new Date(last.start_time * 1000);

  return `${last.displayLabel || last.label} · ${time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function renderSummary(snapshot) {
  const grid = document.getElementById("summary-grid");
  const foot = document.getElementById("summary-foot");
  if (!grid || !foot) return;

  const events = snapshot.frigate?.events || [];
  const cameras = snapshot.frigate?.cameras?.length || 0;
  const detectors = snapshot.frigate?.stats?.detectors || {};
  const aiOnline = Object.keys(detectors).length > 0;

  const home = familyHome(snapshot);
  const people = countEvents(events, "person");
  const vehicles = countEvents(events, "vehicle") + countEvents(events, "car");
  const packages = countEvents(events, "package");

  grid.innerHTML = `
    <div class="security-panel">
      <div class="security-status">
        <span>${aiOnline ? "🟢" : "🔴"}</span>
        <div>
          <strong>${aiOnline ? "System Secure" : "System Offline"}</strong>
          <small>${aiOnline ? "AI detection online" : "AI detection unavailable"}</small>
        </div>
      </div>

      <div class="security-lines">
        <div><span>📷 Cameras</span><b>${cameras}</b></div>
        <div><span>👨‍👩‍👧 Family Home</span><b>${home}</b></div>
        <div><span>👤 People</span><b>${people}</b></div>
        <div><span>🚗 Vehicles</span><b>${vehicles}</b></div>
        <div><span>📦 Packages</span><b>${packages}</b></div>
      </div>

      <div class="last-event">
        <small>Last Event</small>
        <strong>${lastEventText(events)}</strong>
      </div>
    </div>
  `;

  foot.innerHTML = `
    <span>${home} family home</span>
    <span>•</span>
    <span>${cameras} cameras</span>
    <span style="margin-left:auto" class="live">● LIVE</span>
  `;
}

async function loadSummary() {
  const res = await fetch("/api/snapshot");
  const snapshot = await res.json();
  renderSummary(snapshot);
}

loadSummary();
setInterval(loadSummary, 7000);
