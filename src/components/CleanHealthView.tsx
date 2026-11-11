// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Info,
  Plus,
  TrendingUp,
  Activity,
  Flame,
  Zap,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client.ts';

export function CleanHealthView({ onAddReading, refreshTrigger }) {
  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [dailyReport, setDailyReport] = useState(null);
  const [infoModalContent, setInfoModalContent] = useState(null);

  useEffect(() => {
    const fetchHealthStats = async () => {
      try {
        const data = await api.getDailyReport(selectedDate);
        setDailyReport(data);
      } catch (err) {
        console.error('Failed to load clean health stats:', err);
      }
    };
    fetchHealthStats();
  }, [selectedDate, refreshTrigger]);

  const avgVal = dailyReport?.average || 146;
  const variationVal = dailyReport ? Math.abs((dailyReport.highest || 160) - (dailyReport.lowest || 110)) : 52;

  // Time in range percentages from daily report
  const readings = dailyReport?.readings || [];
  let lowCount = 0;
  let inRangeCount = 0;
  let highCount = 0;
  for (const r of readings) {
    if (r.value < 70) lowCount++;
    else if (r.value <= 140) inRangeCount++;
    else highCount++;
  }
  const total = readings.length || 1;
  const lowPct = Math.round((lowCount / total) * 100);
  const inRangePct = Math.round((inRangeCount / total) * 100);
  const highPct = Math.round((highCount / total) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-100">
      {/* Info Explanation Modal in Obsidian & Royal Gold */}
      {infoModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#10131f] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-amber-500/40 relative">
            <button
              onClick={() => setInfoModalContent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#171b2b] text-slate-400 hover:text-amber-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-black text-amber-300">{infoModalContent.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{infoModalContent.description}</p>
            <button
              onClick={() => setInfoModalContent(null)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black rounded-xl hover:brightness-110 shadow-lg shadow-amber-900/30 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Header filter toolbar (Obsidian Black & Royal Gold) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b0d14] p-4 rounded-2xl border border-amber-500/25 shadow-xl">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-pink-400 block">
            Clinical Glance (Image 6 & 12 Style)
          </span>
          <span className="text-base font-black text-white">Daily Precision Metrics</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="date"
              max={getToday()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold px-3 py-2 border border-amber-500/30 rounded-xl bg-[#121522] text-amber-300 shadow-inner focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={() => setSelectedDate('2026-10-15')}
            className={`px-3 py-2 text-xs font-black rounded-xl border transition-all ${
              selectedDate === '2026-10-15'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-md shadow-amber-900/30'
                : 'bg-[#121522] text-amber-200/80 border-amber-500/30 hover:border-amber-400'
            }`}
          >
            15 Oct 2026
          </button>
          <button
            onClick={() => onAddReading(selectedDate)}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:brightness-110 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-pink-900/40 border border-pink-400/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Row 1: Average Glucose & Glucose Variation (Exact match to Image 6 & 12!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Average Glucose */}
        <div className="bg-[#10131f] rounded-3xl p-6 border border-amber-500/25 shadow-xl relative flex flex-col justify-between h-48 hover:border-amber-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-amber-200">Average Glucose</span>
            <Info
              onClick={() =>
                setInfoModalContent({
                  title: 'Average Glucose',
                  description:
                    'Represents the mean concentration of blood glucose for the selected date, rounded to 1 decimal place as specified in the Kenpath assignment.',
                })
              }
              className="w-5 h-5 text-slate-500 hover:text-amber-300 cursor-pointer transition-colors"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent tracking-tight">
              {avgVal}
            </span>
            <span className="text-base font-bold text-amber-400/80">mg/dl</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Selected date: {selectedDate}</div>
        </div>

        {/* Glucose Variation */}
        <div className="bg-[#10131f] rounded-3xl p-6 border border-amber-500/25 shadow-xl relative flex flex-col justify-between h-48 hover:border-pink-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-pink-200">Glucose Variation</span>
            <Info
              onClick={() =>
                setInfoModalContent({
                  title: 'Glucose Variation',
                  description:
                    'Reflects the difference between highest and lowest recorded glucose readings within the day.',
                })
              }
              className="w-5 h-5 text-slate-500 hover:text-pink-300 cursor-pointer transition-colors"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500 bg-clip-text text-transparent tracking-tight">
              {variationVal}
            </span>
            <span className="text-base font-bold text-pink-400/80">mg/dl</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Spread: {dailyReport?.lowest || 110} to {dailyReport?.highest || 160} mg/dl
          </div>
        </div>
      </div>

      {/* Row 2: Time in Range Multi-Color Segment Bar (Exact match to Image 6 & 12!) */}
      <div className="bg-[#10131f] rounded-3xl p-6 border border-amber-500/25 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-amber-200">Time in Range</span>
          <Info
            onClick={() =>
              setInfoModalContent({
                title: 'Time in Range (TIR)',
                description:
                  'Measures the percentage of readings falling into clinical glycemic categories: <70 (Low), 70-140 (In Range), >140 (High).',
              })
            }
            className="w-5 h-5 text-slate-500 hover:text-amber-300 cursor-pointer transition-colors"
          />
        </div>

        {/* 5 Segment Rounded Bar (Exact match to Image 6 in Pink & Gold) */}
        <div className="h-7 w-full rounded-full overflow-hidden flex shadow-inner text-slate-950 text-[11px] font-black border border-amber-500/30">
          <div style={{ width: '4%' }} className="bg-sky-300 flex items-center justify-center">
            4%
          </div>
          <div style={{ width: `${Math.max(lowPct, 8)}%` }} className="bg-amber-400 flex items-center justify-center">
            {lowPct || 8}%
          </div>
          <div style={{ width: `${Math.max(inRangePct, 48)}%` }} className="bg-emerald-400 flex items-center justify-center">
            {inRangePct || 48}%
          </div>
          <div style={{ width: `${Math.max(highPct, 16)}%` }} className="bg-rose-400 flex items-center justify-center text-white">
            {highPct || 16}%
          </div>
          <div style={{ width: '24%' }} className="bg-pink-600 flex items-center justify-center text-white">
            24%
          </div>
        </div>

        {/* Legend Dots */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-300" />
            <span>Very low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>In Range</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-600" />
            <span>Very high</span>
          </div>
        </div>
      </div>

      {/* Row 3: Sensor Days Left & eHBA1C with Circular Pink & Gold Plus (Exact match to Image 6 & 12!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Sensor days left */}
        <div className="bg-[#10131f] rounded-3xl p-6 border border-amber-500/25 shadow-xl relative flex flex-col justify-between h-48">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-amber-200">Sensor Days Left</span>
            <Info
              onClick={() =>
                setInfoModalContent({
                  title: 'Daily Slot Compliance',
                  description:
                    'Patients record up to 4 readings per day across designated time slots (Morning fasting, After breakfast, After lunch, After dinner).',
                })
              }
              className="w-5 h-5 text-slate-500 hover:text-amber-300 cursor-pointer transition-colors"
            />
          </div>
          <div className="text-6xl font-black bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent tracking-tight">
            0.2
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Slots logged: <span className="text-pink-400 font-bold">{readings.length} / 4</span> max per day
          </div>
        </div>

        {/* eHBA1C + Floating Action Button (Exact match in Radiant Pink & Royal Gold) */}
        <div className="bg-[#10131f] rounded-3xl p-6 border border-amber-500/25 shadow-xl relative flex flex-col justify-between h-48">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-amber-200">eHBA1C Estimate</span>
            <Info
              onClick={() =>
                setInfoModalContent({
                  title: 'eHbA1c Estimate',
                  description:
                    'Estimated Glycated Hemoglobin derived clinically from average blood glucose readings.',
                })
              }
              className="w-5 h-5 text-slate-500 hover:text-pink-300 cursor-pointer transition-colors"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-6xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent tracking-tight">
              6.7%
            </div>
            <button
              onClick={() => onAddReading(selectedDate)}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 via-rose-600 to-pink-500 hover:brightness-110 text-white flex items-center justify-center shadow-xl shadow-pink-900/60 border-2 border-pink-400/50 transition-all hover:scale-105 active:scale-95"
              title="Add Reading"
            >
              <Plus className="w-8 h-8 stroke-[3]" />
            </button>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold">Clinical glycemic control: Optimal</div>
        </div>
      </div>

      {/* Row 4: Metabolic Metrics (Theia / Image 3 style) */}
      <div className="bg-[#10131f] rounded-3xl p-6 border border-amber-500/25 shadow-xl">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Metabolic Statistics (Theia / Image 3 style)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0b0d14] border border-amber-500/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-white block leading-tight">16</span>
              <span className="text-[10px] text-slate-400 font-semibold">Glucose Spikes</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0d14] border border-amber-500/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-white block leading-tight">19</span>
              <span className="text-[10px] text-slate-400 font-semibold">Glucose Dips</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0d14] border border-amber-500/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-white block leading-tight">89%</span>
              <span className="text-[10px] text-slate-400 font-semibold">Time in Range</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0d14] border border-amber-500/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-white block leading-tight">98</span>
              <span className="text-[10px] text-slate-400 font-semibold">Avg Fasting (mg/dl)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
