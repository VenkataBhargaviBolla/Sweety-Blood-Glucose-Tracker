// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Sun,
  Coffee,
  Utensils,
  Moon,
  Info,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { formatDateDisplay, getGlucoseCategory } from '../utils/glucose.ts';

export function DailyReportView({
  onAddReading,
  onEditReading,
  patientId,
  refreshTrigger,
}) {
  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDailyReport = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDailyReport(date, patientId);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load daily report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReport(selectedDate);
  }, [selectedDate, patientId, refreshTrigger]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteClick = (reading) => {
    setDeleteTarget(reading);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteReading(deleteTarget.id);
      showToast(`Deleted ${deleteTarget.timeSlot} reading.`);
      setDeleteTarget(null);
      fetchDailyReport(selectedDate);
    } catch (err) {
      showToast(err.message || 'Failed to delete reading');
    } finally {
      setIsDeleting(false);
    }
  };

  const slotIcons = {
    'Morning (fasting)': <Sun className="w-4 h-4 text-amber-500" />,
    'After breakfast': <Coffee className="w-4 h-4 text-orange-500" />,
    'After lunch': <Utensils className="w-4 h-4 text-emerald-500" />,
    'After dinner': <Moon className="w-4 h-4 text-indigo-500" />,
  };

  // Time-in-range calculations for the day (from Image 11!)
  const readings = report?.readings || [];
  let lowCount = 0;
  let inRangeCount = 0;
  let highCount = 0;
  for (const r of readings) {
    if (r.value < 70) lowCount++;
    else if (r.value <= 140) inRangeCount++;
    else highCount++;
  }
  const totalSlots = readings.length || 1;
  const lowPct = Math.round((lowCount / totalSlots) * 100);
  const inRangePct = Math.round((inRangeCount / totalSlots) * 100);
  const highPct = Math.round((highCount / totalSlots) * 100);

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Date Filter Toolbar */}
      <div className="bg-[#121522] p-4 sm:p-5 rounded-xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 tracking-tight">
            Daily Report · Kenpath Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing glucose metrics and slot readings for {formatDateDisplay(selectedDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Presets */}
          <button
            onClick={() => setSelectedDate('2026-10-15')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              selectedDate === '2026-10-15'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-amber-400/40 shadow-sm shadow-pink-900/40'
                : 'bg-[#151928] text-slate-300 border-amber-500/30 hover:bg-[#1d2238] hover:text-amber-300'
            }`}
          >
            15 Oct 2026
          </button>
          <button
            onClick={() => setSelectedDate(getToday())}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              selectedDate === getToday()
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-amber-400/40 shadow-sm shadow-pink-900/40'
                : 'bg-[#151928] text-slate-300 border-amber-500/30 hover:bg-[#1d2238] hover:text-amber-300'
            }`}
          >
            Today
          </button>

          {/* Date Picker Input */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              max={getToday()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs font-bold border border-amber-500/40 rounded-lg bg-[#151928] text-amber-200 focus:outline-none focus:border-pink-500"
            />
          </div>

          <button
            onClick={() => onAddReading(selectedDate)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow-md shadow-pink-900/40 border border-amber-400/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Reading</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-slate-400 bg-[#121522] rounded-xl border border-amber-500/30">
          <div className="inline-block animate-spin text-amber-400 mb-2 text-xl">⌛</div>
          <p className="text-xs font-semibold text-amber-200">Calculating glucose statistics...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {!loading && report && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Glucose */}
            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl relative">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Average Glucose</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                  {report.average !== null ? report.average.toFixed(1) : '—'}
                </span>
                {report.average !== null && (
                  <span className="text-xs font-bold text-slate-400">mg/dL</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Rounded to 1 decimal</p>
            </div>

            {/* Highest Glucose / Maximum */}
            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl relative">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Highest Reading</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                  {report.highest !== null ? report.highest : '—'}
                </span>
                {report.highest !== null && (
                  <span className="text-xs font-bold text-slate-400">mg/dL</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.highest !== null ? getGlucoseCategory(report.highest).label : 'No readings'}
              </p>
            </div>

            {/* Lowest Glucose / Minimum */}
            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl relative">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Lowest Reading</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                  {report.lowest !== null ? report.lowest : '—'}
                </span>
                {report.lowest !== null && (
                  <span className="text-xs font-bold text-slate-400">mg/dL</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.lowest !== null ? getGlucoseCategory(report.lowest).label : 'No readings'}
              </p>
            </div>

            {/* Daily Slots Logged */}
            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl relative">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Daily Slots</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                  {report.count}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 4 max</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.count === 4 ? 'All 4 slots completed' : `${4 - report.count} slots remaining`}
              </p>
            </div>
          </div>

          {/* Time in Range Card */}
          {report.count > 0 && (
            <div className="bg-[#121522] p-6 rounded-xl border border-amber-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-extrabold text-amber-300">Time in range</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>

              {/* Segmented Progress Bar */}
              <div className="h-4 w-full bg-[#171b2a] rounded-full overflow-hidden flex border border-amber-500/20">
                {lowCount > 0 && (
                  <div
                    style={{ width: `${lowPct}%` }}
                    className="bg-[#f59e0b] flex items-center justify-center text-[10px] text-slate-950 font-black"
                  >
                    {lowPct}%
                  </div>
                )}
                {inRangeCount > 0 && (
                  <div
                    style={{ width: `${inRangePct}%` }}
                    className="bg-[#10b981] flex items-center justify-center text-[10px] text-slate-950 font-black"
                  >
                    {inRangePct}%
                  </div>
                )}
                {highCount > 0 && (
                  <div
                    style={{ width: `${highPct}%` }}
                    className="bg-[#f43f5e] flex items-center justify-center text-[10px] text-white font-black"
                  >
                    {highPct}%
                  </div>
                )}
              </div>

              {/* Legend Dots */}
              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>Low (&lt;70): <strong className="text-amber-300">{lowCount}</strong> ({lowPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>In Range (70–140): <strong className="text-emerald-400">{inRangeCount}</strong> ({inRangePct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                  <span>High (&gt;140): <strong className="text-pink-400">{highCount}</strong> ({highPct}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Daily Readings Breakdown Table */}
          <div className="bg-[#121522] rounded-xl border border-amber-500/30 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Readings for {formatDateDisplay(selectedDate)}
                </h3>
                <p className="text-xs text-slate-400">
                  Measured blood glucose values by designated slot
                </p>
              </div>
              <span className="text-xs font-bold text-pink-300 bg-pink-950/40 border border-pink-500/40 px-3 py-1 rounded-full">
                {readings.length} / 4 Recorded
              </span>
            </div>

            {readings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#181d2e] flex items-center justify-center text-amber-400 mb-3 border border-amber-500/30">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  No Readings Recorded for {formatDateDisplay(selectedDate)}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  No glucose measurements recorded for this date yet. You can record up to 4 readings per day across the designated time slots.
                </p>
                <button
                  onClick={() => onAddReading(selectedDate)}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-pink-900/40 border border-amber-400/40 cursor-pointer"
                >
                  Record Reading Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#171b2c] border-b border-amber-500/20 text-amber-300 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Glucose Value</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Meal Notes</th>
                      <th className="py-3 px-4">Recorded Time</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10">
                    {readings.map((r) => {
                      const cat = getGlucoseCategory(r.value, r.timeSlot);
                      return (
                        <tr key={r.id} className="hover:bg-[#181d2e] transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              {slotIcons[r.timeSlot]}
                              <span className="font-extrabold text-white">{r.timeSlot}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-base font-black text-amber-300">{r.value}</span>
                            <span className="ml-1 text-[11px] font-semibold text-slate-400">mg/dL</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              cat.label === 'High' || cat.label === 'Elevated'
                                ? 'bg-pink-950/40 text-pink-300 border-pink-500/40'
                                : cat.label === 'Low'
                                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {cat.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                            {r.notes || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => onEditReading(r)}
                                title="Edit"
                                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-[#1f253a] rounded-md transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(r)}
                                title="Delete Reading"
                                className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-[#2a1725] rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* In-App Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121522] border border-pink-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-pink-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* In-App Delete Confirmation Modal in Obsidian Black, Pink & Gold */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
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
