// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Calendar,
  List,
  Stethoscope,
} from 'lucide-react';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ReadingModal } from './components/ReadingModal.tsx';
import { DailyReportView } from './components/DailyReportView.tsx';
import { RangeReportView } from './components/RangeReportView.tsx';
import { ReadingsHistoryView } from './components/ReadingsHistoryView.tsx';
import { DoctorPortal } from './components/DoctorPortal.tsx';
import { GlucoseTrackerDashboard } from './components/GlucoseTrackerDashboard.tsx';
import { LilyLinkView } from './components/LilyLinkView.tsx';
import { SerendipityBioView } from './components/SerendipityBioView.tsx';
import { CarbonHealthView } from './components/CarbonHealthView.tsx';
import { CleanHealthView } from './components/CleanHealthView.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { api, authStorage } from './api/client.ts';

const DEFAULT_USER = {
  id: 'demo-patient-001',
  name: 'Bolla (Demo Patient)',
  email: 'demo@kenpath.com',
  role: 'patient',
};

export default function App() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [activeTab, setActiveTab] = useState('glucose-tracker');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [readingDefaultDate, setReadingDefaultDate] = useState(undefined);
  const [readingDefaultSlot, setReadingDefaultSlot] = useState(undefined);

  // Trigger for refetching child components
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check or initialize auth on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authStorage.getToken();
        if (token) {
          try {
            const res = await api.getMe();
            if (res && res.user) {
              setUser(res.user);
              return;
            }
          } catch (meErr) {
            // Token expired; auto re-login
          }
        }

        // Auto login as demo patient so preview is instantly active
        try {
          const demoRes = await api.login('demo@kenpath.com', 'Password123!');
          authStorage.setToken(demoRes.token);
          setUser(demoRes.user);
        } catch (demoErr) {
          await api.seedDemo();
          const retryRes = await api.login('demo@kenpath.com', 'Password123!');
          authStorage.setToken(retryRes.token);
          setUser(retryRes.user);
        }
      } catch (err) {
        console.warn('Initial session init:', err);
      }
    };

    initAuth();
  }, []);

  const handleLogout = () => {
    setIsAuthOpen(true);
  };

  const handleOpenAddReading = (date, slot) => {
    setEditingReading(null);
    setReadingDefaultDate(date);
    setReadingDefaultSlot(slot);
    setIsReadingModalOpen(true);
  };

  const handleOpenEditReading = (reading) => {
    setEditingReading(reading);
    setIsReadingModalOpen(true);
  };

  const handleReadingSuccess = () => {
    setRefreshKey((k) => k + 1);
    showToast('Glucose reading saved successfully!');
  };

  const handleResetSeedData = async () => {
    try {
      const res = await api.seedDemo();
      setRefreshKey((k) => k + 1);
      showToast(`Sample data reset with ${res.readingsCount} readings.`);
    } catch (err) {
      showToast(err.message || 'Failed to seed database');
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans flex flex-col selection:bg-pink-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121522] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-amber-500/40 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-pink-200">{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navbar (Always Navigable) */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenSeedModal={handleResetSeedData}
        onOpenAddReading={() => handleOpenAddReading()}
        onReadingAdded={handleReadingSuccess}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Secondary Sub-Navigation / Image Views Switcher (Always Navigable!) */}
      <div className="bg-[#0e111a] border-b border-amber-500/20 py-2.5 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('glucose-tracker')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'glucose-tracker'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>GlucoseTracker (Img 1)</span>
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <span>Daily Report</span>
            </button>
            <button
              onClick={() => setActiveTab('mtd')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mtd'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Month-to-Date</span>
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Monthly Report</span>
            </button>
            <button
              onClick={() => setActiveTab('lilylink')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lilylink'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <span>LilyLink (Img 2)</span>
            </button>
            <button
              onClick={() => setActiveTab('serendipity')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'serendipity'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <span>Serendipity (Img 8)</span>
            </button>
            <button
              onClick={() => setActiveTab('clinical-cards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'clinical-cards'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <span>Cards (Img 6 & 12)</span>
            </button>
            <button
              onClick={() => setActiveTab('carbon-provider')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'carbon-provider'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <span>Provider (Img 9)</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5 text-amber-400" />
              <span>All Readings</span>
            </button>
            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'doctor'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 text-white shadow-md shadow-pink-900/40 border border-amber-400/40'
                  : 'bg-[#141724] text-slate-300 hover:text-amber-300 hover:bg-[#1b2030] border border-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
              <span>Doctor Portal</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs text-slate-400 whitespace-nowrap">
            <span>Viewing: <strong className="text-amber-300 font-bold">{user?.name || 'Bolla (Demo Patient)'}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area - All Pages Open Smoothly */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary key={activeTab} onReset={() => setActiveTab('glucose-tracker')}>
          {activeTab === 'glucose-tracker' && (
            <GlucoseTrackerDashboard
              onAddReading={handleOpenAddReading}
              onEditReading={handleOpenEditReading}
              refreshTrigger={refreshKey}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'daily' && (
            <DailyReportView
              onAddReading={handleOpenAddReading}
              onEditReading={handleOpenEditReading}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'mtd' && (
            <RangeReportView
              type="mtd"
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'monthly' && (
            <RangeReportView
              type="monthly"
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'lilylink' && (
            <LilyLinkView
              onAddReading={handleOpenAddReading}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'serendipity' && (
            <SerendipityBioView
              onAddReading={handleOpenAddReading}
              onLogout={handleLogout}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'clinical-cards' && (
            <CleanHealthView
              onAddReading={handleOpenAddReading}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'carbon-provider' && (
            <CarbonHealthView
              onAddReading={handleOpenAddReading}
            />
          )}

          {activeTab === 'history' && (
            <ReadingsHistoryView
              onAddReading={handleOpenAddReading}
              onEditReading={handleOpenEditReading}
              refreshTrigger={refreshKey}
            />
          )}

          {activeTab === 'doctor' && (
            <DoctorPortal
              onAddReading={handleOpenAddReading}
              onEditReading={handleOpenEditReading}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0c12] border-t border-amber-500/20 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              Sweety GlucoseTracker
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Kenpath Blood Glucose Management System</span>
          </div>
          <div className="text-[11px] font-semibold text-pink-400/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
            <span>PostgreSQL · Node.js Express · React.js</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          showToast(`Signed in as ${u.name}!`);
        }}
      />

      <ReadingModal
        isOpen={isReadingModalOpen}
        onClose={() => setIsReadingModalOpen(false)}
        onSuccess={handleReadingSuccess}
        initialReading={editingReading}
        defaultDate={readingDefaultDate}
        defaultSlot={readingDefaultSlot}
      />
    </div>
  );
}
