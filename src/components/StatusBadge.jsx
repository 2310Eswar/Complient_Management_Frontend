import React from 'react';
import { Clock, RefreshCw, CheckCircle, XCircle, ShieldAlert, UserCheck, Hourglass } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'PENDING':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800 font-semibold',
          icon: <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />,
          label: 'Pending'
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-purple-50 border-purple-200 text-purple-800 font-semibold',
          icon: <UserCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />,
          label: 'Assigned'
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800 font-semibold',
          icon: <RefreshCw className="w-3.5 h-3.5 mr-1 text-blue-600" />,
          label: 'In Progress'
        };
      case 'PENDING_APPROVAL':
        return {
          bg: 'bg-cyan-50 border-cyan-200 text-cyan-900 font-bold',
          icon: <Hourglass className="w-3.5 h-3.5 mr-1 text-cyan-700" />,
          label: 'Pending Approval'
        };
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold',
          icon: <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
          label: 'Resolved'
        };
      case 'CLOSED':
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-700 font-medium',
          icon: <CheckCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />,
          label: 'Closed'
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-50 border-red-200 text-red-800 font-semibold',
          icon: <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />,
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-700',
          icon: <ShieldAlert className="w-3.5 h-3.5 mr-1 text-slate-500" />,
          label: st
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${config.bg} shadow-sm`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
