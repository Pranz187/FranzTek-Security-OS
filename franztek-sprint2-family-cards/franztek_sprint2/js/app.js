function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600);
}

function renderFamily() {
  const grid = document.getElementById("familyGrid");
  grid.innerHTML = "";
  window.FRANZTEK_CONFIG.family.forEach(member => grid.appendChild(createFamilyCard(member)));
}

function renderTimeline() {
  const holder = document.getElementById("timelineItems");
  holder.innerHTML = "";
  window.FRANZTEK_CONFIG.timeline.forEach(item => {
    const row = document.createElement("div");
    row.className = "timeline-item";
    row.innerHTML = `<div class="timeline-time">${item.time}</div><div>${item.text}</div>`;
    holder.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFamily();
  renderTimeline();
  showToast("FranzTek Security OS loaded");
});
