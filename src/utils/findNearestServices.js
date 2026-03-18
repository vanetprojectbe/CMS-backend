const EmergencyService = require("../models/EmergencyService");

/* Haversine formula */
function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371; // km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function findNearest(latitude, longitude) {

  if (!latitude || !longitude) {
    throw new Error("Invalid coordinates");
  }

  const services = await EmergencyService.find();

  const enriched = services.map(service => {

    if (!service.location || !service.location.coordinates) {
      return null;
    }

    const [lon, lat] = service.location.coordinates;

    const dist = calculateDistance(
      latitude,
      longitude,
      lat,
      lon
    );

    return {
      ...service.toObject(),
      distance: dist
    };

  }).filter(Boolean);

  /* Sort by nearest */
  enriched.sort((a, b) => a.distance - b.distance);

  /*
  Optional: pick one of each type
  */
  const result = {
    hospital: null,
    police: null,
    fire: null
  };

  for (const service of enriched) {

    if (!result[service.type]) {
      result[service.type] = service;
    }

  }

  /* Return only valid ones */
  return Object.values(result).filter(Boolean);
}

module.exports = findNearest;