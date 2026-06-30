const config = require("../../config/config");

function frigateBase() {
  return (config.frigateUrl || "").replace(/\/$/, "");
}

async function frigateFetch(path) {
  if (!frigateBase()) return null;
  try {
    const response = await fetch(`${frigateBase()}${path}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getStats() {
  return frigateFetch("/api/stats");
}

async function getConfig() {
  return frigateFetch("/api/config");
}

async function discoverCameras() {
  const cfg = await getConfig();
  const cameras = cfg?.cameras || {};

  return Object.keys(cameras)
    .filter((name) => cameras[name]?.enabled !== false)
    .map((name) => ({
      name,
      friendlyName: cameras[name]?.friendly_name || prettifyName(name),
      frigateName: name,
      lprEnabled: Boolean(cameras[name]?.lpr?.enabled),
      faceRecognitionEnabled: Boolean(cameras[name]?.face_recognition?.enabled),
      zones: Object.keys(cameras[name]?.zones || {})
    }));
}

async function getKnownPlates() {
  const cfg = await getConfig();
  const known = cfg?.lpr?.known_plates || {};
  const plateMap = {};

  for (const [owner, plates] of Object.entries(known)) {
    for (const plate of plates || []) {
      plateMap[normalisePlate(plate)] = owner;
    }
  }

  return plateMap;
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

function normalisePlate(plate) {
  return String(plate || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function prettifyName(name) {
  return String(name || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function snapshotUrl(eventId) {
  return `/api/frigate/event/${encodeURIComponent(eventId)}/snapshot`;
}

function thumbnailUrl(eventId) {
  return `/api/frigate/event/${encodeURIComponent(eventId)}/thumbnail`;
}

function clipUrl(eventId) {
  return `/api/frigate/event/${encodeURIComponent(eventId)}/clip`;
}

module.exports = {
  frigateBase,
  getStats,
  getConfig,
  discoverCameras,
  getKnownPlates,
  getRecentEvents,
  normalisePlate,
  prettifyName,
  snapshotUrl,
  thumbnailUrl,
  clipUrl
};
