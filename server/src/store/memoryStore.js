import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialPoliceStations } from '../utils/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class MemoryStore {
  constructor() {
    this.users = [];
    this.policeStations = [];
    this.complaints = [];
    this.trackingHistories = [];
    this.notifications = [];
    this.auditLogs = [];
    this.initialized = false;
  }

  saveToDisk(key) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const filePath = path.join(DATA_DIR, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify(this[key], null, 2), 'utf-8');
    } catch (err) {
      console.warn(`[MemoryStore] Failed to save ${key} to disk:`, err.message);
    }
  }

  loadFromDisk(key) {
    try {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`[MemoryStore] Failed to load ${key} from disk:`, err.message);
    }
    return null;
  }

  async init() {
    if (this.initialized) return;

    // Load from disk if available
    const savedComplaints = this.loadFromDisk('complaints');
    const savedUsers = this.loadFromDisk('users');
    const savedStations = this.loadFromDisk('policeStations');
    const savedHistories = this.loadFromDisk('trackingHistories');
    const savedNotifications = this.loadFromDisk('notifications');
    const savedAudit = this.loadFromDisk('auditLogs');

    if (savedUsers && savedUsers.length > 0) {
      this.users = savedUsers;
    } else {
      // Seed initial admin: harsha / harsha@123
      const adminUsername = process.env.INITIAL_ADMIN_USERNAME || 'harsha';
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'harsha@policeportal.gov.in';
      const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'harsha@123';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      const adminUser = {
        _id: 'admin_harsha_01',
        id: 'admin_harsha_01',
        fullName: 'Administrator Harsha',
        email: adminEmail.toLowerCase(),
        phone: '+91 98765 43210',
        passwordHash,
        address: 'Central Police Command, Police Headquarters',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560001',
        role: 'admin',
        mustChangePassword: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(adminUser);

      // Seed a sample citizen user for quick demo
      const citizenPassword = await bcrypt.hash('citizen@123', salt);
      const demoCitizen = {
        _id: 'citizen_demo_01',
        id: 'citizen_demo_01',
        fullName: 'Rahul Sharma',
        email: 'citizen@example.com',
        phone: '+91 91234 56789',
        passwordHash: citizenPassword,
        address: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560103',
        role: 'citizen',
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(demoCitizen);
      this.saveToDisk('users');
    }

    if (savedStations && savedStations.length > 0) {
      this.policeStations = savedStations;
    } else {
      this.policeStations = initialPoliceStations.map((st, idx) => ({
        _id: `station_seed_${idx + 1}`,
        id: `station_seed_${idx + 1}`,
        ...st,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      this.saveToDisk('policeStations');
    }

    if (savedComplaints && savedComplaints.length > 0) {
      this.complaints = savedComplaints;
    } else {
      const demoCitizen = this.users.find((u) => u.email === 'citizen@example.com') || this.users[1];
      const adminUser = this.users.find((u) => u.role === 'admin') || this.users[0];

      const sampleComplaint1 = {
        _id: 'complaint_seed_01',
        id: 'complaint_seed_01',
        trackingId: 'CMP-2026-08492',
        userId: demoCitizen?._id || 'citizen_demo_01',
        fullName: demoCitizen?.fullName || 'Rahul Sharma',
        age: 29,
        gender: 'Male',
        phone: demoCitizen?.phone || '+91 91234 56789',
        email: demoCitizen?.email || 'citizen@example.com',
        address: demoCitizen?.address || 'Flat 402, Green Glen Layout, Bellandur',
        city: demoCitizen?.city || 'Bengaluru',
        state: demoCitizen?.state || 'Karnataka',
        pinCode: demoCitizen?.pinCode || '560103',
        complaintTitle: 'Theft of two-wheeler from apartment parking',
        category: 'Vehicle Theft',
        description: 'Black Honda Activa 6G (Reg: KA-01-MJ-2024) was stolen from the residential apartment parking lot overnight between 11:30 PM and 6:00 AM. CCTV footage available on request.',
        incidentDate: '2026-11-15',
        incidentTime: '23:30',
        incidentLocation: 'Green Glen Layout, Bellandur, Bengaluru',
        incidentLatitude: 12.926,
        incidentLongitude: 77.6762,
        suspectInfo: 'Two unidentified individuals wearing hooded jackets seen on CCTV at 02:15 AM',
        witnessInfo: 'Night Security Guard: Mr. Ram Singh',
        additionalInfo: 'Original vehicle registration papers and second key in safe custody.',
        evidenceImages: [],
        selectedPoliceStationId: this.policeStations[2]._id,
        currentStatus: 'Under Verification',
        assignedAdminId: adminUser._id,
        officialAcknowledgmentRef: '',
        officialActionTaken: '',
        internalNotes: 'Verification of CCTV camera feed requested from apartment association.',
        submittedAt: new Date(Date.now() - 48 * 3600 * 1000),
        createdAt: new Date(Date.now() - 48 * 3600 * 1000),
        updatedAt: new Date(Date.now() - 24 * 3600 * 1000),
      };

      const sampleComplaint2 = {
        _id: 'complaint_seed_02',
        id: 'complaint_seed_02',
        trackingId: 'CMP-2026-03184',
        userId: demoCitizen?._id || 'citizen_demo_01',
        fullName: demoCitizen?.fullName || 'Rahul Sharma',
        age: 29,
        gender: 'Male',
        phone: demoCitizen?.phone || '+91 91234 56789',
        email: demoCitizen?.email || 'citizen@example.com',
        address: demoCitizen?.address || 'Flat 402, Green Glen Layout, Bellandur',
        city: demoCitizen?.city || 'Bengaluru',
        state: demoCitizen?.state || 'Karnataka',
        pinCode: demoCitizen?.pinCode || '560103',
        complaintTitle: 'Online phishing scam via fake electricity bill SMS',
        category: 'Cyber Crime',
        description: 'Received SMS stating electricity connection would be disconnected unless an APK app was downloaded. Following installation, unauthorized bank transaction of INR 35,000 occurred.',
        incidentDate: '2026-11-10',
        incidentTime: '15:45',
        incidentLocation: 'Online / Cyber Space',
        incidentLatitude: 12.9772,
        incidentLongitude: 77.5936,
        suspectInfo: 'Phone number sending SMS: +91 99887 76655, Beneficiary account in Axis Bank',
        witnessInfo: 'Bank transaction statement attached',
        additionalInfo: 'Bank has been alerted to freeze beneficiary account.',
        evidenceImages: [],
        selectedPoliceStationId: this.policeStations[0]._id,
        currentStatus: 'Forwarded',
        assignedAdminId: adminUser._id,
        officialAcknowledgmentRef: 'CYBER-CELL-REF-8842',
        officialActionTaken: 'Referred to Karnataka Cyber Crime Police Station CID for cyber forensics and bank nodal escalation.',
        internalNotes: 'Bank nodal officer contacted for transaction freeze.',
        submittedAt: new Date(Date.now() - 120 * 3600 * 1000),
        createdAt: new Date(Date.now() - 120 * 3600 * 1000),
        updatedAt: new Date(Date.now() - 12 * 3600 * 1000),
      };

      this.complaints.push(sampleComplaint1, sampleComplaint2);
      this.saveToDisk('complaints');
    }

    if (savedHistories && savedHistories.length > 0) {
      this.trackingHistories = savedHistories;
    } else {
      if (this.complaints.length >= 2) {
        this.trackingHistories.push(
          {
            _id: 'th_01',
            complaintId: this.complaints[0]._id,
            previousStatus: 'None',
            newStatus: 'Submitted',
            updatedBy: `Citizen ${this.complaints[0].fullName}`,
            remarks: 'Complaint registered by citizen via online portal.',
            isInternal: false,
            createdAt: this.complaints[0].submittedAt || new Date(),
          },
          {
            _id: 'th_02',
            complaintId: this.complaints[0]._id,
            previousStatus: 'Submitted',
            newStatus: 'Under Verification',
            updatedBy: 'Administrator Harsha',
            remarks: 'Initial complaint verification initiated. Verifying incident details and jurisdiction.',
            isInternal: false,
            createdAt: new Date(Date.now() - 24 * 3600 * 1000),
          },
          {
            _id: 'th_03',
            complaintId: this.complaints[1]._id,
            previousStatus: 'None',
            newStatus: 'Submitted',
            updatedBy: `Citizen ${this.complaints[1].fullName}`,
            remarks: 'Cyber crime complaint submitted.',
            isInternal: false,
            createdAt: this.complaints[1].submittedAt || new Date(),
          },
          {
            _id: 'th_04',
            complaintId: this.complaints[1]._id,
            previousStatus: 'Submitted',
            newStatus: 'Forwarded',
            updatedBy: 'Administrator Harsha',
            remarks: 'Forwarded to Central Cyber Crime Division.',
            isInternal: false,
            createdAt: new Date(Date.now() - 12 * 3600 * 1000),
          }
        );
        this.saveToDisk('trackingHistories');
      }
    }

    if (savedNotifications && savedNotifications.length > 0) {
      this.notifications = savedNotifications;
    }
    if (savedAudit && savedAudit.length > 0) {
      this.auditLogs = savedAudit;
    }

    this.initialized = true;
    console.log(`[MemoryStore] Initialized. Loaded ${this.complaints.length} complaints, ${this.users.length} users, ${this.policeStations.length} stations from persistent store.`);
  }
}

export const memoryStore = new MemoryStore();
