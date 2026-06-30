let latestSnapshot = null;

const protocol = location.protocol === "https:" ? "wss" : "ws";

const socket = new WebSocket(`${protocol}://${location.host}`);

socket.onopen = () => {
    console.log("✅ FranzTek WebSocket connected");
};

socket.onclose = () => {
    console.log("❌ WebSocket disconnected");

    // Automatically reconnect
    setTimeout(() => location.reload(), 3000);
};

socket.onerror = (err) => {
    console.error("WebSocket error", err);
};

socket.onmessage = (event) => {
    try {
        latestSnapshot = JSON.parse(event.data);

        window.dispatchEvent(
            new CustomEvent("snapshot", {
                detail: latestSnapshot
            })
        );
    } catch (err) {
        console.error(err);
    }
};