import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintTracking } from '../services/api';
import { Complaint, TrackingHistoryItem, PoliceStation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { generateComplaintAcknowledgmentPDF } from '../utils/pdfGenerator';
import {
  Search,
  Clock,
  CheckCircle,
  FileText,
  MapPin,
  Building2,
  Calendar,
  Download,
  AlertCircle,
  Share2,
  ShieldCheck,
  User,
  ArrowRight,
  Loader2,
  FileCheck,
} from 'lucide-react';

const STATUS_STEPS = [
  'Submitted',
  'Under Verification',
  'Verified',
  'Assigned to Police Station',
  'Forwarded',
  'Acknowledged by Police',
  'Investigation in Progress',
  'Action Taken',
  'Resolved',
];

export const TrackComplaint: React.FC = () => {
  const { trackingId: urlTrackingId } = useParams<{ trackingId: string }>();
  const navigate = useNavigate();

  const [inputTrackingId, setInputTrackingId] = useState(urlTrackingId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<TrackingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (urlTrackingId) {
      setInputTrackingId(urlTrackingId);
      performTracking(urlTrackingId);
    }
  }, [urlTrackingId]);

  const performTracking = async (id: string) => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return;

    setError('');
    setLoading(true);
    try {
      const res = await getComplaintTracking(cleanId);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setHistory(res.trackingHistory || []);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend tracking lookup error, trying local cache', err);
    }

    try {
      const raw = localStorage.getItem('local_submitted_complaints');
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((c: any) => c.trackingId?.toUpperCase() === cleanId);
        if (found) {
          setComplaint(found);
          setHistory([
            {
              _id: 'th_local_01',
              complaintId: found._id || found.trackingId,
              previousStatus: 'None',
              newStatus: found.currentStatus || 'Submitted',
              updatedBy: `Citizen ${found.fullName}`,
              remarks: 'Complaint registered and stored in citizen portal.',
              createdAt: found.createdAt || new Date().toISOString(),
            },
          ]);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    setError(`No complaint found matching tracking number "${cleanId}". Please check the ID and try again.`);
    setComplaint(null);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTrackingId.trim()) {
      navigate(`/track/${inputTrackingId.trim().toUpperCase()}`);
    }
  };

  // Determine current active milestone index for visual timeline
  const getCurrentStepIndex = () => {
    if (!complaint) return 0;
    if (complaint.currentStatus === 'Rejected') return -1;
    if (complaint.currentStatus === 'Closed') return STATUS_STEPS.length;
    const idx = STATUS_STEPS.indexOf(complaint.currentStatus);
    return idx !== -1 ? idx : 0;
  };

  const station = complaint?.selectedPoliceStationId as PoliceStation;
  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Live Audit &amp; Status Lookup
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Track Police Complaint Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your unique tracking ID issued upon registration to inspect investigation milestones and officer remarks.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. CMP-2026-08492"
              value={inputTrackingId}
              onChange={(e) => setInputTrackingId(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm uppercase font-mono tracking-wider bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#0b2545] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Demo IDs Hint */}
        <div className="text-[11px] text-slate-500">
          Try demo tracking code:{' '}
          <button
            type="button"
            onClick={() => {
              setInputTrackingId('CMP-2026-08492');
              performTracking('CMP-2026-08492');
            }}
            className="text-blue-700 font-semibold underline"
          >
            CMP-2026-08492
          </button>{' '}
          or{' '}
          <button
            type="button"
            onClick={() => {
              setInputTrackingId('CMP-2026-03184');
              performTracking('CMP-2026-03184');
            }}
            className="text-blue-700 font-semibold underline"
          >
            CMP-2026-03184
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div>
            <span className="font-bold block">Lookup Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Complaint Dossier & Timeline */}
      {complaint && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            {/* Top Ribbon */}
            <div className="bg-[#0b2545] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold text-xs">TRACKING ID:</span>
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-wider">
                    {complaint.trackingId}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  {complaint.complaintTitle}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={complaint.currentStatus} size="lg" />
                <button
                  type="button"
                  onClick={() => generateComplaintAcknowledgmentPDF(complaint)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                  title="Download Official PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download PDF Slip</span>
                </button>
              </div>
            </div>

            {/* Quick Particulars Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <strong className="text-slate-800">{complaint.category}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted Date</span>
                <strong className="text-slate-800">
                  {new Date(complaint.createdAt || complaint.submittedAt || Date.now()).toLocaleDateString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident Date</span>
                <strong className="text-slate-800">{complaint.incidentDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Police Station</span>
                <strong className="text-blue-900 truncate block">
                  {station?.stationName || 'Assigned Police Station'}
                </strong>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 space-y-6">
              {/* Location & Jurisdiction Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Incident Location</span>
                  </div>
                  <p className="text-slate-700 leading-normal">{complaint.incidentLocation}</p>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Coordinates: {complaint.incidentLatitude?.toFixed(4)}, {complaint.incidentLongitude?.toFixed(4)}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Assigned Police Station</span>
                  </div>
                  <p className="font-semibold text-slate-800">{station?.stationName || 'Central Processing'}</p>
                  <p className="text-slate-600">{station?.address}</p>
                  <p className="text-[11px] text-blue-700 font-bold">Phone: {station?.contactNumber}</p>
                </div>
              </div>

              {/* Official Acknowledgment Details if available */}
              {complaint.officialAcknowledgmentRef && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-teal-700" />
                    <span>Police Official Acknowledgment Reference</span>
                  </div>
                  <div className="font-mono font-bold text-teal-800 text-sm">
                    {complaint.officialAcknowledgmentRef}
                  </div>
                  {complaint.officialActionTaken && (
                    <p className="text-slate-700 mt-1">
                      <strong>Action Taken:</strong> {complaint.officialActionTaken}
                    </p>
                  )}
                </div>
              )}

              {/* Rejection Notice if rejected */}
              {complaint.currentStatus === 'Rejected' && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-1 text-rose-900">
                  <strong className="block font-bold">Complaint Rejected by Jurisdiction Desk:</strong>
                  <p>{complaint.rejectionReason || 'Details could not be verified or matter falls outside jurisdiction.'}</p>
                </div>
              )}

              {/* Visual Multi-step Timeline */}
              {complaint.currentStatus !== 'Rejected' && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span>Investigation Lifecycle Progression</span>
                  </h3>

                  <div className="overflow-x-auto pb-4">
                    <div className="flex items-center min-w-[700px] justify-between relative px-2">
                      {/* Connecting Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0"></div>
                      <div
                        className="absolute top-4 left-6 h-0.5 bg-blue-600 transition-all duration-500 z-0"
                        style={{
                          width: `${Math.min(100, (currentStepIdx / (STATUS_STEPS.length - 1)) * 96)}%`,
                        }}
                      ></div>

                      {STATUS_STEPS.map((st, i) => {
                        const isDone = i <= currentStepIdx;
                        const isCurrent = i === currentStepIdx;
                        return (
                          <div
                            key={st}
                            className="flex flex-col items-center relative z-10 space-y-1.5 flex-1"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                isCurrent
                                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                                  : isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              }`}
                            >
                              {isDone && !isCurrent ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                i + 1
                              )}
                            </div>
                            <span
                              className={`text-[10px] text-center max-w-[80px] leading-tight ${
                                isCurrent
                                  ? 'font-bold text-blue-900'
                                  : isDone
                                  ? 'font-semibold text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Audit History Timeline Feed */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Official Audit &amp; Event Logs</h3>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-500">No public status events recorded yet.</p>
                ) : (
                  <div className="space-y-3 relative pl-6 border-l-2 border-blue-200 ml-2">
                    {history.map((item, idx) => (
                      <div key={item._id || idx} className="relative text-xs space-y-1">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow"></span>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-slate-900">
                            {item.newStatus}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600">{item.remarks}</p>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Updated by: {item.updatedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
