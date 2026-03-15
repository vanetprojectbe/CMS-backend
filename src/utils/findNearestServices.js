const EmergencyService = require("../models/EmergencyService");

function distance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

async function findNearest(latitude, longitude) {

  const services = await EmergencyService.find();

  services.forEach(service => {
    service.distance = distance(
      latitude,
      longitude,
      service.latitude,
      service.longitude
    );
  });

  services.sort((a,b) => a.distance - b.distance);

  return services.slice(0,3);
}

module.exports = findNearest;
