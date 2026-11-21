import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB, isConnectedToMongo } from './config/db.js';
import { memoryStore } from './store/memoryStore.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { getNearestStations } from './controllers/stationController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static serve for evidence images stored locally
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Smart Police Complaint Management System API',
    database: isConnectedToMongo ? 'MongoDB Atlas / Local' : 'In-Memory Fallback Store (Active)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/police-stations', stationRoutes);
app.post('/api/locations/nearest-stations', getNearestStations);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve production frontend assets if built
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint "${req.originalUrl}" was not found on this server.`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Server initialization
const startServer = async () => {
  try {
    // Attempt MongoDB connection
    await connectDB();

    // Initialize in-memory seed store (ensures admin harsha/harsha@123 and stations are ready)
    await memoryStore.init();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🛡️  SMART POLICE COMPLAINT MANAGEMENT SYSTEM BACKEND`);
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`🌐 Connected Database: ${isConnectedToMongo ? 'MongoDB Atlas / Local' : 'Active Memory Store'}`);
      console.log(`🔑 Admin Initial User: ${process.env.INITIAL_ADMIN_USERNAME || 'harsha'}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
