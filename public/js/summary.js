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

function eventTime(e) {
  if (!e?.start_time) return "";
  return new Date(e.start_time * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function cameraName(name) {
  const map = {
    front: "Front Camera",
    doorbell: "Front Door",
    front_doorbell: "Front Door",
    backyard: "Back Yard",
    garage: "Garage"
  };
  return map[name] || name || "Camera";
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

  const last = events[0];

  grid.innerHTML = `
    <div class="summary-v2">

      <div class="summary-status">
        <div class="summary-shield">${aiOnline ? "🛡️" : "⚠️"}</div>
        <div>
          <strong>${aiOnline ? "System Secure" : "System Offline"}</strong>
          <p>${aiOnline ? "AI detection online" : "AI detection unavailable"}</p>
        </div>
        <span class="live">● LIVE</span>
      </div>

      <div class="summary-metrics">
        <div class="summary-tile">
          <span>📷</span>
          <strong>${cameras}</strong>
          <p>Cameras</p>
          <small>Online</small>
        </div>

        <div class="summary-tile">
          <span>👨‍👩‍👧</span>
          <strong>${home}</strong>
          <p>Family Home</p>
          <small>Currently home</small>
        </div>

        <div class="summary-tile">
          <span>👤</span>
          <strong>${people}</strong>
          <p>People</p>
          <small>Recent</small>
        </div>

        <div class="summary-tile">
          <span>🚗</span>
          <strong>${vehicles}</strong>
          <p>Vehicles</p>
          <small>Recent</small>
        </div>

        <div class="summary-tile">
          <span>📦</span>
          <strong>${packages}</strong>
          <p>Packages</p>
          <small>Recent</small>
        </div>
      </div>

      <div class="summary-last-event ${last ? "" : "empty"}" ${last ? `onclick="openEvent('${last.id || ""}')"` : ""}>
        <div class="last-title">🕒 Last Event</div>

        ${
          last
            ? `
              <div class="last-event-row">
                <img src="${last.thumbnailUrl}" onerror="this.style.display='none'">
                <div>
                  <strong>${last.displayLabel || last.label || "Event detected"}</strong>
                  <p>${cameraName(last.camera)} • ${eventTime(last)}</p>
                </div>
                <button>View ›</button>
              </div>
            `
            : `<p>No recent events</p>`
        }
      </div>

    </div>
  `;

  foot.innerHTML = `
    <span>👨‍👩‍👧 ${home} family home</span>
    <span>•</span>
    <span>📷 ${cameras} cameras</span>
    <span style="margin-left:auto" class="live">● LIVE</span>
  `;
}

window.addEventListener("snapshot", (e) => {
  renderSummary(e.detail);
});