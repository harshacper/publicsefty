import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaintTracking } from '../services/api';
import { Complaint, TrackingHistoryItem, PoliceStation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { generateComplaintAcknowledgmentPDF } from '../utils/pdfGenerator';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  FileText,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  Camera,
  User,
  Phone,
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

const crimeIcon = L.divIcon({
  className: 'detail-crime-marker',
  html: `<div style="background-color: #dc2626; color: white; border: 2px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export const ComplaintDetails: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<TrackingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackingId) {
      loadComplaint(trackingId);
    }
  }, [trackingId]);

  const loadComplaint = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await getComplaintTracking(id);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setHistory(res.trackingHistory || []);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('API lookup failed, checking local storage cache', err);
    }

    try {
      const raw = localStorage.getItem('local_submitted_complaints');
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((c: any) => c.trackingId?.toUpperCase() === id.toUpperCase());
        if (found) {
          setComplaint(found);
          setHistory([
            {
              _id: 'th_local_init',
              complaintId: found._id || found.trackingId,
              previousStatus: 'None',
              newStatus: found.currentStatus || 'Submitted',
              updatedBy: `Citizen ${found.fullName}`,
              remarks: 'Complaint registered and preserved in citizen dossier.',
              createdAt: found.createdAt || new Date().toISOString(),
            },
          ]);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    setError('Complaint record not found. Please verify the tracking number.');
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white rounded-xl border border-red-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-600">{error || 'Unable to retrieve dossier.'}</p>
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>
      </div>
    );
  }

  const station = complaint.selectedPoliceStationId as PoliceStation;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <Link
            to="/citizen/complaints"
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Complaints</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Complaint Dossier:</span>
            <span className="font-mono text-blue-700">{complaint.trackingId}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={complaint.currentStatus} size="lg" />
          <button
            onClick={() => generateComplaintAcknowledgmentPDF(complaint)}
            className="inline-flex items-center gap-1.5 bg-[#0b2545] hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download PDF Slip</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details + Map + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Particulars Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Incident Particulars</h3>
              <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                {complaint.category}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Title</span>
                <div className="text-sm font-bold text-slate-900">{complaint.complaintTitle}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Date of Incident
                  </span>
                  <div className="font-semibold text-slate-800">{complaint.incidentDate}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Time of Incident
                  </span>
                  <div className="font-semibold text-slate-800">{complaint.incidentTime}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  Description
                </span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed mt-1">
                  {complaint.description}
                </p>
              </div>

              {complaint.suspectInfo && (
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Suspect Information
                  </span>
                  <div className="text-slate-700 mt-0.5">{complaint.suspectInfo}</div>
                </div>
              )}

              {complaint.witnessInfo && (
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Witness Information
                  </span>
                  <div className="text-slate-700 mt-0.5">{complaint.witnessInfo}</div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Photos Gallery */}
          {complaint.evidenceImages && complaint.evidenceImages.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Camera className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Crime Evidence Photos ({complaint.evidenceImages.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {complaint.evidenceImages.map((img, i) => (
                  <a
                    key={i}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative group rounded-xl overflow-hidden border border-slate-300 aspect-video bg-slate-100 block"
                  >
                    <img
                      src={img.url}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      View Full Image
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Incident Location Map */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">Incident Location</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {complaint.incidentLatitude?.toFixed(5)}, {complaint.incidentLongitude?.toFixed(5)}
              </span>
            </div>

            <p className="text-xs text-slate-700">{complaint.incidentLocation}</p>

            <div className="h-64 rounded-xl overflow-hidden border border-slate-300 relative z-0">
              <MapContainer
                center={[complaint.incidentLatitude, complaint.incidentLongitude]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[complaint.incidentLatitude, complaint.incidentLongitude]}
                  icon={crimeIcon}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>Crime Location</strong>
                      <p>{complaint.incidentLocation}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Station & Status History */}
        <div className="space-y-6">
          {/* Assigned Station Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b pb-2 font-bold text-slate-900 text-sm">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Assigned Police Station</span>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm">
                {station?.stationName || 'Police Station'}
              </div>
              <div className="text-[11px] font-mono text-slate-400">{station?.stationCode}</div>
              <p className="text-slate-600 mt-1">{station?.address}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">Helpline:</span>
              <strong className="text-blue-700">{station?.contactNumber || '112'}</strong>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Status History</h3>

            <div className="space-y-3 relative pl-5 border-l-2 border-blue-200 ml-2 text-xs">
              {history.map((item, idx) => (
                <div key={item._id || idx} className="relative space-y-0.5">
                  <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow"></span>
                  <div className="font-bold text-slate-900">{item.newStatus}</div>
                  <p className="text-slate-600">{item.remarks}</p>
                  <div className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
