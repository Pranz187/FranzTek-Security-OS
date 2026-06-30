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
    const row = document.getElementById("event-row");
    if (!row) return;

    const events = snapshot.frigate?.events || [];

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

function openEvent(id) {
    console.log("Open event:", id);
    // Next sprint: popup snapshot / clip / plate / confidence / zones
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