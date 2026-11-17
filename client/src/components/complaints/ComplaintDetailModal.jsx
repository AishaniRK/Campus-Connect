import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusTimeline from './StatusTimeline';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { MapPin, Building, Calendar, Users, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { complaintService } from '../../services/complaintService';

export default function ComplaintDetailModal({ complaint, isOpen, onClose, onRefresh, departments = [] }) {
  const { isAdmin } = useAuth();
  const { addToast } = useNotify();

  const [status, setStatus] = useState(complaint?.status || 'Pending');
  const [priority, setPriority] = useState(complaint?.priority || 'MEDIUM');
  const [departmentId, setDepartmentId] = useState(complaint?.department_id || '');
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolution_notes || '');
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!complaint) return null;

  const handleUpdateStatus = async () => {
    try {
      setSubmitting(true);
      await complaintService.updateStatus(complaint.id, status, resolutionNotes, adminComment);
      addToast(`Complaint status updated to ${status}.`, 'success');
      setAdminComment('');
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePriority = async () => {
    try {
      setSubmitting(true);
      await complaintService.updatePriority(complaint.id, priority, adminComment);
      addToast(`Priority updated to ${priority}.`, 'success');
      setAdminComment('');
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update priority', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDepartment = async () => {
    try {
      setSubmitting(true);
      await complaintService.assignDepartment(complaint.id, departmentId, adminComment);
      addToast('Department assignment updated.', 'success');
      setAdminComment('');
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const history = complaint.history || [];
  const duplicateReports = complaint.duplicateReports || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complaint Incident #${complaint.complaint_number}`} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Status Stepper */}
        <StatusTimeline currentStatus={complaint.status} />

        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.affected_student_count > 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Users className="w-3.5 h-3.5" />
                  <span>{complaint.affected_student_count} Students Affected</span>
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Submitted on {new Date(complaint.created_at).toLocaleString()}
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-400 font-medium">Department</div>
            <div className="font-bold text-slate-800">{complaint.department_name || 'Campus Helpdesk'}</div>
          </div>
        </div>

        {/* Complaint Title & Description */}
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{complaint.title}</h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {complaint.campus_location} • {complaint.room_number}
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mt-3 whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200">
            {complaint.description}
          </p>
        </div>

        {/* Attached Photo if any */}
        {complaint.image_url && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Photo Evidence</h4>
            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-slate-100">
              <img
                src={complaint.image_url.startsWith('http') ? complaint.image_url : `http://localhost:5001${complaint.image_url}`}
                alt="Complaint Attachment"
                className="w-full h-auto object-cover max-h-64"
              />
            </div>
          </div>
        )}

        {/* Resolution Notes (if resolved) */}
        {complaint.resolution_notes && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official Resolution Notes</span>
            </div>
            <p className="leading-relaxed">{complaint.resolution_notes}</p>
          </div>
        )}

        {/* Duplicate Reports Consolidated List */}
        {duplicateReports.length > 0 && (
          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Consolidated Duplicate Reports ({duplicateReports.length + 1} Total Students)</span>
              </div>
            </div>
            <p className="text-xs text-amber-800 mb-3">
              The Smart Issue Routing system detected {duplicateReports.length} other matching reports from this same room/location and consolidated them into this master incident.
            </p>
            <div className="space-y-2">
              {duplicateReports.map((rep) => (
                <div key={rep.id} className="p-2.5 rounded-lg bg-white border border-amber-100 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{rep.reported_title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{rep.reported_description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit History Timeline */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Incident Timeline & Audit History</h4>
          <div className="space-y-3 pl-2 border-l-2 border-slate-200">
            {history.map((h) => (
              <div key={h.id} className="relative pl-4 text-xs">
                <div className="absolute -left-[9px] top-1 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{h.new_status}</span>
                  <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleString()}</span>
                </div>
                {h.comment && <p className="text-slate-600 mt-0.5 leading-relaxed">{h.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Administrator Controls (Only visible to Admin) */}
        {isAdmin && (
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator Action Panel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status</label>
                <div className="flex gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={submitting}
                    className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-xs font-bold text-white transition disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Priority</label>
                <div className="flex gap-2">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                  <button
                    onClick={handleUpdatePriority}
                    disabled={submitting}
                    className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-xs font-bold text-white transition disabled:opacity-50"
                  >
                    Override
                  </button>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Assign Dept</label>
                <div className="flex gap-2">
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignDepartment}
                    disabled={submitting || !departmentId}
                    className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-xs font-bold text-white transition disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>

            {/* Resolution Notes input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Resolution Notes (When Marking Resolved)</label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Technician replaced Ethernet cable and verified router connectivity..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

