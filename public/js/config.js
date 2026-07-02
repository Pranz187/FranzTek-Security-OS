// Example frontend configuration.
// Replace these values with your own Home Assistant setup.

window.FRANZTEK_CONFIG = {
  refreshMs: 15000,

  family: [
    {
      id: "person1",
      name: "Person One",
      shortName: "Person 1",
      image: "/images/avatar-placeholder.svg",
      presence: "home",
      location: "Home",
      since: "Home",
      battery: "100%",
      wifi: "WiFi",
      charging: "Charging",
      audio: "—",
      entity: "person.person1"
    },
    {
      id: "person2",
      name: "Person Two",
      shortName: "Person 2",
      image: "/images/avatar-placeholder.svg",
      presence: "away",
      location: "Away",
      since: "Away",
      battery: "75%",
      wifi: "Mobile",
      charging: "Not Charging",
      audio: "—",
      entity: "person.person2"
    }
  ],

  cameras: [
    { name: "Front Camera", entity: "camera.front", detail: "Driveway / Street" },
    { name: "Doorbell", entity: "camera.doorbell", detail: "Front Door" },
    { name: "Driveway", entity: "camera.driveway", detail: "Vehicle Detection" }
  ],

  timeline: [
    { time: "12:00 PM", text: "Person detected - Front Camera" },
    { time: "11:45 AM", text: "Vehicle detected - Driveway" },
    { time: "11:30 AM", text: "Package detected - Front Door" }
  ]
};
