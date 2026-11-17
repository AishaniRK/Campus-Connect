import React from 'react';
import { Clock, UserCheck, Play, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { key: 'Pending', label: 'Submitted', desc: 'Awaiting Review', icon: Clock },
  { key: 'Assigned', label: 'Assigned', desc: 'Routed to Dept', icon: UserCheck },
  { key: 'In Progress', label: 'In Progress', desc: 'Work Underway', icon: Play },
  { key: 'Resolved', label: 'Resolved', desc: 'Issue Fixed', icon: CheckCircle2 }
];

export default function StatusTimeline({ currentStatus }) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-brand-600 transition-all duration-500"
            style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-brand-600 text-white'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-center mt-2">
                <div
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-brand-600' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

