/**
 * Calculates the great-circle distance between two points on the Earth
 * using the Haversine formula.
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }

  const R = 6371; // Earth's mean radius in km
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 2 decimal points
};

/**
 * Sorts an array of police stations by distance to the incident location.
 * @param {Array} stations Array of station objects
 * @param {number} incidentLat Incident latitude
 * @param {number} incidentLng Incident longitude
 * @returns {Array} Stations with distance property, sorted ascending
 */
export const rankStationsByDistance = (stations, incidentLat, incidentLng) => {
  return stations
    .map((station) => {
      const distance = calculateDistance(
        incidentLat,
        incidentLng,
        station.latitude,
        station.longitude
      );
      const plain = typeof station.toObject === 'function' ? station.toObject() : { ...station };
      return {
        ...plain,
        distance, // in km
      };
    })
    .sort((a, b) => a.distance - b.distance);
};
