import React from 'react';
import { ComplaintStatus } from '../types';
import {
  Clock,
  Search,
  CheckCircle,
  Share2,
  FileText,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Archive,
  ArrowRightCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-800 border-slate-200';
  let Icon = Clock;

  switch (status) {
    case 'Submitted':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Clock;
      break;
    case 'Under Verification':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Search;
      break;
    case 'Verified':
      bg = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      Icon = CheckCircle;
      break;
    case 'Assigned to Police Station':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = ArrowRightCircle;
      break;
    case 'Forwarded':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Share2;
      break;
    case 'Acknowledged by Police':
      bg = 'bg-teal-50 text-teal-700 border-teal-200';
      Icon = FileText;
      break;
    case 'Investigation in Progress':
      bg = 'bg-sky-50 text-sky-800 border-sky-300 animate-pulse';
      Icon = ShieldCheck;
      break;
    case 'Action Taken':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      Icon = CheckCircle;
      break;
    case 'Resolved':
      bg = 'bg-green-100 text-green-800 border-green-300 font-bold';
      Icon = CheckCircle;
      break;
    case 'Closed':
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      Icon = Archive;
      break;
    case 'Rejected':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
    default:
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = AlertCircle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${bg} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
