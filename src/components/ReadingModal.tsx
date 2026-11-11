// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '../api/client.ts';
import { TIME_SLOTS } from '../types.ts';

export function ReadingModal({
  isOpen,
  onClose,
  onSuccess,
  initialReading,
  defaultDate,
  defaultSlot,
}) {
  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getCurrentTimeFormatted = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [date, setDate] = useState(defaultDate || getToday());
  const [timeSlot, setTimeSlot] = useState(defaultSlot || 'Morning (fasting)');
  const [value, setValue] = useState('');
  const [timeString, setTimeString] = useState(getCurrentTimeFormatted());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialReading) {
      setDate(initialReading.date);
      setTimeSlot(initialReading.timeSlot);
      setValue(String(initialReading.value));
      setNotes(initialReading.notes || '');
      if (initialReading.createdAt) {
        setTimeString(new Date(initialReading.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } else {
      setDate(defaultDate || getToday());
      setTimeSlot(defaultSlot || 'Morning (fasting)');
      setValue('');
      setTimeString(getCurrentTimeFormatted());
      setNotes('');
    }
    setError(null);
    setConfirmDelete(false);
  }, [initialReading, defaultDate, defaultSlot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation 1: Value is required
    if (!value || String(value).trim() === '') {
      setError('Please enter a glucose value.');
      return;
    }

    // Validation 2: Value must be a whole number between 40 and 600
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 40 || parsed > 600) {
      setError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    // Validation 5: Date cannot be in the future
    const todayStr = getToday();
    if (date > todayStr) {
      setError('Date cannot be in the future.');
      return;
    }

    setLoading(true);

    try {
      if (initialReading) {
        const res = await api.updateReading(initialReading.id, {
          date,
          timeSlot,
          value: parsed,
          notes: notes.trim() || undefined,
        });
        onSuccess(res.reading);
      } else {
        const res = await api.createReading({
          date,
          timeSlot,
          value: parsed,
          notes: notes.trim() || undefined,
        });
        onSuccess(res.reading);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save glucose reading.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialReading) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteReading(initialReading.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete reading.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#10131f] rounded-2xl shadow-2xl border border-amber-500/40 w-full max-w-lg p-6 sm:p-8 relative">
        {/* Close 'X' Button (Image 13 style) */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-pink-400 transition-colors p-1 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 tracking-tight">
            {initialReading ? 'Edit Blood Glucose Reading' : 'Enter your Blood Glucose Reading'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Kenpath Clinical Data Entry</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 text-xs text-rose-300 bg-rose-950/50 border border-rose-500/50 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* In-Modal Delete Confirmation Box */}
        {confirmDelete && (
          <div className="mb-5 p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-center animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-white mb-1">Delete this reading?</h4>
            <p className="text-xs text-slate-300 mb-3">
              This will permanently remove the <strong className="text-amber-300">{timeSlot}</strong> reading ({value} mg/dL).
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-[#171b2b] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:brightness-110 rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 2x2 Grid Form (Exact match to Image 13!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Glucose */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                Blood Glucose
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="40"
                  max="600"
                  step="1"
                  required
                  placeholder="119"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-amber-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-black"
                />
                <span className="absolute right-3 text-xs text-amber-400 pointer-events-none font-bold">
                  mg/dL
                </span>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                Date
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  required
                  max={getToday()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-amber-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-bold"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                Time
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  placeholder="11:34 AM"
                  className="w-full px-3 py-2 text-sm text-slate-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-medium"
                />
              </div>
            </div>

            {/* Context / Slot Dropdown (Exact match to Image 13!) */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                Context (Time Slot)
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-medium"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot} className="bg-[#10131f] text-slate-200">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Meal Notes */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1.5">
              Meal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sourdough and strawberries, 2 hrs post meal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 placeholder-slate-500 font-medium"
            />
          </div>

          {/* Footer Buttons: DELETE (if editing), CANCEL and DONE */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-500/20">
            {initialReading ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={loading || deleting}
                className="px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Delete this reading"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || deleting}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#1a1f30] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || deleting}
                className="px-7 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-400 border border-amber-400/40 rounded-xl transition-all shadow-lg shadow-pink-900/50 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Done'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
