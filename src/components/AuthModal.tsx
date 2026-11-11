// @ts-nocheck
import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Activity } from 'lucide-react';
import { api, authStorage } from '../api/client.ts';

export function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isLogin) {
        const res = await api.register(name, email, password, role);
        authStorage.setToken(res.token);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        authStorage.setToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError(null);
    setLoading(true);
    const demoEmail = demoRole === 'patient' ? 'demo@kenpath.com' : 'doctor@kenpath.com';
    const demoPassword = 'Password123!';

    try {
      const res = await api.login(demoEmail, demoPassword);
      authStorage.setToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err) {
      try {
        await api.seedDemo();
        const res = await api.login(demoEmail, demoPassword);
        authStorage.setToken(res.token);
        onSuccess(res.user);
        onClose();
      } catch (seedErr) {
        setError(seedErr.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      {/* Split Card Container (Inspired by Image 7 & Image 5!) */}
      <div className="bg-[#10131f] rounded-2xl shadow-2xl border border-amber-500/40 w-full max-w-3xl overflow-hidden relative flex flex-col md:flex-row min-h-[460px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-[#1b2032] hover:bg-[#252c46] text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Left Side: Gradient Hero Banner (from Image 7 with luxury polish) */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#1c0f1e] via-[#241328] to-[#121522] text-white p-8 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-amber-500/25">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center shadow-md shadow-pink-900/50">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                Sweety
              </span>
            </div>

            <h3 className="text-2xl font-black mb-3 tracking-tight text-white">
              {isLogin ? 'Welcome Back!' : 'Hello, Friend!'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isLogin
                ? 'Enter your credentials to track your daily blood glucose and view comprehensive clinical reports.'
                : 'Register your account to begin recording up to 4 daily glucose readings with analytical reports.'}
            </p>
          </div>

          {/* Toggle Button */}
          <div className="relative z-10 pt-6">
            <p className="text-[11px] text-amber-200/80 mb-2">
              {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="px-6 py-2 border-2 border-amber-400 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Decorative background glow circles */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-pink-600/10 pointer-events-none blur-2xl" />
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-amber-500/10 pointer-events-none blur-2xl" />
        </div>

        {/* Right Side: Clean Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-[#121522]">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 tracking-tight">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin
                ? 'Sign in to access your blood glucose readings and reports'
                : 'Fill in your details to create your secure patient account'}
            </p>
          </div>

          {/* Demo 1-Click Login Option */}
          <div className="mb-4 p-2.5 bg-[#171b2b] border border-amber-500/30 rounded-xl flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300">Quick Demo Access:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-300 bg-[#202538] hover:bg-[#2b324c] border border-amber-500/40 rounded-lg transition-colors cursor-pointer"
              >
                Demo Patient
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('doctor')}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] font-bold text-pink-300 bg-[#2b1828] hover:bg-[#3d2038] border border-pink-500/40 rounded-lg transition-colors cursor-pointer"
              >
                Demo Doctor
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 text-xs text-rose-300 bg-rose-950/50 border border-rose-500/50 rounded-xl font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Bolla Bhargavi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs text-amber-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-bold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-amber-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-amber-200 bg-[#171b2b] border border-amber-500/40 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-bold"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      role === 'patient'
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 text-slate-400 hover:bg-[#1a1f30]'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      role === 'doctor'
                        ? 'border-pink-500 bg-pink-950/40 text-pink-300'
                        : 'border-slate-800 text-slate-400 hover:bg-[#1a1f30]'
                    }`}
                  >
                    Doctor
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-pink-900/50 border border-amber-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
