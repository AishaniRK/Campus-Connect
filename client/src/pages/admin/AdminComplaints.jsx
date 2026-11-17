import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { AlertCircle, Search, Filter, Users, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [departmentId, setDepartmentId] = useState('ALL');
  const [duplicateOnly, setDuplicateOnly] = useState(false);

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (status !== 'ALL') params.status = status;
      if (priority !== 'ALL') params.priority = priority;
      if (departmentId !== 'ALL') params.department_id = departmentId;
      if (duplicateOnly) params.is_duplicate = 'true';

      const [res, deptRes] = await Promise.all([
        complaintService.getAll(params),
        complaintService.getDepartments()
      ]);

      setComplaints(res.complaints || []);
      setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, status, priority, departmentId, duplicateOnly]);

  const openComplaintModal = async (cmp) => {
    try {
      const res = await complaintService.getById(cmp.id);
      setSelectedComplaint(res.complaint);
    } catch (e) {
      setSelectedComplaint(cmp);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-brand-600" />
          <span>Campus Complaints Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, assign responsible departments, override priorities, and manage resolution lifecycles.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket number, location, keyword (e.g. CMP-2026-0001, Lab 4, Wi-Fi)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setDuplicateOnly(!duplicateOnly)}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold border transition text-center truncate ${
                duplicateOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              👥 Duplicates Only
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Assigned Dept</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading complaints queue...</td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No complaints matching filters.</td>
                </tr>
              ) : (
                complaints.map((cmp) => (
                  <tr
                    key={cmp.id}
                    onClick={() => openComplaintModal(cmp)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{cmp.complaint_number}
                        </span>
                        {cmp.affected_student_count > 1 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                            {cmp.affected_student_count} reports
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 max-w-xs truncate">{cmp.title}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{cmp.campus_location}</div>
                      <div className="text-[11px] text-slate-400">{cmp.room_number}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{cmp.category_name || 'General'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {cmp.department_name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={cmp.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cmp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 ml-auto">
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onRefresh={fetchComplaints}
        departments={departments}
      />
    </div>
  );
}

