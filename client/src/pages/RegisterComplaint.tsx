import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { findNearestStations, submitComplaint } from '../services/api';
import { PoliceStation, Complaint } from '../types';
import { generateComplaintAcknowledgmentPDF } from '../utils/pdfGenerator';
import {
  Shield,
  User,
  FileText,
  MapPin,
  Building2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Download,
  Check,
  Search,
  Phone,
  Clock,
  Loader2,
  Info,
} from 'lucide-react';

const CATEGORIES = [
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
  'Other',
];

export const RegisterComplaint: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active step (1: Personal, 2: Incident, 3: Location, 4: Station, 5: Evidence, 6: Summary & Submit, 7: Confirmation)
  const [activeStep, setActiveStep] = useState(1);

  // Section A: Personal Information (prefilled from profile)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || '',
    age: '28',
    gender: 'Male',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || 'Bengaluru',
    state: user?.state || 'Karnataka',
    pinCode: user?.pinCode || '560001',
  });

  // Update if user profile loads after mount
  useEffect(() => {
    if (user) {
      setPersonalInfo((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || 'Bengaluru',
        state: prev.state || user.state || 'Karnataka',
        pinCode: prev.pinCode || user.pinCode || '560001',
      }));
    }
  }, [user]);

  // Section B: Complaint Information
  const initialCat = searchParams.get('category') || 'Theft';
  const [complaintInfo, setComplaintInfo] = useState({
    complaintTitle: '',
    category: CATEGORIES.includes(initialCat) ? initialCat : 'Theft',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '14:30',
    suspectInfo: '',
    witnessInfo: '',
    additionalInfo: '',
  });

  // Section C: Crime Location (defaults to Bengaluru Central or GPS)
  const [locationInfo, setLocationInfo] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    incidentLocation: 'Vidhana Soudha, Bengaluru, Karnataka, India',
  });

  // Section D: Police Stations
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [recommendedStation, setRecommendedStation] = useState<PoliceStation | null>(null);
  const [loadingStations, setLoadingStations] = useState(false);

  // Section E: Evidence Files
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [fileError, setFileError] = useState('');

  // Section F: Confirmation
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Step 7: Completed Result
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Automatically fetch nearest stations whenever location coordinates change
  useEffect(() => {
    if (locationInfo.latitude && locationInfo.longitude) {
      fetchNearbyStations(locationInfo.latitude, locationInfo.longitude);
    }
  }, [locationInfo.latitude, locationInfo.longitude]);

  const fetchNearbyStations = async (lat: number, lng: number) => {
    setLoadingStations(true);
    try {
      const data = await findNearestStations({
        latitude: lat,
        longitude: lng,
        radius: 30000,
        includeOsm: true,
      });

      if (data.success && data.stations?.length > 0) {
        setStations(data.stations);
        const rec = data.recommendedStation || data.stations[0];
        setRecommendedStation(rec);
        // Default to recommended station if none selected yet
        if (!selectedStationId || !data.stations.some((s) => s._id === selectedStationId)) {
          setSelectedStationId(rec._id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch nearest stations', err);
    } finally {
      setLoadingStations(false);
    }
  };

  // Evidence file handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const previews: string[] = [];

    if (evidenceFiles.length + files.length > 5) {
      setFileError('You can upload a maximum of 5 evidence photos.');
      return;
    }

    for (const file of files) {
      // Validate file format
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFileError(`File ${file.name} is not a valid format. Allowed: JPG, PNG, WEBP.`);
        continue;
      }

      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`File ${file.name} exceeds the maximum size limit of 10 MB.`);
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setEvidenceFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleSubmitComplaint = async () => {
    setSubmissionError('');
    if (!agreementChecked) {
      setSubmissionError('Please accept the declaration checkbox before submitting.');
      return;
    }

    if (!selectedStationId) {
      setSubmissionError('Please select a jurisdiction police station.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      // Section A
      formData.append('fullName', personalInfo.fullName);
      formData.append('age', personalInfo.age);
      formData.append('gender', personalInfo.gender);
      formData.append('phone', personalInfo.phone);
      formData.append('email', personalInfo.email);
      formData.append('address', personalInfo.address);
      formData.append('city', personalInfo.city);
      formData.append('state', personalInfo.state);
      formData.append('pinCode', personalInfo.pinCode);

      // Section B
      formData.append('complaintTitle', complaintInfo.complaintTitle);
      formData.append('category', complaintInfo.category);
      formData.append('description', complaintInfo.description);
      formData.append('incidentDate', complaintInfo.incidentDate);
      formData.append('incidentTime', complaintInfo.incidentTime);
      formData.append('suspectInfo', complaintInfo.suspectInfo);
      formData.append('witnessInfo', complaintInfo.witnessInfo);
      formData.append('additionalInfo', complaintInfo.additionalInfo);

      // Section C
      formData.append('incidentLocation', locationInfo.incidentLocation);
      formData.append('incidentLatitude', String(locationInfo.latitude));
      formData.append('incidentLongitude', String(locationInfo.longitude));

      // Section D
      formData.append('selectedPoliceStationId', selectedStationId);

      // Section E
      for (const file of evidenceFiles) {
        formData.append('evidenceImages', file);
      }

      const res = await submitComplaint(formData);
      if (res.success && res.complaint) {
        setSubmittedComplaint(res.complaint);
        // Persist to local cache so user dashboard immediately has it even if network reloads
        try {
          const raw = localStorage.getItem('local_submitted_complaints');
          const existing = raw ? JSON.parse(raw) : [];
          const updated = [
            res.complaint,
            ...existing.filter(
              (c: any) => c.trackingId !== res.complaint.trackingId && c._id !== res.complaint._id
            ),
          ];
          localStorage.setItem('local_submitted_complaints', JSON.stringify(updated));
        } catch (e) {
          console.warn('Could not cache complaint locally', e);
        }
        setActiveStep(7); // Jump to confirmation screen
      } else {
        setSubmissionError(res.message || 'Submission failed. Please review your details.');
      }
    } catch (err: any) {
      setSubmissionError(
        err.response?.data?.message ||
          'Server encountered an error while submitting your complaint. Please verify all inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Complainant' },
    { num: 2, label: 'Incident' },
    { num: 3, label: 'Crime Site Map' },
    { num: 4, label: 'Police Station' },
    { num: 5, label: 'Photo Evidence' },
    { num: 6, label: 'Review & Submit' },
  ];

  const selectedStationObj = stations.find((s) => s._id === selectedStationId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          Official Form 1-A • Citizen Intimation
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Register Police Complaint &amp; Incident Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Complete Sections A through E. Pinpoint the incident location on the map and attach supporting evidence.
        </p>
      </div>

      {/* Stepper Progress Bar (hidden in confirmation step 7) */}
      {activeStep <= 6 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            {stepsList.map((step) => (
              <div
                key={step.num}
                onClick={() => {
                  if (step.num < activeStep) setActiveStep(step.num);
                }}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  step.num === activeStep
                    ? 'text-blue-700 font-bold'
                    : step.num < activeStep
                    ? 'text-emerald-600 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-1 transition ${
                    step.num === activeStep
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow'
                      : step.num < activeStep
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {step.num < activeStep ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-[10px] sm:text-xs text-center hidden sm:inline">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: Section A - Personal Information */}
      {activeStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <User className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Section A: Personal Information</h3>
              <p className="text-xs text-slate-500">
                Prefilled from your registered profile. You may modify particulars if needed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                required
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="14"
                max="120"
                value={personalInfo.age}
                onChange={(e) => setPersonalInfo({ ...personalInfo, age: e.target.value })}
                required
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={personalInfo.gender}
                onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                required
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                required
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential House Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={personalInfo.address}
                onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                required
                placeholder="Street address, building, apartment"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
              <input
                type="text"
                value={personalInfo.city}
                onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={personalInfo.state}
                onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={personalInfo.pinCode}
                onChange={(e) => setPersonalInfo({ ...personalInfo, pinCode: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (!personalInfo.fullName || !personalInfo.phone || !personalInfo.email) {
                  alert('Please fill all required personal information fields.');
                  return;
                }
                setActiveStep(2);
              }}
              className="inline-flex items-center gap-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition"
            >
              <span>Next: Incident Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Section B - Complaint Information */}
      {activeStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Section B: Complaint Information</h3>
              <p className="text-xs text-slate-500">
                Categorize the incident and provide a comprehensive chronological description.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complaint Subject / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={complaintInfo.complaintTitle}
                  onChange={(e) =>
                    setComplaintInfo({ ...complaintInfo, complaintTitle: e.target.value })
                  }
                  required
                  placeholder="e.g. Laptop bag snatched near metro station gate 2"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Crime Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={complaintInfo.category}
                  onChange={(e) =>
                    setComplaintInfo({ ...complaintInfo, category: e.target.value })
                  }
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold text-blue-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={complaintInfo.incidentDate}
                  onChange={(e) =>
                    setComplaintInfo({ ...complaintInfo, incidentDate: e.target.value })
                  }
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={complaintInfo.incidentTime}
                  onChange={(e) =>
                    setComplaintInfo({ ...complaintInfo, incidentTime: e.target.value })
                  }
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Complaint Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={complaintInfo.description}
                onChange={(e) =>
                  setComplaintInfo({ ...complaintInfo, description: e.target.value })
                }
                required
                placeholder="Describe what occurred in detail: sequence of events, items lost or damaged, vehicles involved, transaction details for cyber frauds, etc."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suspect Information <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={complaintInfo.suspectInfo}
                  onChange={(e) =>
                    setComplaintInfo({ ...complaintInfo, suspectInfo: e.target.value })
                  }
                  placeholder="Appearance, height, clothing, phone number, vehicle plate, bank details"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Witness Particulars <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={complaintInfo.witnessInfo}
                  onChange={(e) =>
                    setComplaintInfo({ ...complaintInfo, witnessInfo: e.target.value })
                  }
                  placeholder="Names and contact details of any eyewitnesses or nearby store owners"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>
            </div>

            {complaintInfo.category === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Particulars (For 'Other' Category)
                </label>
                <input
                  type="text"
                  value={complaintInfo.additionalInfo}
                  onChange={(e) =>
                    setComplaintInfo({ ...complaintInfo, additionalInfo: e.target.value })
                  }
                  placeholder="Specify nature of grievance"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!complaintInfo.complaintTitle.trim() || !complaintInfo.description.trim()) {
                  alert('Please enter both Complaint Title and Detailed Description.');
                  return;
                }
                setActiveStep(3);
              }}
              className="inline-flex items-center gap-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition"
            >
              <span>Next: Crime Location Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Section C - Crime Location */}
      {activeStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Section C: Crime Location Detection</h3>
              <p className="text-xs text-slate-500">
                Important: The crime location must be where the incident occurred, not necessarily your home or current spot.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-blue-700 mt-0.5" />
              <div>
                <strong>How to set the crime site:</strong> You can click the "Use My Current Location" button if the crime occurred where you are right now, OR type the address/landmark in the search box, OR drag the red marker directly on the interactive map.
              </div>
            </div>

            <MapLocationPicker
              latitude={locationInfo.latitude}
              longitude={locationInfo.longitude}
              address={locationInfo.incidentLocation}
              onLocationChange={(lat, lng, addr) => {
                setLocationInfo({
                  latitude: lat,
                  longitude: lng,
                  incidentLocation: addr,
                });
              }}
              height="380px"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition"
            >
              <span>Next: Select Police Station</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Section D - Police Station Selection */}
      {activeStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Section D: Police Station Selection</h3>
              <p className="text-xs text-slate-500">
                Nearest police stations calculated automatically via Haversine distances based on your crime location.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {recommendedStation && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Recommended Nearest Station
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {recommendedStation.stationName}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{recommendedStation.address}</p>
                    <div className="flex items-center gap-4 text-xs mt-1 text-slate-700">
                      <span>
                        Distance: <strong>{recommendedStation.distance} km</strong>
                      </span>
                      <span>
                        Phone: <strong>{recommendedStation.contactNumber}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                {selectedStationId === recommendedStation._id ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
                    <Check className="w-4 h-4" /> Selected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedStationId(recommendedStation._id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                  >
                    Select Recommended
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Available Nearby Police Stations ({stations.length})
              </label>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {stations.map((st) => {
                  const isSelected = selectedStationId === st._id;
                  return (
                    <div
                      key={st._id}
                      onClick={() => setSelectedStationId(st._id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="stationRadio"
                          checked={isSelected}
                          onChange={() => setSelectedStationId(st._id)}
                          className="mt-1 text-blue-600"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {st.stationName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {st.stationCode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{st.address}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>Phone: {st.contactNumber}</span>
                            <span>•</span>
                            <span className="font-semibold text-blue-700">
                              {st.distance !== undefined ? `${st.distance} km away` : 'Jurisdiction Post'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
              <strong>Jurisdiction Policy:</strong> Selection of station provides initial recommendation. The police administration reserves the authority to transfer the file if statutory territorial boundaries dictate another jurisdiction.
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedStationId) {
                  alert('Please choose a police station before proceeding.');
                  return;
                }
                setActiveStep(5);
              }}
              className="inline-flex items-center gap-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition"
            >
              <span>Next: Upload Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Section E - Crime Evidence Upload */}
      {activeStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Section E: Crime Evidence Photos</h3>
              <p className="text-xs text-slate-500">
                Upload up to 5 photos supporting your complaint (JPG, JPEG, PNG, WEBP, max 10MB each).
              </p>
            </div>
          </div>

          {fileError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50 transition">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <label className="cursor-pointer font-bold text-blue-700 hover:text-blue-900 text-xs">
                <span>Click here to select photos from device</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">
                Accepted: JPG, JPEG, PNG, WEBP (Max 5 files, 10 MB per file)
              </p>
            </div>
          </div>

          {/* Previews Grid */}
          {filePreviews.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Selected Evidence Photos ({filePreviews.length}/5):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {filePreviews.map((src, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-square bg-slate-100"
                  >
                    <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow transition"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                      Img {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
            🔒 <strong>Data Privacy Guarantee:</strong> Evidence files are uploaded securely and are strictly protected. They are never published publicly or shared with unauthorized individuals.
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="inline-flex items-center gap-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition"
            >
              <span>Next: Review &amp; Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Section F - Final Submission Summary */}
      {activeStep === 6 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Section F: Review Complaint Summary</h3>
              <p className="text-xs text-slate-500">
                Carefully review all submitted particulars before electronic intimation recording.
              </p>
            </div>
          </div>

          {submissionError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Dossier Summary Grid */}
          <div className="space-y-4 text-xs">
            {/* Complainant card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-blue-900 uppercase tracking-wide flex justify-between">
                <span>Complainant Details</span>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-blue-700 hover:underline capitalize"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block">Name:</span>
                  <strong>{personalInfo.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Mobile:</span>
                  <strong>{personalInfo.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <strong>{personalInfo.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Age / Gender:</span>
                  <strong>
                    {personalInfo.age} yrs / {personalInfo.gender}
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <span className="text-slate-400 block">Address:</span>
                  <span>
                    {personalInfo.address}, {personalInfo.city}, {personalInfo.state} - {personalInfo.pinCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Incident card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-blue-900 uppercase tracking-wide flex justify-between">
                <span>Incident Particulars</span>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-blue-700 hover:underline capitalize"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div>
                  <span className="text-slate-400">Title:</span>{' '}
                  <strong>{complaintInfo.complaintTitle}</strong>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-400">Category:</span>{' '}
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold">
                      {complaintInfo.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date/Time:</span>{' '}
                    <strong>
                      {complaintInfo.incidentDate} at {complaintInfo.incidentTime}
                    </strong>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mt-1">Description:</span>
                  <p className="bg-white p-2.5 rounded border border-slate-200 mt-0.5 leading-relaxed">
                    {complaintInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Police Station */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block uppercase font-bold text-[10px]">
                  Crime Location
                </span>
                <div className="font-semibold text-slate-800">{locationInfo.incidentLocation}</div>
                <div className="text-[11px] font-mono text-slate-500">
                  LAT: {locationInfo.latitude.toFixed(5)}, LNG: {locationInfo.longitude.toFixed(5)}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 block uppercase font-bold text-[10px]">
                  Selected Police Station
                </span>
                <div className="font-bold text-slate-900">{selectedStationObj?.stationName}</div>
                <div className="text-xs text-slate-600">{selectedStationObj?.address}</div>
                <div className="text-[11px] text-blue-700 font-semibold">
                  Contact: {selectedStationObj?.contactNumber}
                </div>
              </div>
            </div>

            {/* Uploaded Evidence files */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500">Attached Photo Evidence: </span>
              <strong>{evidenceFiles.length} file(s) attached</strong>
            </div>
          </div>

          {/* Statutory Citizen Declaration */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs text-amber-950 font-medium leading-relaxed">
                I solemnly declare that all particulars submitted in this complaint are true and accurate to the best of my knowledge and belief. I understand that submitting false reports to law enforcement is a punishable offence under Section 182 / 211 of the Indian Penal Code.
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={submitting || !agreementChecked}
              onClick={handleSubmitComplaint}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-7 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Complaint...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Completed Submission Receipt */}
      {activeStep === 7 && submittedComplaint && (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-emerald-300 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Electronic Intimation Recorded
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Complaint Registered Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your incident report has been securely registered in the central system. An acknowledgment has been generated.
            </p>
          </div>

          {/* Highlighted Tracking ID Box */}
          <div className="max-w-md mx-auto bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-blue-500 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Unique Complaint Tracking ID
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-blue-700 tracking-wider">
              {submittedComplaint.trackingId}
            </div>
            <div className="text-[11px] text-slate-500">
              Initial Tracking Status: <strong className="text-blue-700 font-semibold">Submitted</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => generateComplaintAcknowledgmentPDF(submittedComplaint)}
              className="inline-flex items-center gap-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow transition"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Official Acknowledgment (PDF)</span>
            </button>

            <Link
              to={`/track/${submittedComplaint.trackingId}`}
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-5 py-2.5 rounded-lg text-xs border border-blue-200 transition"
            >
              <Search className="w-4 h-4" />
              <span>Track Live Status</span>
            </Link>

            <Link
              to="/citizen/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 transition"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Disclaimer Reminder */}
          <div className="max-w-lg mx-auto p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
            <strong>Next Steps:</strong>
            <p className="text-[11px] leading-relaxed">
              Your complaint will be reviewed by the administrative desk and forwarded to {selectedStationObj?.stationName} for verification. You can track all updates live with your Tracking ID.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
