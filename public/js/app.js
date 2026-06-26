let latestSnapshot = null;
let camerasRendered = false;

function updateClock(){
  const now=new Date();
  document.getElementById("clock").textContent=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  document.getElementById("date").textContent=now.toLocaleDateString([],{weekday:"long",day:"numeric",month:"long"});
}
function niceState(state){if(!state)return"Unknown";if(state==="home")return"Home";if(state==="not_home")return"Away";if(state==="unavailable")return"Unavailable";return String(state).replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
function stateClass(state){if(state==="home")return"good";if(state==="not_home"||state==="away")return"bad";if(state==="unavailable"||state==="unknown")return"muted";return"warn"}
function batteryIcon(value){const n=Number(value);if(Number.isNaN(n))return"🔋";return n>=25?"🔋":"🪫"}
function eventIcon(kind,label){
  const l=(label||kind||"").toLowerCase();
  if(kind==="vehicle"||l.includes("car"))return"🚗";
  if(kind==="person"||l.includes("person")||l.includes("face"))return"👤";
  if(kind==="package"||l.includes("package")||l.includes("amazon"))return"📦";
  if(kind==="animal"||l.includes("dog")||l.includes("cat"))return"🐶";
  return"🎥";
}
function timeAgo(ts){
  if(!ts)return"";
  const ms=Date.now()-(ts*1000);
  const mins=Math.max(0,Math.round(ms/60000));
  if(mins<1)return"now";
  if(mins<60)return`${mins}m ago`;
  return`${Math.round(mins/60)}h ago`;
}

function renderFamily(snapshot){
  const family=snapshot.config.family||[], states=snapshot.states||{}, list=document.getElementById("family-list");
  list.innerHTML="";
  let home=0;
  for(const person of family){
    const pState=states[person.personEntity]||{state:"unknown"};
    const bState=states[person.batteryEntity]||{state:"--"};
    const chargeState=person.batteryStateEntity?states[person.batteryStateEntity]:null;
    if(pState.state==="home")home++;
    const charging=chargeState?.state==="charging"?" ⚡":"";
    const div=document.createElement("div");
    div.className="person";
    div.innerHTML=`<div class="avatar">${person.emoji||"👤"}</div>
      <div><div class="name">${person.name}</div><div class="sub">${batteryIcon(bState.state)} ${bState.state}%${charging} · ${person.device||"Phone"}</div></div>
      <div class="status ${stateClass(pState.state)}">${niceState(pState.state)}</div>`;
    list.appendChild(div);
  }
  document.getElementById("home-count").textContent=`${home}/${family.length}`;
  document.getElementById("family-badge").textContent=`${home} home`;
}
function renderWeather(snapshot){
  const weather=snapshot.states[snapshot.config.weatherEntity]; if(!weather)return;
  const temp=weather.attributes?.temperature??"--"; const f=weather.attributes?.forecast?.[0]||{};
  document.getElementById("outside-temp").textContent=`${temp}°`;
  document.getElementById("weather-temp").textContent=`${temp}°`;
  document.getElementById("weather-state").textContent=niceState(weather.state);
  document.getElementById("weather-desc").textContent=niceState(weather.state);
  document.getElementById("weather-extra").textContent=`High ${f.temperature??"--"}° · Low ${f.templow??"--"}°`;
}
function renderCameras(snapshot){
  const grid=document.getElementById("camera-grid");
  const cameras=snapshot.frigate?.cameras||snapshot.config.cameras||[];
  document.getElementById("camera-count").textContent=cameras.length;
  document.getElementById("camera-badge").textContent=`${cameras.length} found`;

  if(!cameras.length){
    grid.innerHTML=`<div class="cam-error">No Frigate cameras discovered</div>`;
    return;
  }

  grid.innerHTML=cameras.map(cam=>{
    const tags=[];
    if(cam.lprEnabled)tags.push("LPR");
    if(cam.faceRecognitionEnabled)tags.push("Face");
    return `<div class="cam" data-cam="${cam.frigateName}" data-title="${cam.friendlyName}">
      <img src="/api/frigate/camera/${encodeURIComponent(cam.frigateName)}/mjpeg" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'cam-error',textContent:'Camera not available: ${cam.frigateName}'}))">
      <div class="cam-title">${cam.friendlyName}</div>
      <div class="cam-tags">${tags.map(t=>`<span>${t}</span>`).join("")}</div>
    </div>`;
  }).join("");

  document.querySelectorAll(".cam").forEach(el=>{
    el.addEventListener("click",()=>openCamera(el.dataset.title,el.dataset.cam));
  });
}
function renderCamerasOnce(snapshot){
  if(camerasRendered)return;
  renderCameras(snapshot);
  camerasRendered=true;
}
function renderEvents(snapshot){
  const events=snapshot.frigate?.events||[];
  document.getElementById("event-count").textContent=events.length;
  const list=document.getElementById("event-list");

  if(!events.length){
    list.innerHTML=`<div class="item muted"><span>No Frigate events found</span></div>`;
    return;
  }

  list.innerHTML=events.slice(0,12).map(ev=>{
    const title=ev.displayLabel || ev.knownVehicle || ev.plate || ev.label || "Event";
    const camera=ev.camera ? niceState(ev.camera) : "Camera";
    const known=ev.knownVehicle ? `<span class="event-pill good">Known vehicle</span>` : "";
    const plate=ev.plate ? `<span class="event-pill">${ev.plate}</span>` : "";
    const score=ev.top_score ? ` · ${Math.round(ev.top_score*100)}%` : "";
    return `<div class="event-card">
      <a class="event-img" href="${ev.snapshotUrl}" target="_blank">
        <img src="${ev.thumbnailUrl}" onerror="this.style.display='none'">
      </a>
      <div class="event-body">
        <div class="event-title">
          <strong>${niceState(title)}</strong>
          <span>${eventIcon(ev.eventKind, ev.label)}</span>
        </div>
        <small>${camera} · ${timeAgo(ev.start_time)}${score}</small>
        ${known || plate}
        <div class="event-actions">
          <a href="${ev.snapshotUrl}" target="_blank">Snapshot</a>
          <a href="${ev.clipUrl}" target="_blank">Clip</a>
        </div>
      </div>
    </div>`;
  }).join("");
}
function renderSummary(snapshot){
  const family=snapshot.config.family||[], states=snapshot.states||{}, events=snapshot.frigate?.events||[], cameras=snapshot.frigate?.cameras||[];
  const home=family.filter(p=>states[p.personEntity]?.state==="home").length;
  const people=events.filter(e=>e.eventKind==="person").length;
  const cars=events.filter(e=>e.eventKind==="vehicle").length;
  const packages=events.filter(e=>e.eventKind==="package").length;
  document.getElementById("daily-summary").textContent=`${home} family members home. ${cameras.length} cameras. Events: ${events.length}. People: ${people}. Vehicles: ${cars}. Packages: ${packages}.`;
}
function render(snapshot){
  latestSnapshot=snapshot;
  renderFamily(snapshot);
  renderWeather(snapshot);
  renderCamerasOnce(snapshot);
  renderEvents(snapshot);
  renderSummary(snapshot);
}
function openCamera(title,camera){
  document.getElementById("modal-title").textContent=title;
  document.getElementById("modal-img").src=`/api/frigate/camera/${encodeURIComponent(camera)}/mjpeg`;
  document.getElementById("camera-modal").classList.remove("hidden");
}
function closeCamera(){
  document.getElementById("modal-img").src="";
  document.getElementById("camera-modal").classList.add("hidden");
}
async function pressFrontDoor(){
  const button=latestSnapshot?.config?.quickButtons?.showFrontDoor;
  if(!button)return alert("Front door button not configured.");
  const res=await fetch(`/api/ha/button/${encodeURIComponent(button)}/press`,{method:"POST"});
  const json=await res.json();
  if(!json.ok)alert(json.error||"Could not press Alexa button.");
}
async function loadSnapshot(){
  const res=await fetch("/api/snapshot");
  render(await res.json());
}
function connectSocket(){
  const protocol=location.protocol==="https:"?"wss":"ws";
  const ws=new WebSocket(`${protocol}://${location.host}`);
  ws.onopen=()=>{
    document.getElementById("live-badge").textContent="LIVE";
    document.getElementById("live-badge").className="badge good";
  };
  ws.onmessage=e=>{
    const data=JSON.parse(e.data);
    if(!data.error)render(data);
  };
  ws.onclose=()=>{
    document.getElementById("live-badge").textContent="RECONNECTING";
    document.getElementById("live-badge").className="badge warn";
    setTimeout(connectSocket,3000);
  };
}
document.addEventListener("DOMContentLoaded",async()=>{
  updateClock();
  setInterval(updateClock,1000);
  document.getElementById("show-front-door").addEventListener("click",pressFrontDoor);
  document.getElementById("modal-close").addEventListener("click",closeCamera);
  await loadSnapshot();
  connectSocket();
});
