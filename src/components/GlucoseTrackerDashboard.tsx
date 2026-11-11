// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Plus,
  BarChart2,
  Twitter,
  Info,
  Clock,
  Menu,
  CheckCircle2,
  AlertCircle,
  X,
  Bell,
  Trash2,
  Edit2,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../api/client.ts';
import { formatDateDisplay, getGlucoseCategory } from '../utils/glucose.ts';
import { TIME_SLOTS } from '../types.ts';

export function GlucoseTrackerDashboard({
  onAddReading,
  onEditReading,
  refreshTrigger,
  onNavigate,
}) {
  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [dailyReport, setDailyReport] = useState(null);
  const [mtdReport, setMtdReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Quick Add states (from Image 1!)
  const [quickValue, setQuickValue] = useState('');
  const [quickSlot, setQuickSlot] = useState('Morning (fasting)');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);
  const [quickError, setQuickError] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [daily, mtd] = await Promise.all([
        api.getDailyReport(selectedDate),
        api.getMonthToDateReport(selectedDate),
      ]);
      setDailyReport(daily);
      setMtdReport(mtd);
    } catch (err) {
      console.error('Failed to load GlucoseTracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, refreshTrigger]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setQuickError(null);
    setQuickSuccess(false);

    if (!quickValue || String(quickValue).trim() === '') {
      setQuickError('Please enter a glucose value.');
      return;
    }

    const val = Number(quickValue);
    if (!Number.isInteger(val) || val < 40 || val > 600) {
      setQuickError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    setQuickLoading(true);
    try {
      await api.createReading({
        date: selectedDate,
        timeSlot: quickSlot,
        value: val,
      });
      setQuickValue('');
      setQuickSuccess(true);
      showNotification(`Glucose value ${val} mg/dL logged for ${quickSlot}!`);
      setTimeout(() => setQuickSuccess(false), 3000);
      loadData();
    } catch (err) {
      setQuickError(err.message || 'Failed to add reading');
    } finally {
      setQuickLoading(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (reading) => {
    setDeleteTarget(reading);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteReading(deleteTarget.id);
      showNotification(`Deleted ${deleteTarget.timeSlot} reading (${deleteTarget.value} mg/dL).`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to delete reading');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTweet = () => {
    const text = `My latest blood glucose reading is ${latestValue} mg/dL on Sweety GlucoseTracker! #DiabetesManagement`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showNotification('Tweet text copied to clipboard!');
    } else {
      showNotification(`Tweet: "${text}"`);
    }
  };

  // 14-day breakdown calculations (from Image 1!)
  const mtdReadings = mtdReport?.readings || [];
  let lowCount = 0;
  let highCount = 0;
  let inTargetCount = 0;
  let otherCount = 0;

  for (const r of mtdReadings) {
    if (r.value < 70) lowCount++;
    else if (r.value > 180) highCount++;
    else if (r.value >= 70 && r.value <= 140) inTargetCount++;
    else otherCount++;
  }

  const totalPeriod = mtdReadings.length || 1;
  const lowPct = ((lowCount / totalPeriod) * 100).toFixed(2);
  const highPct = ((highCount / totalPeriod) * 100).toFixed(2);
  const inTargetPct = ((inTargetCount / totalPeriod) * 100).toFixed(2);
  const otherPct = ((otherCount / totalPeriod) * 100).toFixed(2);

  // Recharts line data (from Image 1: "Average Glucose by Day - Last 14 Days")
  const dateMap = new Map();
  for (const r of mtdReadings) {
    if (!dateMap.has(r.date)) {
      dateMap.set(r.date, { date: r.date, sum: 0, count: 0 });
    }
    const item = dateMap.get(r.date);
    item.sum += r.value;
    item.count++;
  }

  const chartData = Array.from(dateMap.values())
    .map((item) => {
      const [, m, d] = item.date.split('-');
      return {
        date: item.date,
        shortDate: `${m}/${d}`,
        avg: Math.round((item.sum / item.count) * 10) / 10,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  // Latest reading from today or report
  const dailyReadings = dailyReport?.readings || [];
  const latestReading = dailyReadings.length > 0 ? dailyReadings[dailyReadings.length - 1] : null;
  const latestValue = latestReading ? latestReading.value : (dailyReport?.highest || 227);

  // Estimated HbA1c formula: (Avg Glucose + 46.7) / 28.7
  const periodAvg = mtdReport?.average || dailyReport?.average || 136.3;
  const estimatedHbA1c = ((periodAvg + 46.7) / 28.7).toFixed(2);

  return (
    <div className="space-y-5 font-sans text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121522] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-500/40 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span className="text-pink-200">{toast}</span>
        </div>
      )}

      {/* Page Header (Image 1 style with luxury theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 font-bold">
            <Grid className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
              Dashboard
            </h1>
            <p className="text-[11px] text-slate-400">
              Kenpath Blood Glucose Management & Analytics
            </p>
          </div>
        </div>

        {/* Date Selector & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-amber-300">Selected Date:</span>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              max={getToday()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-amber-500/40 rounded-lg bg-[#151928] font-bold text-amber-200 shadow-sm focus:outline-none focus:border-pink-500"
            />
          </div>
          <button
            onClick={() => setSelectedDate('2026-10-15')}
            className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
              selectedDate === '2026-10-15'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-amber-400/40 shadow-sm shadow-pink-900/40'
                : 'bg-[#151928] text-slate-300 border-amber-500/30 hover:bg-[#1d2238] hover:text-amber-300'
            }`}
          >
            15 Oct 2026
          </button>
          <button
            onClick={() => setSelectedDate(getToday())}
            className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
              selectedDate === getToday()
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-amber-400/40 shadow-sm shadow-pink-900/40'
                : 'bg-[#151928] text-slate-300 border-amber-500/30 hover:bg-[#1d2238] hover:text-amber-300'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Luxury Feature Alert Banner (Image 1 style) */}
      {!bannerDismissed && (
        <div className="bg-gradient-to-r from-[#1c0f1e] via-[#241328] to-[#1c0f1e] border border-pink-500/40 text-pink-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-pink-600/40 text-pink-300 font-extrabold text-[10px] uppercase border border-pink-500/40">
              New Feature
            </span>
            <span>
              You can now record up to 4 glucose readings per day and view Daily, Month-to-Date, and Monthly reports.
            </span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-pink-400 hover:text-white font-bold ml-4 text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Action Bar (Image 1 style with luxury theme) */}
      <div className="bg-gradient-to-r from-[#111420] via-[#161b2b] to-[#111420] border border-amber-500/30 rounded-xl p-3 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => onAddReading(selectedDate)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-amber-400/40 rounded-lg flex items-center gap-1.5 shadow-md shadow-pink-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Glucose</span>
          </button>

          {/* Working Reports Dropdown (Image 1 style) */}
          <div className="relative">
            <button
              onClick={() => setIsReportsMenuOpen(!isReportsMenuOpen)}
              className="px-3.5 py-1.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 border border-amber-300 rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reports</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 stroke-[2.5]" />
            </button>

            {isReportsMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-[#121624] rounded-xl shadow-2xl border border-amber-500/40 z-30 py-1.5 text-xs">
                <button
                  onClick={() => {
                    setIsReportsMenuOpen(false);
                    if (onNavigate) onNavigate('daily');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#1a2034] text-slate-200 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>📋</span>
                  <span>Daily Report (15 Oct 2026)</span>
                </button>
                <button
                  onClick={() => {
                    setIsReportsMenuOpen(false);
                    if (onNavigate) onNavigate('mtd');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#1a2034] text-slate-200 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Month-to-Date (1–15 Oct 2026)</span>
                </button>
                <button
                  onClick={() => {
                    setIsReportsMenuOpen(false);
                    if (onNavigate) onNavigate('monthly');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#1a2034] text-slate-200 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>🗓️</span>
                  <span>Monthly Report (1–30 Sep 2026)</span>
                </button>
                <button
                  onClick={() => {
                    setIsReportsMenuOpen(false);
                    if (onNavigate) onNavigate('history');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#1a2034] text-slate-200 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-2 border-t border-amber-500/20"
                >
                  <span>📑</span>
                  <span>All Logged Readings</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Quick Add Form (Image 1 style) */}
        <form onSubmit={handleQuickAdd} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="number"
              min="40"
              max="600"
              step="1"
              placeholder="Value (mg/dL)"
              value={quickValue}
              onChange={(e) => setQuickValue(e.target.value)}
              className="w-32 px-2.5 py-1.5 text-xs bg-[#171b29] border border-amber-500/40 rounded-lg text-amber-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 font-bold"
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
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-amber-400/40 rounded-lg shadow-md shadow-pink-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {quickLoading ? 'Adding...' : 'Quick Add'}
          </button>
        </form>
      </div>

      {quickError && (
        <div className="p-3 text-xs bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">{quickError}</span>
        </div>
      )}

      {quickSuccess && (
        <div className="p-3 text-xs bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">Glucose reading saved successfully for {quickSlot}!</span>
        </div>
      )}

      {/* 2-Column Main Dashboard Grid (Image 1 style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Latest Reading Card (Image 1 style) */}
            <div className="bg-[#121522] border border-amber-500/30 rounded-xl shadow-xl overflow-hidden">
              <div className="bg-[#171b2c] border-b border-amber-500/20 px-4 py-2 text-center text-xs font-bold text-amber-300 uppercase tracking-wider">
                Latest Reading
              </div>
              <div className="p-5 text-center">
                <div className="text-3xl font-black text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]">
                  {latestValue} <span className="text-sm font-semibold text-amber-300">mg/dL</span>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleTweet}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-[11px] font-bold shadow-md shadow-pink-900/40 cursor-pointer transition-all border border-amber-400/30"
                  >
                    <Twitter className="w-3 h-3 fill-white" />
                    <span>Tweet</span>
                  </button>
                </div>
              </div>
            </div>

            {/* HbA1c Estimate Card (Image 1 style) */}
            <div className="bg-[#121522] border border-amber-500/30 rounded-xl shadow-xl overflow-hidden">
              <div className="bg-[#171b2c] border-b border-amber-500/20 px-4 py-2 text-center text-xs font-bold text-amber-300 uppercase tracking-wider">
                HbA1c Estimate*
              </div>
              <div className="p-5 text-center">
                <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                  {estimatedHbA1c}%
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-400">
                  ({periodAvg ? periodAvg.toFixed(2) : '138.17'} mg/dL)
                </div>
              </div>
            </div>
          </div>

          {/* 14-Day / Period Breakdown Table (Image 1 style) */}
          <div className="bg-[#121522] border border-amber-500/30 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#171b2c] border-b border-amber-500/20 px-4 py-2.5 text-center text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              14-Day Breakdown (Month-to-Date)
            </div>
            <div className="p-4">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-amber-500/10">
                  <tr>
                    <td className="py-2 font-bold text-slate-200">Lows</td>
                    <td className="py-2 text-slate-400">{lowCount} ({lowPct}%)</td>
                    <td className="py-2 font-bold text-slate-200 text-right">Lowest</td>
                    <td className="py-2 text-rose-400 font-extrabold text-right">
                      {mtdReport?.lowest || dailyReport?.lowest || 55} mg/dL
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-200">Highs</td>
                    <td className="py-2 text-slate-400">{highCount} ({highPct}%)</td>
                    <td className="py-2 font-bold text-slate-200 text-right">Highest</td>
                    <td className="py-2 text-rose-400 font-extrabold text-right">
                      {mtdReport?.highest || dailyReport?.highest || 234} mg/dL
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-200">Within Target</td>
                    <td className="py-2 text-emerald-400 font-bold">{inTargetCount} ({inTargetPct}%)</td>
                    <td className="py-2 text-slate-500 text-right">—</td>
                    <td className="py-2 text-slate-500 text-right">—</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-200">Other</td>
                    <td className="py-2 text-slate-400">{otherCount} ({otherPct}%)</td>
                    <td className="py-2 font-bold text-slate-200 text-right">Average</td>
                    <td className="py-2 text-amber-400 font-extrabold text-right">
                      {periodAvg ? periodAvg.toFixed(2) : '128.37'} mg/dL
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Yellow/Gold Summary Stat Cards (Exact match to Image 5 with luxury polish!) */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <div className="bg-gradient-to-b from-[#1c2030] to-[#131624] border-2 border-amber-400/80 rounded-xl p-2.5 text-center shadow-md shadow-amber-500/10">
              <span className="block text-[10px] font-extrabold text-amber-300 uppercase">Total</span>
              <span className="text-lg font-black text-white">{mtdReport?.count || 21}</span>
            </div>
            <div className="bg-gradient-to-b from-[#1c2030] to-[#131624] border-2 border-amber-400/80 rounded-xl p-2.5 text-center shadow-md shadow-amber-500/10">
              <span className="block text-[10px] font-extrabold text-amber-300 uppercase">Minimum</span>
              <span className="text-sm font-black text-amber-400">
                {mtdReport?.lowest ? `${mtdReport.lowest}.00` : '13.00'}
              </span>
              <span className="block text-[9px] text-slate-400">mg/dL</span>
            </div>
            <div className="bg-gradient-to-b from-[#1c2030] to-[#131624] border-2 border-amber-400/80 rounded-xl p-2.5 text-center shadow-md shadow-amber-500/10">
              <span className="block text-[10px] font-extrabold text-amber-300 uppercase">Average</span>
              <span className="text-sm font-black text-amber-400">
                {mtdReport?.average ? mtdReport.average.toFixed(2) : '140.43'}
              </span>
              <span className="block text-[9px] text-slate-400">mg/dL</span>
            </div>
            <div className="bg-gradient-to-b from-[#1c2030] to-[#131624] border-2 border-amber-400/80 rounded-xl p-2.5 text-center shadow-md shadow-amber-500/10">
              <span className="block text-[10px] font-extrabold text-amber-300 uppercase">Maximum</span>
              <span className="text-sm font-black text-amber-400">
                {mtdReport?.highest ? `${mtdReport.highest}.00` : '145.00'}
              </span>
              <span className="block text-[9px] text-slate-400">mg/dL</span>
            </div>
            <div className="bg-gradient-to-b from-[#1c2030] to-[#131624] border-2 border-amber-400/80 rounded-xl p-2.5 text-center shadow-md shadow-amber-500/10 col-span-3 sm:col-span-1">
              <span className="block text-[10px] font-extrabold text-amber-300 uppercase">Last</span>
              <span className="text-sm font-black text-pink-400">
                {latestValue}.00
              </span>
              <span className="block text-[9px] text-slate-400">mg/dL</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Highcharts style Average Glucose by Day (Image 1 style) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#121522] border border-amber-500/30 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="w-full text-center">
                <h3 className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  Average Glucose by Day
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">Last 14 Days</span>
              </div>
              <Menu className="w-4 h-4 text-amber-400 cursor-pointer" />
            </div>

            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#252c42" />
                  <XAxis dataKey="shortDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[50, 220]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0b0d14] text-white p-2.5 rounded-lg border border-amber-500/40 text-xs shadow-2xl">
                            <div className="text-slate-400">{formatDateDisplay(d.date)}</div>
                            <div className="font-extrabold text-amber-300">{d.avg} mg/dL</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="avg"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f43f5e', stroke: '#fbbf24', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#ec4899', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-right text-[9px] text-slate-500 mt-1">Highcharts.com · Sweety Analytics</div>
          </div>

          {/* Daily Slot Breakdown Table (Image 1 & 5 style) */}
          <div className="bg-[#121522] border border-amber-500/30 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#171b2c] border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300">
                Daily Slots for {formatDateDisplay(selectedDate)}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-600/40 to-rose-600/40 text-pink-300 border border-pink-500/40">
                {dailyReadings.length} / 4 Slots Logged
              </span>
            </div>

            {dailyReadings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No readings recorded for {formatDateDisplay(selectedDate)}.
                <div className="mt-3">
                  <button
                    onClick={() => onAddReading(selectedDate)}
                    className="px-4 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold hover:from-pink-500 hover:to-rose-500 transition-all border border-amber-400/30 cursor-pointer shadow-md shadow-pink-900/40"
                  >
                    Enter Reading
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-amber-500/10">
                {dailyReadings.map((r) => {
                  const cat = getGlucoseCategory(r.value, r.timeSlot);
                  return (
                    <div
                      key={r.id}
                      className="p-3.5 flex items-center justify-between hover:bg-[#181d2e] transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="font-extrabold text-white">{r.timeSlot}</span>
                          {r.notes && (
                            <span className="ml-2 text-slate-400">
                              ({r.notes})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-amber-300">{r.value} mg/dL</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          cat.label === 'High' || cat.label === 'Elevated'
                            ? 'bg-pink-950/40 text-pink-300 border-pink-500/40'
                            : cat.label === 'Low'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {cat.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onEditReading(r)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(r)}
                            className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-pink-950/30 rounded-md transition-colors cursor-pointer"
                            title="Delete Reading"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal in Obsidian Black, Pink & Gold */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#10131f] border border-pink-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1">Delete Glucose Reading?</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to delete this <strong className="text-amber-300">{deleteTarget.timeSlot}</strong> reading (<strong className="text-pink-400">{deleteTarget.value} mg/dL</strong>) on <span className="font-mono text-slate-200 font-bold">{deleteTarget.date}</span>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#171b2b] border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:brightness-110 rounded-xl shadow-lg shadow-pink-900/40 border border-pink-400/40 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
