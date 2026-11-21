import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  FilePlus2,
  Search,
  MapPin,
  HelpCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  PhoneCall,
  LayoutDashboard,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { getNotifications, markNotificationRead } from '../services/api';
import { NotificationItem } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // silent catch for unauthenticated
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationRead('all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0b2545] text-white shadow-lg border-b border-[#1e3a5f]">
      {/* Top micro bar */}
      <div className="bg-[#07162c] text-xs text-slate-300 py-1 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Official Public Grievance Portal
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              Department of Police & Internal Security
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/how-it-works" className="hover:text-amber-300 transition">
              How It Works
            </Link>
            <span>|</span>
            <Link to="/contact" className="hover:text-amber-300 transition">
              Help & FAQ
            </Link>
            <span>|</span>
            <a
              href="tel:112"
              className="text-amber-300 font-bold hover:underline flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" /> 112
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-700 via-blue-900 to-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                <span>SMART POLICE</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] uppercase font-black px-1.5 py-0.5 rounded tracking-wider">
                  Citizen Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-300 tracking-wide font-medium">
                Complaint Registration & Real-Time Tracking System
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md transition ${
                isActive('/') ? 'bg-[#1e3a5f] text-amber-300 font-semibold' : 'text-slate-200 hover:bg-[#13325c] hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/complaint/register"
              className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition ${
                isActive('/complaint/register')
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-amber-300 bg-blue-900/60 hover:bg-blue-800'
              }`}
            >
              <FilePlus2 className="w-4 h-4" />
              <span>File Complaint</span>
            </Link>
            <Link
              to="/track"
              className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition ${
                isActive('/track') ? 'bg-[#1e3a5f] text-amber-300 font-semibold' : 'text-slate-200 hover:bg-[#13325c] hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint</span>
            </Link>
            <Link
              to="/stations"
              className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition ${
                isActive('/stations') ? 'bg-[#1e3a5f] text-amber-300 font-semibold' : 'text-slate-200 hover:bg-[#13325c] hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Station Finder</span>
            </Link>
            <Link
              to="/emergency"
              className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition ${
                isActive('/emergency') ? 'bg-red-700 text-white font-semibold' : 'text-red-300 hover:bg-red-900/50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergency 112</span>
            </Link>
          </nav>

          {/* Desktop Right User Controls */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-[#1e3a5f] rounded-full relative transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50">
                      <div className="bg-[#0b2545] text-white px-4 py-2.5 flex justify-between items-center text-xs">
                        <span className="font-bold flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-amber-400" /> Notifications ({unreadCount} unread)
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-amber-300 hover:underline text-[11px]"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-3 text-xs hover:bg-slate-50 transition cursor-pointer ${
                                !notif.isRead ? 'bg-blue-50/60 font-medium' : ''
                              }`}
                              onClick={() => {
                                if (notif.trackingId) {
                                  navigate(`/track/${notif.trackingId}`);
                                  setNotificationsOpen(false);
                                }
                              }}
                            >
                              <div className="font-semibold text-slate-900">{notif.title}</div>
                              <p className="text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 bg-[#1e3a5f] hover:bg-[#2b4c77] px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold leading-tight text-white max-w-[120px] truncate">
                        {user?.fullName}
                      </div>
                      <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                        {user?.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1.5 z-50 text-xs">
                      {isAdmin ? (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-900 font-semibold"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/complaints"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                            Manage Complaints
                          </Link>
                          <Link
                            to="/admin/stations"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Manage Police Stations
                          </Link>
                          <hr className="my-1 border-slate-100" />
                        </>
                      ) : (
                        <>
                          <Link
                            to="/citizen/dashboard"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-900 font-semibold"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            Citizen Dashboard
                          </Link>
                          <Link
                            to="/citizen/complaints"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                            My Complaints
                          </Link>
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <User className="w-4 h-4 text-blue-600" />
                            My Profile
                          </Link>
                          <hr className="my-1 border-slate-100" />
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-[#1e3a5f] border border-slate-600 transition"
                >
                  Citizen Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={() => navigate('/citizen/dashboard')}
                className="p-1.5 bg-[#1e3a5f] text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-[#1e3a5f] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07162c] border-t border-[#1e3a5f] px-4 pt-2 pb-6 space-y-2 text-sm">
          <Link
            to="/"
            className="block py-2 px-3 rounded hover:bg-[#1e3a5f]"
          >
            Home
          </Link>
          <Link
            to="/complaint/register"
            className="block py-2 px-3 rounded bg-blue-600 text-white font-semibold flex items-center gap-2"
          >
            <FilePlus2 className="w-4 h-4" /> File Complaint
          </Link>
          <Link
            to="/track"
            className="block py-2 px-3 rounded hover:bg-[#1e3a5f] flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Track Complaint
          </Link>
          <Link
            to="/stations"
            className="block py-2 px-3 rounded hover:bg-[#1e3a5f] flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Nearest Police Station Finder
          </Link>
          <Link
            to="/how-it-works"
            className="block py-2 px-3 rounded hover:bg-[#1e3a5f]"
          >
            How It Works
          </Link>
          <Link
            to="/about"
            className="block py-2 px-3 rounded hover:bg-[#1e3a5f]"
          >
            About Us
          </Link>
          <Link
            to="/emergency"
            className="block py-2 px-3 rounded bg-red-700 text-white font-bold flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" /> Emergency Helplines (112)
          </Link>

          <hr className="border-slate-800 my-2" />

          {isAuthenticated ? (
            <div className="space-y-1">
              <div className="px-3 py-1 text-xs text-slate-400">
                Signed in as <strong className="text-white">{user?.fullName}</strong> ({user?.role})
              </div>
              {isAdmin ? (
                <Link
                  to="/admin/dashboard"
                  className="block py-2 px-3 rounded hover:bg-[#1e3a5f] text-amber-300 font-semibold"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className="block py-2 px-3 rounded hover:bg-[#1e3a5f] text-amber-300 font-semibold"
                  >
                    Citizen Dashboard
                  </Link>
                  <Link
                    to="/citizen/complaints"
                    className="block py-2 px-3 rounded hover:bg-[#1e3a5f]"
                  >
                    My Complaints
                  </Link>
                  <Link
                    to="/profile"
                    className="block py-2 px-3 rounded hover:bg-[#1e3a5f]"
                  >
                    My Profile
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-3 rounded text-red-400 hover:bg-red-950 font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                className="text-center py-2 px-3 rounded bg-[#1e3a5f] text-white font-semibold text-xs"
              >
                Citizen Login
              </Link>
              <Link
                to="/register"
                className="text-center py-2 px-3 rounded bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
