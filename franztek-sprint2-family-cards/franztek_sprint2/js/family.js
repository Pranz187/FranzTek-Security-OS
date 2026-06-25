function statusLabel(status) {
  return String(status || "away").toUpperCase();
}

function createFamilyCard(member) {
  const card = document.createElement("article");
  card.className = `family-card ${member.status}`;
  card.innerHTML = `
    <img class="avatar" src="${member.image}" alt="${member.name}" />
    <div class="family-name">${member.name}</div>
    <div class="status ${member.status}">${statusLabel(member.status)}</div>
    <div class="details">
      <div class="detail"><span>📍 Location</span><strong>${member.location}</strong></div>
      <div class="detail"><span>🕒 Status</span><strong>${member.since}</strong></div>
      <div class="detail"><span>🔋 Battery</span><strong>${member.battery}</strong></div>
      <div class="detail"><span>📶 Network</span><strong>${member.connection}</strong></div>
      <div class="detail"><span>✨ Extra</span><strong>${member.extra}</strong></div>
    </div>
  `;
  card.addEventListener("click", () => showToast(`👋 ${member.name}: ${statusLabel(member.status)}`));
  return card;
}
