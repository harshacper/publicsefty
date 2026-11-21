import React, { useState, useEffect } from 'react';
import {
  getPoliceStations,
  createPoliceStationApi,
  updatePoliceStationApi,
  deletePoliceStationApi,
} from '../services/api';
import { PoliceStation } from '../types';
import { Sidebar } from '../components/Sidebar';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Save,
} from 'lucide-react';

export const AdminPoliceStationManagement: React.FC = () => {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<PoliceStation | null>(null);

  const [formData, setFormData] = useState({
    stationName: '',
    stationCode: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
    contactNumber: '',
    email: '',
    jurisdiction: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setLoading(true);
    try {
      const res = await getPoliceStations();
      if (res.success) {
        setStations(res.stations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStation(null);
    setFormData({
      stationName: '',
      stationCode: `PS-${Date.now().toString().slice(-4)}`,
      address: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      contactNumber: '+91 80 ',
      email: '',
      jurisdiction: '',
    });
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (st: PoliceStation) => {
    setEditingStation(st);
    setFormData({
      stationName: st.stationName,
      stationCode: st.stationCode,
      address: st.address,
      city: st.city,
      state: st.state,
      pinCode: st.pinCode,
      latitude: st.latitude,
      longitude: st.longitude,
      contactNumber: st.contactNumber,
      email: st.email || '',
      jurisdiction: st.jurisdiction,
    });
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (editingStation) {
        const res = await updatePoliceStationApi(editingStation._id, formData);
        if (res.success) {
          setSuccess('Police station updated successfully.');
          loadStations();
          setTimeout(() => setModalOpen(false), 1000);
        }
      } else {
        const res = await createPoliceStationApi(formData);
        if (res.success) {
          setSuccess('Police station created and registered in directory.');
          loadStations();
          setTimeout(() => setModalOpen(false), 1000);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save police station.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStation = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you wish to deactivate "${name}"?`)) {
      return;
    }

    try {
      const res = await deletePoliceStationApi(id);
      if (res.success) {
        loadStations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate station.');
    }
  };

  const filteredStations = stations.filter(
    (s) =>
      s.stationName.toLowerCase().includes(search.toLowerCase()) ||
      s.stationCode.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] bg-slate-100">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar type="admin" />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Infrastructure &amp; Jurisdiction Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Police Station Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Add new police posts, update coordinates, manage jurisdictional boundaries, and inspect assigned complaint cases.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Police Station</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search station name, code, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            Total Registered: {filteredStations.length}
          </span>
        </div>

        {/* Stations Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading police stations...</span>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No police stations found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b2545] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Station Code</th>
                    <th className="p-3.5">Station Name</th>
                    <th className="p-3.5">Address &amp; City</th>
                    <th className="p-3.5">Coordinates (Lat, Lng)</th>
                    <th className="p-3.5">Contact Phone</th>
                    <th className="p-3.5">Jurisdiction Coverage</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStations.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-blue-700">{st.stationCode}</td>
                      <td className="p-3.5 font-bold text-slate-900">{st.stationName}</td>
                      <td className="p-3.5 text-slate-600 max-w-[200px] truncate">
                        {st.address}, {st.city}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        {st.latitude?.toFixed(4)}, {st.longitude?.toFixed(4)}
                      </td>
                      <td className="p-3.5 text-slate-700 font-semibold">{st.contactNumber}</td>
                      <td className="p-3.5 text-slate-600 max-w-[220px] truncate">
                        {st.jurisdiction}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Station"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStation(st._id, st.stationName)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Deactivate Station"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Add / Edit Station */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-[#0b2545] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {editingStation ? 'Edit Police Station' : 'Register New Police Station'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-3.5 text-xs flex-1">
                {error && (
                  <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Police Station Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.stationName}
                      onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                      placeholder="e.g. Cubbon Park Police Station"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Station Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.stationCode}
                      onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })}
                      placeholder="e.g. BLR-CP-01"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Contact Helpline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="+91 80 2294 2581"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Physical Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, area, landmark"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Latitude (GPS) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: parseFloat(e.target.value) })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Longitude (GPS) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jurisdiction Boundaries &amp; Zones
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.jurisdiction}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                      placeholder="Areas, blocks, landmarks covered by this station"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{editingStation ? 'Update Station' : 'Register Station'}</span>
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
