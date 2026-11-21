import React from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert, HeartPulse, Flame, Users, Laptop, LifeBuoy } from 'lucide-react';

export const EmergencyInfo: React.FC = () => {
  const helplines = [
    {
      number: '112',
      title: 'National Emergency Response System (ERSS)',
      desc: 'Single unified emergency number across all states and Union Territories for Police, Fire, and Ambulance dispatch.',
      category: 'Primary Unified Helpline',
      color: 'bg-red-600 text-white',
      badge: 'Immediate Dispatch',
      icon: PhoneCall,
    },
    {
      number: '1930',
      title: 'National Cyber Financial Fraud Helpline (I4C)',
      desc: 'Immediate reporting of unauthorized online financial and UPI transactions. Calling within the golden hour enables immediate bank account freezing.',
      category: 'Cyber Financial Crimes',
      color: 'bg-blue-800 text-white',
      badge: 'Golden Hour Freeze',
      icon: Laptop,
    },
    {
      number: '1091',
      title: 'Women in Distress Helpline',
      desc: 'Dedicated 24/7 emergency response for women facing domestic violence, stalking, workplace harassment, or street assault.',
      category: 'Women Safety',
      color: 'bg-purple-700 text-white',
      badge: 'Confidential Support',
      icon: Users,
    },
    {
      number: '1098',
      title: 'Childline India',
      desc: 'Emergency 24-hour toll-free phone service for children in need of care, rescue from trafficking, child labour, or physical abuse.',
      category: 'Child Protection',
      color: 'bg-amber-600 text-white',
      badge: 'Child Protection',
      icon: LifeBuoy,
    },
    {
      number: '108',
      title: 'Emergency Medical & Ambulance',
      desc: 'Critical medical trauma response, road traffic accidents, emergency patient transport, and cardiac life support dispatch.',
      category: 'Medical Trauma',
      color: 'bg-emerald-700 text-white',
      badge: 'Life Support',
      icon: HeartPulse,
    },
    {
      number: '101',
      title: 'Fire & Rescue Services',
      desc: 'Industrial, residential fire breakout emergencies, building collapse rescue operations, and hazardous gas leaks.',
      category: 'Fire & Rescue',
      color: 'bg-orange-700 text-white',
      badge: 'Fire Department',
      icon: Flame,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Critical Emergency Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-rose-900 text-white p-8 sm:p-12 rounded-3xl shadow-2xl space-y-5 border-4 border-red-500/40">
        <div className="inline-flex items-center gap-2 bg-red-950/80 text-amber-300 font-extrabold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>Statutory Emergency Notice</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Are you in Immediate Physical Danger?{' '}
          <span className="text-amber-300 underline underline-offset-8">Dial 112 Right Now.</span>
        </h1>

        <p className="text-sm sm:text-base text-red-100 max-w-3xl leading-relaxed">
          This web application is designed strictly for non-emergency public grievance registration and tracking. It is <strong>NOT</strong> monitored by real-time tactical dispatchers. If you are experiencing a life-threatening incident, domestic violence in progress, robbery, assault, or ongoing medical trauma, dial emergency responders immediately.
        </p>

        <div className="pt-2">
          <a
            href="tel:112"
            className="inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-4 rounded-2xl text-lg sm:text-xl shadow-2xl transition transform active:scale-95"
          >
            <PhoneCall className="w-6 h-6 fill-current animate-pulse" />
            <span>CONNECT TO 112 DISPATCH</span>
          </a>
        </div>
      </div>

      {/* Directory Cards */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-bold text-slate-900">National Emergency Helplines Directory</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tap on any helpline card below to place an immediate emergency phone call.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helplines.map((line, i) => {
            const Icon = line.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {line.category}
                    </span>
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      {line.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xl">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900 font-mono tracking-wider">
                        {line.number}
                      </div>
                      <h4 className="text-xs font-bold text-slate-700 leading-tight">
                        {line.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{line.desc}</p>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <a
                    href={`tel:${line.number}`}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-95 ${line.color}`}
                  >
                    <PhoneCall className="w-4 h-4 fill-current" />
                    <span>Call {line.number}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
