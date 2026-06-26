const config = require("./config");

function frigateBase() {
  return (config.frigateUrl || "").replace(/\/$/, "");
}

async function getStats() {
  if (!frigateBase()) return null;
  try {
    const response = await fetch(`${frigateBase()}/api/stats`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getConfig() {
  if (!frigateBase()) return null;
  try {
    const response = await fetch(`${frigateBase()}/api/config`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getRecentEvents(limit = 12) {
  if (!frigateBase()) return [];
  try {
    const response = await fetch(`${frigateBase()}/api/events?limit=${limit}`);
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

function snapshotUrl(eventId) {
  return `/api/frigate/event/${encodeURIComponent(eventId)}/snapshot`;
}

function clipUrl(eventId) {
  return `/api/frigate/event/${encodeURIComponent(eventId)}/clip`;
}

function liveMjpegUrl(cameraName) {
  return `/api/frigate/camera/${encodeURIComponent(cameraName)}/mjpeg`;
}

module.exports = {
  frigateBase,
  getStats,
  getConfig,
  getRecentEvents,
  snapshotUrl,
  clipUrl,
  liveMjpegUrl
};
