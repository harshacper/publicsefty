import PoliceStation from '../models/PoliceStation.js';
import { isConnectedToMongo } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';
import { rankStationsByDistance, calculateDistance } from '../utils/distanceCalculator.js';
import { fetchNearbyPoliceStationsFromOverpass } from '../utils/overpassService.js';

// @desc    Get all active police stations
// @route   GET /api/police-stations
// @access  Public
export const getAllStations = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let stations;

    if (isConnectedToMongo) {
      const filter = { isActive: true };
      if (city) filter.city = new RegExp(city, 'i');
      if (search) {
        filter.$or = [
          { stationName: new RegExp(search, 'i') },
          { stationCode: new RegExp(search, 'i') },
          { city: new RegExp(search, 'i') },
          { address: new RegExp(search, 'i') },
        ];
      }
      stations = await PoliceStation.find(filter).sort({ city: 1, stationName: 1 });
    } else {
      let filtered = memoryStore.policeStations.filter((s) => s.isActive);
      if (city) {
        filtered = filtered.filter((s) => s.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.stationName.toLowerCase().includes(q) ||
            s.stationCode.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
        );
      }
      stations = filtered;
    }

    res.json({
      success: true,
      count: stations.length,
      stations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single police station by ID
// @route   GET /api/police-stations/:id
// @access  Public
export const getStationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let station;

    if (isConnectedToMongo) {
      station = await PoliceStation.findById(id);
    } else {
      station = memoryStore.policeStations.find((s) => String(s._id) === String(id));
    }

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Police station not found.',
      });
    }

    res.json({
      success: true,
      station,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Discover nearest police stations based on coordinates
// @route   POST /api/locations/nearest-stations
// @access  Public
export const getNearestStations = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 50000, includeOsm = true } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Incident latitude and longitude are required to calculate nearest police stations.',
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    let dbStations = [];
    if (isConnectedToMongo) {
      dbStations = await PoliceStation.find({ isActive: true });
    } else {
      dbStations = memoryStore.policeStations.filter((s) => s.isActive);
    }

    // Rank database stations by Haversine distance
    let rankedDbStations = rankStationsByDistance(dbStations, lat, lng);

    let osmStations = [];
    if (includeOsm) {
      try {
        // Query OpenStreetMap Overpass within specified radius (default up to 15km)
        const osmRadius = Math.min(Number(radius), 15000);
        osmStations = await fetchNearbyPoliceStationsFromOverpass(lat, lng, osmRadius);
      } catch (err) {
        console.warn('[Overpass Query Skipped]', err.message);
      }
    }

    // Merge: Put DB stations first, append OSM discovered stations if not duplicates
    const combinedStations = [...rankedDbStations];
    for (const osmSt of osmStations) {
      const exists = combinedStations.some(
        (st) =>
          calculateDistance(st.latitude, st.longitude, osmSt.latitude, osmSt.longitude) < 0.5
      );
      if (!exists) {
        combinedStations.push(osmSt);
      }
    }

    combinedStations.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      incidentCoordinates: { latitude: lat, longitude: lng },
      recommendedStation: combinedStations[0] || null,
      stations: combinedStations.slice(0, 10), // Return top 10 closest
    });
  } catch (error) {
    next(error);
  }
};
