let currentEventIndex = -1;
let currentEvents = [];

function eventIcon(e) {
    const label = (e.label || e.eventKind || "").toLowerCase();

    if (label.includes("person")) return "😀";
    if (label.includes("car") || label.includes("vehicle")) return "🚗";
    if (label.includes("truck")) return "🚚";
    if (label.includes("motorcycle")) return "🏍️";
    if (label.includes("bicycle")) return "🚲";
    if (label.includes("dog")) return "🐕";
    if (label.includes("cat")) return "🐈";
    if (label.includes("package")) return "📦";

    return "📷";
}

function eventTitle(e) {
    if (e.knownVehicle) return e.knownVehicle;
    if (e.sub_label) return e.sub_label;

    const type = (e.eventKind || e.label || "").toLowerCase();

    if (["vehicle", "car", "truck"].includes(type)) return "Unknown Vehicle";
    if (type === "person") return "Unknown Person";
    if (type === "package") return "Package Delivery";
    if (type === "dog") return "Dog";
    if (type === "cat") return "Cat";

    return e.label || "Event";
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

function getEventScore(e) {
    const rawScore =
        e.score ??
        e.top_score ??
        e.data?.top_score ??
        e.data?.score ??
        0;

    return rawScore ? Math.round(rawScore * 100) : 0;
}

function getEventZones(e) {
    return e.current_zones || e.zones || e.entered_zones || [];
}

function eventTypeName(e) {
    const type = (e.eventKind || e.label || "").toLowerCase();

    if (["vehicle", "car", "truck"].includes(type)) return "Vehicle";
    if (type === "person") return "Person";
    if (type === "package") return "Package";
    if (type === "dog") return "Dog";
    if (type === "cat") return "Cat";

    return e.label || "Event";
}


function eventAiSummary(e) {
    const title = eventTitle(e).replace(/^Unknown /, "unknown ");
    const camera = cameraName(e.camera) || "a camera";
    const zones = getEventZones(e);
    const zoneText = zones.length ? ` in ${zones.join(", ")}` : "";
    const confidence = getEventScore(e);
    const confidenceText = confidence ? ` with ${confidence}% confidence` : "";
    const plate = e.knownVehicle || e.plate || null;

    if (plate && eventTypeName(e) === "Vehicle") {
        return `${plate} was detected by ${camera}${zoneText}${confidenceText}.`;
    }

    return `${title} was detected by ${camera}${zoneText}${confidenceText}.`;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}


function renderFeaturedEvent(events) {
    const card = document.getElementById("featured-event-card");
    if (!card) return;

    const event = (events || [])[0];

    if (!event) {
        card.innerHTML = `
            <div class="featured-title">📍 LAST EVENT</div>
            <div class="featured-empty">No recent events</div>
        `;
        return;
    }

    const confidence = getEventScore(event);
    const typeName = eventTypeName(event);
    const title = eventTitle(event);
    const time = eventTime(event) || "--:--";
    const image = event.thumbnailUrl || event.snapshotUrl || "";
    const id = event.id || "";

    card.innerHTML = `
        <div class="featured-title">📍 LAST EVENT</div>

        <div class="featured-body">
            <div class="featured-image-wrap">
                <img src="${image}" loading="lazy" onerror="this.style.display='none'">
                <span class="featured-badge">${eventIcon(event)} ${typeName}</span>
            </div>

            <div class="featured-name">
                <strong>${title}</strong>
                <p>${cameraName(event.camera)}</p>
            </div>

            <div class="featured-chips">
                <div class="featured-chip">
                    <strong>🕒 ${time}</strong>
                    <small>Today</small>
                </div>
                <div class="featured-chip">
                    <strong>🎯 ${confidence || "—"}${confidence ? "%" : ""}</strong>
                    <small>Confidence</small>
                </div>
            </div>

            <div class="featured-actions">
                <button type="button" data-featured-action="view" data-event-id="${id}">👁 View Details</button>
                <button type="button" data-featured-action="clip" data-event-id="${id}">▶ Play Clip</button>
            </div>
        </div>
    `;
}

function setupFeaturedEventActions() {
    const card = document.getElementById("featured-event-card");
    if (!card) return;

    card.addEventListener("click", e => {
        const button = e.target.closest("button[data-featured-action]");
        if (!button) return;

        const id = button.dataset.eventId || "";
        if (!id) return;

        openEvent(id);

        if (button.dataset.featuredAction === "clip") {
            setTimeout(() => {
                const clip = document.getElementById("event-clip");
                if (clip) clip.click();
            }, 120);
        }
    });
}

function renderEvents(snapshot) {
    window.latestSnapshot = snapshot;

    const row = document.getElementById("event-row");
    if (!row) return;

    const events = snapshot.frigate?.events || [];
    currentEvents = events;
    renderFeaturedEvent(events);

    if (!events.length) {
        row.innerHTML = `<div class="event empty">No Events</div>`;
        return;
    }

    row.innerHTML = events.slice(1, 6).map(e => `
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
    const confidence = getEventScore(event);
    const zones = getEventZones(event);

    setText("event-title", `${eventIcon(event)} ${eventTitle(event)}`);
    setText("event-time", eventTime(event));
    setText("event-camera", cameraName(event.camera));
    setText("event-type", eventTypeName(event));
    setText("event-badge-type", eventTypeName(event));
    setText("event-badge-confidence", confidence ? `${confidence}% confidence` : "Confidence —");
    setText("event-ai-summary", eventAiSummary(event));

    const confidenceText = document.getElementById("event-confidence");
    const confidenceBar = document.getElementById("event-confidence-bar");

    confidenceText.textContent = confidence ? `${confidence}%` : "-";
    confidenceBar.style.width = `${confidence}%`;
    confidenceBar.className = "";

    if (confidence >= 90) {
        confidenceBar.classList.add("confidence-high");
    } else if (confidence >= 70) {
        confidenceBar.classList.add("confidence-medium");
    } else {
        confidenceBar.classList.add("confidence-low");
    }

    document.getElementById("event-zone").textContent =
        zones.length ? zones.join(", ") : "No zone";

    document.getElementById("event-plate").textContent =
        event.knownVehicle || event.plate || event.sub_label || "-";

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

window.addEventListener("snapshot", e => {
    renderEvents(e.detail);
});

document.addEventListener("DOMContentLoaded", () => {
    setupFeaturedEventActions();

    const modal = document.getElementById("event-modal");

    if (modal) {
        modal.addEventListener("click", e => {
            if (e.target.id === "event-modal") closeEvent();
        });
    }
});

document.addEventListener("keydown", e => {
    const modal = document.getElementById("event-modal");
    if (!modal || modal.classList.contains("hidden")) return;

    if (e.key === "Escape") closeEvent();
    if (e.key === "ArrowLeft") previousEvent();
    if (e.key === "ArrowRight") nextEvent();
});

window.openEvent = openEvent;
window.closeEvent = closeEvent;
window.previousEvent = previousEvent;
window.nextEvent = nextEvent;
