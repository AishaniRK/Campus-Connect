import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { complaintService } from '../../services/complaintService';
import StatCard from '../../components/common/StatCard';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import {
  Users,
  Briefcase,
  AlertCircle,
  Clock,
  Play,
  CheckCircle2,
  Building2,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [res, deptRes] = await Promise.all([
        adminService.getOverview(),
        complaintService.getDepartments()
      ]);
      setData(res);
      setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error('[Admin Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const openComplaintModal = async (cmp) => {
    try {
      const res = await complaintService.getById(cmp.id);
      setSelectedComplaint(res.complaint);
    } catch (e) {
      setSelectedComplaint(cmp);
    }
  };

  if (loading || !data) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading admin analytics...</div>;
  }

  const { stats, charts, potentialDuplicates } = data;
  const pieColors = ['#f59e0b', '#6366f1', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-xs font-semibold text-brand-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Operations & Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-lg">
            Monitor college opportunities, department complaint queues, response times, and automated duplicate consolidation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-center">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Pending Triage</div>
            <div className="text-lg font-bold text-amber-400">{stats.pendingComplaints} Issues</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-center">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">High Priority</div>
            <div className="text-lg font-bold text-rose-400">{stats.highPriorityComplaints} Urgent</div>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Registered undergraduates"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Active Opportunities"
          value={stats.totalOpportunities}
          subtitle="Hackathons, internships & fests"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          subtitle="All reported issues"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Duplicate Incidents"
          value={stats.duplicateIncidentsCount}
          subtitle="Consolidated multi-student issues"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Department Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Complaints by Responsible Department
            </h3>
            <span className="text-xs text-slate-400 font-medium">Department workload</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.complaintsByDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Status Lifecycle Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Complaint Status Lifecycle Distribution
            </h3>
            <span className="text-xs text-slate-400 font-medium">Resolution progress</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusBreakdown}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column: Potential Duplicate Incidents & Most Saved Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Potential Duplicate Incidents Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Consolidated Duplicate Incidents</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Issues where multiple students reported the same problem
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {potentialDuplicates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active duplicate incidents currently.
              </div>
            ) : (
              potentialDuplicates.map((cmp) => (
                <div
                  key={cmp.id}
                  onClick={() => openComplaintModal(cmp)}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{cmp.complaint_number}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                        {cmp.affected_student_count} Reports Merged
                      </span>
                      <StatusBadge status={cmp.status} />
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{cmp.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Location: {cmp.campus_location} • {cmp.room_number}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Saved Opportunities Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-brand-600" />
                <span>Most Saved Opportunities</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                High student interest and bookmark volume
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {charts.mostSavedOpportunities.map((opp) => (
              <div key={opp.id} className="py-3 px-2 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">{opp.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Category: {opp.category} • Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold shrink-0 border border-brand-200">
                  {opp.savedCount} Saves
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for complaint actions */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onRefresh={fetchOverview}
        departments={departments}
      />
    </div>
  );
}

