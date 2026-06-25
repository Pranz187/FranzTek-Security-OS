function renderCameras() {
  const root = document.getElementById('cameraGrid');
  root.innerHTML = '';
  FRANZTEK_CONFIG.cameras.forEach(camera => {
    const card = document.createElement('article');
    card.className = 'camera-card';
    card.innerHTML = `
      <div>
        <strong>${camera.name}</strong>
        <p>${camera.detail}</p>
      </div>
      <div class="camera-preview">${camera.entity}</div>
    `;
    root.appendChild(card);
  });
}
