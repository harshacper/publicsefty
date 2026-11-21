import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyComplaints } from '../services/api';
import { Complaint, PoliceStation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Sidebar } from '../components/Sidebar';
import { generateComplaintAcknowledgmentPDF } from '../utils/pdfGenerator';
import {
  FilePlus2,
  Search,
  FileText,
  User,
  LifeBuoy,
  Clock,
  CheckCircle2,
  Share2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  MapPin,
  Calendar,
  Loader2,
  Download,
  Eye,
  X,
  Camera,
  Building2,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getMyComplaints();
      let serverComplaints: Complaint[] = [];
      if (res.success && res.complaints) {
        serverComplaints = res.complaints;
      }

      // Check local cache backup
      let localList: Complaint[] = [];
      try {
        const raw = localStorage.getItem('local_submitted_complaints');
        if (raw) localList = JSON.parse(raw);
      } catch (e) {}

      // Merge avoiding duplicates by trackingId
      const mergedMap = new Map<string, Complaint>();
      serverComplaints.forEach((c) => mergedMap.set(c.trackingId, c));
      localList.forEach((c) => {
        if (!mergedMap.has(c.trackingId)) {
          mergedMap.set(c.trackingId, c);
        }
      });

      const finalList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || b.submittedAt || 0).getTime() - new Date(a.createdAt || a.submittedAt || 0).getTime()
      );

      setComplaints(finalList);
      try {
        localStorage.setItem('local_submitted_complaints', JSON.stringify(finalList));
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load citizen complaints', err);
      // Fallback to local cache if offline
      try {
        const raw = localStorage.getItem('local_submitted_complaints');
        if (raw) setComplaints(JSON.parse(raw));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const totalSubmitted = complaints.length;
  const underVerification = complaints.filter((c) => c.currentStatus === 'Under Verification').length;
  const forwarded = complaints.filter((c) => c.currentStatus === 'Forwarded').length;
  const underInvestigation = complaints.filter(
    (c) => c.currentStatus === 'Investigation in Progress' || c.currentStatus === 'Acknowledged by Police'
  ).length;
  const resolved = complaints.filter((c) => c.currentStatus === 'Resolved' || c.currentStatus === 'Closed').length;

  const recentComplaints = complaints.slice(0, 8);

  const selectedStation = selectedComplaint?.selectedPoliceStationId as PoliceStation;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] bg-slate-100">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar type="citizen" />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0b2545] to-[#1e3a5f] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              Citizen Public Services Command
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.fullName || 'Citizen'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Your registered complaints are securely saved and tracked here in real-time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/complaint/register"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Register Complaint</span>
            </Link>
            <Link
              to="/track"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Track By ID</span>
            </Link>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/complaint/register"
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col items-center text-center group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Register New</span>
          </Link>

          <Link
            to="/track"
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col items-center text-center group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Track Complaint</span>
          </Link>

          <Link
            to="/citizen/complaints"
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col items-center text-center group"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center mb-2 group-hover:bg-cyan-600 group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">View My Complaints ({complaints.length})</span>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col items-center text-center group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Update Profile</span>
          </Link>

          <Link
            to="/contact"
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col items-center text-center group col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Contact Support</span>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Total Filed</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalSubmitted}</div>
            <div className="text-[11px] text-slate-500 mt-1">Submitted in portal</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Verification</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{underVerification}</div>
            <div className="text-[11px] text-slate-500 mt-1">Admin reviewing</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Forwarded</span>
              <Share2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600">{forwarded}</div>
            <div className="text-[11px] text-slate-500 mt-1">Sent to police station</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Investigation</span>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-600">{underInvestigation}</div>
            <div className="text-[11px] text-slate-500 mt-1">Active inquiry</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{resolved}</div>
            <div className="text-[11px] text-slate-500 mt-1">Completed reports</div>
          </div>
        </div>

        {/* Complaints History Table with Direct Details Modal */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">My Complaint Dossiers</h3>
              <p className="text-xs text-slate-500">
                Click any complaint to inspect complete details, police station particulars, and acknowledgment
              </p>
            </div>
            <Link
              to="/citizen/complaints"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>View All ({complaints.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading saved complaints...</span>
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <FilePlus2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No complaints registered yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Whenever you submit an incident report, its full details, location, evidence, and status will be permanently saved and displayed here.
              </p>
              <Link
                to="/complaint/register"
                className="inline-block bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                File Your First Complaint
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Tracking ID</th>
                    <th className="p-3.5">Title &amp; Category</th>
                    <th className="p-3.5">Police Station</th>
                    <th className="p-3.5">Incident Date</th>
                    <th className="p-3.5">Current Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentComplaints.map((c) => {
                    const stName = (c.selectedPoliceStationId as any)?.stationName || 'Assigned Police Station';
                    return (
                      <tr
                        key={c._id || c.trackingId}
                        className="hover:bg-blue-50/50 transition cursor-pointer"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        <td className="p-3.5 font-mono font-bold text-blue-700">
                          {c.trackingId}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">{c.complaintTitle}</div>
                          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded mt-0.5 font-medium">
                            {c.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{stName}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{c.incidentDate}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={c.currentStatus} size="sm" />
                        </td>
                        <td className="p-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedComplaint(c)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => generateComplaintAcknowledgmentPDF(c)}
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Download PDF Slip"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/track/${c.trackingId}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition"
                          >
                            <span>Track</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* POPUP MODAL: Full Complaint Details right on the Dashboard */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-[#0b2545] text-white p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {selectedComplaint.trackingId}
                    </span>
                    <StatusBadge status={selectedComplaint.currentStatus} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedComplaint.complaintTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                {/* Complainant Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Complainant</span>
                    <strong className="text-slate-800">{selectedComplaint.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                    <strong className="text-slate-800">{selectedComplaint.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded">
                      {selectedComplaint.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident Date</span>
                    <strong className="text-slate-800">{selectedComplaint.incidentDate}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-4 pt-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident Location</span>
                    <span className="text-slate-700">{selectedComplaint.incidentLocation}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">
                    Detailed Narrative:
                  </span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed text-slate-800">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Assigned Station */}
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-blue-900 font-bold block text-xs">
                      Jurisdiction: {selectedStation?.stationName || 'Assigned Police Station'}
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{selectedStation?.address}</p>
                    <span className="text-blue-700 font-semibold text-[11px] mt-0.5 block">
                      Helpline: {selectedStation?.contactNumber || '112'}
                    </span>
                  </div>
                </div>

                {/* Suspect & Witness info if present */}
                {(selectedComplaint.suspectInfo || selectedComplaint.witnessInfo) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedComplaint.suspectInfo && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Suspect Particulars:</span>
                        <p className="text-slate-700 mt-1">{selectedComplaint.suspectInfo}</p>
                      </div>
                    )}
                    {selectedComplaint.witnessInfo && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Witness Particulars:</span>
                        <p className="text-slate-700 mt-1">{selectedComplaint.witnessInfo}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Photos if present */}
                {selectedComplaint.evidenceImages?.length > 0 && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1.5 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Attached Evidence Photos ({selectedComplaint.evidenceImages.length}):</span>
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedComplaint.evidenceImages.map((img, i) => (
                        <a
                          key={i}
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-video rounded-lg overflow-hidden border bg-slate-100 block group relative"
                        >
                          <img src={img.url} alt="Evidence" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => generateComplaintAcknowledgmentPDF(selectedComplaint)}
                  className="bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download PDF Acknowledgment</span>
                </button>

                <div className="flex gap-2">
                  <Link
                    to={`/track/${selectedComplaint.trackingId}`}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <span>Full Live Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
