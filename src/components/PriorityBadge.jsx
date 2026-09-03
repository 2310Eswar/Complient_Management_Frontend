import React from 'react';
import { AlertTriangle, AlertCircle, ArrowUp, Minus } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = (p) => {
    switch (p) {
      case 'URGENT':
        return {
          bg: 'bg-red-50 border-red-200 text-red-800 font-bold',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />,
          label: 'URGENT'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800 font-semibold',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />,
          label: 'High'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-brand-50 border-brand-200 text-brand-800 font-semibold',
          icon: <ArrowUp className="w-3.5 h-3.5 mr-1 text-brand-600" />,
          label: 'Medium'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-700 font-medium',
          icon: <Minus className="w-3.5 h-3.5 mr-1 text-slate-500" />,
          label: 'Low'
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${config.bg}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default PriorityBadge;
