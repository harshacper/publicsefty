import React, { useState, useEffect } from 'react';
import { getAdminDashboardData } from '../services/api';
import { DashboardMetrics } from '../types';
import { Sidebar } from '../components/Sidebar';
import {
  BarChart3,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  TrendingUp,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react';

export const AdminReportsAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboardData();
      if (res.success) {
        setMetrics(res.metrics);
        setCharts(res.charts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolutionRate =
    metrics && metrics.totalComplaints > 0
      ? Math.round(((metrics.resolved + metrics.closed) / metrics.totalComplaints) * 100)
      : 0;

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

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] bg-slate-100">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar type="admin" />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Executive Analytics &amp; Strategic Reporting
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Reports &amp; Grievance Metrics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Quantitative analysis of public incident submissions, resolution rates, and station workloads.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Brief</span>
            </button>
            <a
              href="/api/admin/reports/export-csv"
              className="inline-flex items-center gap-1.5 bg-[#0b2545] hover:bg-blue-900 text-amber-300 font-bold px-4 py-2 rounded-xl text-xs shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Raw Records (CSV)</span>
            </a>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-2xl">
              {resolutionRate}%
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Resolution Efficiency
              </span>
              <h3 className="text-xl font-bold text-slate-900">Case Closure Rate</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {metrics?.resolved || 0} cases resolved of {metrics?.totalComplaints || 0} registered
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Station Allocation
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {metrics?.totalStations || 0} Police Stations
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Actively accepting incident files</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Active Inquiries
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {(metrics?.underVerification || 0) + (metrics?.investigationInProgress || 0)} In Progress
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Currently assigned to investigating officers</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Station Workload Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 font-bold text-slate-900 text-sm">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Police Station Case Distribution</span>
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(charts?.stationCounts || {}).map(([stationName, count]) => (
                <div key={stationName} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{stationName}</span>
                  <span className="bg-blue-50 text-blue-800 font-mono font-bold px-2.5 py-0.5 rounded">
                    {count as number} assigned
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 font-bold text-slate-900 text-sm">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Status Matrix Audit</span>
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(charts?.statusCounts || {}).map(([st, cnt]) => (
                <div key={st} className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-700">{st}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {cnt as number} cases
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
