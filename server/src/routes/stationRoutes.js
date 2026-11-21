import express from 'express';
import {
  getAllStations,
  getStationById,
  getNearestStations,
} from '../controllers/stationController.js';

const router = express.Router();

router.get('/', getAllStations);
router.post('/nearest', getNearestStations);
router.get('/:id', getStationById);

export default router;
