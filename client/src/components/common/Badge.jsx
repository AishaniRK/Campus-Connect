import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

export function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      <span>{status}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_COLORS[priority] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      <span>{priority}</span>
    </span>
  );
}

export function MatchBadge({ percentage }) {
  let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (percentage < 60) color = 'bg-amber-50 text-amber-700 border-amber-200';
  if (percentage < 40) color = 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      <span>✨</span>
      <span>{percentage}% Match</span>
    </span>
  );
}

