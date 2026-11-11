// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Printer,
  ArrowLeftRight,
  Download,
  Utensils,
  Sun,
  Coffee,
  Moon,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client.ts';

export function LilyLinkView({ onAddReading, refreshTrigger }) {
  const [selectedRange, setSelectedRange] = useState('7 Days');
  const [readings, setReadings] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterMode, setFilterMode] = useState('all'); // all, inRange, outRange
  const [toast, setToast] = useState(null);

  const weekLabels = [
    'October 9 to October 15, 2026',
    'October 2 to October 8, 2026',
    'September 24 to September 30, 2026',
  ];

  // Active meal card details (Image 2 style)
  const [activeMeal, setActiveMeal] = useState({
    title: 'Breakfast',
    mealName: 'Sourdough and strawberries',
    carbs: '36g Carbs',
    time: '15 Oct 2026 10:00 AM',
    notes: 'Feel full and energized, 2 hrs after oatmeal & berries',
    bloodSugar: 145,
    slot: 'After breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
  });

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        const res = await api.getReadings({ limit: 100 });
        setReadings(res.readings || []);
      } catch (err) {
        console.error('Failed to load LilyLink data:', err);
      }
    };
    fetchMatrixData();
  }, [refreshTrigger]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!readings || readings.length === 0) {
      showNotification('No readings available to export.');
      return;
    }

    const headers = 'ID,Date,TimeSlot,Value(mg/dL),Notes,CreatedAt\n';
    const rows = readings
      .map((r) => `"${r.id}","${r.date}","${r.timeSlot}",${r.value},"${r.notes || ''}","${r.createdAt}"`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lilylink_glucose_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Glucose logs exported as CSV!');
  };

  const handlePrevWeek = () => {
    setWeekOffset((prev) => (prev + 1) % weekLabels.length);
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => (prev - 1 + weekLabels.length) % weekLabels.length);
  };

  // Designated slots matching assignment
  const slots = [
    { key: 'Morning (fasting)', label: 'Fasting', icon: Sun, color: 'text-amber-600' },
    { key: 'After breakfast', label: 'Breakfast', icon: Coffee, color: 'text-orange-600' },
    { key: 'After lunch', label: 'Lunch', icon: Utensils, color: 'text-emerald-600' },
    { key: 'After dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-600' },
  ];

  // Calculate slot averages and in-range counts
  const slotStats = slots.map((s) => {
    let slotReadings = readings.filter((r) => r.timeSlot === s.key);
    if (filterMode === 'inRange') {
      slotReadings = slotReadings.filter((r) => r.value >= 70 && r.value <= 140);
    } else if (filterMode === 'outRange') {
      slotReadings = slotReadings.filter((r) => r.value < 70 || r.value > 140);
    }

    const count = slotReadings.length;
    const inRange = slotReadings.filter((r) => r.value >= 70 && r.value <= 140).length;
    const sum = slotReadings.reduce((acc, curr) => acc + curr.value, 0);
    const avg = count > 0 ? Math.round(sum / count) : 120;
    return {
      ...s,
      avg,
      inRange: `${inRange}/${count || 7}`,
      sampleValues: slotReadings.slice(0, 5).map((r) => r.value),
    };
  });

  return (
    <div className="bg-[#10131f] border border-amber-500/30 rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121522] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-amber-500/40 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span className="text-pink-200">{toast}</span>
        </div>
      )}

      {/* LilyLink Subheader */}
      <div className="bg-[#151928] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center font-black text-white shadow-md shadow-pink-900/50">
            LL
          </div>
          <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
            LilyLink
          </span>
          <span className="text-xs bg-pink-950/40 text-pink-300 px-3 py-0.5 rounded-full border border-pink-500/40 font-bold">
            Glucose Logs & Food Journal
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-amber-300 border-b-2 border-amber-400 pb-0.5 cursor-pointer">Patients</span>
          <span className="text-slate-400 hover:text-white cursor-pointer">Providers</span>
          <span className="text-slate-400 hover:text-white cursor-pointer">Subscription</span>
          <span className="text-slate-400 hover:text-white cursor-pointer">Payments</span>
        </div>
      </div>

      {/* Main Grid: Left Matrix Table + Right Meal Card */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Matrix Section (8 cols) */}
        <div className="xl:col-span-8 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white">Glucose Logs</h2>
              <div className="flex items-center gap-1.5 text-xs text-amber-200 bg-[#171b2b] border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                <ChevronLeft
                  onClick={handlePrevWeek}
                  className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors"
                />
                <span>{weekLabels[weekOffset]}</span>
                <ChevronRight
                  onClick={handleNextWeek}
                  className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilterMode((m) => (m === 'all' ? 'inRange' : m === 'inRange' ? 'outRange' : 'all'));
                  showNotification(`Filter: ${filterMode === 'all' ? 'In-Range Only' : filterMode === 'inRange' ? 'Out-of-Range Only' : 'All'}`);
                }}
                title="Toggle Filter"
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  filterMode !== 'all' ? 'bg-pink-950/40 text-pink-300 border-pink-500/40' : 'text-slate-400 hover:bg-[#1a1f30] border-amber-500/30'
                }`}
              >
                <Filter className="w-4 h-4 text-amber-300" />
              </button>
              <button
                onClick={handlePrint}
                title="Print Log"
                className="p-2 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-[#1a1f30] border border-amber-500/30 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
              </button>
              <button
                onClick={handleExportCSV}
                title="Export CSV"
                className="p-2 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-[#1a1f30] border border-amber-500/30 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
              </button>
              <button
                onClick={() => onAddReading()}
                className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-pink-900/40 border border-amber-400/40 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Meal/Glucose</span>
              </button>
            </div>
          </div>

          {/* Range Pills */}
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
            {['7 Days', '14 Days', '30 Days', 'All Time'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedRange(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedRange === tab
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border border-amber-400/40 shadow-sm shadow-pink-900/40'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-[#171b2b]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Matrix Breakdown Table */}
          <div className="overflow-x-auto bg-[#121522] rounded-xl border border-amber-500/30 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171b2c] border-b border-amber-500/20 text-amber-300 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Average</th>
                  <th className="py-3 px-4"># In Range</th>
                  <th className="py-3 px-4">Mon 22/3</th>
                  <th className="py-3 px-4">Tue 23/3</th>
                  <th className="py-3 px-4">Wed 24/3</th>
                  <th className="py-3 px-4">Thu 25/3</th>
                  <th className="py-3 px-4">Fri 26/3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10 font-medium">
                {slotStats.map((row) => (
                  <tr
                    key={row.key}
                    onClick={() =>
                      setActiveMeal({
                        title: row.label,
                        mealName:
                          row.label === 'Breakfast'
                            ? 'Sourdough and strawberries'
                            : row.label === 'Lunch'
                            ? 'Grilled chicken salad & quinoa'
                            : row.label === 'Dinner'
                            ? 'Baked salmon & asparagus'
                            : 'Fasting black coffee & lemon water',
                        carbs: row.label === 'Breakfast' ? '36g Carbs' : row.label === 'Lunch' ? '45g Carbs' : '28g Carbs',
                        time: '15 Oct 2026',
                        notes: 'Clinically in-target glucose stability post meal',
                        bloodSugar: typeof row.avg === 'number' ? row.avg : 120,
                        slot: row.key,
                        image:
                          row.label === 'Breakfast'
                            ? 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80'
                            : row.label === 'Lunch'
                            ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
                            : 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
                      })
                    }
                    className="hover:bg-[#181d2e] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-extrabold text-white">
                      <div className="flex items-center gap-2">
                        <row.icon className="w-4 h-4 text-amber-400" />
                        <span>{row.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-black text-amber-300">{row.avg} mg/dL</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{row.inRange}</td>
                    {row.sampleValues.concat([110, 145, 160, 130, 122]).slice(0, 5).map((val, idx) => {
                      const isHigh = val > 140;
                      const isLow = val < 70;
                      return (
                        <td
                          key={idx}
                          className={`py-3 px-4 font-black ${
                            isHigh
                              ? 'text-pink-400'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-slate-200'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-400">
            Click any row to inspect meal details, food photos, and glycemic target curve.
          </p>
        </div>

        {/* Right Meal Photo Card */}
        <div className="xl:col-span-4 bg-[#121522] rounded-xl border border-amber-500/30 shadow-xl overflow-hidden flex flex-col">
          {/* Card Title */}
          <div className="p-4 border-b border-amber-500/20 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">{activeMeal.title}</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-950/40 text-pink-300 border border-pink-500/40">
              {activeMeal.slot}
            </span>
          </div>

          {/* Meal Photo */}
          <div className="relative h-48 w-full overflow-hidden bg-slate-950">
            <img
              src={activeMeal.image}
              alt={activeMeal.mealName}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
              <h4 className="font-extrabold text-base text-white">{activeMeal.mealName}</h4>
              <div className="flex items-center justify-between text-xs text-slate-200 mt-1">
                <span>{activeMeal.time}</span>
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white border border-amber-400/30">
                  {activeMeal.carbs}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Blood Sugar Curve */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Notes</span>
              <p className="text-xs text-slate-300 mt-0.5">{activeMeal.notes}</p>
            </div>

            <div className="p-3 bg-[#171b2b] rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Blood Sugar</span>
                <span className="text-[11px] text-slate-400">After-Meal 1hr</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-amber-300">{activeMeal.bloodSugar}</span>
                <span className="text-xs font-semibold text-slate-400 ml-1">mg/dL</span>
              </div>
            </div>

            {/* Optimal Glucose Range Visual */}
            <div className="border border-amber-500/30 rounded-xl p-3 bg-[#171b2b]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Optimal Glucose Range</span>
                <span className="font-bold text-emerald-400">80 – 140 mg/dL</span>
              </div>
              <div className="h-2 w-full bg-[#10131f] rounded-full overflow-hidden border border-amber-500/20">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
