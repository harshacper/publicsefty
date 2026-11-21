import React, { useState } from 'react';
import {
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ContactHelp: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'Does submitting a complaint on this portal register an immediate FIR?',
      a: 'No. Submitting a complaint records a formal Electronic Intimation Receipt and issues a unique Complaint Tracking ID. As per statutory criminal law, the Station House Officer (SHO) of the jurisdictional police station reviews the details, verifies evidence, and proceeds to record a formal FIR (First Information Report) or NCR as appropriate.',
    },
    {
      q: 'How does the nearest police station selection work?',
      a: 'The system uses OpenStreetMap and Haversine distance calculations from the crime coordinates you select on the map. It automatically computes proximity in kilometers and recommends the closest station. You may also select a preferred station if you have jurisdiction information.',
    },
    {
      q: 'What should I do if an emergency or physical danger is happening right now?',
      a: 'DO NOT wait for web complaint processing. Dial National Emergency Number 112 immediately. Officers will be dispatched via the Emergency Response Support System (ERSS) directly to your location.',
    },
    {
      q: 'Can anyone else view my uploaded photo evidence or personal phone number?',
      a: 'No. The system employs strict role-based access control. Complainant particulars and uploaded evidence files are private and strictly accessible only to the registered citizen and authorized police administrators.',
    },
    {
      q: 'How can I download the official Complaint Acknowledgment slip?',
      a: 'After filing a complaint, or by navigating to the Track Complaint page and entering your Tracking ID, click the "Download Official PDF Slip" button to save an authentic acknowledgment document.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Support &amp; Grievance Redressal
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Contact &amp; Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Have queries about the digital complaint registration procedure? Browse our guide or reach out to our nodal desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQs Accordion */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-700" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-slate-900 text-xs sm:text-sm hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Contact Form & Headquarters Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Portal Support &amp; Feedback</h3>
            <p className="text-xs text-slate-600">
              Submit technical inquiries, portal feedback, or follow-up queries to the administrative helpdesk.
            </p>

            {submitted ? (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <p className="font-bold">Thank you for contacting us!</p>
                <p>Your inquiry has been logged. Our nodal officer will respond within 24 business hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-blue-700 underline font-semibold mt-2 block mx-auto"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Query subject or Tracking ID"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue or feedback in detail..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0b2545] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Query</span>
                </button>
              </form>
            )}
          </div>

          {/* Central Headquarters Card */}
          <div className="bg-[#0b2545] text-white p-5 rounded-2xl shadow-sm text-xs space-y-3">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              Police Central Command Desk
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Office of the Director General of Police, Central Police Command Headquarters, Bengaluru - 560001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Control Room: +91 80 2294 2222 / 112</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>citizen.desk@policeportal.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
