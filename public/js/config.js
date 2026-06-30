// Edit these paths/entities to match your Home Assistant setup.
window.FRANZTEK_CONFIG = {
  refreshMs: 15000,
  family: [
    {
      id: 'franz',
      name: 'Franz Keller',
      shortName: 'Franz',
      image: '/local/franztek/franz.png?v=1',
      presence: 'home',
      location: 'Front Door',
      since: 'Home 2h 13m',
      battery: '87%',
      wifi: 'WiFi',
      charging: 'Charging',
      audio: 'Sonos Playing',
      entity: 'person.franz'
    },
    {
      id: 'kat',
      name: 'Kat Portelli',
      shortName: 'Kat',
      image: '/local/franztek/kat.png?v=1',
      presence: 'away',
      location: 'Work',
      since: 'Left 8:03 AM',
      battery: '61%',
      wifi: 'Mobile Data',
      charging: 'Not Charging',
      audio: 'Silent',
      entity: 'person.kat'
    },
    {
      id: 'rita',
      name: 'Rita',
      shortName: 'Rita',
      image: '/local/franztek/rita.png?v=1',
      presence: 'home',
      location: 'Living Room',
      since: 'Seen 12 mins ago',
      battery: '72%',
      wifi: 'WiFi',
      charging: 'Charging',
      audio: '—',
      entity: 'person.rita'
    },
    {
      id: 'nick',
      name: 'Nick',
      shortName: 'Nick',
      image: '/local/franztek/nick.png?v=1',
      presence: 'sleeping',
      location: 'Bedroom',
      since: 'Resting',
      battery: '—',
      wifi: '—',
      charging: '—',
      audio: '—',
      entity: 'person.nick'
    }
  ],
  cameras: [
    { name: 'Front Camera', entity: 'camera.front', detail: 'Driveway / Street' },
    { name: 'Ring Doorbell', entity: 'camera.front_door', detail: 'Front Door' },
    { name: 'Driveway', entity: 'camera.driveway', detail: 'Vehicle Detection' }
  ],
  timeline: [
    { time: '6:12 PM', text: 'Franz arrived home - Front Camera' },
    { time: '6:09 PM', text: 'Vehicle detected - Driveway' },
    { time: '5:55 PM', text: 'Package detected - Front Door' },
    { time: '4:42 PM', text: 'Kat left home' }
  ]
};
