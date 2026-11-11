// @ts-nocheck
import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Target,
  ArrowRight,
  CheckCircle,
  Plus,
  Sparkles,
} from 'lucide-react';

export function CarbonHealthView({ onAddReading }) {
  const [activeTab, setActiveTab] = useState('reports');
  const [activeInterval, setActiveInterval] = useState('Week');
  const [selectedMonth, setSelectedMonth] = useState('Oct 2026');

  // Multi-week trend rows (Exact match to Image 9 in Pink & Royal Gold)
  const trendRows = [
    { window: '10/10 – 10/16', inRange: '36.9%', below: '4.7%', urgLows: 1, avgBg: '108.1', cgm: '41.6', highlight: true },
    { window: '10/03 – 10/09', inRange: '93.2%', below: '5.6%', urgLows: 1, avgBg: '102.8', cgm: '99.9', highlight: false },
    { window: '09/27 – 10/02', inRange: '88.2%', below: '6.6%', urgLows: 0, avgBg: '111.0', cgm: '98.7', highlight: false },
    { window: '09/20 – 09/26', inRange: '87.7%', below: '8.8%', urgLows: 2, avgBg: '106.4', cgm: '98.7', highlight: true },
    { window: '09/13 – 09/19', inRange: '86.7%', below: '3.3%', urgLows: 0, avgBg: '123.7', cgm: '96.9', highlight: false },
    { window: '09/06 – 09/12', inRange: '91.1%', below: '7.8%', urgLows: 2, avgBg: '105.6', cgm: '99.9', highlight: true },
  ];

  return (
    <div className="bg-[#0b0d14] border border-amber-500/25 rounded-3xl shadow-2xl overflow-hidden font-sans text-slate-100">
      {/* Mac Browser Header Bar (Image 9 style in Obsidian & Gold) */}
      <div className="bg-[#07080c] border-b border-amber-500/20 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <span className="ml-3 text-xs font-mono font-bold text-slate-400">
            Carbon Health Provider Portal · <span className="text-amber-300">provider.carbonhealth.com</span>
          </span>
        </div>
        <div className="text-xs text-pink-400 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          Clinical Mode · Bolla Bhargavi
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Title and Provider Tabs (Image 9 style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#121522] border border-amber-500/30 flex items-center justify-center text-amber-300">
              <ChevronLeft className="w-5 h-5 cursor-pointer" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent tracking-tight">
                Blood Glucose
              </h2>
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Clinical Trends Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400/30'
                  : 'bg-[#121522] text-slate-400 hover:text-amber-300 border border-amber-500/20'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Reports (1)</span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3.5 py-2 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'goals'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400/30'
                  : 'bg-[#121522] text-slate-400 hover:text-amber-300 border border-amber-500/20'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-300" />
              <span>Goals</span>
            </button>
            <button
              onClick={() => onAddReading()}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-900/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Log Reading</span>
            </button>
          </div>
        </div>

        {activeTab === 'reports' && (
          <>
            {/* Filter Toolbar (Image 9 style in Obsidian & Gold) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#10131f] p-3.5 rounded-2xl border border-amber-500/25 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-black text-amber-300 uppercase tracking-wider text-[11px]">Trends:</span>
                <div className="flex items-center gap-2 bg-[#07080c] border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-mono font-bold text-amber-200">10/01/2026</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="font-mono font-bold text-amber-200">10/15/2026</span>
                </div>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#07080c] border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="Oct 2026">Jump to Oct 2026</option>
                  <option value="Sep 2026">Jump to Sep 2026</option>
                </select>
              </div>

              <div className="flex items-center bg-[#07080c] border border-amber-500/30 rounded-xl p-1 font-bold">
                {['Day', 'Week', 'Month'].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setActiveInterval(interval)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      activeInterval === interval
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Trends Table (Exact match to Image 9 in Pink & Royal Gold) */}
            <div className="overflow-x-auto border border-amber-500/25 rounded-2xl bg-[#10131f] shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e111c] border-b border-amber-500/20 text-amber-300 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Time Window</th>
                    <th className="py-3.5 px-4">Time in Range</th>
                    <th className="py-3.5 px-4">Time below Range</th>
                    <th className="py-3.5 px-4">Urg Lows</th>
                    <th className="py-3.5 px-4">Avg BG</th>
                    <th className="py-3.5 px-4">% Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10 font-medium">
                  {trendRows.map((row, i) => (
                    <tr
                      key={i}
                      className={`transition-colors ${
                        row.highlight
                          ? 'bg-pink-950/20 hover:bg-pink-950/30 border-l-2 border-l-pink-500'
                          : 'bg-[#10131f] hover:bg-[#151928]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{row.window}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-black ${row.highlight ? 'text-pink-400' : 'text-amber-300'}`}>
                          {row.inRange}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{row.below}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                            row.urgLows > 0
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.urgLows}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-200">{row.avgBg} mg/dL</td>
                      <td className="py-3.5 px-4 text-slate-400 font-semibold">{row.cgm}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Patient Glycemic Goals & Targets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 bg-[#10131f] border border-amber-500/30 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-200">Fasting Glucose</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">70 – 100 mg/dL</div>
                <p className="text-slate-400 mt-1">Current average: 84 mg/dL (On Track)</p>
              </div>

              <div className="p-5 bg-[#10131f] border border-pink-500/30 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-pink-200">Post-Meal Glucose</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-pink-300">&lt; 140 mg/dL</div>
                <p className="text-slate-400 mt-1">Measured 2 hrs post breakfast, lunch, dinner</p>
              </div>

              <div className="p-5 bg-[#10131f] border border-amber-500/30 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-200">Target Time in Range</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">&gt; 70%</div>
                <p className="text-slate-400 mt-1">Achieved: 89% in clinical target</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
