import React, { useState } from 'react';
import { adminChangePassword, AdminApiError } from '../../types';

interface AdminAccountProps {
  adminEmail?: string;
}

const PASSWORD_RULES = [
  'At least 8 characters long',
  'Not entirely numeric',
  'Not a commonly used password',
  'Not too similar to your current password',
];

const AdminAccount: React.FC<AdminAccountProps> = ({ adminEmail }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Client-side confirmation check for immediate feedback.
    if (newPassword !== confirmPassword) {
      setFieldErrors({
        confirm_password: ['The new password and confirmation do not match.'],
      });
      return;
    }

    if (newPassword.length < 8) {
      setFieldErrors({
        new_password: ['Password must be at least 8 characters long.'],
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await adminChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccess(
        response?.message ||
          'Your password has been updated successfully. You can now sign in with your new password.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof AdminApiError) {
        setFieldErrors(err.fieldErrors);
        setError(err.message);
      } else {
        setError('Unable to change your password right now. Please try again shortly.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (name: string) =>
    fieldErrors[name] && fieldErrors[name].length > 0 ? fieldErrors[name][0] : '';

  const inputClass = (hasError: boolean) =>
    `w-full bg-slate-900/50 border rounded-xl px-4 py-3.5 text-white transition-all focus:outline-none ${
      hasError
        ? 'border-red-500/60 focus:border-red-500'
        : 'border-white/10 focus:border-blue-500'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-red-600/20">
          &#128273;
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Account &amp; Security</h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            {adminEmail ? `Signed in as ${adminEmail}` : 'Manage your admin portal credentials'}
          </p>
        </div>
      </div>

      {/* Change password card */}
      <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
          Change Password
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Your password is stored securely (hashed) and is never shown to anyone, including
          other administrators.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm"
          >
            <span className="font-bold">Error: </span>
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs sm:text-sm"
          >
            <span className="font-bold">Success: </span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Current password */}
          <div>
            <label
              htmlFor="current-password"
              className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type={showPasswords ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass(!!fieldError('current_password'))}
              placeholder="Enter your current password"
            />
            {fieldError('current_password') && (
              <p className="mt-2 text-xs text-red-400">{fieldError('current_password')}</p>
            )}
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"
            >
              New Password
            </label>
            <input
              id="new-password"
              type={showPasswords ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass(!!fieldError('new_password'))}
              placeholder="Choose a strong new password"
            />
            {fieldError('new_password') && (
              <p className="mt-2 text-xs text-red-400">{fieldError('new_password')}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass(!!fieldError('confirm_password'))}
              placeholder="Re-enter your new password"
            />
            {fieldError('confirm_password') && (
              <p className="mt-2 text-xs text-red-400">{fieldError('confirm_password')}</p>
            )}
          </div>

          {/* Show/hide passwords */}
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            Show passwords
          </label>

          {/* Password rules */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              Password requirements
            </p>
            <ul className="space-y-1">
              {PASSWORD_RULES.map((rule) => (
                <li key={rule} className="text-xs text-gray-400 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-xl shadow-red-600/20 transform active:scale-95 uppercase tracking-widest text-sm"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>

          <p className="text-[10px] sm:text-xs text-gray-500 text-center">
            You stay signed in after changing your password, and can immediately sign in again
            with your new password.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminAccount;

