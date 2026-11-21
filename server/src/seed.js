import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import PoliceStation from './models/PoliceStation.js';
import Complaint from './models/Complaint.js';
import TrackingHistory from './models/TrackingHistory.js';
import { initialPoliceStations } from './utils/seedData.js';

dotenv.config();

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_police_complaint_db';
  console.log(`[Seed] Connecting to MongoDB: ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected to MongoDB.');

    // 1. Seed Administrator
    const adminUsername = process.env.INITIAL_ADMIN_USERNAME || 'harsha';
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'harsha@policeportal.gov.in';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'harsha@123';

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    let adminDoc;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    if (!existingAdmin) {
      adminDoc = await User.create({
        fullName: 'Administrator Harsha',
        email: adminEmail.toLowerCase(),
        phone: '+91 98765 43210',
        passwordHash,
        address: 'Central Police Command HQ, Ashok Nagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560001',
        role: 'admin',
        mustChangePassword: true,
      });
      console.log(`[Seed] ✅ Created initial Admin: ${adminUsername} (${adminEmail})`);
    } else {
      adminDoc = existingAdmin;
      console.log(`[Seed] ℹ️  Admin ${adminEmail} already exists.`);
    }

    // 2. Seed Sample Citizen
    const citizenEmail = 'citizen@example.com';
    let citizenDoc = await User.findOne({ email: citizenEmail });
    if (!citizenDoc) {
      const citizenHash = await bcrypt.hash('citizen@123', salt);
      citizenDoc = await User.create({
        fullName: 'Rahul Sharma',
        email: citizenEmail,
        phone: '+91 91234 56789',
        passwordHash: citizenHash,
        address: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560103',
        role: 'citizen',
        mustChangePassword: false,
      });
      console.log(`[Seed] ✅ Created sample Citizen: ${citizenEmail} (Password: citizen@123)`);
    }

    // 3. Seed Police Stations
    console.log('[Seed] Seeding police stations...');
    for (const stationData of initialPoliceStations) {
      await PoliceStation.findOneAndUpdate(
        { stationCode: stationData.stationCode },
        stationData,
        { upsert: true, new: true }
      );
    }
    console.log(`[Seed] ✅ Seeded ${initialPoliceStations.length} police stations.`);

    // 4. Seed sample complaints if none exist
    const complaintsCount = await Complaint.countDocuments();
    if (complaintsCount === 0) {
      const cubbonPark = await PoliceStation.findOne({ stationCode: 'BLR-CP-01' });
      const koramangala = await PoliceStation.findOne({ stationCode: 'BLR-KM-03' });

      const cmp1 = await Complaint.create({
        trackingId: 'CMP-2026-08492',
        userId: citizenDoc._id,
        fullName: citizenDoc.fullName,
        age: 29,
        gender: 'Male',
        phone: citizenDoc.phone,
        email: citizenDoc.email,
        address: citizenDoc.address,
        city: citizenDoc.city,
        state: citizenDoc.state,
        pinCode: citizenDoc.pinCode,
        complaintTitle: 'Theft of two-wheeler from apartment parking',
        category: 'Vehicle Theft',
        description: 'Black Honda Activa 6G (Reg: KA-01-MJ-2024) was stolen from the residential apartment parking lot overnight between 11:30 PM and 6:00 AM.',
        incidentDate: '2026-11-15',
        incidentTime: '23:30',
        incidentLocation: 'Green Glen Layout, Bellandur, Bengaluru',
        incidentLatitude: 12.9260,
        incidentLongitude: 77.6762,
        suspectInfo: 'Two unidentified individuals wearing hooded jackets seen on CCTV at 02:15 AM',
        witnessInfo: 'Night Security Guard: Mr. Ram Singh',
        additionalInfo: 'Original vehicle registration papers and second key in safe custody.',
        selectedPoliceStationId: koramangala ? koramangala._id : cubbonPark._id,
        currentStatus: 'Under Verification',
        assignedAdminId: adminDoc._id,
        internalNotes: 'Verification of CCTV camera feed requested from apartment association.',
      });

      await TrackingHistory.create({
        complaintId: cmp1._id,
        previousStatus: 'None',
        newStatus: 'Submitted',
        updatedBy: `Citizen ${citizenDoc.fullName}`,
        updatedById: citizenDoc._id,
        remarks: 'Complaint registered by citizen via online portal.',
        isInternal: false,
      });

      await TrackingHistory.create({
        complaintId: cmp1._id,
        previousStatus: 'Submitted',
        newStatus: 'Under Verification',
        updatedBy: `Administrator ${adminDoc.fullName}`,
        updatedById: adminDoc._id,
        remarks: 'Initial complaint verification initiated. Verifying incident details and jurisdiction.',
        isInternal: false,
      });

      console.log('[Seed] ✅ Seeded sample complaint: CMP-2026-08492');
    }

    console.log('[Seed] 🎉 Seeding complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
};

seedDatabase();
