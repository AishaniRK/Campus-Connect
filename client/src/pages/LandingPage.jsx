import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Compass, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Building, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">
              Campus<span className="text-brand-400">Connect</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
              College Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-brand-600/25"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-md shadow-brand-600/25"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unified Campus Experience: 2 Modules, 1 Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          College Opportunity Aggregator & <br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
            Smart Campus Issue Routing
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Never miss an internship, hackathon, or scholarship across endless chat groups. Plus, report campus Wi-Fi, electrical, or lab issues with intelligent duplicate detection and automated routing.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition flex items-center gap-2"
          >
            <span>Launch Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition"
          >
            Student Registration
          </Link>
        </div>

        {/* Demo Credentials Quick Pill */}
        <div className="mt-10 p-4 max-w-xl mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 text-left">
          <div className="font-bold text-white mb-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pre-Seeded Demo Accounts for Evaluation:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div>
              <span className="text-slate-300 font-semibold">Student:</span> arjun.sharma@campusconnect.edu <br />
              <span className="text-slate-300 font-semibold">Password:</span> Student@123
            </div>
            <div>
              <span className="text-slate-300 font-semibold">Admin:</span> admin@campusconnect.edu <br />
              <span className="text-slate-300 font-semibold">Password:</span> Admin@123
            </div>
          </div>
        </div>
      </section>

      {/* The Two Modules Showcase Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Two Powerful Integrated Systems</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Designed specifically for student success and campus facilities reliability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Module 1 Card */}
          <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/80 hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Module 1</span>
            <h3 className="text-xl font-bold text-white mt-1">College Opportunity Aggregator</h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Curated hub for hackathons, internships, research fellowships, coding contests, and scholarships. Eliminates fragmented WhatsApp messages.
            </p>
            <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-factor filtering by branch, year, required skills, and deadline</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Rule-based match score calculation (%) tailored to student profiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transparent recommendation explanations why each opportunity fits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Save/bookmark and upcoming deadline urgency alerts</span>
              </li>
            </ul>
          </div>

          {/* Module 2 Card */}
          <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/80 hover:border-indigo-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Module 2</span>
            <h3 className="text-xl font-bold text-white mt-1">Smart Campus Issue Routing</h3>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Centralized platform for reporting campus issues—Wi-Fi dropouts, broken projectors, electrical faults, and water leaks.
            </p>
            <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Keyword-based categorization (Network, AV, Electrical, Plumbing, Civil)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated department suggestions & priority detection (HIGH / MEDIUM / LOW)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Intelligent duplicate detection preventing redundant tickets from the same room</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full status tracking lifecycle: Pending → Assigned → In Progress → Resolved</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div>Campus Connect © 2026 – Academic Engineering Full-Stack Project</div>
        <div className="mt-1 text-slate-600">Built with React, Vite, Tailwind CSS, Node.js, Express, and MySQL</div>
      </footer>
    </div>
  );
}

