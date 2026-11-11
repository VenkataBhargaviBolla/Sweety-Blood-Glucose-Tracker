// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { DailyReportView } from './DailyReportView.tsx';
import { RangeReportView } from './RangeReportView.tsx';

export function DoctorPortal({ onAddReading, onEditReading }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [activeReportTab, setActiveReportTab] = useState('daily');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.getPatients();
        setPatients(res.patients || []);
        if (res.patients && res.patients.length > 0) {
          setSelectedPatientId(res.patients[0].id);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    fetchPatients();
  }, []);

  const currentPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="bg-[#121522] border border-amber-500/30 text-white p-6 rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-900/50">
              <Stethoscope className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">
                Doctor Clinician Portal
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Clinical review panel: monitor glycemic trends, average readings, and compliance across assigned patients.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="bg-[#121522] p-5 rounded-xl border border-amber-500/30 shadow-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
          Select Assigned Patient:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {patients.map((p) => {
            const isSelected = p.id === selectedPatientId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-pink-500 bg-pink-950/40 ring-1 ring-pink-500/50'
                    : 'border-slate-800 bg-[#161a29] hover:border-amber-500/40 hover:bg-[#1e2338]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <p className="text-[11px] text-slate-400">{p.email}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-300 bg-[#10131f] px-2 py-0.5 rounded-full border border-amber-500/30">
                  {p.readingsCount} logs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Report Tabs */}
      {currentPatient && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h3 className="text-sm font-bold text-slate-200">
              Viewing Clinical Reports for: <span className="text-amber-300 font-extrabold">{currentPatient.name}</span>
            </h3>
            <div className="flex items-center gap-1 bg-[#151928] p-1 rounded-xl text-xs border border-amber-500/30">
              <button
                onClick={() => setActiveReportTab('daily')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReportTab === 'daily'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm shadow-pink-900/40'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Daily Report
              </button>
              <button
                onClick={() => setActiveReportTab('mtd')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReportTab === 'mtd'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm shadow-pink-900/40'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Month-to-Date
              </button>
              <button
                onClick={() => setActiveReportTab('monthly')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReportTab === 'monthly'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm shadow-pink-900/40'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                Monthly (Prev)
              </button>
            </div>
          </div>

          {activeReportTab === 'daily' && (
            <DailyReportView
              patientId={selectedPatientId}
              onAddReading={onAddReading}
              onEditReading={onEditReading}
              refreshTrigger={0}
            />
          )}

          {activeReportTab === 'mtd' && (
            <RangeReportView
              type="mtd"
              patientId={selectedPatientId}
              refreshTrigger={0}
            />
          )}

          {activeReportTab === 'monthly' && (
            <RangeReportView
              type="monthly"
              patientId={selectedPatientId}
              refreshTrigger={0}
            />
          )}
        </div>
      )}
    </div>
  );
}
