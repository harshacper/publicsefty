import axios from 'axios';
import { calculateDistance } from './distanceCalculator.js';

/**
 * Discovers real police stations around a latitude and longitude using OpenStreetMap Overpass API
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @param {number} radius Radius in meters (default 10,000m = 10km)
 * @returns {Promise<Array>} List of police stations with name, address, lat, lng, distance
 */
export const fetchNearbyPoliceStationsFromOverpass = async (lat, lng, radius = 10000) => {
  try {
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="police"](around:${radius},${lat},${lng});
        way["amenity"="police"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 7000,
      }
    );

    if (!response.data || !response.data.elements) {
      return [];
    }

    const stations = response.data.elements.map((el, index) => {
      const stationLat = el.lat || (el.center && el.center.lat);
      const stationLng = el.lon || (el.center && el.center.lon);
      const tags = el.tags || {};

      const name = tags.name || tags['name:en'] || `Police Station (OSM #${el.id})`;
      const street = tags['addr:street'] || '';
      const city = tags['addr:city'] || tags['addr:district'] || 'Local Jurisdiction';
      const postcode = tags['addr:postcode'] || '';
      const phone = tags.phone || tags['contact:phone'] || '112 / 100';

      const address = [street, city, postcode].filter(Boolean).join(', ') || 'Local Police Post';
      const distance = calculateDistance(lat, lng, stationLat, stationLng);

      return {
        _id: `osm_${el.id}`,
        stationName: name,
        stationCode: `OSM-${el.id}`.slice(0, 10).toUpperCase(),
        address,
        city,
        state: tags['addr:state'] || 'Jurisdiction Area',
        pinCode: postcode || 'N/A',
        latitude: stationLat,
        longitude: stationLng,
        contactNumber: phone,
        jurisdiction: tags.operator || 'State Police Department',
        isOsmDiscovered: true,
        isActive: true,
        distance,
      };
    });

    return stations.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.warn(`[Overpass] Overpass API query failed or timed out: ${error.message}. Using registered police station directory.`);
    return [];
  }
};
