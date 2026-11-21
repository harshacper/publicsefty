import express from 'express';
import {
  adminLogin,
  getDashboardMetrics,
  getAdminComplaints,
  updateComplaintStatus,
  assignPoliceStation,
  createPoliceStation,
  updatePoliceStation,
  deletePoliceStation,
  exportComplaintsCSV,
  getAllUsers,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin Authentication
router.post('/login', authLimiter, adminLogin);

// Protected Admin & Police Officer Routes
router.use(protect);
router.use(authorizeRoles('admin', 'police_officer'));

router.get('/dashboard', getDashboardMetrics);
router.get('/complaints', getAdminComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.patch('/complaints/:id/assign', assignPoliceStation);
router.get('/reports/export-csv', exportComplaintsCSV);
router.get('/users', getAllUsers);

// Police Station Management
router.post('/police-stations', createPoliceStation);
router.put('/police-stations/:id', updatePoliceStation);
router.delete('/police-stations/:id', deletePoliceStation);

export default router;
