import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  FileEdit,
  MapPin,
  Camera,
  CheckSquare,
  FileCheck2,
  Search,
  Bell,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create Your Citizen Profile',
      icon: UserPlus,
      desc: 'Register with your verified email and mobile number. Your profile securely stores your basic contact particulars so future complaint submissions are swift and pre-filled.',
      tip: 'Requires email, phone, and standard residency address.',
    },
    {
      num: '02',
      title: 'Enter Incident Particulars',
      icon: FileEdit,
      desc: 'Choose from 12 crime categories (Theft, Cyber Crime, Harassment, Vehicle Theft, etc.). Detail the date, time, narrative of the event, and any known suspect or witness descriptions.',
      tip: 'Be as precise as possible to aid investigating officers.',
    },
    {
      num: '03',
      title: 'Pinpoint Exact Crime Location on Map',
      icon: MapPin,
      desc: 'The system uses OpenStreetMap tiles. You can detect your GPS coordinates or move the red marker to where the incident actually occurred if it happened away from your current location.',
      tip: 'Reverse geocoding automatically resolves the street and area name.',
    },
    {
      num: '04',
      title: 'Automatic Police Station Discovery',
      icon: Building2,
      desc: 'The platform calculates Haversine distances to discover the nearest police stations in real-time, displays their contact numbers and address, and suggests the optimal station.',
      tip: 'Citizens can override the recommendation and choose a preferred station.',
    },
    {
      num: '05',
      title: 'Upload Crime Evidence Photos',
      icon: Camera,
      desc: 'Attach up to 5 photos (JPG, PNG, WEBP) of property damage, CCTV stills, bills, or bank transaction receipts. Files are stored securely on Cloudinary / protected servers.',
      tip: 'Evidence is private and strictly inaccessible to the public.',
    },
    {
      num: '06',
      title: 'Receive Formal Tracking ID & Download PDF',
      icon: FileCheck2,
      desc: 'Upon final submission, a unique tracking code (e.g. CMP-2026-08492) is generated immediately. Download the official PDF acknowledgment slip for your records.',
      tip: 'Valid electronic intimation acknowledgment with time-stamp.',
    },
    {
      num: '07',
      title: 'Track Live Investigation & Status Updates',
      icon: Search,
      desc: 'Check live status changes on the portal anytime without visiting the police station. View official officer remarks, investigation milestones, and action taken records.',
      tip: 'SMS / Email notifications are delivered automatically on status changes.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          User Guide &amp; Lifecycle
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How the Smart Police Portal Works
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          A step-by-step walkthrough explaining how your complaint is recorded, geolocated, reviewed by administrators, and assigned to the right police station.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 transition flex flex-col md:flex-row gap-6 items-start md:items-center"
            >
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-2xl font-black text-slate-300 font-mono w-10">
                  {st.num}
                </span>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-slate-900">{st.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{st.desc}</p>
                <div className="text-[11px] text-blue-700 font-medium pt-1">
                  💡 <strong>Key note:</strong> {st.tip}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#0b2545] text-white p-8 rounded-2xl text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">Ready to Register an Incident?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Sign up in under 60 seconds or log in to file a non-emergency complaint with full location mapping and photo evidence.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition"
          >
            Create Citizen Account
          </Link>
          <Link
            to="/track"
            className="bg-[#1e3a5f] hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition border border-slate-600"
          >
            Track Existing Report
          </Link>
        </div>
      </div>
    </div>
  );
};
