// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Coffee,
  Utensils,
  Moon,
  Layers,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { formatDateDisplay, getGlucoseCategory } from '../utils/glucose.ts';

export function ReadingsHistoryView({
  onAddReading,
  onEditReading,
  patientId,
  refreshTrigger,
}) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [selectedSlot, setSelectedSlot] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReadings = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await api.getReadings({
        page: targetPage,
        limit,
        date: filterDate || undefined,
        patientId,
      });
      setData(res);
      setPage(targetPage);
    } catch (err) {
      console.error('Failed to load readings history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings(1);
  }, [filterDate, patientId, refreshTrigger]);

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
      fetchReadings(page);
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

  const displayedReadings = (data?.readings || []).filter((r) =>
    selectedSlot === 'all' ? true : r.timeSlot === selectedSlot
  );

  return (
    <div className="space-y-5 font-sans text-slate-100">
      {/* Controls & Filter Bar */}
      <div className="bg-[#121522] p-4 sm:p-5 rounded-xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
              All Logged Readings
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-950/40 text-pink-300 border border-pink-500/40">
              {data?.total ?? 0} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full chronological archive with slot tags and clinical categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Slot filter */}
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-[#171b29] border border-amber-500/40 rounded-lg text-slate-200 focus:outline-none focus:border-pink-500"
          >
            <option value="all" className="bg-[#10131f]">All Time Slots</option>
            <option value="Morning (fasting)" className="bg-[#10131f]">Morning (fasting)</option>
            <option value="After breakfast" className="bg-[#10131f]">After breakfast</option>
            <option value="After lunch" className="bg-[#10131f]">After lunch</option>
            <option value="After dinner" className="bg-[#10131f]">After dinner</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#171b29] border border-amber-500/40 rounded-lg text-amber-200 focus:outline-none focus:border-pink-500"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs font-bold text-amber-300 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            onClick={() => onAddReading()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-400 text-white text-xs font-bold rounded-lg shadow-md shadow-pink-900/40 border border-amber-400/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reading</span>
          </button>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-[#121522] rounded-xl border border-amber-500/30 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin text-amber-400 mb-2 text-xl">⌛</div>
            <p className="text-xs font-semibold text-amber-200">Loading readings history...</p>
          </div>
        ) : displayedReadings.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 mx-auto text-amber-400/60 mb-2" />
            <h4 className="text-sm font-bold text-white">No Readings Found</h4>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              No matching readings were found for the selected filter.
            </p>
            <button
              onClick={() => onAddReading()}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold rounded-lg shadow-md shadow-pink-900/40 border border-amber-400/40 cursor-pointer"
            >
              Add Reading Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171b2c] border-b border-amber-500/20 text-amber-300 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Time Slot</th>
                  <th className="py-3 px-4 font-bold">Glucose Value</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Notes</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {displayedReadings.map((r) => {
                  const cat = getGlucoseCategory(r.value, r.timeSlot);
                  return (
                    <tr key={r.id} className="hover:bg-[#181d2e] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {formatDateDisplay(r.date)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {slotIcons[r.timeSlot]}
                          <span className="font-semibold text-slate-200">{r.timeSlot}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-base font-black text-amber-300">
                          {r.value}
                        </span>
                        <span className="ml-1 text-[10px] font-bold text-slate-400">mg/dL</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
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
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onEditReading(r)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-[#1f253a] rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(r)}
                            className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-[#2a1725] rounded-lg transition-colors cursor-pointer"
                            title="Delete Reading"
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

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-amber-500/20 flex items-center justify-between text-xs text-slate-300">
            <div>
              Showing page <strong className="text-amber-300">{data.page}</strong> of{' '}
              <strong className="text-amber-300">{data.totalPages}</strong> ({data.total} total)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchReadings(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-amber-500/30 hover:bg-[#181d2e] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-amber-300" />
              </button>
              <span className="px-3 py-1 font-bold text-white bg-pink-950/40 rounded-lg border border-pink-500/40">{page}</span>
              <button
                onClick={() => fetchReadings(page + 1)}
                disabled={page >= data.totalPages}
                className="p-1.5 rounded-lg border border-amber-500/30 hover:bg-[#181d2e] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        )}
      </div>

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
