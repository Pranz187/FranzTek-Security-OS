# FranzTek Security OS

A modern security dashboard for Home Assistant and Frigate.

## Features

- 📹 Live Frigate camera feeds
- 🚨 Recent events with thumbnails
- 👨‍👩‍👧 Family presence
- 💡 Light controls
- 🌦️ Weather
- 🔒 Security summary
- ⚡ Real-time dashboard

## Requirements

- Node.js 20+
- Home Assistant
- Frigate NVR

## Installation

Clone the repository:

```bash
git clone https://github.com/Pranz187/FranzTek-Security-OS.git
cd FranzTek-Security-OS
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Home Assistant and Frigate settings.

Start the server:

```bash
npm start
```

Open:

```
http://localhost:8088
```
