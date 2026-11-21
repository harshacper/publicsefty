import mongoose from 'mongoose';

export const COMPLAINT_CATEGORIES = [
  'Theft',
  'Robbery',
  'Cyber Crime',
  'Fraud',
  'Harassment',
  'Missing Person',
  'Assault',
  'Domestic Violence',
  'Property Dispute',
  'Vehicle Theft',
  'Online Scam',
  'Other'
];

export const COMPLAINT_STATUSES = [
  'Submitted',
  'Under Verification',
  'Verified',
  'Assigned to Police Station',
  'Forwarded',
  'Acknowledged by Police',
  'Investigation in Progress',
  'Action Taken',
  'Resolved',
  'Closed',
  'Rejected'
];

const evidenceImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Citizen Personal Information (Section A)
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      required: true,
    },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },

    // Complaint Information (Section B)
    complaintTitle: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    incidentDate: { type: String, required: true },
    incidentTime: { type: String, required: true },
    incidentLocation: { type: String, required: true },
    suspectInfo: { type: String, default: '' },
    witnessInfo: { type: String, default: '' },
    additionalInfo: { type: String, default: '' },

    // Crime Location Coordinates (Section C)
    incidentLatitude: { type: Number, required: true },
    incidentLongitude: { type: Number, required: true },

    // Selected Police Station (Section D)
    selectedPoliceStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
      required: true,
      index: true,
    },

    // Evidence Images (Section E)
    evidenceImages: [evidenceImageSchema],

    // Tracking & Management Status
    currentStatus: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: 'Submitted',
      index: true,
    },
    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    officialAcknowledgmentRef: {
      type: String,
      default: '',
    },
    officialActionTaken: {
      type: String,
      default: '',
    },
    internalNotes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ createdAt: -1 });

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
export default Complaint;
