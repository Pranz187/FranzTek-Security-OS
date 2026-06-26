const config = require("./config");

async function haFetch(path, options = {}) {
  if (!config.haUrl || !config.haToken) {
    throw new Error("Missing HA_URL or HA_TOKEN in .env");
  }

  const response = await fetch(`${config.haUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.haToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HA error ${response.status}: ${text}`);
  }

  return response.json();
}

async function getState(entityId) {
  return haFetch(`/api/states/${entityId}`);
}

async function callService(domain, service, entityId, data = {}) {
  return haFetch(`/api/services/${domain}/${service}`, {
    method: "POST",
    body: JSON.stringify({ entity_id: entityId, ...data })
  });
}

module.exports = { getState, callService };
