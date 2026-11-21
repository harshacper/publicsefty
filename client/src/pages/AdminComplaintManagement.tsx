import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getAdminComplaintsList,
  updateComplaintStatusApi,
  assignPoliceStationApi,
  getPoliceStations,
} from '../services/api';
import { Complaint, PoliceStation, ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Sidebar } from '../components/Sidebar';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  X,
  Camera,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Shield,
  Save,
} from 'lucide-react';

const CATEGORIES = [
  'All',
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

const STATUSES: (ComplaintStatus | 'All')[] = [
  'All',
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
  'Rejected',
];

export const AdminComplaintManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState<string>('All');
  const [stationId, setStationId] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [detailModalComplaint, setDetailModalComplaint] = useState<Complaint | null>(null);
  const [actionModalComplaint, setActionModalComplaint] = useState<Complaint | null>(null);

  // Status update form states
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Under Verification');
  const [remarks, setRemarks] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [ackRef, setAckRef] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reassignStationId, setReassignStationId] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [category, status, stationId, sortBy, sortOrder]);

  const loadStations = async () => {
    try {
      const res = await getPoliceStations();
      if (res.success) setStations(res.stations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await getAdminComplaintsList({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        stationId: stationId !== 'All' ? stationId : undefined,
        sortBy,
        sortOrder,
      });
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadComplaints();
  };

  // Open action modal
  const openActionModal = (c: Complaint) => {
    setActionModalComplaint(c);
    setNewStatus(c.currentStatus);
    setRemarks('');
    setIsInternal(false);
    setAckRef(c.officialAcknowledgmentRef || '');
    setActionTaken(c.officialActionTaken || '');
    setInternalNotes(c.internalNotes || '');
    setRejectionReason(c.rejectionReason || '');
    setReassignStationId(
      typeof c.selectedPoliceStationId === 'object'
        ? (c.selectedPoliceStationId as any)._id
        : (c.selectedPoliceStationId as string)
    );
    setActionError('');
    setActionSuccess('');
  };

  // Save status & action
  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModalComplaint) return;
    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      // 1. If station re-assigned
      const currentStationId =
        typeof actionModalComplaint.selectedPoliceStationId === 'object'
          ? (actionModalComplaint.selectedPoliceStationId as any)._id
          : actionModalComplaint.selectedPoliceStationId;

      if (reassignStationId && reassignStationId !== currentStationId) {
        await assignPoliceStationApi(actionModalComplaint._id, {
          stationId: reassignStationId,
          notes: remarks || 'Station jurisdiction re-evaluated by admin',
        });
      }

      // 2. Status update
      const res = await updateComplaintStatusApi(actionModalComplaint._id, {
        newStatus,
        remarks,
        isInternal,
        officialAcknowledgmentRef: ackRef,
        officialActionTaken: actionTaken,
        internalNotes,
        rejectionReason: newStatus === 'Rejected' ? rejectionReason : '',
      });

      if (res.success) {
        setActionSuccess('Complaint dossier and status successfully updated.');
        loadComplaints();
        setTimeout(() => {
          setActionModalComplaint(null);
        }, 1200);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setActionError(
          `Access Denied (403): You are currently authenticated as "${user?.fullName || user?.email || 'Citizen'}" with role [${user?.role || 'citizen'}]. Updating official complaint dossiers requires an Administrator account (e.g. "harsha"). Please sign out and sign in at /admin/login.`
        );
      } else {
        setActionError(err.response?.data?.message || 'Failed to update complaint.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] bg-slate-100">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar type="admin" />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Central Incident Management Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Master Complaint Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Complete 20-column administrative records table with jurisdictional dispatch and investigation controls.
            </p>
          </div>

          <a
            href="/api/admin/reports/export-csv"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold px-4 py-2 rounded-xl text-xs shadow transition self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs"
          >
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ID, name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Station */}
            <div>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white truncate"
              >
                <option value="All">All Police Stations</option>
                {stations.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.stationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#0b2545] hover:bg-blue-900 text-white font-bold py-2 rounded-lg text-xs transition"
              >
                Apply Filter
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setStatus('All');
                  setStationId('All');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Master 20-Column Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Fetching complaints from database...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">No complaints match current query filters.</p>
              <p>Try resetting filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#0b2545] text-white uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">1. Tracking ID</th>
                    <th className="p-3">2. Citizen Name</th>
                    <th className="p-3">3. Age</th>
                    <th className="p-3">4. Gender</th>
                    <th className="p-3">5. Mobile</th>
                    <th className="p-3">6. Email</th>
                    <th className="p-3">7. Title</th>
                    <th className="p-3">8. Category</th>
                    <th className="p-3">9. Description</th>
                    <th className="p-3">10. Incident Date</th>
                    <th className="p-3">11. Incident Location</th>
                    <th className="p-3">12. Lat</th>
                    <th className="p-3">13. Lng</th>
                    <th className="p-3">14. Evidence</th>
                    <th className="p-3">15. Police Station</th>
                    <th className="p-3">16. Current Status</th>
                    <th className="p-3">17. Submitted At</th>
                    <th className="p-3">18. Last Updated</th>
                    <th className="p-3">19. Assigned Admin</th>
                    <th className="p-3 text-right sticky right-0 bg-[#0b2545]">20. Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c, index) => {
                    const st = c.selectedPoliceStationId as PoliceStation;
                    const adm = c.assignedAdminId as any;
                    return (
                      <tr key={c._id} className="hover:bg-blue-50/50 transition">
                        <td className="p-3 text-slate-400 font-mono">{index + 1}</td>
                        <td className="p-3 font-mono font-bold text-blue-700">{c.trackingId}</td>
                        <td className="p-3 font-semibold text-slate-900">{c.fullName}</td>
                        <td className="p-3 text-slate-600">{c.age}</td>
                        <td className="p-3 text-slate-600">{c.gender}</td>
                        <td className="p-3 text-slate-700">{c.phone}</td>
                        <td className="p-3 text-slate-600">{c.email}</td>
                        <td className="p-3 max-w-[180px] truncate font-medium text-slate-800">
                          {c.complaintTitle}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {c.category}
                          </span>
                        </td>
                        <td className="p-3 max-w-[220px] truncate text-slate-500">
                          {c.description}
                        </td>
                        <td className="p-3 text-slate-600">{c.incidentDate}</td>
                        <td className="p-3 max-w-[180px] truncate text-slate-600">
                          {c.incidentLocation}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {c.incidentLatitude?.toFixed(4)}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {c.incidentLongitude?.toFixed(4)}
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                            {c.evidenceImages?.length || 0} file(s)
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 font-medium">
                          {st?.stationName || 'N/A'}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={c.currentStatus} size="sm" />
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(c.createdAt || c.submittedAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {adm?.fullName || 'Unassigned'}
                        </td>
                        <td className="p-3 text-right sticky right-0 bg-white/95 backdrop-blur-sm shadow-sm space-x-1">
                          <button
                            type="button"
                            onClick={() => setDetailModalComplaint(c)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                            title="View Full Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(c)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] transition"
                            title="Update Status / Action"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL 1: Full Complaint Details & Dossier */}
        {detailModalComplaint && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-[#0b2545] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400">
                    {detailModalComplaint.trackingId}
                  </span>
                  <span>• Dossier Inspection</span>
                </div>
                <button
                  onClick={() => setDetailModalComplaint(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Citizen Name:</span>
                    <strong className="text-sm">{detailModalComplaint.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Phone:</span>
                    <strong>{detailModalComplaint.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address:</span>
                    <span>{detailModalComplaint.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Age / Gender:</span>
                    <span>
                      {detailModalComplaint.age} yrs / {detailModalComplaint.gender}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Residential Address:</span>
                    <span>{detailModalComplaint.address}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">
                    Incident Particulars:
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {detailModalComplaint.complaintTitle}
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded">
                      {detailModalComplaint.category}
                    </span>
                    <span className="text-slate-500">
                      {detailModalComplaint.incidentDate} at {detailModalComplaint.incidentTime}
                    </span>
                  </div>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed text-slate-800">
                    {detailModalComplaint.description}
                  </p>
                </div>

                {detailModalComplaint.evidenceImages?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">
                      Uploaded Photo Evidence:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {detailModalComplaint.evidenceImages.map((img, i) => (
                        <a
                          key={i}
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-video rounded-lg overflow-hidden border bg-slate-100 block"
                        >
                          <img
                            src={img.url}
                            alt="Evidence"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {detailModalComplaint.internalNotes && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                    <strong className="block text-[11px] mb-0.5">🔒 Internal Confidential Notes:</strong>
                    <p>{detailModalComplaint.internalNotes}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailModalComplaint(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Status Update, Jurisdiction Assignment & Remarks */}
        {actionModalComplaint && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
              <div className="bg-[#0b2545] text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">
                    Administrative Action: {actionModalComplaint.trackingId}
                  </h3>
                  <span className="text-[11px] text-amber-400">
                    Complainant: {actionModalComplaint.fullName}
                  </span>
                </div>
                <button
                  onClick={() => setActionModalComplaint(null)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAction} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                {actionError && (
                  <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    {actionError}
                  </div>
                )}
                {actionSuccess && (
                  <div className="p-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {/* Status Selection */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Update Investigation Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-blue-900 bg-white"
                  >
                    {STATUSES.filter((s) => s !== 'All').map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Police Station Jurisdiction Assignment */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jurisdiction Police Station Allocation
                  </label>
                  <select
                    value={reassignStationId}
                    onChange={(e) => setReassignStationId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {stations.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.stationName} ({st.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Official remarks sent to citizen */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Official Remarks <span className="text-slate-400 font-normal">(Sent to citizen &amp; visible in tracking timeline)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter formal update remarks..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  ></textarea>
                </div>

                {/* Police Acknowledgment Ref */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Acknowledgment Ref / GD No.
                    </label>
                    <input
                      type="text"
                      value={ackRef}
                      onChange={(e) => setAckRef(e.target.value)}
                      placeholder="e.g. GD-2026-9812 or SHO-ACK-44"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Action Taken Summary
                    </label>
                    <input
                      type="text"
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder="e.g. Beat officer visited location"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    🔒 Confidential Internal Notes <span className="text-slate-400 font-normal">(Visible only to authorized police officers)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Inter-departmental notes, suspect intelligence, verification results..."
                    className="w-full p-2 border border-slate-300 rounded-lg bg-amber-50/40 text-slate-900"
                  ></textarea>
                </div>

                {newStatus === 'Rejected' && (
                  <div>
                    <label className="block font-bold text-rose-800 mb-1">
                      Statutory Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify why report cannot be admitted (e.g. Civil dispute, outside boundary)"
                      className="w-full p-2 border border-rose-300 rounded-lg text-rose-900 bg-rose-50"
                    />
                  </div>
                )}

                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActionModalComplaint(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save &amp; Update Live Status</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
