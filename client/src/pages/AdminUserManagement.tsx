import React, { useState, useEffect } from 'react';
import { getAdminUsersList } from '../services/api';
import { User as UserType } from '../types';
import { Sidebar } from '../components/Sidebar';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Loader2,
  UserCheck,
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersList();
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4.5rem)] bg-slate-100">
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar type="admin" />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Identity &amp; Authentication Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User &amp; Citizen Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Registered citizen profiles and system administrator accounts.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            Total Accounts: {filtered.length}
          </span>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading user records...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No registered user profiles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b2545] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">User Full Name</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">City &amp; State</th>
                    <th className="p-3.5">System Role</th>
                    <th className="p-3.5">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => {
                    const isAdmin = u.role === 'admin' || u.role === 'police_officer';
                    return (
                      <tr key={u.id || u._id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                              isAdmin ? 'bg-amber-600' : 'bg-blue-600'
                            }`}
                          >
                            {u.fullName?.charAt(0) || 'U'}
                          </span>
                          <span>{u.fullName}</span>
                        </td>
                        <td className="p-3.5 text-slate-700">{u.email}</td>
                        <td className="p-3.5 text-slate-700 font-mono">{u.phone}</td>
                        <td className="p-3.5 text-slate-600">
                          {u.city ? `${u.city}, ${u.state || ''}` : 'Location Unspecified'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isAdmin
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
