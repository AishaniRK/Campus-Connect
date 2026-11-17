import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useNotify } from '../../context/NotificationContext';
import {
  AlertCircle,
  Building,
  MapPin,
  Upload,
  CheckCircle2,
  Sparkles,
  Info,
  Users,
  ArrowRight
} from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../../utils/constants';

export default function ReportIssue() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [campusLocation, setCampusLocation] = useState('Tech Tower');
  const [roomNumber, setRoomNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState(null);

  const { addToast } = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await complaintService.getCategories();
        setCategories(res.categories || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadCategories();
  }, []);

  // Real-time client keyword suggestion
  const suggestedCategory = () => {
    const text = `${title} ${description}`.toLowerCase();
    if (!text.trim()) return null;

    if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('lan') || text.includes('router')) {
      return { id: 1, name: 'IT / Network', reason: 'Detected network keywords (wi-fi, internet, router)' };
    }
    if (text.includes('projector') || text.includes('computer') || text.includes('screen') || text.includes('monitor') || text.includes('display') || text.includes('speaker')) {
      return { id: 2, name: 'Technical Equipment', reason: 'Detected AV/equipment keywords (projector, screen, PC)' };
    }
    if (text.includes('light') || text.includes('fan') || text.includes('electricity') || text.includes('socket') || text.includes('switch') || text.includes('power') || text.includes('ac')) {
      return { id: 3, name: 'Electrical', reason: 'Detected electrical maintenance keywords (light, fan, switch)' };
    }
    if (text.includes('water') || text.includes('leakage') || text.includes('tap') || text.includes('pipe') || text.includes('washroom') || text.includes('toilet') || text.includes('sink')) {
      return { id: 4, name: 'Plumbing', reason: 'Detected plumbing/sanitation keywords (water, leakage, pipe)' };
    }
    if (text.includes('desk') || text.includes('chair') || text.includes('bench') || text.includes('furniture') || text.includes('door') || text.includes('window') || text.includes('board')) {
      return { id: 5, name: 'Infrastructure', reason: 'Detected furniture/civil keywords (desk, chair, bench)' };
    }
    return null;
  };

  const suggestion = suggestedCategory();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image must be under 5MB', 'error');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !roomNumber.trim()) {
      addToast('Please complete all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    setDuplicateAlert(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('campus_location', campusLocation);
      formData.append('room_number', roomNumber.trim());

      const chosenCat = categoryId || (suggestion ? suggestion.id : '');
      if (chosenCat) {
        formData.append('category_id', chosenCat);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await complaintService.submit(formData);

      if (res.isDuplicate) {
        setDuplicateAlert(res);
        addToast(res.message, 'info', 6000);
      } else {
        addToast('Complaint submitted and routed successfully!', 'success');
        navigate('/complaints');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill samples for quick testing
  const fillSample = (type) => {
    if (type === 'duplicate') {
      setTitle('Internet connection down in Lab 4');
      setDescription('Cannot ping server or connect to internet from computer lab 4 during class.');
      setCampusLocation('Tech Tower');
      setRoomNumber('Lab 4');
    } else if (type === 'projector') {
      setTitle('Projector red light blinking in Classroom 102');
      setDescription('Projector turns off automatically after 2 minutes. Need technician before lecture.');
      setCampusLocation('Academic Block A');
      setRoomNumber('Classroom 102');
    } else if (type === 'water') {
      setTitle('Water tap leaking heavily in 1st floor washroom');
      setDescription('Water is overflowing from basin and spilling onto the floor.');
      setCampusLocation('Science Wing');
      setRoomNumber('Washroom 1F');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-brand-600" />
          <span>Report Campus Issue</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit equipment, electrical, plumbing, or network problems. Our system automatically categorizes, prioritizes, and routes the ticket to the responsible department.
        </p>
      </div>

      {/* Quick Test Demo Samples Bar */}
      <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-brand-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Quick Fill Demo Presets:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillSample('duplicate')}
            className="px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:text-brand-600 border border-slate-200 font-semibold transition shadow-sm"
          >
            Duplicate Test (Lab 4 Wi-Fi)
          </button>
          <button
            type="button"
            onClick={() => fillSample('projector')}
            className="px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:text-brand-600 border border-slate-200 font-semibold transition shadow-sm"
          >
            Projector Issue
          </button>
          <button
            type="button"
            onClick={() => fillSample('water')}
            className="px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:text-brand-600 border border-slate-200 font-semibold transition shadow-sm"
          >
            Plumbing Leakage
          </button>
        </div>
      </div>

      {/* Duplicate Incident Alert Banner (if duplicate matched) */}
      {duplicateAlert && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
            <Users className="w-5 h-5 text-amber-600" />
            <span>Smart Duplicate Incident Detection</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {duplicateAlert.message}
          </p>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs space-y-1">
            <div className="font-bold text-slate-800">
              Master Incident #{duplicateAlert.masterComplaint?.complaint_number}: {duplicateAlert.masterComplaint?.title}
            </div>
            <div className="text-[11px] text-slate-500">
              Status: <span className="font-semibold text-brand-600">{duplicateAlert.masterComplaint?.status}</span> • Total {duplicateAlert.masterComplaint?.affected_student_count} reports merged
            </div>
          </div>
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={() => navigate('/complaints')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <span>View My Linked Complaints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDuplicateAlert(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Complaint Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wi-Fi router keeps disconnecting in Lab 4"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Location & Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Campus Building / Location *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Room / Laboratory Number *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Lab 4, Classroom 203, Washroom 2F"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Category with Auto-Suggestion helper */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Issue Category
            </label>
            {suggestion && (
              <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-brand-200">
                <Sparkles className="w-3 h-3 text-brand-600" />
                <span>Auto-Suggested: {suggestion.name}</span>
              </span>
            )}
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          >
            <option value="">Auto-Detect Category from Description</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {suggestion && !categoryId && (
            <p className="text-[11px] text-slate-400 mt-1">
              Based on keywords in your title, our engine will automatically categorize this under <strong className="text-slate-600">{suggestion.name}</strong>.
            </p>
          )}
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Detailed Problem Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the issue clearly (e.g. Wi-Fi drops connection every 5 minutes, speed is below 1 Mbps, affects 15 students during practical session)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition leading-relaxed"
          />
        </div>

        {/* Optional Image Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Photo Attachment (Optional)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-brand-50/20 transition">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-700">Click to upload photo evidence</span>
              <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WEBP up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {previewUrl && (
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Automatic duplicate check will run upon submission</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/25 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting & Routing...' : 'Submit Campus Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}

