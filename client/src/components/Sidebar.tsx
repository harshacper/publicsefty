import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Search,
  User,
  Shield,
  MapPin,
  Users,
  BarChart3,
  HelpCircle,
  PhoneCall,
} from 'lucide-react';

interface SidebarProps {
  type?: 'citizen' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const { user, isAdmin } = useAuth();
  const role = type || (isAdmin ? 'admin' : 'citizen');

  const citizenLinks = [
    { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/complaint/register', label: 'Register Complaint', icon: FilePlus2 },
    { to: '/citizen/complaints', label: 'My Complaints', icon: FileText },
    { to: '/track', label: 'Track Complaint', icon: Search },
    { to: '/stations', label: 'Find Police Station', icon: MapPin },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/emergency', label: 'Emergency Helplines', icon: PhoneCall },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Command Overview', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'Complaint Management', icon: FileText },
    { to: '/admin/stations', label: 'Police Stations (CRUD)', icon: MapPin },
    { to: '/admin/users', label: 'Citizen User Directory', icon: Users },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/track', label: 'Public Tracking Lookup', icon: Search },
  ];

  const links = role === 'admin' ? adminLinks : citizenLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-[calc(100vh-4.5rem)] border-r border-slate-800">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
          {role === 'admin' ? 'Command Center' : 'Citizen Services'}
        </div>
        <div className="font-bold text-white text-sm truncate flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="truncate">{user?.fullName || 'User'}</span>
        </div>
        <div className="text-[11px] text-amber-300 font-semibold uppercase mt-0.5">
          Role: {user?.role || 'Citizen'}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/citizen/dashboard' || link.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Helpline Box */}
      <div className="p-3 m-3 bg-[#0b2545] rounded-lg border border-slate-700 text-xs">
        <div className="text-amber-300 font-bold flex items-center gap-1.5 mb-1">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Emergency Support</span>
        </div>
        <p className="text-[11px] text-slate-400">
          In imminent danger, dial National Emergency immediately:
        </p>
        <a
          href="tel:112"
          className="mt-2 block text-center bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-2 rounded text-xs transition"
        >
          Call 112
        </a>
      </div>
    </aside>
  );
};
