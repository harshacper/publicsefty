import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintByTrackingId,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadEvidence } from '../middleware/uploadMiddleware.js';
import { complaintSubmitLimiter } from '../middleware/rateLimiter.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isConnectedToMongo } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';

const router = express.Router();

// Optional protect middleware so track complaint page can be accessed publicly with tracking ID
// while logged-in users or admins receive enhanced details
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'police_complaint_super_secret_jwt_key_2026_secured'
    );
    let user;
    if (isConnectedToMongo) {
      user = await User.findById(decoded.id).select('-passwordHash');
    } else {
      user = memoryStore.users.find((u) => String(u._id) === String(decoded.id));
    }
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
};

router.post(
  '/',
  protect,
  complaintSubmitLimiter,
  uploadEvidence.array('evidenceImages', 5),
  createComplaint
);

router.get('/my', protect, getMyComplaints);
router.get('/:trackingId', optionalProtect, getComplaintByTrackingId);

export default router;
