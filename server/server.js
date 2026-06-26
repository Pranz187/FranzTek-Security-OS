const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");
const config = require("./config");
const ha = require("./homeassistant");
const frigate = require("./frigate");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const configPath = path.join(__dirname, "..", "config", "config.json");

function readAppConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function allTrackedEntities(appConfig) {
  const entities = new Set([config.weatherEntity]);
  for (const p of appConfig.family || []) {
    if (p.personEntity) entities.add(p.personEntity);
    if (p.batteryEntity) entities.add(p.batteryEntity);
    if (p.batteryStateEntity) entities.add(p.batteryStateEntity);
    if (p.alarmEntity) entities.add(p.alarmEntity);
  }
  return [...entities];
}

function enrichEvents(events) {
  return (events || []).map((event) => ({
    ...event,
    snapshotUrl: frigate.snapshotUrl(event.id),
    clipUrl: frigate.clipUrl(event.id)
  }));
}

async function buildSnapshot() {
  const appConfig = readAppConfig();

  const snapshot = {
    version: "0.3.0",
    time: new Date().toISOString(),
    config: {
      family: appConfig.family || [],
      cameras: appConfig.cameras || [],
      quickButtons: appConfig.quickButtons || {},
      weatherEntity: config.weatherEntity,
      frigateConfigured: Boolean(config.frigateUrl)
    },
    states: {},
    frigate: {
      stats: await frigate.getStats(),
      events: enrichEvents(await frigate.getRecentEvents(12))
    }
  };

  for (const entity of allTrackedEntities(appConfig)) {
    try {
      snapshot.states[entity] = await ha.getState(entity);
    } catch (error) {
      snapshot.states[entity] = {
        entity_id: entity,
        state: "unavailable",
        attributes: { error: error.message }
      };
    }
  }

  return snapshot;
}

function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
}

app.get("/api/snapshot", async (req, res) => {
  try {
    res.json(await buildSnapshot());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ha/button/:entity/press", async (req, res) => {
  try {
    const result = await ha.callService("button", "press", req.params.entity);
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get("/api/frigate/events", async (req, res) => {
  res.json(enrichEvents(await frigate.getRecentEvents(20)));
});

app.get("/api/frigate/camera/:camera/mjpeg", async (req, res) => {
  if (!frigate.frigateBase()) return res.status(500).send("FRIGATE_URL missing");

  const camera = encodeURIComponent(req.params.camera);
  const url = `${frigate.frigateBase()}/api/${camera}?h=720`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return res.status(upstream.status).send("Frigate camera stream unavailable");
    }

    res.setHeader("Content-Type", upstream.headers.get("content-type") || "multipart/x-mixed-replace");
    upstream.body.pipeTo(new WritableStream({
      write(chunk) {
        res.write(Buffer.from(chunk));
      },
      close() {
        res.end();
      },
      abort() {
        res.end();
      }
    })).catch(() => res.end());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/frigate/event/:eventId/snapshot", async (req, res) => {
  if (!frigate.frigateBase()) return res.status(500).send("FRIGATE_URL missing");

  const url = `${frigate.frigateBase()}/api/events/${encodeURIComponent(req.params.eventId)}/snapshot.jpg`;
  try {
    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) return res.status(upstream.status).send("Snapshot unavailable");
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/frigate/event/:eventId/clip", (req, res) => {
  if (!frigate.frigateBase()) return res.status(500).send("FRIGATE_URL missing");
  const url = `${frigate.frigateBase()}/api/events/${encodeURIComponent(req.params.eventId)}/clip.mp4`;
  res.redirect(url);
});

app.get("/health", (req, res) => res.json({ ok: true, version: "0.3.0" }));

wss.on("connection", async (ws) => {
  ws.send(JSON.stringify(await buildSnapshot()));
});

setInterval(async () => {
  try {
    broadcast(await buildSnapshot());
  } catch (error) {
    broadcast({ type: "error", error: error.message });
  }
}, 7000);

server.listen(config.port, () => {
  console.log(`FranzTek Security OS v0.3.0 running at http://localhost:${config.port}`);
});
