import React, { useState, useEffect } from 'react';
import { opportunityService } from '../../services/opportunityService';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import OpportunityModal from '../../components/opportunities/OpportunityModal';
import { Sparkles, CheckCircle2, SlidersHorizontal, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecommendedOpportunities() {
  const { user } = useAuth();
  const { addToast } = useNotify();

  const [recommended, setRecommended] = useState([]);
  const [minMatch, setMinMatch] = useState(50);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await opportunityService.getRecommended();
      setRecommended(res.recommendedOpportunities || []);
    } catch (err) {
      console.error('[Recommendations Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleSaveToggle = async (opp) => {
    try {
      const targetId = opp.opportunity_id || opp.id;
      if (opp.is_saved) {
        await opportunityService.unsave(targetId);
        addToast('Removed from saved bookmarks', 'info');
      } else {
        await opportunityService.save(targetId);
        addToast('Saved to your bookmarks!', 'success');
      }
      setRecommended(prev => prev.map(o => ((o.id === targetId || o.opportunity_id === targetId) ? { ...o, is_saved: !o.is_saved } : o)));
      if (selectedOpp && (selectedOpp.id === targetId || selectedOpp.opportunity_id === targetId)) {
        setSelectedOpp(prev => prev ? { ...prev, is_saved: !prev.is_saved } : null);
      }
    } catch (err) {
      addToast('Failed to update bookmark', 'error');
    }
  };

  const filteredList = recommended.filter((o) => (o.matchPercentage || 0) >= minMatch);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-brand-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-xs font-semibold text-brand-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Rule-Based Recommendation Algorithm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Personalized For You
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Our recommendation algorithm strictly checks your mandatory eligibility (branch & year), then ranks opportunities using weighted skill overlap (35 pts) and interest alignment (15 pts).
          </p>
        </div>

        {/* Profile Card Preview */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs text-slate-200 shrink-0 min-w-[220px]">
          <div className="flex items-center gap-2 font-bold text-white mb-2 pb-2 border-b border-white/10">
            <User className="w-4 h-4 text-brand-300" />
            <span>Matching Profile</span>
          </div>
          <div className="space-y-1">
            <div>
              <span className="text-slate-400">Branch: </span>
              <span className="font-semibold text-white">{user?.profile?.branch || 'CSE'}</span>
            </div>
            <div>
              <span className="text-slate-400">Year: </span>
              <span className="font-semibold text-white">Year {user?.profile?.academic_year || 3}</span>
            </div>
            <div>
              <span className="text-slate-400">Skills Tracked: </span>
              <span className="font-semibold text-white">{(user?.profile?.skills || []).length} skills</span>
            </div>
          </div>
          <Link
            to="/profile"
            className="mt-3 block text-center py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold text-white transition"
          >
            Edit Profile Skills
          </Link>
        </div>
      </div>

      {/* Match Threshold Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span>Minimum Match Threshold: {minMatch}%</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="30"
            max="90"
            step="5"
            value={minMatch}
            onChange={(e) => setMinMatch(parseInt(e.target.value, 10))}
            className="w-40 sm:w-60 accent-brand-600 cursor-pointer"
          />
          <span className="font-mono font-bold text-brand-600 w-10 text-right">{minMatch}%</span>
        </div>
      </div>

      {/* Recommended Opportunities List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Computing match percentages...</div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No opportunities reached {minMatch}% match</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try lowering the match threshold slider or adding more relevant technical skills in your Profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSaveToggle={handleSaveToggle}
              onViewDetails={(item) => setSelectedOpp(item)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <OpportunityModal
        opportunity={selectedOpp}
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  );
}

