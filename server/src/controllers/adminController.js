import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Complaint, { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../models/Complaint.js';
import PoliceStation from '../models/PoliceStation.js';
import TrackingHistory from '../models/TrackingHistory.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { isConnectedToMongo } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';
import { sendComplaintUpdateEmail } from '../utils/emailService.js';

const generateToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || 'police_complaint_super_secret_jwt_key_2026_secured',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public (Rate-limited, admin only)
export const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    let adminUser;

    if (isConnectedToMongo) {
      adminUser = await User.findOne({
        $and: [
          { role: { $in: ['admin', 'police_officer'] } },
          {
            $or: [
              { email: cleanUsername },
              { fullName: new RegExp(`^${cleanUsername}$`, 'i') },
            ],
          },
        ],
      });
    } else {
      adminUser = memoryStore.users.find(
        (u) =>
          ['admin', 'police_officer'].includes(u.role) &&
          (u.email.toLowerCase() === cleanUsername ||
            cleanUsername === (process.env.INITIAL_ADMIN_USERNAME || 'harsha').toLowerCase())
      );
    }

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials. Access unauthorized.',
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials. Access unauthorized.',
      });
    }

    // Log admin login to audit log
    const auditEntry = {
      administratorId: adminUser._id,
      adminName: adminUser.fullName,
      adminEmail: adminUser.email,
      action: 'ADMIN_LOGIN',
      changes: { loginTime: new Date() },
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      createdAt: new Date(),
    };

    if (isConnectedToMongo) {
      await AuditLog.create(auditEntry);
    } else {
      memoryStore.auditLogs.unshift({ _id: `audit_${Date.now()}`, ...auditEntry });
    }

    const token = generateToken(adminUser._id, adminUser.role, adminUser.email);

    res.json({
      success: true,
      message: 'Administrator authentication successful.',
      token,
      admin: {
        id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        phone: adminUser.phone,
        role: adminUser.role,
        mustChangePassword: adminUser.mustChangePassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Dashboard Metrics & Statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardMetrics = async (req, res, next) => {
  try {
    let complaintsList = [];
    let stationsList = [];
    let usersList = [];

    if (isConnectedToMongo) {
      complaintsList = await Complaint.find().lean();
      stationsList = await PoliceStation.find().lean();
      usersList = await User.find().lean();
    } else {
      complaintsList = memoryStore.complaints;
      stationsList = memoryStore.policeStations;
      usersList = memoryStore.users;
    }

    const totalComplaints = complaintsList.length;
    const newComplaints = complaintsList.filter((c) => c.currentStatus === 'Submitted').length;
    const underVerification = complaintsList.filter((c) => c.currentStatus === 'Under Verification').length;
    const verified = complaintsList.filter((c) => c.currentStatus === 'Verified').length;
    const forwarded = complaintsList.filter((c) => c.currentStatus === 'Forwarded').length;
    const investigationInProgress = complaintsList.filter((c) => c.currentStatus === 'Investigation in Progress').length;
    const actionTaken = complaintsList.filter((c) => c.currentStatus === 'Action Taken').length;
    const resolved = complaintsList.filter((c) => c.currentStatus === 'Resolved').length;
    const closed = complaintsList.filter((c) => c.currentStatus === 'Closed').length;
    const rejected = complaintsList.filter((c) => c.currentStatus === 'Rejected').length;

    // Category distribution
    const categoryCounts = {};
    COMPLAINT_CATEGORIES.forEach((cat) => (categoryCounts[cat] = 0));
    complaintsList.forEach((c) => {
      if (categoryCounts[c.category] !== undefined) {
        categoryCounts[c.category]++;
      } else {
        categoryCounts[c.category] = 1;
      }
    });

    // Status distribution
    const statusCounts = {};
    COMPLAINT_STATUSES.forEach((st) => (statusCounts[st] = 0));
    complaintsList.forEach((c) => {
      if (statusCounts[c.currentStatus] !== undefined) {
        statusCounts[c.currentStatus]++;
      }
    });

    // Monthly breakdown for current year
    const monthlyCounts = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m) => (monthlyCounts[m] = 0));
    complaintsList.forEach((c) => {
      const date = new Date(c.createdAt || c.submittedAt);
      const mName = months[date.getMonth()];
      if (mName) monthlyCounts[mName]++;
    });

    // Location / City distribution
    const cityCounts = {};
    complaintsList.forEach((c) => {
      const city = c.city || 'Other';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    // Police Station wise complaints
    const stationCounts = {};
    complaintsList.forEach((c) => {
      const stationId = String(c.selectedPoliceStationId?._id || c.selectedPoliceStationId);
      const st = stationsList.find((s) => String(s._id) === stationId);
      const name = st ? st.stationName : 'Unassigned';
      stationCounts[name] = (stationCounts[name] || 0) + 1;
    });

    // Recent 5 complaints
    const recentComplaints = complaintsList
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      metrics: {
        totalComplaints,
        newComplaints,
        underVerification,
        verified,
        forwarded,
        investigationInProgress,
        actionTaken,
        resolved,
        closed,
        rejected,
        totalStations: stationsList.length,
        totalCitizens: usersList.filter((u) => u.role === 'citizen').length,
      },
      charts: {
        categoryCounts,
        statusCounts,
        monthlyCounts,
        cityCounts,
        stationCounts,
      },
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all complaints with filters, search, pagination
// @route   GET /api/admin/complaints
// @access  Private (Admin)
export const getAdminComplaints = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      stationId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    let complaints = [];
    let total = 0;

    if (isConnectedToMongo) {
      const query = {};

      if (search) {
        query.$or = [
          { trackingId: new RegExp(search, 'i') },
          { fullName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') },
          { complaintTitle: new RegExp(search, 'i') },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      if (status && status !== 'All') {
        query.currentStatus = status;
      }

      if (stationId && stationId !== 'All') {
        query.selectedPoliceStationId = stationId;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }

      total = await Complaint.countDocuments(query);
      const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      complaints = await Complaint.find(query)
        .populate('selectedPoliceStationId', 'stationName stationCode address contactNumber city')
        .populate('assignedAdminId', 'fullName email')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit));
    } else {
      let filtered = [...memoryStore.complaints];

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.trackingId.toLowerCase().includes(q) ||
            c.fullName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            c.complaintTitle.toLowerCase().includes(q)
        );
      }

      if (category && category !== 'All') {
        filtered = filtered.filter((c) => c.category === category);
      }

      if (status && status !== 'All') {
        filtered = filtered.filter((c) => c.currentStatus === status);
      }

      if (stationId && stationId !== 'All') {
        filtered = filtered.filter(
          (c) => String(c.selectedPoliceStationId) === String(stationId)
        );
      }

      if (startDate) {
        filtered = filtered.filter((c) => new Date(c.createdAt) >= new Date(startDate));
      }

      if (endDate) {
        filtered = filtered.filter(
          (c) => new Date(c.createdAt) <= new Date(new Date(endDate).setHours(23, 59, 59, 999))
        );
      }

      total = filtered.length;

      // Populate stations and admin
      complaints = filtered
        .map((c) => {
          const st = memoryStore.policeStations.find(
            (s) => String(s._id) === String(c.selectedPoliceStationId)
          );
          const adm = memoryStore.users.find(
            (u) => String(u._id) === String(c.assignedAdminId)
          );
          return {
            ...c,
            selectedPoliceStationId: st || { stationName: 'Police Station' },
            assignedAdminId: adm ? { fullName: adm.fullName, email: adm.email } : null,
          };
        })
        .sort((a, b) => {
          const valA = new Date(a[sortBy] || a.createdAt);
          const valB = new Date(b[sortBy] || b.createdAt);
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        })
        .slice((page - 1) * limit, page * limit);
    }

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update Complaint Status with Remarks & Audit Log
// @route   PATCH /api/admin/complaints/:id/status
// @access  Private (Admin)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      newStatus,
      remarks,
      isInternal = false,
      officialAcknowledgmentRef,
      officialActionTaken,
      internalNotes,
      rejectionReason,
    } = req.body;

    if (!newStatus || !COMPLAINT_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status provided. Must be one of: ${COMPLAINT_STATUSES.join(', ')}`,
      });
    }

    const adminId = req.user._id || req.user.id;
    const adminName = req.user.fullName || 'Administrator';

    let complaint;
    let prevStatus = 'Submitted';

    if (isConnectedToMongo) {
      complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found.' });
      }

      prevStatus = complaint.currentStatus;
      complaint.currentStatus = newStatus;
      complaint.assignedAdminId = adminId;

      if (officialAcknowledgmentRef !== undefined) {
        complaint.officialAcknowledgmentRef = officialAcknowledgmentRef;
      }
      if (officialActionTaken !== undefined) {
        complaint.officialActionTaken = officialActionTaken;
      }
      if (internalNotes !== undefined) {
        complaint.internalNotes = internalNotes;
      }
      if (rejectionReason !== undefined) {
        complaint.rejectionReason = rejectionReason;
      }

      await complaint.save();

      // Create tracking history entry
      await TrackingHistory.create({
        complaintId: complaint._id,
        previousStatus: prevStatus,
        newStatus,
        updatedBy: adminName,
        updatedById: adminId,
        remarks: remarks || `Status officially updated to ${newStatus}`,
        isInternal: Boolean(isInternal),
      });

      // Audit Log
      await AuditLog.create({
        administratorId: adminId,
        adminName,
        adminEmail: req.user.email,
        action: 'STATUS_UPDATE',
        complaintId: complaint._id,
        changes: { previousStatus: prevStatus, newStatus, remarks },
        ipAddress: req.ip || '',
      });

      // Create citizen notification (if not an internal-only memo)
      if (!isInternal) {
        await Notification.create({
          userId: complaint.userId,
          complaintId: complaint._id,
          trackingId: complaint.trackingId,
          title: `Complaint Status Updated: ${newStatus}`,
          message: `Your complaint ${complaint.trackingId} status has changed to "${newStatus}". Remarks: ${remarks || 'None'}`,
        });

        // Email citizen
        sendComplaintUpdateEmail({
          to: complaint.email,
          trackingId: complaint.trackingId,
          status: newStatus,
          remarks,
          citizenName: complaint.fullName,
        }).catch((e) => console.warn('[Email error]', e.message));
      }
    } else {
      complaint = memoryStore.complaints.find((c) => String(c._id) === String(id));
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found.' });
      }

      prevStatus = complaint.currentStatus;
      complaint.currentStatus = newStatus;
      complaint.assignedAdminId = adminId;
      complaint.updatedAt = new Date();

      if (officialAcknowledgmentRef !== undefined) {
        complaint.officialAcknowledgmentRef = officialAcknowledgmentRef;
      }
      if (officialActionTaken !== undefined) {
        complaint.officialActionTaken = officialActionTaken;
      }
      if (internalNotes !== undefined) {
        complaint.internalNotes = internalNotes;
      }
      if (rejectionReason !== undefined) {
        complaint.rejectionReason = rejectionReason;
      }

      // Tracking History
      memoryStore.trackingHistories.push({
        _id: `th_${Date.now()}`,
        complaintId: complaint._id,
        previousStatus: prevStatus,
        newStatus,
        updatedBy: adminName,
        updatedById: adminId,
        remarks: remarks || `Status officially updated to ${newStatus}`,
        isInternal: Boolean(isInternal),
        createdAt: new Date(),
      });

      // Audit Log
      memoryStore.auditLogs.unshift({
        _id: `audit_${Date.now()}`,
        administratorId: adminId,
        adminName,
        adminEmail: req.user.email,
        action: 'STATUS_UPDATE',
        complaintId: complaint._id,
        changes: { previousStatus: prevStatus, newStatus, remarks },
        ipAddress: req.ip || '',
        createdAt: new Date(),
      });

      // Notification
      if (!isInternal) {
        memoryStore.notifications.unshift({
          _id: `notif_${Date.now()}`,
          userId: complaint.userId,
          complaintId: complaint._id,
          trackingId: complaint.trackingId,
          title: `Complaint Status Updated: ${newStatus}`,
          message: `Your complaint ${complaint.trackingId} status has changed to "${newStatus}". Remarks: ${remarks || 'None'}`,
          isRead: false,
          createdAt: new Date(),
        });
      }

      memoryStore.saveToDisk('complaints');
      memoryStore.saveToDisk('trackingHistories');
      memoryStore.saveToDisk('notifications');
      memoryStore.saveToDisk('auditLogs');
    }

    res.json({
      success: true,
      message: `Complaint ${complaint.trackingId} status successfully updated to "${newStatus}".`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Re-assign or verify police station jurisdiction
// @route   PATCH /api/admin/complaints/:id/assign
// @access  Private (Admin)
export const assignPoliceStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stationId, notes } = req.body;

    if (!stationId) {
      return res.status(400).json({ success: false, message: 'Police station ID is required.' });
    }

    const adminId = req.user._id || req.user.id;
    const adminName = req.user.fullName || 'Administrator';

    let complaint;
    let stationName = 'Police Station';

    if (isConnectedToMongo) {
      const station = await PoliceStation.findById(stationId);
      if (!station) {
        return res.status(404).json({ success: false, message: 'Specified police station not found.' });
      }
      stationName = station.stationName;

      complaint = await Complaint.findById(id);
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found.' });
      }

      complaint.selectedPoliceStationId = stationId;
      complaint.assignedAdminId = adminId;
      if (complaint.currentStatus === 'Submitted') {
        complaint.currentStatus = 'Assigned to Police Station';
      }
      await complaint.save();

      // Tracking history
      await TrackingHistory.create({
        complaintId: complaint._id,
        previousStatus: complaint.currentStatus,
        newStatus: complaint.currentStatus,
        updatedBy: adminName,
        updatedById: adminId,
        remarks: `Reassigned to ${stationName}. ${notes || ''}`,
        isInternal: false,
      });

      // Audit Log
      await AuditLog.create({
        administratorId: adminId,
        adminName,
        adminEmail: req.user.email,
        action: 'POLICE_STATION_ASSIGN',
        complaintId: complaint._id,
        changes: { stationId, stationName, notes },
      });
    } else {
      const station = memoryStore.policeStations.find((s) => String(s._id) === String(stationId));
      if (!station) {
        return res.status(404).json({ success: false, message: 'Specified police station not found.' });
      }
      stationName = station.stationName;

      complaint = memoryStore.complaints.find((c) => String(c._id) === String(id));
      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found.' });
      }

      complaint.selectedPoliceStationId = stationId;
      complaint.assignedAdminId = adminId;
      if (complaint.currentStatus === 'Submitted') {
        complaint.currentStatus = 'Assigned to Police Station';
      }
      complaint.updatedAt = new Date();

      memoryStore.trackingHistories.push({
        _id: `th_${Date.now()}`,
        complaintId: complaint._id,
        previousStatus: complaint.currentStatus,
        newStatus: complaint.currentStatus,
        updatedBy: adminName,
        updatedById: adminId,
        remarks: `Reassigned to ${stationName}. ${notes || ''}`,
        isInternal: false,
        createdAt: new Date(),
      });

      memoryStore.auditLogs.unshift({
        _id: `audit_${Date.now()}`,
        administratorId: adminId,
        adminName,
        adminEmail: req.user.email,
        action: 'POLICE_STATION_ASSIGN',
        complaintId: complaint._id,
        changes: { stationId, stationName, notes },
        createdAt: new Date(),
      });

      memoryStore.saveToDisk('complaints');
      memoryStore.saveToDisk('trackingHistories');
      memoryStore.saveToDisk('auditLogs');
    }

    res.json({
      success: true,
      message: `Jurisdiction station assigned to ${stationName}.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Police Station Management CRUD
// @route   POST /api/admin/police-stations
// @access  Private (Admin)
export const createPoliceStation = async (req, res, next) => {
  try {
    const {
      stationName,
      stationCode,
      address,
      city,
      state,
      pinCode,
      latitude,
      longitude,
      contactNumber,
      email,
      jurisdiction,
    } = req.body;

    if (!stationName || !stationCode || !address || !city || !state || !pinCode || latitude === undefined || longitude === undefined || !contactNumber || !jurisdiction) {
      return res.status(400).json({
        success: false,
        message: 'All police station fields are required.',
      });
    }

    let station;
    if (isConnectedToMongo) {
      station = await PoliceStation.create({
        stationName: stationName.trim(),
        stationCode: stationCode.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        contactNumber: contactNumber.trim(),
        email: email ? email.trim() : '',
        jurisdiction: jurisdiction.trim(),
        isActive: true,
      });
    } else {
      station = {
        _id: `station_${Date.now()}`,
        stationName: stationName.trim(),
        stationCode: stationCode.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        contactNumber: contactNumber.trim(),
        email: email ? email.trim() : '',
        jurisdiction: jurisdiction.trim(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.policeStations.push(station);
    }

    res.status(201).json({
      success: true,
      message: 'Police station registered successfully.',
      station,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update Police Station
// @route   PUT /api/admin/police-stations/:id
// @access  Private (Admin)
export const updatePoliceStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let station;

    if (isConnectedToMongo) {
      station = await PoliceStation.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else {
      const idx = memoryStore.policeStations.findIndex((s) => String(s._id) === String(id));
      if (idx !== -1) {
        memoryStore.policeStations[idx] = {
          ...memoryStore.policeStations[idx],
          ...req.body,
          updatedAt: new Date(),
        };
        station = memoryStore.policeStations[idx];
      }
    }

    if (!station) {
      return res.status(404).json({ success: false, message: 'Police station not found.' });
    }

    res.json({
      success: true,
      message: 'Police station updated successfully.',
      station,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete or deactivate Police Station
// @route   DELETE /api/admin/police-stations/:id
// @access  Private (Admin)
export const deletePoliceStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let station;

    if (isConnectedToMongo) {
      station = await PoliceStation.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } else {
      const target = memoryStore.policeStations.find((s) => String(s._id) === String(id));
      if (target) {
        target.isActive = false;
        station = target;
      }
    }

    if (!station) {
      return res.status(404).json({ success: false, message: 'Police station not found.' });
    }

    res.json({
      success: true,
      message: 'Police station deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Export permitted complaint records as CSV
// @route   GET /api/admin/reports/export-csv
// @access  Private (Admin)
export const exportComplaintsCSV = async (req, res, next) => {
  try {
    let complaints = [];
    if (isConnectedToMongo) {
      complaints = await Complaint.find().populate('selectedPoliceStationId', 'stationName stationCode');
    } else {
      complaints = memoryStore.complaints.map((c) => {
        const st = memoryStore.policeStations.find((s) => String(s._id) === String(c.selectedPoliceStationId));
        return {
          ...c,
          selectedPoliceStationId: st || { stationName: 'Police Station', stationCode: 'PS' },
        };
      });
    }

    const headers = [
      'Complaint ID',
      'Citizen Name',
      'Age',
      'Gender',
      'Phone',
      'Email',
      'Title',
      'Category',
      'Incident Date',
      'Incident Location',
      'Police Station',
      'Current Status',
      'Submitted At',
    ];

    const rows = complaints.map((c) => [
      `"${c.trackingId}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.age,
      `"${c.gender}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.complaintTitle.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.incidentDate}"`,
      `"${c.incidentLocation.replace(/"/g, '""')}"`,
      `"${c.selectedPoliceStationId?.stationName || 'N/A'}"`,
      `"${c.currentStatus}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=police_complaints_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: User Management
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    let users = [];
    if (isConnectedToMongo) {
      users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    } else {
      users = memoryStore.users.map(({ passwordHash, ...rest }) => rest);
    }

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
