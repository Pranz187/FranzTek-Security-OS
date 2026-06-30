const CAMERA_URLS = {
  front: "/api/frigate/camera/front/mjpeg",
  doorbell: "/api/frigate/camera/front_doorbell/mjpeg"
};

const LIGHTS = [
  {
    entity: "light.front_light",
    button: 0
  },
  {
    entity: "light.front_door",
    button: 1
  }
];

function setClock() {
  const now = new Date();

  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  document.getElementById("date").textContent =
    now.toLocaleDateString([], {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
}

function setupCamera(id, url) {
  const img = document.getElementById(id);
  if (!img) return;

  img.src = url;

  img.onerror = () => {
    img.style.opacity = ".25";
  };
}

function updateLight(buttonIndex, state) {
  const btn = document.querySelectorAll(".light-tile")[buttonIndex];
  if (!btn) return;

  const label = btn.querySelector("small");
  const indicator = btn.querySelector("i");

  const on = state === "on";

  label.textContent = on ? "On" : "Off";
  label.style.color = on ? "var(--green)" : "#a7b7c9";

  if (indicator) {
    indicator.style.background = on ? "var(--blue)" : "#344152";
  }

  btn.classList.toggle("on", on);
}

async function refreshLights() {
  try {
    const snap = await fetch("/api/snapshot").then(r => r.json());

    LIGHTS.forEach(light => {
      const state = snap.states?.[light.entity]?.state || "off";
      updateLight(light.button, state);
    });

  } catch (e) {
    console.error(e);
  }
}

function setupLightButtons() {

  document.querySelectorAll(".light-tile").forEach((btn, index) => {

    btn.addEventListener("click", async () => {

      btn.style.opacity = ".6";

      try {

        await fetch(
          `/api/ha/light/${LIGHTS[index].entity.replace("light.","")}/toggle`,
          {
            method: "POST"
          }
        );

        await refreshLights();

      } catch (err) {

        console.error(err);

      }

      btn.style.opacity = "1";

    });

  });

}

document.addEventListener("DOMContentLoaded", () => {

  setClock();
  setInterval(setClock, 1000);

  setupCamera("front-camera", CAMERA_URLS.front);
  setupCamera("doorbell-camera", CAMERA_URLS.doorbell);

  setupLightButtons();

  refreshLights();

  setInterval(refreshLights, 3000);

});