export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  role: 'citizen' | 'admin' | 'police_officer';
  mustChangePassword?: boolean;
  createdAt?: string;
}

export interface PoliceStation {
  _id: string;
  id?: string;
  stationName: string;
  stationCode: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  email?: string;
  jurisdiction: string;
  isActive: boolean;
  distance?: number;
  isOsmDiscovered?: boolean;
}

export interface EvidenceImage {
  url: string;
  publicId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
}

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Verification'
  | 'Verified'
  | 'Assigned to Police Station'
  | 'Forwarded'
  | 'Acknowledged by Police'
  | 'Investigation in Progress'
  | 'Action Taken'
  | 'Resolved'
  | 'Closed'
  | 'Rejected';

export interface TrackingHistoryItem {
  _id: string;
  complaintId: string;
  previousStatus: string;
  newStatus: ComplaintStatus;
  updatedBy: string;
  updatedById?: string;
  remarks?: string;
  isInternal?: boolean;
  supportingDocument?: string;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  trackingId: string;
  userId: string | User;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  complaintTitle: string;
  category: string;
  description: string;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  incidentLatitude: number;
  incidentLongitude: number;
  suspectInfo?: string;
  witnessInfo?: string;
  additionalInfo?: string;
  selectedPoliceStationId: string | PoliceStation;
  evidenceImages: EvidenceImage[];
  currentStatus: ComplaintStatus;
  assignedAdminId?: any;
  officialAcknowledgmentRef?: string;
  officialActionTaken?: string;
  internalNotes?: string;
  rejectionReason?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  complaintId?: string;
  trackingId?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalComplaints: number;
  newComplaints: number;
  underVerification: number;
  verified: number;
  forwarded: number;
  investigationInProgress: number;
  actionTaken: number;
  resolved: number;
  closed: number;
  rejected: number;
  totalStations: number;
  totalCitizens: number;
}
