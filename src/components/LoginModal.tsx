import React, { useState } from 'react';
import { Shield, GraduationCap, Users, Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { loginUser } from '../services/api';
import { AuthSession } from '../types/academy';

interface LoginModalProps {
  isOpen: boolean;
  initialPortal: 'admin' | 'teacher' | 'parent';
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  initialPortal,
  onClose,
  onSuccess
}) => {
  const [activePortal, setActivePortal] = useState<'admin' | 'teacher' | 'parent'>(initialPortal);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoChips, setShowDemoChips] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const session = await loginUser(loginId, password, activePortal);
      onSuccess(session);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: 'admin' | 'teacher' | 'parent', u: string, p: string) => {
    setActivePortal(role);
    setLoginId(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Header */}
        <div className="bg-emerald-950 px-6 pt-7 pb-6 text-center text-white border-b border-emerald-900 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-900 border border-emerald-700/60 text-amber-300 mb-3 shadow-inner">
            {activePortal === 'admin' ? (
              <Shield className="w-6 h-6" />
            ) : activePortal === 'teacher' ? (
              <GraduationCap className="w-6 h-6" />
            ) : (
              <Users className="w-6 h-6" />
            )}
          </div>
          <h2 className="font-serif-academy text-xl sm:text-2xl font-bold tracking-tight text-amber-100">
            Darussalam Academy
          </h2>
          <p className="text-xs font-medium text-emerald-300 tracking-wider uppercase mt-1">
            Nandi • Secure Portal
          </p>
        </div>

        {/* Portal Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/80 p-1">
          <button
            type="button"
            onClick={() => { setActivePortal('parent'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activePortal === 'parent'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Parent Login
          </button>
          <button
            type="button"
            onClick={() => { setActivePortal('teacher'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activePortal === 'teacher'
                ? 'bg-emerald-900 text-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Teacher Login
          </button>
          <button
            type="button"
            onClick={() => { setActivePortal('admin'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activePortal === 'admin'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="mb-5 text-center">
            <h3 className="text-base font-bold text-stone-900">
              {activePortal === 'parent' && 'Welcome, Parent'}
              {activePortal === 'teacher' && 'Welcome, Faculty Member'}
              {activePortal === 'admin' && 'Authorized Administrator Access'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Enter the credentials provided by the academy administration.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {activePortal === 'parent'
                  ? 'Student ID / Parent Login ID'
                  : activePortal === 'teacher'
                  ? 'Teacher Login ID'
                  : 'Administrator Login ID'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={
                    activePortal === 'parent'
                      ? 'e.g. parent_jm156'
                      : activePortal === 'teacher'
                      ? 'e.g. teacher_faizy'
                      : 'e.g. admin'
                  }
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/50 focus:border-emerald-700 transition-all text-stone-900"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your academy password"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/50 focus:border-emerald-700 transition-all text-stone-900"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span className="text-[11px]">Forgot password?</span>
              <span className="text-[11px] text-stone-600 italic">
                Contact administration office
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                activePortal === 'parent'
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : activePortal === 'teacher'
                  ? 'bg-emerald-900 hover:bg-emerald-950 text-amber-200'
                  : 'bg-stone-900 hover:bg-black'
              } disabled:opacity-60`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Assistance Notice */}
          <div className="mt-4 pt-3 border-t border-stone-200 text-center">
            <p className="text-[11px] text-stone-500">
              For login assistance, contact the academy administration.
            </p>
          </div>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-4 p-3 bg-stone-100 rounded-xl border border-stone-200 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Quick Demo Logins (Click to autofill)
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('parent', 'parent_jm156', 'parent123')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-stone-800 border border-stone-200 flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-amber-800">Parent (Abdul Hadi C - JM156)</span>
                <span className="font-mono text-[11px] text-stone-500">parent_jm156 / parent123</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('teacher', 'teacher_faizy', 'teacher123')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-stone-800 border border-stone-200 flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-emerald-900">Teacher (Usthad Ibrahim Faizy)</span>
                <span className="font-mono text-[11px] text-stone-500">teacher_faizy / teacher123</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('admin', 'admin', 'admin123')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-stone-900">Administrator (Full Control)</span>
                <span className="font-mono text-[11px] text-stone-500">admin / admin123</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
