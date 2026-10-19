import React, { useState } from 'react';
import { Lock, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { changePassword } from '../services/api';

interface FirstLoginPasswordModalProps {
  isOpen: boolean;
  userId: string;
  userName: string;
  isMandatoryFirstLogin: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const FirstLoginPasswordModal: React.FC<FirstLoginPasswordModalProps> = ({
  isOpen,
  userId,
  userName,
  isMandatoryFirstLogin,
  onSuccess,
  onCancel
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(userId, currentPassword, newPassword);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FAF8F5] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="bg-amber-800 p-5 text-white flex items-center gap-3">
          <div className="p-2.5 bg-amber-900/60 rounded-xl border border-amber-600/50">
            <KeyRound className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h3 className="font-serif-academy text-lg font-bold">
              {isMandatoryFirstLogin ? 'First-Time Login Security' : 'Change Password'}
            </h3>
            <p className="text-xs text-amber-200">
              {isMandatoryFirstLogin
                ? 'Mandatory: Set your personal private password.'
                : 'Keep your academy account secure.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isMandatoryFirstLogin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                As required by Darussalam Academy security policy, temporary administrator-issued passwords must be changed immediately on first login.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              {error}
            </div>
          )}

          {!isMandatoryFirstLogin && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                placeholder="Enter current password"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              New Personal Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              placeholder="Repeat new password"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            {!isMandatoryFirstLogin && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-xs font-semibold bg-emerald-900 hover:bg-emerald-950 text-amber-200 rounded-xl shadow-sm transition-all"
            >
              {isLoading ? 'Updating...' : 'Save & Secure Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
