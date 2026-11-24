import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayground } from '../context/PlaygroundContext';
import { X, LogIn, UserPlus, Sparkles, KeyRound, Mail, User, Loader2, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const { showToast } = usePlayground();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Successfully signed in!', 'success');
      } else {
        await register(name, email, password);
        showToast('Account registered and signed in!', 'success');
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('student@ojt.edu', 'student123');
      showToast('Signed in as Demo MHN TAB Student!', 'success');
      onClose();
    } catch (err) {
      showToast('Demo login error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    setLoading(true);
    try {
      await login('admin@ojt.edu', 'admin123');
      showToast('Signed in as Platform Administrator!', 'success');
      onClose();
    } catch (err) {
      showToast('Admin demo login error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#161b22] border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 px-6 flex items-center justify-between bg-[#1f242c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {mode === 'login' ? 'MHN TAB Sign In' : 'Register MHN TAB Account'}
              </h2>
              <p className="text-[11px] text-gray-400">Access cloud programs, solve problems, and track progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-800 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'login' ? 'border-sky-500 text-sky-400 bg-white/5' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'register' ? 'border-sky-500 text-sky-400 bg-white/5' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baibhav Kumar"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@ojt.edu"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d1117] border border-gray-700 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-gray-500 uppercase font-semibold">Or Quick Access</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          {/* 1-Click Demo Login Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Demo Trainee</span>
            </button>

            <button
              type="button"
              onClick={handleAdminDemoLogin}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 active:scale-98"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Demo Admin</span>
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-500 mt-2">
            No signup required to run code! You can also practice freely in Guest Mode.
          </p>
        </form>
      </div>
    </div>
  );
}
