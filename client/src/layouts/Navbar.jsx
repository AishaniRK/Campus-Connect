import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User, Menu, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount((res.data.notifications || []).filter(n => !n.is_read).length);
        }
      } catch (e) {
        // silent fail
      }
    }
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between">
      {/* Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Campus Connect</span>
          <span>•</span>
          <span className="text-brand-600 font-bold capitalize">
            {user?.role === 'admin' ? 'Admin Control Center' : 'Student Portal'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* System Active Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Live</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 px-2 py-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl transition ${n.is_read ? 'opacity-70' : 'bg-brand-50/40'}`}
                    >
                      <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <Link
            to={user?.role === 'admin' ? '/admin/dashboard' : '/profile'}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff`}
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-brand-500/30 transition"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition truncate max-w-[130px]">
                {user?.name}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 capitalize">
                {user?.role === 'admin' ? 'Administrator' : `${user?.profile?.branch || 'Student'} • Year ${user?.profile?.academic_year || '3'}`}
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

