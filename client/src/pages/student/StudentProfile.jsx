import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { User, Code, Heart, GraduationCap, Save, CheckCircle2 } from 'lucide-react';
import { BRANCHES, ACADEMIC_YEARS, COMMON_SKILLS, COMMON_INTERESTS } from '../../utils/constants';

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotify();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    branch: user?.profile?.branch || 'CSE',
    academic_year: String(user?.profile?.academic_year || '3'),
    semester: String(user?.profile?.semester || '5'),
    skills: user?.profile?.skills || [],
    interests: user?.profile?.interests || [],
    bio: user?.profile?.bio || ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        branch: user.profile?.branch || 'CSE',
        academic_year: String(user.profile?.academic_year || '3'),
        semester: String(user.profile?.semester || '5'),
        skills: user.profile?.skills || [],
        interests: user.profile?.interests || [],
        bio: user.profile?.bio || ''
      });
    }
  }, [user]);

  const toggleSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(formData);
      await refreshUser();
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-brand-600" />
          <span>Student Profile & Preferences</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Keep your skills and interests up to date. Our recommendation algorithm calculates matching percentages directly from these selections.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Academic Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <span>Academic Standing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Branch</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {BRANCHES.filter((b) => b.value !== 'ALL').map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Academic Year</label>
              <select
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {ACADEMIC_YEARS.filter((y) => y.value !== 'ALL').map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Roll Number</label>
              <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-600">
                {user?.profile?.roll_number || 'STU-1045'}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Tag Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-brand-600" />
              <span>Technical Skills (Used for Opportunity Matching)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-semibold">{formData.skills.length} Selected</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {COMMON_SKILLS.map((skill) => {
              const selected = formData.skills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selected
                      ? 'bg-brand-600 text-white font-bold shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {skill} {selected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Career Interests & Focus Areas</span>
            </label>
            <span className="text-[11px] text-slate-400 font-semibold">{formData.interests.length} Selected</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {COMMON_INTERESTS.map((interest) => {
              const selected = formData.interests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selected
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {interest} {selected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Short Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Short Student Bio
          </label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

