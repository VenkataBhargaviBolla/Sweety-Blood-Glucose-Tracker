// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { api } from '../api/client.ts';
import { formatDateDisplay, formatDateRange } from '../utils/glucose.ts';

export function RangeReportView({
  type,
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
  const [slotFilter, setSlotFilter] = useState('all');

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      if (type === 'mtd') {
        const data = await api.getMonthToDateReport(selectedDate, patientId);
        setReport(data);
      } else {
        const data = await api.getMonthlyReport(selectedDate, patientId);
        setReport(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [type, selectedDate, patientId, refreshTrigger]);

  const chartReadings = report?.readings || [];
  const filteredReadings =
    slotFilter === 'all'
      ? chartReadings
      : chartReadings.filter((r) => r.timeSlot === slotFilter);

  const dateMap = new Map();
  for (const r of filteredReadings) {
    if (!dateMap.has(r.date)) {
      dateMap.set(r.date, { date: r.date, avg: 0, readings: [], count: 0 });
    }
    const item = dateMap.get(r.date);
    item.readings.push(r);
    item.count++;
  }

  const chartData = Array.from(dateMap.values())
    .map((item) => {
      const sum = item.readings.reduce((acc, curr) => acc + curr.value, 0);
      const avg = Math.round((sum / item.count) * 10) / 10;
      const fasting = item.readings.find((r) => r.timeSlot === 'Morning (fasting)')?.value ?? null;
      const breakfast = item.readings.find((r) => r.timeSlot === 'After breakfast')?.value ?? null;
      const lunch = item.readings.find((r) => r.timeSlot === 'After lunch')?.value ?? null;
      const dinner = item.readings.find((r) => r.timeSlot === 'After dinner')?.value ?? null;

      const [, m, d] = item.date.split('-');
      return {
        date: item.date,
        shortDate: `${parseInt(d, 10)}/${parseInt(m, 10)}`,
        avg,
        fasting,
        breakfast,
        lunch,
        dinner,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  let inTargetCount = 0;
  let elevatedCount = 0;
  let lowCount = 0;
  for (const r of chartReadings) {
    if (r.value < 70) lowCount++;
    else if (r.value <= 140) inTargetCount++;
    else elevatedCount++;
  }
  const totalCount = chartReadings.length || 1;
  const inTargetPct = Math.round((inTargetCount / totalCount) * 100);
  const elevatedPct = Math.round((elevatedCount / totalCount) * 100);
  const highPct = elevatedPct;
  const lowPct = Math.round((lowCount / totalCount) * 100);

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Date Filter Toolbar */}
      <div className="bg-[#121522] p-4 sm:p-5 rounded-xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 tracking-tight">
              {type === 'mtd' ? 'Month-to-Date Report' : 'Monthly Report (Previous Month)'}
            </h2>
            {report && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/40">
                {formatDateRange(report.startDate, report.endDate)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {type === 'mtd'
              ? 'Calculated from 1st of the month to your selected date.'
              : 'Calculated across the complete previous calendar month.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            Current Date
          </button>

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
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-slate-400 bg-[#121522] rounded-xl border border-amber-500/30">
          <div className="inline-block animate-spin text-amber-400 mb-2 text-xl">⌛</div>
          <p className="text-xs font-semibold text-amber-200">Aggregating report range metrics...</p>
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
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl">
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

            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl">
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
              <p className="text-[11px] text-slate-500 mt-1">Peak during range</p>
            </div>

            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl">
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
              <p className="text-[11px] text-slate-500 mt-1">Minimum during range</p>
            </div>

            <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Total Readings</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                  {report.count}
                </span>
                <span className="text-xs font-bold text-slate-400">readings</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Across range</p>
            </div>
          </div>

          {/* Time in Range Bar */}
          {report.count > 0 && (
            <div className="bg-[#121522] p-6 rounded-xl border border-amber-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-extrabold text-amber-300">Time in range</span>
                <Info className="w-4 h-4 text-amber-400" />
              </div>

              <div className="h-4 w-full bg-[#171b2a] rounded-full overflow-hidden flex border border-amber-500/20">
                {lowCount > 0 && (
                  <div
                    style={{ width: `${lowPct}%` }}
                    className="bg-[#f59e0b] flex items-center justify-center text-[10px] text-slate-950 font-black"
                  >
                    {lowPct}%
                  </div>
                )}
                {inTargetCount > 0 && (
                  <div
                    style={{ width: `${inTargetPct}%` }}
                    className="bg-[#10b981] flex items-center justify-center text-[10px] text-slate-950 font-black"
                  >
                    {inTargetPct}%
                  </div>
                )}
                {elevatedCount > 0 && (
                  <div
                    style={{ width: `${elevatedPct}%` }}
                    className="bg-[#f43f5e] flex items-center justify-center text-[10px] text-white font-black"
                  >
                    {highPct}%
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>Low (&lt;70): <strong className="text-amber-300">{lowCount}</strong> ({lowPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>In Range (70–140): <strong className="text-emerald-400">{inTargetCount}</strong> ({inTargetPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                  <span>High (&gt;140): <strong className="text-pink-400">{elevatedCount}</strong> ({elevatedPct}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Line Chart */}
          {report.count > 0 ? (
            <div className="bg-[#121522] p-6 rounded-xl border border-amber-500/30 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                    Average Glucose by Day
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daily trendline over {formatDateRange(report.startDate, report.endDate)}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#151928] p-1 rounded-lg text-xs border border-amber-500/30">
                  <button
                    onClick={() => setSlotFilter('all')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      slotFilter === 'all'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm shadow-pink-900/40'
                        : 'text-slate-300 hover:text-amber-300'
                    }`}
                  >
                    All Slots
                  </button>
                  <button
                    onClick={() => setSlotFilter('Morning (fasting)')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      slotFilter === 'Morning (fasting)'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm shadow-pink-900/40'
                        : 'text-slate-300 hover:text-amber-300'
                    }`}
                  >
                    Fasting
                  </button>
                  <button
                    onClick={() => setSlotFilter('After lunch')}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      slotFilter === 'After lunch'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm shadow-pink-900/40'
                        : 'text-slate-300 hover:text-amber-300'
                    }`}
                  >
                    After Lunch
                  </button>
                </div>
              </div>

              <div className="w-full min-w-0 h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#252c42" />
                    <ReferenceArea
                      y1={70}
                      y2={140}
                      fill="#10b981"
                      fillOpacity={0.08}
                      stroke="none"
                    />
                    <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.6} />
                    <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.6} />

                    <XAxis dataKey="shortDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[40, 260]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#0b0d14] text-white p-3 rounded-lg border border-amber-500/40 shadow-2xl text-xs space-y-1">
                              <div className="font-extrabold text-amber-300 border-b border-amber-500/20 pb-1">
                                {formatDateDisplay(data.date)}
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">Daily Average:</span>
                                <span className="font-bold text-amber-400">{data.avg} mg/dL</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#fbbf24"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#f43f5e', stroke: '#fbbf24', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-center gap-6 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-1 bg-[#fbbf24] rounded-full" />
                  <span>Daily Average Curve</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-2 bg-emerald-500/30 rounded-xs" />
                  <span>Clinical In-Range (70–140 mg/dL)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#121522] p-12 rounded-xl border border-amber-500/30 text-center shadow-xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#181d2e] flex items-center justify-center text-amber-400 mb-3 border border-amber-500/30">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">
                No Readings Found For This Range
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                There are no readings recorded between {formatDateRange(report.startDate, report.endDate)}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
