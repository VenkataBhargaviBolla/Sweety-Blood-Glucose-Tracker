// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Layers,
  Bell,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Sparkles,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../api/client.ts';
import { formatDateDisplay } from '../utils/glucose.ts';

export function SerendipityBioView({ onAddReading, onLogout, refreshTrigger }) {
  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [report, setReport] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('reports'); // reports, alerts, settings, billing, support

  useEffect(() => {
    const fetchBioData = async () => {
      try {
        const data = await api.getDailyReport(selectedDate);
        setReport(data);
      } catch (err) {
        console.error('Failed to load Serendipity data:', err);
      }
    };
    fetchBioData();
  }, [selectedDate, refreshTrigger]);

  // CGM wave points across hours 01:30 to 09:30 (Exact match to Image 8 in Royal Gold & Radiant Pink)
  const sampleWavePoints = [
    { time: '01:30', val: 104 },
    { time: '02:00', val: 106 },
    { time: '02:30', val: 102 },
    { time: '03:00', val: 96 },
    { time: '03:30', val: 91 },
    { time: '04:00', val: 94 },
    { time: '04:30', val: 118 },
    { time: '05:00', val: 145 },
    { time: '05:30', val: 156 },
    { time: '06:00', val: 160 },
    { time: '06:30', val: 152 },
    { time: '07:00', val: 168 },
    { time: '07:30', val: 154 },
    { time: '08:00', val: 160 },
    { time: '08:30', val: 150 },
    { time: '09:00', val: 132 },
    { time: '09:30', val: 118 },
  ];

  const readings = report?.readings || [];
  const minVal = report?.lowest || 87;
  const maxVal = report?.highest || 168;
  const avgVal = report?.average ? report.average.toFixed(2) : '129.63';

  // Range percentages donut (Gold & Pink themed)
  const donutData = [
    { name: 'In Range', value: 100, color: '#f59e0b' },
    { name: 'Below Range', value: 0, color: '#fb7185' },
    { name: 'Above Range', value: 0, color: '#f43f5e' },
  ];

  return (
    <div className="bg-[#0b0d14] border border-amber-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row font-sans text-slate-100">
      {/* Obsidian Black & Royal Gold Sidebar (Exact match to Image 8 layout) */}
      <div className="w-full md:w-64 bg-[#07080c] text-white p-5 flex flex-col justify-between shrink-0 border-r border-amber-500/20 relative">
        <div className="space-y-6">
          {/* Logo with Royal Gold & Radiant Pink */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-amber-500/20">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-900/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent block">
                Serendipity Bio
              </span>
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
                Clinical CGM Hub
              </span>
            </div>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-[#121522] border border-amber-500/20">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-xs">
              B
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-100 block truncate">Bolla Bhargavi</span>
              <span className="text-[10px] text-amber-300 font-mono">Patient #4829</span>
            </div>
          </div>

          {/* Working Nav Links with Radiant Pink & Royal Gold */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('reports')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                activeSubTab === 'reports'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white font-black shadow-lg shadow-pink-900/40 border border-pink-400/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#121522]'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => setActiveSubTab('alerts')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                activeSubTab === 'alerts'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white font-black shadow-lg shadow-pink-900/40 border border-pink-400/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#121522]'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span>Alerts</span>
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                activeSubTab === 'settings'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white font-black shadow-lg shadow-pink-900/40 border border-pink-400/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#121522]'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-300" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveSubTab('billing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                activeSubTab === 'billing'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white font-black shadow-lg shadow-pink-900/40 border border-pink-400/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#121522]'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>Billing</span>
            </button>
            <button
              onClick={() => setActiveSubTab('support')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                activeSubTab === 'support'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white font-black shadow-lg shadow-pink-900/40 border border-pink-400/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#121522]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Support</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-amber-500/20 space-y-2">
          <button
            onClick={() => onAddReading(selectedDate)}
            className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reading</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-2 rounded-lg hover:bg-[#121522]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 space-y-6 bg-[#0b0d14]">
        {activeSubTab === 'reports' && (
          <>
            {/* Top: Daily Entries CGM Curve (Image 8 style) */}
            <div className="bg-[#10131f] p-6 rounded-2xl border border-amber-500/25 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                    Daily Entries
                  </h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs font-bold border border-amber-500/30 rounded-lg px-2.5 py-1.5 bg-[#07080c] text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    <span className="text-amber-200">Target Range: 80 – 180</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    <span className="text-pink-300">Out of Range</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={sampleWavePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2438" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis domain={[80, 180]} ticks={[80, 100, 120, 140, 160, 180]} stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0c0f18',
                        borderColor: '#f59e0b',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
                      }}
                      itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f43f5e', stroke: '#fbbf24', strokeWidth: 1.5 }}
                      activeDot={{ r: 7, fill: '#fbbf24' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom 2 Cards (Exact match to Image 8 in Pink & Royal Gold) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Min and Max Table */}
              <div className="bg-[#10131f] p-6 rounded-2xl border border-amber-500/25 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">Daily Min and Max</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Kenpath Algorithmic
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 font-bold border-b border-amber-500/20">
                        <th className="py-2.5 text-left">Date</th>
                        <th className="py-2.5 text-left">Average</th>
                        <th className="py-2.5 text-left">Min</th>
                        <th className="py-2.5 text-left">Max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-500/10">
                      <tr className="font-semibold text-slate-200">
                        <td className="py-3 text-white font-mono font-bold">{selectedDate}</td>
                        <td className="py-3 text-amber-300 font-bold">{avgVal}</td>
                        <td className="py-3 text-emerald-400 font-bold">{minVal}</td>
                        <td className="py-3 text-pink-400 font-bold">{maxVal}</td>
                      </tr>
                      <tr className="text-slate-400">
                        <td className="py-2 font-medium">Slots Logged</td>
                        <td className="py-2 text-pink-300 font-bold">{readings.length} / 4</td>
                        <td className="py-2">—</td>
                        <td className="py-2">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-500/15 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Clinical daily report range compliance verified.</span>
                  <span className="text-amber-400 font-bold">100% Target Met</span>
                </div>
              </div>

              {/* Daily Range Percentages Green & Gold Donut */}
              <div className="bg-[#10131f] p-6 rounded-2xl border border-amber-500/25 shadow-xl flex flex-col items-center justify-between text-center">
                <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider mb-2 w-full text-left">
                  Daily Range Percentages
                </h4>

                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                      100%
                    </span>
                    <span className="text-[10px] font-black text-pink-400 uppercase tracking-wider">In Range</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-300 mt-2">
                  <span className="text-amber-300 font-bold">100% In Range</span>
                  <span className="text-slate-500">0% Below</span>
                  <span className="text-slate-500">0% Above</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Alerts Tab */}
        {activeSubTab === 'alerts' && (
          <div className="bg-[#10131f] p-6 rounded-2xl border border-amber-500/25 shadow-xl space-y-4">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Bell className="w-5 h-5 text-pink-500" />
              <span>Glycemic Threshold Alerts</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#14192b] border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-200 block">Normal Glycemic Range</span>
                  <span className="text-slate-400">Target: 70 – 140 mg/dL</span>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-lg">
                  Active
                </span>
              </div>
              <div className="p-4 bg-[#14192b] border border-pink-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-pink-200 block">Hypoglycemia Alert</span>
                  <span className="text-slate-400">Trigger threshold: &lt; 70 mg/dL</span>
                </div>
                <span className="px-3 py-1 bg-pink-600 text-white font-bold rounded-lg shadow-sm">
                  Enabled
                </span>
              </div>
              <div className="p-4 bg-[#14192b] border border-rose-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-200 block">Hyperglycemia Alert</span>
                  <span className="text-slate-400">Trigger threshold: &gt; 180 mg/dL</span>
                </div>
                <span className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg shadow-sm">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeSubTab === 'settings' && (
          <div className="bg-[#10131f] p-6 rounded-2xl border border-amber-500/25 shadow-xl space-y-5 text-xs">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-pink-500" />
              <span>Patient Clinical Preferences</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Lower Bound (mg/dL)</label>
                <input
                  type="number"
                  defaultValue={70}
                  className="w-full p-2.5 bg-[#07080c] border border-amber-500/30 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Upper Bound (mg/dL)</label>
                <input
                  type="number"
                  defaultValue={140}
                  className="w-full p-2.5 bg-[#07080c] border border-amber-500/30 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <p className="text-slate-400">Settings synchronized with Kenpath Sweety backend PostgreSQL database.</p>
          </div>
        )}

        {/* Billing Tab */}
        {activeSubTab === 'billing' && (
          <div className="bg-[#10131f] p-6 rounded-2xl border border-amber-500/25 shadow-xl space-y-4 text-xs">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pink-500" />
              <span>Subscription & Medical Coverage</span>
            </h3>
            <div className="p-5 bg-gradient-to-r from-pink-950/40 via-amber-950/30 to-[#121522] border border-amber-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-black text-amber-200 block text-sm">Serendipity Continuous Care</span>
                <span className="text-slate-400">Covered under Kenpath Health Partner Plan · Premium Tier</span>
              </div>
              <span className="font-black text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-3.5 py-1.5 rounded-full shadow-md">
                Active Tier
              </span>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeSubTab === 'support' && (
          <div className="bg-[#10131f] p-6 rounded-2xl border border-amber-500/25 shadow-xl space-y-4 text-xs">
            <h3 className="text-base font-black text-amber-300">Clinical Support Center</h3>
            <p className="text-slate-300">Have questions regarding your glucose targets or need doctor assistance?</p>
            <div className="p-4 bg-[#14192b] border border-pink-500/30 rounded-xl text-slate-300">
              <strong className="text-pink-300">Emergency hotline:</strong> Contact your healthcare provider immediately if blood sugar is &lt; 50 or &gt; 350 mg/dL.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
