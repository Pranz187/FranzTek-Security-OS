# FranzTek Security OS v0.7.1

This build focuses on the two issues that mattered most before adding more features:

- Responsive dashboard layout that fits cleanly across common resolutions.
- Faster camera loading by using direct Frigate MJPEG streams with Node proxy fallback.

## What changed

- Rebuilt the UI into three responsive columns:
  - Left: logo, security summary, lights
  - Center: live camera wall
  - Right: weather/clock, family, recent events
- Fixed the Family card stretching and leaving empty space above Recent Events.
- Added `/api/client-config` for frontend runtime settings.
- Added `FRIGATE_PUBLIC_URL` and `CAMERA_MODE` support.
- Updated camera code to prefer direct Frigate streams:
  - `direct-mjpeg` by default
  - automatic fallback to FranzTek proxy stream
- Fixed `events.js` syntax and Event Intelligence handling.
- Added confidence score handling from Frigate event `data.score` / `data.top_score`.
- Updated version references to `v0.7.1`.

## Important

This zip does not include your private `.env`, `config/config.json`, `.git`, `node_modules`, or personal family photos.

Unzip it over your existing project so your private config and images stay in place.

## Recommended .env camera settings

```env
FRIGATE_URL=http://YOUR_FRIGATE_IP:5000
FRIGATE_PUBLIC_URL=http://YOUR_FRIGATE_IP:5000
CAMERA_MODE=direct-mjpeg
```

If direct camera streams do not load on the wall panel, set:

```env
CAMERA_MODE=proxy-mjpeg
```
