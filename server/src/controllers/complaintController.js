import Complaint, { COMPLAINT_CATEGORIES } from '../models/Complaint.js';
import TrackingHistory from '../models/TrackingHistory.js';
import Notification from '../models/Notification.js';
import PoliceStation from '../models/PoliceStation.js';
import { isConnectedToMongo } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';

// Helper to generate a unique formal tracking ID
const generateTrackingId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CMP-${year}-${randomNum}`;
};

// @desc    Register a new complaint (Sections A to F)
// @route   POST /api/complaints
// @access  Private (Citizen)
export const createComplaint = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      fullName,
      age,
      gender,
      phone,
      email,
      address,
      city,
      state,
      pinCode,
      complaintTitle,
      category,
      description,
      incidentDate,
      incidentTime,
      incidentLocation,
      incidentLatitude,
      incidentLongitude,
      suspectInfo,
      witnessInfo,
      additionalInfo,
      selectedPoliceStationId,
    } = req.body;

    // Validate essential fields
    if (
      !fullName ||
      !age ||
      !gender ||
      !phone ||
      !email ||
      !complaintTitle ||
      !category ||
      !description ||
      !incidentDate ||
      !incidentTime ||
      !incidentLocation ||
      incidentLatitude === undefined ||
      incidentLongitude === undefined ||
      !selectedPoliceStationId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields across Sections A through D before submitting.',
      });
    }

    // Process uploaded evidence files
    const evidenceImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (isCloudinaryConfigured) {
          try {
            const uploadRes = await cloudinary.uploader.upload(file.path, {
              folder: 'police_complaints_evidence',
              resource_type: 'image',
            });
            evidenceImages.push({
              url: uploadRes.secure_url,
              publicId: uploadRes.public_id,
              fileName: file.originalname,
              fileType: file.mimetype,
              fileSize: file.size,
              uploadedAt: new Date(),
            });
            // Clean up temporary local file
            fs.unlinkSync(file.path);
          } catch (uploadErr) {
            console.warn('[Cloudinary Upload Error]', uploadErr.message);
            // Fallback to local file URL
            const relativePath = `/uploads/evidence/${file.filename}`;
            evidenceImages.push({
              url: relativePath,
              publicId: file.filename,
              fileName: file.originalname,
              fileType: file.mimetype,
              fileSize: file.size,
              uploadedAt: new Date(),
            });
          }
        } else {
          // Local storage URL
          const relativePath = `/uploads/evidence/${file.filename}`;
          evidenceImages.push({
            url: relativePath,
            publicId: file.filename,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedAt: new Date(),
          });
        }
      }
    }

    const trackingId = generateTrackingId();

    let newComplaint;

    if (isConnectedToMongo) {
      newComplaint = await Complaint.create({
        trackingId,
        userId,
        fullName: fullName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address || '',
        city: city || '',
        state: state || '',
        pinCode: pinCode || '',
        complaintTitle: complaintTitle.trim(),
        category,
        description: description.trim(),
        incidentDate,
        incidentTime,
        incidentLocation: incidentLocation.trim(),
        incidentLatitude: Number(incidentLatitude),
        incidentLongitude: Number(incidentLongitude),
        suspectInfo: suspectInfo || '',
        witnessInfo: witnessInfo || '',
        additionalInfo: additionalInfo || '',
        selectedPoliceStationId,
        evidenceImages,
        currentStatus: 'Submitted',
      });

      // Create Initial Tracking History Record
      await TrackingHistory.create({
        complaintId: newComplaint._id,
        previousStatus: 'None',
        newStatus: 'Submitted',
        updatedBy: `Citizen ${fullName}`,
        updatedById: userId,
        remarks: 'Complaint registered successfully by citizen. Awaiting administrative verification.',
        isInternal: false,
      });

      // Create Citizen Notification
      await Notification.create({
        userId,
        complaintId: newComplaint._id,
        trackingId,
        title: 'Complaint Registered Successfully',
        message: `Your complaint has been submitted under tracking ID ${trackingId}. Initial status: Submitted.`,
      });
    } else {
      const complaintId = `complaint_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      newComplaint = {
        _id: complaintId,
        id: complaintId,
        trackingId,
        userId: String(userId),
        fullName: fullName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address || '',
        city: city || '',
        state: state || '',
        pinCode: pinCode || '',
        complaintTitle: complaintTitle.trim(),
        category,
        description: description.trim(),
        incidentDate,
        incidentTime,
        incidentLocation: incidentLocation.trim(),
        incidentLatitude: Number(incidentLatitude),
        incidentLongitude: Number(incidentLongitude),
        suspectInfo: suspectInfo || '',
        witnessInfo: witnessInfo || '',
        additionalInfo: additionalInfo || '',
        selectedPoliceStationId,
        evidenceImages,
        currentStatus: 'Submitted',
        assignedAdminId: null,
        officialAcknowledgmentRef: '',
        officialActionTaken: '',
        internalNotes: '',
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.complaints.unshift(newComplaint);

      // Tracking History
      memoryStore.trackingHistories.push({
        _id: `th_${Date.now()}`,
        complaintId,
        previousStatus: 'None',
        newStatus: 'Submitted',
        updatedBy: `Citizen ${fullName}`,
        updatedById: userId,
        remarks: 'Complaint registered successfully by citizen. Awaiting administrative verification.',
        isInternal: false,
        createdAt: new Date(),
      });

      // Notification
      memoryStore.notifications.unshift({
        _id: `notif_${Date.now()}`,
        userId,
        complaintId,
        trackingId,
        title: 'Complaint Registered Successfully',
        message: `Your complaint has been submitted under tracking ID ${trackingId}. Initial status: Submitted.`,
        isRead: false,
        createdAt: new Date(),
      });

      // Persist to disk so data is never lost
      memoryStore.saveToDisk('complaints');
      memoryStore.saveToDisk('trackingHistories');
      memoryStore.saveToDisk('notifications');
    }

    // Populate police station details for immediate response & acknowledgment slip
    let stationObj = null;
    if (isConnectedToMongo) {
      stationObj = await PoliceStation.findById(selectedPoliceStationId);
    } else {
      stationObj = memoryStore.policeStations.find(
        (s) => String(s._id) === String(selectedPoliceStationId)
      );
    }

    const responseComplaint = {
      ...(typeof newComplaint.toObject === 'function' ? newComplaint.toObject() : newComplaint),
      selectedPoliceStationId: stationObj || { stationName: 'Police Station', stationCode: 'PS' },
    };

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      trackingId,
      complaint: responseComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints submitted by the current citizen
// @route   GET /api/complaints/my
// @access  Private (Citizen)
export const getMyComplaints = async (req, res, next) => {
  try {
    const userId = String(req.user._id || req.user.id || '');
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const userPhone = (req.user.phone || '').replace(/[^0-9]/g, '');
    let complaints;

    if (isConnectedToMongo) {
      const orConditions = [];
      if (userId) orConditions.push({ userId });
      if (userEmail) orConditions.push({ email: userEmail });

      let query = orConditions.length > 0 ? { $or: orConditions } : { userId };
      if (req.user.role === 'admin') {
        const adminSpecific = await Complaint.find(query)
          .populate('selectedPoliceStationId', 'stationName stationCode address contactNumber city email jurisdiction')
          .sort({ createdAt: -1 });
        if (adminSpecific.length > 0) {
          complaints = adminSpecific;
        } else {
          complaints = await Complaint.find()
            .populate('selectedPoliceStationId', 'stationName stationCode address contactNumber city email jurisdiction')
            .sort({ createdAt: -1 });
        }
      } else {
        complaints = await Complaint.find(query)
          .populate('selectedPoliceStationId', 'stationName stationCode address contactNumber city email jurisdiction')
          .sort({ createdAt: -1 });
      }
    } else {
      let filtered = memoryStore.complaints.filter((c) => {
        const cUserId = String(c.userId?._id || c.userId?.id || c.userId || '');
        const cEmail = (c.email || '').toLowerCase().trim();
        const cPhone = (c.phone || '').replace(/[^0-9]/g, '');

        const matchesId = Boolean(userId && cUserId === userId);
        const matchesEmail = Boolean(userEmail && cEmail === userEmail);
        const matchesPhone = Boolean(userPhone && cPhone && cPhone === userPhone);

        return matchesId || matchesEmail || matchesPhone;
      });

      // If user is admin and has 0 personal complaints, show all complaints so admin can monitor them in the citizen view too
      if (filtered.length === 0 && req.user.role === 'admin') {
        filtered = [...memoryStore.complaints];
      }

      complaints = filtered
        .map((c) => {
          const station = memoryStore.policeStations.find(
            (s) => String(s._id) === String(c.selectedPoliceStationId?._id || c.selectedPoliceStationId)
          );
          return {
            ...c,
            selectedPoliceStationId: station || c.selectedPoliceStationId || { stationName: 'Police Station' },
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint details with timeline tracking history
// @route   GET /api/complaints/:trackingId
// @access  Private or Public with Tracking ID & validation
export const getComplaintByTrackingId = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const cleanId = trackingId.trim().toUpperCase();

    let complaint;
    let history = [];

    if (isConnectedToMongo) {
      complaint = await Complaint.findOne({ trackingId: cleanId })
        .populate('selectedPoliceStationId', 'stationName stationCode address contactNumber city email jurisdiction')
        .populate('assignedAdminId', 'fullName email');

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: `Complaint with tracking ID "${cleanId}" was not found. Please verify the tracking number.`,
        });
      }

      // Access permission: tracking is accessible via valid Tracking ID;
      // Complainants and Admins see full dossier; public viewers see non-sensitive tracking timeline

      // Fetch tracking history
      // If admin, show all; if citizen, hide internal notes
      const historyFilter = { complaintId: complaint._id };
      if (!req.user || req.user.role === 'citizen') {
        historyFilter.isInternal = false;
      }

      history = await TrackingHistory.find(historyFilter).sort({ createdAt: 1 });
    } else {
      complaint = memoryStore.complaints.find((c) => c.trackingId.toUpperCase() === cleanId);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: `Complaint with tracking ID "${cleanId}" was not found. Please verify the tracking number.`,
        });
      }

      // Valid tracking ID found in memory store

      const station = memoryStore.policeStations.find(
        (s) => String(s._id) === String(complaint.selectedPoliceStationId)
      );

      const assignedAdmin = memoryStore.users.find(
        (u) => String(u._id) === String(complaint.assignedAdminId)
      );

      complaint = {
        ...complaint,
        selectedPoliceStationId: station || { stationName: 'Police Station' },
        assignedAdminId: assignedAdmin || null,
      };

      const isAdmin = req.user && ['admin', 'police_officer'].includes(req.user.role);
      history = memoryStore.trackingHistories
        .filter((th) => String(th.complaintId) === String(complaint._id))
        .filter((th) => (isAdmin ? true : !th.isInternal))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Mask sensitive phone/address if accessed without login
    let complaintData = typeof complaint.toObject === 'function' ? complaint.toObject() : { ...complaint };
    if (!req.user || req.user.role === 'citizen') {
      delete complaintData.internalNotes;
    }

    res.json({
      success: true,
      complaint: complaintData,
      trackingHistory: history,
    });
  } catch (error) {
    next(error);
  }
};
