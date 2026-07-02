const DEFAULT_CAMERAS = {
  front: "front",
  doorbell: "front_doorbell"
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

async function getClientConfig() {
  try {
    const response = await fetch("/api/client-config");
    if (!response.ok) throw new Error("client config unavailable");
    return response.json();
  } catch (error) {
    console.warn("Using fallback camera configuration:", error.message);
    return { frigatePublicUrl: "", cameraMode: "proxy-mjpeg" };
  }
}

function directFrigateMjpegUrl(baseUrl, camera, height = 720) {
  return `${baseUrl.replace(/\/$/, "")}/api/${encodeURIComponent(camera)}?h=${height}`;
}

function proxyMjpegUrl(camera, height = 480) {
  return `/api/frigate/camera/${encodeURIComponent(camera)}/mjpeg?h=${height}`;
}

function setupCamera(id, cameraName, clientConfig) {
  const img = document.getElementById(id);
  if (!img) return;

  const directBase = clientConfig.frigatePublicUrl || "";
  const useDirect = directBase && clientConfig.cameraMode !== "proxy-mjpeg";
  const primaryUrl = useDirect
    ? directFrigateMjpegUrl(directBase, cameraName, 720)
    : proxyMjpegUrl(cameraName, 480);
  const fallbackUrl = proxyMjpegUrl(cameraName, 480);

  img.dataset.primaryUrl = primaryUrl;
  img.dataset.fallbackUrl = fallbackUrl;
  img.src = primaryUrl;
  img.style.opacity = "1";

  img.onerror = () => {
    if (img.src !== fallbackUrl) {
      img.src = fallbackUrl;
      return;
    }

    img.style.opacity = ".25";
  };
}

async function setupCameras() {
  const clientConfig = await getClientConfig();

  setupCamera("front-camera", DEFAULT_CAMERAS.front, clientConfig);
  setupCamera("doorbell-camera", DEFAULT_CAMERAS.doorbell, clientConfig);
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

function updateLightsFromSnapshot(snapshot) {
  LIGHTS.forEach(light => {
    const state = snapshot.states?.[light.entity]?.state || "off";
    updateLight(light.button, state);
  });
}

function setupLightButtons() {
  document.querySelectorAll(".light-tile").forEach((btn, index) => {
    btn.addEventListener("click", async () => {
      btn.style.opacity = ".6";

      try {
        await fetch(
          `/api/ha/light/${LIGHTS[index].entity.replace("light.","")}/toggle`,
          { method: "POST" }
        );
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

  setupCameras();
  setupLightButtons();

  window.addEventListener("snapshot", (e) => {
    updateLightsFromSnapshot(e.detail);
  });
});
