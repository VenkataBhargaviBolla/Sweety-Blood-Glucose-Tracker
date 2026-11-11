// @ts-nocheck
import React, { useState } from 'react';
import {
  Droplet,
  Plus,
  LayoutDashboard,
  BarChart3,
  List,
  Stethoscope,
  LogOut,
  User,
  Database,
  Calendar,
} from 'lucide-react';
import { TIME_SLOTS } from '../types.ts';
import { api } from '../api/client.ts';

export function Navbar({
  user,
  onOpenAuth,
  onLogout,
  onOpenSeedModal,
  onOpenAddReading,
  onReadingAdded,
  activeTab,
  setActiveTab,
}) {
  const [quickValue, setQuickValue] = useState('');
  const [quickSlot, setQuickSlot] = useState('Morning (fasting)');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickToast, setQuickToast] = useState(null);

  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const val = Number(quickValue);
    if (!quickValue || isNaN(val) || val < 40 || val > 600) {
      setQuickToast({ type: 'error', text: 'Value must be between 40 and 600 mg/dl.' });
      setTimeout(() => setQuickToast(null), 3500);
      return;
    }

    setQuickLoading(true);
    try {
      await api.createReading({
        date: getToday(),
        timeSlot: quickSlot,
        value: val,
      });
      setQuickValue('');
      setQuickToast({ type: 'success', text: `Added ${quickSlot} reading (${val} mg/dL).` });
      setTimeout(() => setQuickToast(null), 3000);
      if (onReadingAdded) onReadingAdded();
    } catch (err) {
      setQuickToast({ type: 'error', text: err.message || 'Failed to add reading' });
      setTimeout(() => setQuickToast(null), 3500);
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div>
      {/* Obsidian Black & Royal Gold Top Header */}
      <header className="bg-[#0b0d14] text-white border-b border-amber-500/25 shadow-xl sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div
              onClick={() => setActiveTab('daily')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-md shadow-pink-900/50 group-hover:scale-105 transition-transform">
                <Droplet className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
                  Sweety
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-pink-400/90 -mt-1 hidden sm:inline uppercase">
                  Kenpath Glucose Tracker
                </span>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden lg:flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab('glucose-tracker')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'glucose-tracker'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>GlucoseTracker (Img 1)</span>
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'daily'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <span>Daily Report</span>
              </button>
              <button
                onClick={() => setActiveTab('mtd')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'mtd'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Month-to-Date</span>
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'monthly'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Monthly</span>
              </button>
              <button
                onClick={() => setActiveTab('lilylink')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'lilylink'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <span>LilyLink (Img 2)</span>
              </button>
              <button
                onClick={() => setActiveTab('serendipity')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'serendipity'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <span>Serendipity (Img 8)</span>
              </button>
              <button
                onClick={() => setActiveTab('clinical-cards')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'clinical-cards'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <span>Cards (Img 6 & 12)</span>
              </button>
              <button
                onClick={() => setActiveTab('carbon-provider')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'carbon-provider'
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40 font-bold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-[#151824]'
                }`}
              >
                <span>Provider (Img 9)</span>
              </button>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAddReading()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-amber-400/40 rounded-lg shadow-md shadow-pink-900/40 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Glucose</span>
              </button>

              <button
                onClick={onOpenSeedModal}
                title="Reset or load sample readings"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-[#161a28] hover:bg-[#1e2336] border border-amber-500/40 rounded-lg transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Data</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-amber-500/20">
                <span className="text-xs font-bold text-amber-300 hidden sm:inline flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  {user ? user.name : 'Bolla (Demo Patient)'}
                </span>
                <button
                  onClick={onLogout}
                  title="Switch or change account"
                  className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Add Toolbar (Obsidian Black, Pink & Royal Gold) */}
      <div className="bg-gradient-to-r from-[#0d0f17] via-[#121624] to-[#0d0f17] border-b border-amber-500/20 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddReading()}
              className="px-3.5 py-1.5 text-xs font-bold text-amber-300 bg-[#151928] hover:bg-[#1d2238] border border-amber-500/40 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Enter Glucose Reading</span>
            </button>
          </div>

          {/* Quick Input Bar (Image 1 style with luxury theme) */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                placeholder="Value (mg/dL)"
                value={quickValue}
                onChange={(e) => setQuickValue(e.target.value)}
                className="w-32 sm:w-36 px-2.5 py-1.5 text-xs bg-[#171b29] border border-amber-500/40 rounded-lg text-amber-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 font-bold"
              />
            </div>

            <select
              value={quickSlot}
              onChange={(e) => setQuickSlot(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#171b29] border border-amber-500/40 rounded-lg text-slate-200 focus:outline-none focus:border-pink-500 font-medium"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot} className="bg-[#121522] text-slate-200">
                  {slot}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={quickLoading}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-amber-400/40 rounded-lg transition-all shadow-md shadow-pink-900/40 cursor-pointer disabled:opacity-50"
            >
              {quickLoading ? 'Adding...' : 'Quick Add'}
            </button>
          </form>
        </div>

        {/* Quick Add In-App Notification */}
        {quickToast && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-500/20">
            <div className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center justify-between animate-in fade-in ${
              quickToast.type === 'error'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
            }`}>
              <span>{quickToast.text}</span>
              <button
                type="button"
                onClick={() => setQuickToast(null)}
                className="text-slate-400 hover:text-white text-xs ml-3"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
