import React from 'react';
import { Shield, Eye, Lock, MapPin, Users, Award, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-[#0b2545] text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-[#1e3a5f] relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">
            About the Smart Police Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Digital Citizen Services &amp; Transparent Police Complaint Tracking
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The Smart Police Complaint Management System is an advanced civic-technology initiative designed to modernize the interaction between citizens and police law enforcement agencies across India.
          </p>
        </div>
      </div>

      {/* Core Objectives */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-bold text-slate-900">Key Pillars of Our System</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Built upon principles of accountability, geographic accuracy, and data security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">Unbroken Transparency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens are informed at every step of the verification, forwarding, and investigation lifecycle. No complaint is buried without a formal recorded reason and audit trail.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">Geographic Precision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crime location is decoupled from the citizen's current location. Users pinpoint the exact crime site on interactive OpenStreetMap tiles to calculate accurate distances to nearby police stations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">Privacy &amp; Evidence Security</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Incident evidence and personal details are encrypted and strictly restricted to the registered complainant and verified administrative officers.
            </p>
          </div>
        </div>
      </section>

      {/* Statutory Disclosures */}
      <section className="bg-amber-50/70 border border-amber-200 p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>Statutory Framework &amp; Legal Distinctions</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          In strict accordance with legal mandates and public service ethics:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc pl-5">
          <li>
            <strong>Electronic Complaint Acknowledgment:</strong> This platform issues a valid electronic tracking ID and printable intimation slip upon submission.
          </li>
          <li>
            <strong>Police Jurisdiction Review:</strong> The nearest police station identified by Haversine calculations does not automatically confer jurisdiction. The report is verified by authorized personnel before formal jurisdictional assignment.
          </li>
          <li>
            <strong>FIR Registration Procedure:</strong> As per the Code of Criminal Procedure (CrPC), formal First Information Reports (FIR) for cognizable offences are recorded by Station House Officers following statutory verification.
          </li>
          <li>
            <strong>Emergency Assistance:</strong> This web portal is NOT an emergency response dispatcher. For live emergencies, assault, or active crimes in progress, citizens must call <strong>112</strong> immediately.
          </li>
        </ul>
      </section>
    </div>
  );
};
