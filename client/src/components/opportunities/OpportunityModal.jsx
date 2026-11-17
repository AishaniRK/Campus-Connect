import React from 'react';
import Modal from '../common/Modal';
import { MatchBadge } from '../common/Badge';
import { Calendar, MapPin, Building, Bookmark, ExternalLink, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OpportunityModal({ opportunity, isOpen, onClose, onSaveToggle }) {
  if (!opportunity) return null;

  const branches = opportunity.eligible_branches || ['ALL'];
  const years = opportunity.eligible_academic_years || ['ALL'];
  const skills = opportunity.required_skills || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Opportunity Overview" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Header Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {opportunity.opportunity_type}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {opportunity.mode}
            </span>
            {opportunity.matchPercentage !== undefined && opportunity.matchPercentage > 0 && (
              <MatchBadge percentage={opportunity.matchPercentage} />
            )}
          </div>

          {onSaveToggle && (
            <button
              onClick={() => onSaveToggle(opportunity)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                opportunity.is_saved
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${opportunity.is_saved ? 'fill-amber-500' : ''}`} />
              <span>{opportunity.is_saved ? 'Bookmarked' : 'Save'}</span>
            </button>
          )}
        </div>

        {/* Title & Organization */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
            {opportunity.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold mt-1">
            <Building className="w-4 h-4 text-slate-400" />
            <span>{opportunity.organization_name}</span>
          </div>
        </div>

        {/* Perks & Key info banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Location</div>
            <div className="font-semibold text-slate-800 mt-0.5">{opportunity.location || 'Virtual'}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Application Deadline</div>
            <div className="font-semibold text-slate-800 mt-0.5">
              {new Date(opportunity.application_deadline).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Reward / Perks</div>
            <div className="font-semibold text-emerald-700 mt-0.5">
              {opportunity.stipend_or_prize || 'Certificate'}
            </div>
          </div>
        </div>

        {/* Recommendation explanation breakdown if exists */}
        {opportunity.recommendationReasons && opportunity.recommendationReasons.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50/50 border border-brand-200/60">
            <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-2">
              Why this opportunity was recommended for you:
            </h4>
            <ul className="space-y-1.5 text-xs text-brand-950">
              {opportunity.recommendationReasons.map((reason, rIdx) => (
                <li key={rIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            About the Opportunity
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {opportunity.description}
          </p>
        </div>

        {/* Eligibility Details */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Eligibility Requirements
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {opportunity.eligibility_requirements}
          </p>
        </div>

        {/* Target Audience & Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h5 className="font-bold text-slate-700 mb-1.5">Eligible Branches & Years:</h5>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-slate-100 font-semibold rounded-md text-slate-700">
                Branches: {branches.join(', ')}
              </span>
              <span className="px-2 py-1 bg-slate-100 font-semibold rounded-md text-slate-700">
                Years: {years.join(', ')}
              </span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 mb-1.5">Required Skills:</h5>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-brand-50 text-brand-700 font-medium rounded-md border border-brand-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Close
          </button>
          <a
            href={opportunity.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition"
          >
            <span>Apply / Register on Official Site</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Modal>
  );
}

