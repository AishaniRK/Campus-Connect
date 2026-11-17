import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { opportunityService } from '../../services/opportunityService';
import { complaintService } from '../../services/complaintService';
import StatCard from '../../components/common/StatCard';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import OpportunityModal from '../../components/opportunities/OpportunityModal';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import {
  Sparkles,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotify();

  const [recommended, setRecommended] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, allRes, savedRes, cmpRes] = await Promise.all([
        opportunityService.getRecommended().catch(() => ({ recommendedOpportunities: [] })),
        opportunityService.getAll({ limit: 4 }).catch(() => ({ opportunities: [] })),
        opportunityService.getSaved().catch(() => ({ savedOpportunities: [] })),
        complaintService.getMyComplaints().catch(() => ({ masterComplaints: [] }))
      ]);

      setRecommended(recRes.recommendedOpportunities || []);
      setRecentOpportunities(allRes.opportunities || []);
      setSavedCount((savedRes.savedOpportunities || []).length);
      setMyComplaints(cmpRes.masterComplaints || []);
    } catch (err) {
      console.error('[Dashboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveToggle = async (opp) => {
    try {
      const targetId = opp.opportunity_id || opp.id;
      if (opp.is_saved) {
        await opportunityService.unsave(targetId);
        addToast('Removed from saved bookmarks', 'info');
      } else {
        await opportunityService.save(targetId);
        addToast('Opportunity saved to bookmarks!', 'success');
      }
      setRecommendedOpps(prev => prev.map(o => ((o.id === targetId || o.opportunity_id === targetId) ? { ...o, is_saved: !o.is_saved } : o)));
      if (selectedOpp && (selectedOpp.id === targetId || selectedOpp.opportunity_id === targetId)) {
        setSelectedOpp(prev => prev ? { ...prev, is_saved: !prev.is_saved } : null);
      }
    } catch (err) {
      addToast('Failed to update bookmark', 'error');
    }
  };

  const activeComplaintsCount = myComplaints.filter((c) => c.status !== 'Resolved').length;
  const resolvedComplaintsCount = myComplaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Campus Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-brand-100 leading-relaxed">
            Personalized dashboard for your {user?.profile?.branch || 'CSE'} major (Year {user?.profile?.academic_year || '3'}). Discover matching opportunities and track reported campus issues in real time.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/recommended"
              className="px-4 py-2 rounded-xl bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold transition flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>View Recommendations ({recommended.length})</span>
            </Link>
            <Link
              to="/report-issue"
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Campus Issue</span>
            </Link>
          </div>
        </div>

        {/* Decorative blur backdrop */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recommended For You"
          value={recommended.length}
          subtitle="Based on your skills & branch"
          icon={Sparkles}
          color="brand"
        />
        <StatCard
          title="Saved Bookmarks"
          value={savedCount}
          subtitle="Opportunities you tracked"
          icon={Bookmark}
          color="amber"
        />
        <StatCard
          title="Active Issues"
          value={activeComplaintsCount}
          subtitle="Complaints in progress"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Resolved Issues"
          value={resolvedComplaintsCount}
          subtitle="Successfully fixed"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Recommended Opportunities Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Recommended Opportunities For You</span>
            </h2>
            <p className="text-xs text-slate-500">
              Matched against your {user?.profile?.branch} skills and interests
            </p>
          </div>
          <Link
            to="/recommended"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>See all matches</span>
            <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading recommendations...</div>
        ) : recommended.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No opportunities matched your exact profile yet. Check back soon or update your skills in Profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommended.slice(0, 3).map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSaveToggle={handleSaveToggle}
                onViewDetails={(item) => setSelectedOpp(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Two-Column: Recently Added Opportunities & Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Added Opportunities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-600" />
              <span>Recently Added Opportunities</span>
            </h3>
            <Link to="/opportunities" className="text-xs font-bold text-brand-600 hover:underline">
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            {recentOpportunities.slice(0, 3).map((opp) => (
              <div
                key={opp.id}
                onClick={() => setSelectedOpp(opp)}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700">
                      {opp.opportunity_type}
                    </span>
                    <span className="text-[11px] text-slate-400">{opp.organization_name}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 hover:text-brand-600 transition line-clamp-1">
                    {opp.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Deadline: {new Date(opp.application_deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* My Reported Complaints Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Your Campus Complaints Status</span>
            </h3>
            <Link to="/complaints" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {myComplaints.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                You haven't reported any campus issues yet.
              </div>
            ) : (
              myComplaints.slice(0, 3).map((cmp) => (
                <ComplaintCard
                  key={cmp.id}
                  complaint={cmp}
                  onViewDetails={(item) => setSelectedComplaint(item)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <OpportunityModal
        opportunity={selectedOpp}
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onSaveToggle={handleSaveToggle}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onRefresh={fetchData}
      />
    </div>
  );
}

