import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../services/api';
import { Complaint, PoliceStation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Sidebar } from '../components/Sidebar';
import { generateComplaintAcknowledgmentPDF } from '../utils/pdfGenerator';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
  FilePlus2,
  Eye,
  X,
  Camera,
  Building2,
} from 'lucide-react';

export const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
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
        (a, b) =>
          new Date(b.createdAt || b.submittedAt || 0).getTime() -
          new Date(a.createdAt || a.submittedAt || 0).getTime()
      );

      setComplaints(finalList);
      try {
        localStorage.setItem('local_submitted_complaints', JSON.stringify(finalList));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      try {
        const raw = localStorage.getItem('local_submitted_complaints');
        if (raw) setComplaints(JSON.parse(raw));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = [
    'All',
    'Submitted',
    'Under Verification',
    'Forwarded',
    'Investigation in Progress',
    'Resolved',
    'Closed',
  ];

  const selectedStation = selectedComplaint?.selectedPoliceStationId as PoliceStation;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] bg-slate-100">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar type="citizen" />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Citizen Dossier
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Registered Complaints
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              View records, inspect saved details, download acknowledgment receipts, and track progress.
            </p>
          </div>

          <Link
            to="/complaint/register"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition active:scale-95 self-start sm:self-auto"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>File New Complaint</span>
          </Link>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, title, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading complaints...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No matching complaints found.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or status filter to see all your recorded reports.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Tracking ID</th>
                    <th className="p-4">Title &amp; Category</th>
                    <th className="p-4">Jurisdiction Station</th>
                    <th className="p-4">Incident Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const stName =
                      (c.selectedPoliceStationId as any)?.stationName || 'Assigned Police Station';
                    return (
                      <tr
                        key={c._id || c.trackingId}
                        className="hover:bg-blue-50/50 transition cursor-pointer"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        <td className="p-4 font-mono font-bold text-blue-700">
                          {c.trackingId}
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">
                            {c.complaintTitle}
                          </div>
                          <span className="inline-block bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium mt-0.5">
                            {c.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 max-w-[200px] truncate">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{stName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.incidentDate}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={c.currentStatus} size="sm" />
                        </td>
                        <td className="p-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedComplaint(c)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => generateComplaintAcknowledgmentPDF(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Download PDF Acknowledgment"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/track/${c.trackingId}`}
                            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded text-xs transition"
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

        {/* POPUP MODAL: Full Complaint Details */}
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
