import React, { useState, useEffect } from 'react';
import { opportunityService } from '../../services/opportunityService';
import { useNotify } from '../../context/NotificationContext';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import OpportunityModal from '../../components/opportunities/OpportunityModal';
import { Bookmark, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedOpportunities() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const { addToast } = useNotify();

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await opportunityService.getSaved();
      setSaved(res.savedOpportunities || []);
    } catch (err) {
      console.error('[Saved Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = async (opp) => {
    try {
      const targetId = opp.opportunity_id || opp.id;
      await opportunityService.unsave(targetId);
      addToast('Removed from saved bookmarks', 'info');
      if (selectedOpp && (selectedOpp.id === targetId || selectedOpp.opportunity_id === targetId)) {
        setSelectedOpp(null);
      }
      fetchSaved();
    } catch (err) {
      addToast('Failed to remove bookmark', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Saved Bookmarks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep track of upcoming hackathon registrations and internship application deadlines.
          </p>
        </div>

        <Link
          to="/opportunities"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Explore More</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading saved bookmarks...</div>
      ) : saved.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">You haven't saved any opportunities yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any opportunity card to save it to this list.
          </p>
          <Link
            to="/opportunities"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition"
          >
            Explore Opportunities Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSaveToggle={handleSaveToggle}
              onViewDetails={(item) => setSelectedOpp(item)}
            />
          ))}
        </div>
      )}

      <OpportunityModal
        opportunity={selectedOpp}
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  );
}

