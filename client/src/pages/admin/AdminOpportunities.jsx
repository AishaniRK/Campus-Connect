import React, { useState, useEffect } from 'react';
import { opportunityService } from '../../services/opportunityService';
import { useNotify } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import { Briefcase, Plus, Search, Edit2, Trash2, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { BRANCHES, ACADEMIC_YEARS, COMMON_SKILLS } from '../../utils/constants';

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    title: '',
    description: '',
    organization_name: '',
    category_id: '1',
    opportunity_type: 'Hackathon',
    eligible_branches: ['CSE', 'IT'],
    eligible_academic_years: [2, 3, 4],
    required_skills: ['React', 'Node.js', 'Python'],
    mode: 'Online',
    location: 'Virtual / Remote',
    registration_link: '',
    application_deadline: '',
    eligibility_requirements: 'Undergraduate engineering students with active ID.',
    stipend_or_prize: 'Certificate & Perks'
  };

  const [formData, setFormData] = useState(initialForm);

  const { addToast } = useNotify();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const [oppRes, catRes] = await Promise.all([
        opportunityService.getAll({ search }),
        opportunityService.getCategories()
      ]);
      setOpportunities(oppRes.opportunities || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search]);

  const openAddModal = () => {
    setEditingOpp(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (opp) => {
    setEditingOpp(opp);
    setFormData({
      title: opp.title,
      description: opp.description,
      organization_name: opp.organization_name,
      category_id: String(opp.category_id),
      opportunity_type: opp.opportunity_type || 'Hackathon',
      eligible_branches: opp.eligible_branches || ['ALL'],
      eligible_academic_years: opp.eligible_academic_years || ['ALL'],
      required_skills: opp.required_skills || [],
      mode: opp.mode || 'Online',
      location: opp.location || 'Virtual / Remote',
      registration_link: opp.registration_link,
      application_deadline: opp.application_deadline ? opp.application_deadline.split('T')[0] : '',
      eligibility_requirements: opp.eligibility_requirements,
      stipend_or_prize: opp.stipend_or_prize || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await opportunityService.delete(id);
      addToast('Opportunity deleted successfully.', 'info');
      fetchOpportunities();
    } catch (err) {
      addToast('Failed to delete opportunity.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOpp) {
        await opportunityService.update(editingOpp.id, formData);
        addToast('Opportunity updated successfully!', 'success');
      } else {
        await opportunityService.create(formData);
        addToast('Opportunity added to catalog!', 'success');
      }
      setModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save opportunity', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBranch = (b) => {
    setFormData((prev) => ({
      ...prev,
      eligible_branches: prev.eligible_branches.includes(b)
        ? prev.eligible_branches.filter((x) => x !== b)
        : [...prev.eligible_branches, b]
    }));
  };

  const toggleYear = (y) => {
    setFormData((prev) => ({
      ...prev,
      eligible_academic_years: prev.eligible_academic_years.includes(y)
        ? prev.eligible_academic_years.filter((x) => x !== y)
        : [...prev.eligible_academic_years, y]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-600" />
            <span>Manage College Opportunities</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add, update, or remove hackathons, internships, scholarships, and contests for student discovery.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter opportunities by title, organization, or skills..."
          className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Opportunities Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Opportunity</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading catalog...</td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No opportunities found.</td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 max-w-xs truncate">{opp.title}</div>
                      <div className="text-[11px] text-slate-400">{opp.opportunity_type}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{opp.organization_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-brand-50 text-brand-700 text-[11px]">
                        {opp.category_name || opp.opportunity_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{opp.mode}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(opp.application_deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(opp)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(opp.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOpp ? 'Edit Opportunity' : 'Post New Campus Opportunity'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Smart India Campus Hackathon 2026"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Organization *</label>
              <input
                type="text"
                required
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Google India or Innovation Cell"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Main Auditorium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Application Deadline *</label>
              <input
                type="date"
                required
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Registration Link *</label>
            <input
              type="url"
              required
              value={formData.registration_link}
              onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Details about the opportunity, schedule, rules, and hiring tracks..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Eligibility Criteria</label>
            <textarea
              rows={2}
              value={formData.eligibility_requirements}
              onChange={(e) => setFormData({ ...formData, eligibility_requirements: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Open to 2nd to 4th year CSE/IT students..."
            />
          </div>

          {/* Eligible Branches & Years */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Eligible Branches:</label>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'CSE', 'IT', 'ECE', 'MECH', 'CIVIL'].map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => toggleBranch(b)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      formData.eligible_branches.includes(b)
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Eligible Academic Years:</label>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 1, 2, 3, 4].map((y) => (
                  <button
                    type="button"
                    key={y}
                    onClick={() => toggleYear(y)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      formData.eligible_academic_years.includes(y)
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {y === 'ALL' ? 'ALL' : `Year ${y}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Prize / Stipend Info</label>
            <input
              type="text"
              value={formData.stipend_or_prize}
              onChange={(e) => setFormData({ ...formData, stipend_or_prize: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. ₹1,10,000 / month or ₹2,50,000 Cash Pool"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-600/20 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingOpp ? 'Save Changes' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

