function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showWelcome(name, location) {
  const toast = document.getElementById('welcomeToast');
  document.getElementById('welcomeName').textContent = `Welcome Home ${name}`;
  document.getElementById('welcomeDetail').textContent = `${location} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 5000);
}

function updateAiSummary() {
  const home = FRANZTEK_CONFIG.family.filter(p => p.presence === 'home').map(p => p.shortName);
  const away = FRANZTEK_CONFIG.family.filter(p => p.presence === 'away').map(p => p.shortName);
  document.getElementById('aiSummary').textContent = `${home.join(', ') || 'Nobody'} home. ${away.join(', ') || 'Nobody'} away. Cameras online and no active alerts.`;
}

function initDashboard() {
  updateClock();
  renderFamilyCards();
  renderCameras();
  renderTimeline();
  updateAiSummary();
  setInterval(updateClock, 10000);
}

document.addEventListener('DOMContentLoaded', initDashboard);
