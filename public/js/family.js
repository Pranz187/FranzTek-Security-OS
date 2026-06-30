function getState(states, entity) {
  return entity && states[entity] ? states[entity].state : null;
}

function statusInfo(state) {

  switch (state) {

    case "home":
      return {
        text: "Home",
        class: "home",
        icon: "🟢"
      };

    case "not_home":
      return {
        text: "Away",
        class: "away",
        icon: "🟠"
      };

    default:
      return {
        text: "Unknown",
        class: "unknown",
        icon: "⚪"
      };

  }

}

function batteryDisplay(level, state) {

  if (!level)
    return "🔋 —";

  let icon = "🔋";

  if (state === "charging" || state === "full")
    icon = "⚡";

  return `${icon} ${level}%`;

}

function renderFamily(snapshot) {

  const list = document.getElementById("family-list");
  if (!list) return;

  const family = snapshot.config?.family || [];
  const states = snapshot.states || {};

  list.innerHTML = family.map(person => {

    const presence = getState(states, person.personEntity);
    const battery = getState(states, person.batteryEntity);
    const batteryState = getState(states, person.batteryStateEntity);

    const status = statusInfo(presence);

    return `

<div class="person">

<div class="avatar-circle">

${
person.photo
?

`<img src="${person.photo}" alt="${person.name}">`

:

(person.emoji || "👤")

}

</div>

<div class="person-main">

<div class="person-top">

<strong>${person.name}</strong>

<span class="status-badge ${status.class}">
${status.icon} ${status.text}
</span>

</div>

<div class="person-bottom">

<span class="family-device">
📱 ${person.device || "Phone"}
</span>

<span class="battery">
${batteryDisplay(battery, batteryState)}
</span>

</div>

</div>

</div>

`;

  }).join("");

}

async function loadFamily() {

  const snap =
    await fetch("/api/snapshot")
      .then(r => r.json());

  renderFamily(snap);

}

window.addEventListener("snapshot", e => {

  renderFamily(e.detail);

});