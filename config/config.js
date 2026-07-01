require("dotenv").config();

module.exports = {
  port: process.env.PORT || 8088,
  haUrl: process.env.HA_URL,
  haToken: process.env.HA_TOKEN,
  frigateUrl: process.env.FRIGATE_URL,
  frigatePublicUrl: process.env.FRIGATE_PUBLIC_URL || process.env.FRIGATE_URL,
  cameraMode: process.env.CAMERA_MODE || "direct-mjpeg",
  weatherEntity: process.env.WEATHER_ENTITY || "weather.forecast_home",
};
