function renderTimeline() {
  const root = document.getElementById('timeline');
  root.innerHTML = '';
  FRANZTEK_CONFIG.timeline.forEach(item => {
    const row = document.createElement('div');
    row.className = 'timeline-item';
    row.innerHTML = `<div class="timeline-time">${item.time}</div><div>${item.text}</div>`;
    root.appendChild(row);
  });
}
