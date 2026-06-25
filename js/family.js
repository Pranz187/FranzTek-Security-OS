function presenceLabel(presence) {
  const map = { home: 'HOME', away: 'AWAY', driving: 'DRIVING', sleeping: 'SLEEPING' };
  return map[presence] || String(presence || 'UNKNOWN').toUpperCase();
}

function renderFamilyCards() {
  const root = document.getElementById('familyCards');
  root.innerHTML = '';
  FRANZTEK_CONFIG.family.forEach(person => {
    const card = document.createElement('article');
    card.className = `family-card ${person.presence}`;
    card.innerHTML = `
      <div class="avatar-wrap"><img class="avatar" src="${person.image}" alt="${person.name}" onerror="this.src='images/avatar-placeholder.svg'"></div>
      <h3 class="person-name">${person.shortName}</h3>
      <div class="presence"><span class="presence-dot"></span>${presenceLabel(person.presence)}</div>
      <div class="info-list">
        <div class="info-row"><span>📍 Location</span><strong>${person.location}</strong></div>
        <div class="info-row"><span>🕒 Status</span><strong>${person.since}</strong></div>
        <div class="info-row"><span>🔋 Phone</span><strong>${person.battery}</strong></div>
        <div class="info-row"><span>📶 Network</span><strong>${person.wifi}</strong></div>
        <div class="info-row"><span>⚡ Power</span><strong>${person.charging}</strong></div>
        <div class="info-row"><span>🎵 Audio</span><strong>${person.audio}</strong></div>
      </div>
      <div class="quick-actions">
        <button onclick="showWelcome('${person.shortName}', '${person.location}')">Welcome</button>
        <button onclick="alert('Hook this to Home Assistant service call later')">Actions</button>
      </div>
    `;
    root.appendChild(card);
  });
}
