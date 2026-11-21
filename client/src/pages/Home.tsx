import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  FilePlus2,
  Search,
  MapPin,
  Clock,
  PhoneCall,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Laptop,
  Users,
  Car,
  FileCheck,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [quickTrackingId, setQuickTrackingId] = useState('');
  const navigate = useNavigate();

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackingId.trim()) {
      navigate(`/track/${quickTrackingId.trim().toUpperCase()}`);
    }
  };

  const crimeServices = [
    {
      title: 'Theft & Burglary',
      desc: 'Report residential, commercial, or personal property theft with immediate evidence logs.',
      icon: Lock,
      category: 'Theft',
      badge: 'High Priority',
    },
    {
      title: 'Cyber Crime & Phishing',
      desc: 'Financial frauds, identity theft, unauthorized transactions, UPI fraud, and online extortion.',
      icon: Laptop,
      category: 'Cyber Crime',
      badge: 'Cyber Cell',
    },
    {
      title: 'Women & Child Safety',
      desc: 'Harassment, domestic violence, assault, and emergency protective interventions.',
      icon: Users,
      category: 'Harassment',
      badge: 'Zero Tolerance',
    },
    {
      title: 'Vehicle Theft',
      desc: 'Two-wheeler and four-wheeler vehicle theft reporting with engine & chassis records.',
      icon: Car,
      category: 'Vehicle Theft',
      badge: 'Auto Squad',
    },
    {
      title: 'Missing Persons',
      desc: 'Urgent intimation for missing family members, minors, or vulnerable adults.',
      icon: AlertTriangle,
      category: 'Missing Person',
      badge: 'Immediate Action',
    },
    {
      title: 'Financial & Online Scam',
      desc: 'Fraudulent investment schemes, job scams, fake lottery notifications, and crypto fraud.',
      icon: FileCheck,
      category: 'Fraud',
      badge: 'Economic Wing',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#07162c] via-[#0b2545] to-[#1e3a5f] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#1e3a5f] shadow-xl overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-5 pointer-events-none">
          <Shield className="w-[600px] h-[600px] text-white" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-amber-400/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>Next-Gen Smart Police Citizen Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Register Grievances, Discover Nearby Stations &amp;{' '}
                <span className="text-amber-400 underline decoration-blue-500 underline-offset-8">
                  Track Live Progress.
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                A secure, transparent, and responsive digital policing interface. Citizens can report incidents, upload evidence, detect nearest jurisdiction police stations, and track investigation updates at every step.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/complaint/register"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-lg text-sm shadow-lg hover:shadow-xl transition transform active:scale-95"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Register Complaint</span>
                </Link>
                <Link
                  to="/stations"
                  className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#284f80] text-white font-semibold px-5 py-3 rounded-lg text-sm border border-slate-600 transition"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Find Nearby Station</span>
                </Link>
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-3 rounded-lg text-sm shadow-md transition"
                >
                  <PhoneCall className="w-4 h-4 fill-current animate-pulse" />
                  <span>Emergency 112</span>
                </a>
              </div>
            </div>

            {/* Right Card: Quick Track Box */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-7 border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-base">Quick Complaint Tracking</h3>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Live Portal
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-3 mb-4">
                  Already registered a complaint? Enter your formal Complaint Tracking ID (e.g., <code>CMP-2026-08492</code>) to view the current status, remarks, and audit timeline.
                </p>
                <form onSubmit={handleQuickTrack} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Tracking Identification Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="CMP-2026-XXXXX"
                        value={quickTrackingId}
                        onChange={(e) => setQuickTrackingId(e.target.value)}
                        className="w-full uppercase font-mono tracking-wider px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0b2545] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                  >
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Track Status Now</span>
                  </button>
                </form>

                {/* Sample tracking IDs hint for convenience */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Demo tracking ID: </span>
                  <button
                    type="button"
                    onClick={() => setQuickTrackingId('CMP-2026-08492')}
                    className="text-blue-700 font-semibold underline hover:text-blue-900"
                  >
                    CMP-2026-08492
                  </button>
                  <span> or </span>
                  <button
                    type="button"
                    onClick={() => setQuickTrackingId('CMP-2026-03184')}
                    className="text-blue-700 font-semibold underline hover:text-blue-900"
                  >
                    CMP-2026-03184
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Numbers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-900">100%</div>
            <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">
              Transparent Tracking
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-900">&lt; 15 mins</div>
            <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">
              Initial Review Intimation
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-blue-900">OpenStreetMap</div>
            <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">
              Nearby Station Discovery
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-red-600">24 × 7</div>
            <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">
              National ERSS 112
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Complaint Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Citizen Reporting Modules
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Select Incident Category to Register
            </h2>
          </div>
          <Link
            to="/complaint/register"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group"
          >
            <span>Proceed to Full Form</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {crimeServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{srv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{srv.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Non-Emergency Report</span>
                  <Link
                    to={`/complaint/register?category=${encodeURIComponent(srv.category)}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>File Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works 4-Step Summary */}
      <section className="bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Transparent Digital Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How the System Operates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              From electronic registration to jurisdictional review and status updates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-black flex items-center justify-center mb-3">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Citizen Registration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Register with verified email and mobile details. Authenticated citizens keep their private reports protected.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-black flex items-center justify-center mb-3">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Incident &amp; Location Map</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide incident particulars, drag marker on map for exact crime location, and upload supporting photos.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-black flex items-center justify-center mb-3">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Auto Nearest Station</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The system calculates Haversine distances to recommend the nearest station while allowing manual choice.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-black flex items-center justify-center mb-3">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Track &amp; Acknowledgment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive instant Tracking ID, download official PDF Acknowledgment, and track status updates in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Callout Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-red-700 to-red-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-red-900/60 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Immediate Police Assistance</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">Facing Life Threat or Ongoing Emergency?</h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Do not wait for web complaint processing. Dial National Emergency Response Service 112 immediately for instant police dispatch.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href="tel:112"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3 rounded-xl text-base shadow-lg transition text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <PhoneCall className="w-5 h-5 fill-current" />
              <span>DIAL 112 NOW</span>
            </a>
            <Link
              to="/emergency"
              className="bg-red-900 hover:bg-red-950 text-white font-bold px-5 py-3 rounded-xl text-sm border border-red-500/50 transition text-center flex items-center justify-center"
            >
              View All Helplines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
