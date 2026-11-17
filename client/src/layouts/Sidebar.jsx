import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Sparkles,
  Bookmark,
  AlertCircle,
  Clock,
  User,
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  PlusCircle,
  HelpCircle,
  LogOut,
  Layers
} from 'lucide-react';

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();

  const studentLinks = [
    { section: 'Overview', items: [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }
    ]},
    { section: 'Opportunity Aggregator', items: [
      { name: 'Explore All', to: '/opportunities', icon: Compass },
      { name: 'Recommended', to: '/recommended', icon: Sparkles, badge: 'Smart Match' },
      { name: 'Saved Bookmarks', to: '/saved', icon: Bookmark }
    ]},
    { section: 'Smart Issue Routing', items: [
      { name: 'Report an Issue', to: '/report-issue', icon: PlusCircle, highlight: true },
      { name: 'My Complaints', to: '/complaints', icon: Clock }
    ]},
    { section: 'Account', items: [
      { name: 'My Profile', to: '/profile', icon: User }
    ]}
  ];

  const adminLinks = [
    { section: 'Administration', items: [
      { name: 'Overview Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }
    ]},
    { section: 'Operations Management', items: [
      { name: 'Manage Opportunities', to: '/admin/opportunities', icon: Briefcase },
      { name: 'Campus Complaints', to: '/admin/complaints', icon: AlertCircle, badge: 'Routing' },
      { name: 'Departments & Rules', to: '/admin/departments', icon: Building2 },
      { name: 'Student Directory', to: '/admin/students', icon: Users }
    ]}
  ];

  const navigation = isAdmin ? adminLinks : studentLinks;

  const linkContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight leading-none">
              Campus<span className="text-brand-400">Connect</span>
            </div>
            <div className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-1">
              Aggregator & Issues
            </div>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {navigation.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.section}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : item.highlight
                        ? 'bg-brand-500/10 text-brand-400 hover:bg-brand-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 transition group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Role Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <div>
              <div className="text-xs font-bold text-white capitalize">{user?.role} Mode</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 fixed inset-y-0 left-0 z-40">
        {linkContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10">
            {linkContent}
          </div>
        </div>
      )}
    </>
  );
}

