import mongoose from 'mongoose';

export let isConnectedToMongo = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_police_complaint_db';
  
  try {
    console.log(`[DB] Attempting MongoDB connection to: ${uri.replace(/\/\/.*@/, '//<credentials>@')}...`);
    
    // Connect with a 2s timeout so it doesn't block startup if local mongod isn't running
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    
    isConnectedToMongo = true;
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[DB] MongoDB not reachable at ${uri} (${err.message})`);
    console.log('[DB] Activating resilient in-memory local data store fallback.');
    console.log('[DB] To connect to MongoDB Atlas, add your connection string to server/.env (MONGODB_URI=mongodb+srv://...)');
    return null;
  }
};
