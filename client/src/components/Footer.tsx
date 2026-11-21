import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Mail, MapPin, ExternalLink, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07162c] text-slate-300 text-sm border-t border-[#1e3a5f]">
      {/* Emergency Strip */}
      <div className="bg-[#0b2545] border-b border-[#1e3a5f] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-red-600/30 text-red-400 rounded-lg">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="font-bold text-white text-base">National Emergency Response (ERSS)</div>
              <div className="text-xs text-slate-400">Police, Medical, Fire & Disaster Assistance</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href="tel:112"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-lg flex items-center gap-2 shadow"
            >
              <span>112 - All Emergencies</span>
            </a>
            <a
              href="tel:1930"
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
            >
              <span>1930 - Cyber Helpline</span>
            </a>
            <a
              href="tel:1091"
              className="bg-purple-800 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
            >
              <span>1091 - Women Helpline</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-blue-700 border border-amber-400 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-white text-base tracking-wide">
                SMART POLICE PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, responsive citizen safety and complaint management platform enabling secure online reporting, automated nearest police station identification, transparent multi-stage tracking, and civic accountability.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Central Police Command, Headquarters</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@policeportal.gov.in</span>
              </div>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm border-l-2 border-amber-400 pl-2">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/complaint/register" className="hover:text-amber-300 transition">
                  File Incident Complaint
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-300 transition">
                  Track Complaint Status
                </Link>
              </li>
              <li>
                <Link to="/stations" className="hover:text-amber-300 transition">
                  Nearest Police Station Finder
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-300 transition">
                  Citizen New Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-300 transition">
                  Citizen Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Information */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm border-l-2 border-amber-400 pl-2">
              Information & Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/how-it-works" className="hover:text-amber-300 transition">
                  How the Portal Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition">
                  About Digital Policing
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-amber-300 transition">
                  Emergency Helplines Directory
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition">
                  Grievance & Citizen Feedback
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-amber-300 transition flex items-center gap-1">
                  <span>Authorized Official Login</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Disclaimer */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm border-l-2 border-amber-400 pl-2">
              Legal Notice & Protocol
            </h4>
            <div className="bg-[#0b2545] p-3 rounded-lg border border-slate-700/60 text-xs text-slate-300 space-y-2">
              <div className="flex items-start gap-1.5 text-amber-300 font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Notice on FIR Registration:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Online submission provides a formal Electronic Intimation & Tracking Receipt. Formal First Information Reports (FIR) or Non-Cognizable Reports (NCR) are recorded after verification by the assigned police station jurisdiction.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} Smart Police Complaint Management System. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Cyber Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
