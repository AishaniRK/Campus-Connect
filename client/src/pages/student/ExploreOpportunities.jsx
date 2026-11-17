import React, { useState, useEffect } from 'react';
import { opportunityService } from '../../services/opportunityService';
import { useNotify } from '../../context/NotificationContext';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import OpportunityModal from '../../components/opportunities/OpportunityModal';
import { Search, Filter, RotateCcw, Compass, Calendar, AlertCircle } from 'lucide-react';
import { BRANCHES, ACADEMIC_YEARS, COMMON_SKILLS } from '../../utils/constants';

export default function ExploreOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [branch, setBranch] = useState('ALL');
  const [academicYear, setAcademicYear] = useState('ALL');
  const [skill, setSkill] = useState('');
  const [mode, setMode] = useState('ALL');
  const [approachingDeadline, setApproachingDeadline] = useState(false);

  // Detail Modal
  const [selectedOpp, setSelectedOpp] = useState(null);

  const { addToast } = useNotify();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category !== 'ALL') params.category = category;
      if (branch !== 'ALL') params.branch = branch;
      if (academicYear !== 'ALL') params.academic_year = academicYear;
      if (skill) params.skill = skill;
      if (mode !== 'ALL') params.mode = mode;
      if (approachingDeadline) params.approaching_deadline = 'true';

      const res = await opportunityService.getAll(params);
      setOpportunities(res.opportunities || []);
    } catch (err) {
      console.error('[Fetch Opportunities Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await opportunityService.getCategories();
        setCategories(res.categories || []);
      } catch (e) {}
    }
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpportunities();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, branch, academicYear, skill, mode, approachingDeadline]);

  const resetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setBranch('ALL');
    setAcademicYear('ALL');
    setSkill('');
    setMode('ALL');
    setApproachingDeadline(false);
  };

  const handleSaveToggle = async (opp) => {
    try {
      const targetId = opp.opportunity_id || opp.id;
      if (opp.is_saved) {
        await opportunityService.unsave(targetId);
        addToast('Bookmark removed', 'info');
      } else {
        await opportunityService.save(targetId);
        addToast('Saved to your bookmarks!', 'success');
      }
      setOpportunities(prev => prev.map(o => ((o.id === targetId || o.opportunity_id === targetId) ? { ...o, is_saved: !o.is_saved } : o)));
      if (selectedOpp && (selectedOpp.id === targetId || selectedOpp.opportunity_id === targetId)) {
        setSelectedOpp(prev => prev ? { ...prev, is_saved: !prev.is_saved } : null);
      }
    } catch (err) {
      addToast('Failed to update bookmark', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-brand-600" />
          <span>Explore College Opportunities</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse verified hackathons, internships, scholarships, and technical workshops across departments.
        </p>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, organization, or keywords (e.g. Google, Hackathon, Python)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {BRANCHES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Required Skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Any Skill</option>
              {COMMON_SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Reset / Deadline Toggle */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setApproachingDeadline(!approachingDeadline)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition text-center truncate ${
                approachingDeadline
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Show opportunities closing in 7 days"
            >
              ⏳ &lt; 7 Days
            </button>
            <button
              onClick={resetFilters}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Found {opportunities.length} opportunities</span>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading catalog...</div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No matching opportunities found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or switching branch/category.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSaveToggle={handleSaveToggle}
              onViewDetails={(item) => setSelectedOpp(item)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <OpportunityModal
        opportunity={selectedOpp}
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  );
}

