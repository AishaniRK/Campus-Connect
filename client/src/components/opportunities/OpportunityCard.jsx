import React from 'react';
import { Bookmark, Calendar, MapPin, Building, Sparkles, ExternalLink, ArrowRight, Award } from 'lucide-react';
import { MatchBadge } from '../common/Badge';

export default function OpportunityCard({ opportunity, onSaveToggle, onViewDetails }) {
  const isApproaching = () => {
    const today = new Date();
    const deadline = new Date(opportunity.application_deadline);
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const daysRemaining = () => {
    const today = new Date();
    const deadline = new Date(opportunity.application_deadline);
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Deadline Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const branches = opportunity.eligible_branches || ['ALL'];
  const years = opportunity.eligible_academic_years || ['ALL'];
  const skills = opportunity.required_skills || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner / Type */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-wider">
              {opportunity.opportunity_type || 'Opportunity'}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
              {opportunity.mode || 'Online'}
            </span>
            {opportunity.matchPercentage !== undefined && opportunity.matchPercentage > 0 && (
              <MatchBadge percentage={opportunity.matchPercentage} />
            )}
          </div>

          {/* Bookmark Button */}
          {onSaveToggle && (
            <button
              onClick={() => onSaveToggle(opportunity)}
              className={`p-2 rounded-xl transition ${
                opportunity.is_saved
                  ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={opportunity.is_saved ? 'Remove Bookmark' : 'Save Opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${opportunity.is_saved ? 'fill-amber-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Title & Organization */}
        <h3
          onClick={() => onViewDetails(opportunity)}
          className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition cursor-pointer line-clamp-2 leading-snug"
        >
          {opportunity.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{opportunity.organization_name}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Prize / Stipend if available */}
        {opportunity.stipend_or_prize && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{opportunity.stipend_or_prize}</span>
          </div>
        )}

        {/* Recommendation Reason Highlight */}
        {opportunity.recommendationReasons && opportunity.recommendationReasons.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-brand-50/60 border border-brand-100 text-[11px] text-brand-900 leading-snug flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-700">Why matched: </span>
              {opportunity.recommendationReasons.slice(0, 2).join(' • ')}
            </div>
          </div>
        )}

        {/* Skills Tags */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill, sIdx) => (
            <span
              key={sIdx}
              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium self-center">
              +{skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
        {/* Deadline Indicator */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`font-semibold ${
              isApproaching() ? 'text-rose-600 font-bold' : 'text-slate-600'
            }`}
          >
            {daysRemaining()}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(opportunity)}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 group/btn"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

