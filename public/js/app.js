const CAMERA_URLS = {
  front: [
    "/api/front/latest.jpg",
    "/api/frigate/front/latest.jpg",
    "http://192.168.5.84:5000/api/front/latest.jpg"
  ],
  doorbell: [
    "/api/front_doorbell/latest.jpg",
    "/api/frigate/front_doorbell/latest.jpg",
    "http://192.168.5.84:5000/api/front_doorbell/latest.jpg"
  ]
};

function setClock() {
  const now = new Date();

  document.getElementById("clock").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  document.getElementById("date").textContent = now.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function cycleImage(id, urls) {
  const img = document.getElementById(id);
  let index = 0;

  function load() {
    img.src = `${urls[index]}?t=${Date.now()}`;
  }

  img.onerror = () => {
    index = (index + 1) % urls.length;

    if (index === 0) {
      img.style.opacity = ".25";
    } else {
      load();
    }
  };

  load();
  setInterval(load, 2000);
}

function setupLightButtons() {
  document.querySelectorAll(".light-tile").forEach((btn) => {
    btn.onclick = () => {
      const state = btn.querySelector("small");
      const isOn = state.textContent === "On";

      state.textContent = isOn ? "Off" : "On";
      state.style.color = isOn ? "#a7b7c9" : "var(--green)";
      btn.querySelector("i").style.background = isOn ? "#344152" : "var(--blue)";
    };
  });
}

setClock();
setInterval(setClock, 1000);

cycleImage("front-camera", CAMERA_URLS.front);
cycleImage("doorbell-camera", CAMERA_URLS.doorbell);

setupLightButtons();
