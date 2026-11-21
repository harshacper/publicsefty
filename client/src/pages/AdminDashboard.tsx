import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardData } from '../services/api';
import { DashboardMetrics, Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Sidebar } from '../components/Sidebar';
import {
  Shield,
  FileText,
  Clock,
  Share2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  BarChart3,
  ArrowRight,
  Loader2,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState<{
    categoryCounts: Record<string, number>;
    statusCounts: Record<string, number>;
    monthlyCounts: Record<string, number>;
    cityCounts: Record<string, number>;
    stationCounts: Record<string, number>;
  } | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboardData();
      if (res.success) {
        setMetrics(res.metrics);
        setCharts(res.charts);
        setRecentComplaints(res.recentComplaints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] bg-slate-100">
        <Sidebar type="admin" />
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Calculate highest count for normalizing bar chart heights
  const maxCategoryCount = Math.max(1, ...Object.values(charts?.categoryCounts || {}));
  const maxMonthlyCount = Math.max(1, ...Object.values(charts?.monthlyCounts || {}));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] bg-slate-100">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar type="admin" />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl overflow-x-hidden">
        {/* Command Center Header */}
        <div className="bg-[#0b2545] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Administrative Command Center • Live Database
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Police Administration &amp; Grievance Redressal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Overview of all citizen incident submissions, jurisdiction allocation, and case investigations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/complaints"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs shadow flex items-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Manage Complaints</span>
            </Link>
            <a
              href="/api/admin/reports/export-csv"
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-4 py-2 rounded-lg text-xs border border-slate-700 shadow flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Total Files</div>
            <div className="text-2xl font-black text-blue-900 mt-1">{metrics?.totalComplaints || 0}</div>
            <span className="text-[10px] text-slate-400">All submissions</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/40">
            <div className="text-[10px] font-bold text-blue-700 uppercase">New Submitted</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{metrics?.newComplaints || 0}</div>
            <span className="text-[10px] text-blue-600">Pending review</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/40">
            <div className="text-[10px] font-bold text-amber-700 uppercase">Verification</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{metrics?.underVerification || 0}</div>
            <span className="text-[10px] text-amber-600">Desk inspection</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-purple-50/40">
            <div className="text-[10px] font-bold text-purple-700 uppercase">Forwarded</div>
            <div className="text-2xl font-black text-purple-700 mt-1">{metrics?.forwarded || 0}</div>
            <span className="text-[10px] text-purple-600">To Station</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-sm bg-sky-50/40">
            <div className="text-[10px] font-bold text-sky-700 uppercase">Investigation</div>
            <div className="text-2xl font-black text-sky-700 mt-1">
              {metrics?.investigationInProgress || 0}
            </div>
            <span className="text-[10px] text-sky-600">Active inquiry</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/40">
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Resolved</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{metrics?.resolved || 0}</div>
            <span className="text-[10px] text-emerald-600">Completed</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/40 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-rose-700 uppercase">Rejected</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{metrics?.rejected || 0}</div>
            <span className="text-[10px] text-rose-600">Declined/Transferred</span>
          </div>
        </div>

        {/* Charts & Analytics Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints by Category Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <span>Complaints by Crime Category</span>
              </h3>
              <span className="text-[11px] text-slate-500">Live Breakdown</span>
            </div>

            <div className="space-y-2.5">
              {Object.entries(charts?.categoryCounts || {}).map(([cat, count]) => {
                const percent = Math.round((count / maxCategoryCount) * 100);
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-semibold">{cat}</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {count} report{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, percent)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Submissions Trend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span>Complaints by Month (Current Year)</span>
                </h3>
                <span className="text-[11px] text-slate-500">Chronological</span>
              </div>

              {/* Monthly Bar Chart */}
              <div className="pt-6 flex items-end justify-between gap-1 h-44 px-2">
                {Object.entries(charts?.monthlyCounts || {}).map(([month, count]) => {
                  const barHeight = Math.max(8, Math.round((count / maxMonthlyCount) * 100));
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[9px] font-bold text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-blue-900 to-blue-600 rounded-t hover:bg-amber-400 transition-all cursor-pointer"
                        style={{ height: `${barHeight}%` }}
                        title={`${month}: ${count} complaints`}
                      ></div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase">
                        {month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* City Distribution Pill List */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">
                Distribution by Location / Jurisdiction City:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(charts?.cityCounts || {}).map(([city, cnt]) => (
                  <span
                    key={city}
                    className="bg-slate-100 text-slate-800 text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                  >
                    {city}: <strong>{cnt}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Complaints Table for Immediate Action */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Latest Registered Complaints</h3>
              <p className="text-xs text-slate-500">Incoming incident records requiring verification</p>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>Open Master Management Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Tracking ID</th>
                  <th className="p-4">Citizen Name</th>
                  <th className="p-4">Title &amp; Category</th>
                  <th className="p-4">Police Station</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentComplaints.map((c) => {
                  const st = (c.selectedPoliceStationId as any)?.stationName || 'Police Station';
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-bold text-blue-700">{c.trackingId}</td>
                      <td className="p-4 font-semibold text-slate-900">{c.fullName}</td>
                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{c.complaintTitle}</div>
                        <span className="text-[10px] text-slate-500">{c.category}</span>
                      </td>
                      <td className="p-4 text-slate-600">{st}</td>
                      <td className="p-4">
                        <StatusBadge status={c.currentStatus} size="sm" />
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/admin/complaints?search=${c.trackingId}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded text-xs transition"
                        >
                          Review &amp; Update
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
