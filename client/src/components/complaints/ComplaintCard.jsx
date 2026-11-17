import React from 'react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { MapPin, Users, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ComplaintCard({ complaint, onViewDetails }) {
  const isDuplicateGroup = complaint.affected_student_count > 1 || complaint.is_duplicate;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              #{complaint.complaint_number}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>

          {/* Duplicate affected badge */}
          {isDuplicateGroup && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Users className="w-3.5 h-3.5" />
              <span>{complaint.affected_student_count} Students Affected</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(complaint)}
          className="text-base font-bold text-slate-900 hover:text-brand-600 transition cursor-pointer line-clamp-2"
        >
          {complaint.title}
        </h3>

        {/* Location & Room */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {complaint.campus_location} • {complaint.room_number}
          </span>
        </div>

        {/* Category & Department */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2.5">
          <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium">
            Category: {complaint.category_name || 'General'}
          </span>
          <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium">
            Dept: {complaint.department_name || 'Helpdesk'}
          </span>
        </div>

        {/* Resolution note preview if resolved */}
        {complaint.status === 'Resolved' && complaint.resolution_notes && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Resolution: </span>
              {complaint.resolution_notes}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
        </div>

        <button
          onClick={() => onViewDetails(complaint)}
          className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <span>Track Status</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

