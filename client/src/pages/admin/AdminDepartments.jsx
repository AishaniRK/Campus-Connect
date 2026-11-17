import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { adminService } from '../../services/adminService';
import { useNotify } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import { Building2, Plus, Edit2, Trash2, Key, Sparkles, Save } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department Modal State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    contact_email: '',
    contact_phone: ''
  });

  // Category Edit Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catKeywords, setCatKeywords] = useState('');

  const { addToast } = useNotify();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, catRes] = await Promise.all([
        complaintService.getDepartments(),
        complaintService.getCategories()
      ]);
      setDepartments(deptRes.departments || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '', description: '', contact_email: '', contact_phone: '' });
    setDeptModalOpen(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      contact_email: dept.contact_email || '',
      contact_phone: dept.contact_phone || ''
    });
    setDeptModalOpen(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await adminService.updateDepartment(editingDept.id, deptForm);
        addToast('Department updated successfully.', 'success');
      } else {
        await adminService.createDepartment(deptForm);
        addToast('Department created successfully.', 'success');
      }
      setDeptModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save department', 'error');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await adminService.deleteDepartment(id);
      addToast('Department deleted.', 'info');
      fetchData();
    } catch (err) {
      addToast('Failed to delete department', 'error');
    }
  };

  const openEditCat = (cat) => {
    setEditingCat(cat);
    const kwArr = Array.isArray(cat.keywords) ? cat.keywords : [];
    setCatKeywords(kwArr.join(', '));
    setCatModalOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      const kwList = catKeywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
      await adminService.updateIssueCategory(editingCat.id, {
        keywords: kwList
      });
      addToast(`Keywords for ${editingCat.name} updated!`, 'success');
      setCatModalOpen(false);
      fetchData();
    } catch (err) {
      addToast('Failed to update keywords', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-brand-600" />
          <span>Departments & Issue Categorization Rules</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure responsible campus departments and customize the keyword dictionaries used for automated complaint classification.
        </p>
      </div>

      {/* Departments Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Campus Facilities Departments</h3>
            <p className="text-xs text-slate-400">Responsible teams handling dispatched student complaints</p>
          </div>
          <button
            onClick={openAddDept}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {d.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditDept(d)}
                      className="p-1 text-slate-400 hover:text-brand-600 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(d.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{d.name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{d.contact_email || 'No email'}</span>
                <span>{d.contact_phone || 'No phone'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issue Categorization Keywords Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Keyword Dictionaries for Automated Classification</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            When students describe their issue, the system matches words in the title & description against these keyword dictionaries. Click any category to add or modify keywords.
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const keywords = Array.isArray(cat.keywords) ? cat.keywords : [];
            return (
              <div key={cat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">{cat.name}</h4>
                    <span className="text-[10px] text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      Default Priority: {cat.default_priority || 'MEDIUM'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{cat.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {keywords.map((kw, kIdx) => (
                      <span key={kIdx} className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-mono text-[11px] border border-slate-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openEditCat(cat)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition shrink-0 self-start"
                >
                  Edit Keywords
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dept Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleDeptSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. IT & Network Services"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Code *</label>
              <input
                type="text"
                required
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. IT"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Email</label>
              <input
                type="email"
                value={deptForm.contact_email}
                onChange={(e) => setDeptForm({ ...deptForm, contact_email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="it@campusconnect.edu"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={2}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Scope of work and responsibilities..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeptModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-600/20"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Keywords Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={`Edit Keyword Dictionary: ${editingCat?.name}`}
      >
        <form onSubmit={handleCatSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Comma-Separated Keywords *
            </label>
            <textarea
              rows={4}
              required
              value={catKeywords}
              onChange={(e) => setCatKeywords(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs leading-relaxed"
              placeholder="e.g. wifi, internet, network, router, lan, ethernet, ip, connection..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Separate individual keywords by commas. Text analyzer matches complaints using normalized tokens.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCatModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-600/20"
            >
              Update Keywords
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

