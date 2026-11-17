import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Clock, PlusCircle, AlertCircle, Users, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyComplaints() {
  const [masterComplaints, setMasterComplaints] = useState([]);
  const [linkedReports, setLinkedReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints();
      setMasterComplaints(res.masterComplaints || []);
      setLinkedReports(res.linkedReports || []);
    } catch (err) {
      console.error('[My Complaints Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const openComplaintModal = async (cmp) => {
    try {
      const res = await complaintService.getById(cmp.id || cmp.complaint_id);
      setSelectedComplaint(res.complaint);
    } catch (err) {
      setSelectedComplaint(cmp);
    }
  };

  const filteredMaster = masterComplaints.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-600" />
            <span>My Reported Issues</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time progress, department assignment, and resolution notes for your campus reports.
          </p>
        </div>

        <Link
          to="/report-issue"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        {['ALL', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st === 'ALL' ? 'All Complaints' : st}
          </button>
        ))}
      </div>

      {/* Duplicate Incident Linked Reports Section */}
      {linkedReports.length > 0 && statusFilter === 'ALL' && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Consolidated Reports ({linkedReports.length} Reports Linked to Master Incidents)</span>
          </div>
          <p className="text-xs text-amber-800">
            When you reported these issues, our system matched them with active incidents at the same room/lab. Your submission was linked so you automatically receive updates as it progresses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {linkedReports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => openComplaintModal({ id: rep.complaint_id })}
                className="p-3.5 rounded-xl bg-white border border-amber-200/80 hover:shadow-md transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      #{rep.complaint_number}
                    </span>
                    <StatusBadge status={rep.master_status || 'In Progress'} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{rep.reported_title}</h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{rep.campus_location} • {rep.room_number}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Complaints Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading complaints...</div>
      ) : filteredMaster.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No complaints found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any reported issues under this status filter.
          </p>
          <Link
            to="/report-issue"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition"
          >
            Report an Issue Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaster.map((cmp) => (
            <ComplaintCard
              key={cmp.id}
              complaint={cmp}
              onViewDetails={() => openComplaintModal(cmp)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onRefresh={fetchMyComplaints}
      />
    </div>
  );
}

