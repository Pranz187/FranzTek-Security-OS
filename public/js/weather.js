function weatherIcon(condition) {
  const map = {
    sunny: "☀️",
    clear: "☀️",
    cloudy: "☁️",
    partlycloudy: "⛅",
    rainy: "🌧️",
    pouring: "🌧️",
    lightning: "⛈️",
    fog: "🌫️",
    windy: "💨"
  };

  return map[condition] || "🌤️";
}

function renderWeather(snapshot) {
  const weather = snapshot.states?.[snapshot.config?.weatherEntity];

  const icon = document.getElementById("weather-icon");
  const temp = document.getElementById("weather-temp");
  const condition = document.getElementById("weather-condition");
  const extra = document.getElementById("weather-extra");

  if (!weather || weather.state === "unavailable" || weather.state === "unknown") {
    icon.textContent = "🌤️";
    temp.textContent = "--°C";
    condition.textContent = "Weather unavailable";
    extra.textContent = "Check Home Assistant";
    return;
  }

  const attrs = weather.attributes || {};
  const temperature = attrs.temperature ?? attrs.native_temperature ?? "--";

  icon.textContent = weatherIcon(weather.state);
  temp.textContent = `${temperature}°C`;
  condition.textContent = weather.state.replaceAll("_", " ");
  extra.textContent = attrs.humidity ? `${attrs.humidity}% humidity` : "";
}

async function loadWeather() {
  try {
    const snap = await fetch("/api/snapshot").then(r => r.json());
    renderWeather(snap);
  } catch (err) {
    console.error("Weather load failed:", err);
  }
}

window.addEventListener("snapshot", (e) => {
    renderWeather(e.detail);
});