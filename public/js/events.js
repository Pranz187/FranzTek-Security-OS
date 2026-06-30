let currentEventIndex = -1;
let currentEvents = [];

function eventIcon(e) {
    const label = (e.label || e.eventKind || "").toLowerCase();

    if (label.includes("person")) return "😀";
    if (label.includes("car")) return "🚗";
    if (label.includes("truck")) return "🚚";
    if (label.includes("motorcycle")) return "🏍️";
    if (label.includes("bicycle")) return "🚲";
    if (label.includes("dog")) return "🐕";
    if (label.includes("cat")) return "🐈";
    if (label.includes("package")) return "📦";

    return "📷";
}

function eventTitle(e) {
    const title = e.displayLabel || e.sub_label || e.label || "Unknown";
    return title.charAt(0).toUpperCase() + title.slice(1);
}

function cameraName(name) {
    const map = {
        front: "Front Camera",
        doorbell: "Front Door",
        front_doorbell: "Front Door",
        backyard: "Back Yard",
        garage: "Garage"
    };

    return map[name] || name || "";
}

function eventTime(e) {
    if (!e.start_time) return "";

    return new Date(e.start_time * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderEvents(snapshot) {
    window.latestSnapshot = snapshot;

    const row = document.getElementById("event-row");
    if (!row) return;

    const events = snapshot.frigate?.events || [];
    currentEvents = events;

    if (!events.length) {
        row.innerHTML = `<div class="event empty">No Events</div>`;
        return;
    }

    row.innerHTML = events.slice(0, 5).map(e => `
        <article class="event" onclick="openEvent('${e.id || ""}')">
            <img src="${e.thumbnailUrl}" loading="lazy" onerror="this.style.display='none'">

            <div class="event-info">
                <strong>${eventIcon(e)} ${eventTitle(e)}</strong>
                <p>${cameraName(e.camera)}</p>
                <small>${eventTime(e)}</small>
            </div>
        </article>
    `).join("");
}

function updateEventNavButtons() {
    const prev = document.getElementById("event-prev");
    const next = document.getElementById("event-next");
    const count = document.getElementById("event-count");

    if (prev) prev.disabled = currentEventIndex <= 0;
    if (next) next.disabled = currentEventIndex >= currentEvents.length - 1;

    if (count) {
        count.textContent =
            currentEventIndex >= 0
                ? `${currentEventIndex + 1} / ${currentEvents.length}`
                : "";
    }
}

function openEvent(id) {
    currentEvents = window.latestSnapshot?.frigate?.events || [];
    currentEventIndex = currentEvents.findIndex(e => e.id === id);

    if (currentEventIndex === -1) return;

    const event = currentEvents[currentEventIndex];

    document.getElementById("event-title").textContent =
        `${eventIcon(event)} ${event.displayLabel || event.label}`;

    document.getElementById("event-time").textContent = eventTime(event);
    document.getElementById("event-camera").textContent = cameraName(event.camera);
    document.getElementById("event-type").textContent = event.eventKind || event.label || "-";

    const confidence = event.score
        ? Math.round(event.score * 100)
        : 0;

    document.getElementById("event-confidence").textContent =
        confidence ? `${confidence}%` : "-";

    document.getElementById("event-confidence-bar").style.width =
       `${confidence}%`;

    document.getElementById("event-zone").textContent =
        event.current_zones?.join(", ") || "-";

    document.getElementById("event-plate").textContent =
        event.knownVehicle || event.plate || "-";

    const img = document.getElementById("event-image");
    const video = document.getElementById("event-video");
    const clipBtn = document.getElementById("event-clip");

    img.src = event.snapshotUrl;
    img.classList.remove("hidden");

    video.pause();
    video.removeAttribute("src");
    video.load();
    video.classList.add("hidden");

    clipBtn.textContent = "▶ Play Clip";

    clipBtn.onclick = () => {
        img.classList.add("hidden");
        video.src = event.clipUrl;
        video.classList.remove("hidden");
        video.play();
        clipBtn.textContent = "⏸ Clip Playing";
    };

    updateEventNavButtons();

    document.getElementById("event-modal").classList.remove("hidden");
}

function closeEvent() {
    const img = document.getElementById("event-image");
    const video = document.getElementById("event-video");

    if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.classList.add("hidden");
    }

    if (img) {
        img.classList.remove("hidden");
    }

    document.getElementById("event-modal").classList.add("hidden");
}

function previousEvent() {
    if (currentEventIndex <= 0) return;
    openEvent(currentEvents[currentEventIndex - 1].id);
}

function nextEvent() {
    if (currentEventIndex >= currentEvents.length - 1) return;
    openEvent(currentEvents[currentEventIndex + 1].id);
}

async function loadEvents() {
    try {
        const snap = await fetch("/api/snapshot").then(r => r.json());
        renderEvents(snap);
    } catch (err) {
        console.error("Failed to load Frigate events:", err);
    }
}

window.addEventListener("snapshot", (e) => {
    renderEvents(e.detail);
});

document.getElementById("event-modal").addEventListener("click", e => {
    if (e.target.id === "event-modal") closeEvent();
});

document.addEventListener("keydown", e => {
    if (document.getElementById("event-modal").classList.contains("hidden")) return;

    if (e.key === "Escape") closeEvent();
    if (e.key === "ArrowLeft") previousEvent();
    if (e.key === "ArrowRight") nextEvent();
});

window.openEvent = openEvent;
window.closeEvent = closeEvent;
window.previousEvent = previousEvent;
window.nextEvent = nextEvent;