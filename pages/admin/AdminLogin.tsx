import React, { useState } from 'react';
import { adminLogin, AdminApiError, AdminUser } from '../../types';

interface AdminLoginProps {
  onLogin: (success: boolean, user?: AdminUser) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await adminLogin(email.trim(), password);
      onLogin(true, response?.user);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setFieldErrors(err.fieldErrors);
        setError(err.message);
      } else if (err instanceof TypeError) {
        // Network / CORS failure - the API could not be reached.
        setError(
          'Unable to reach the server. Please check your connection and try again.'
        );
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const fieldError = (name: string) =>
    fieldErrors[name] && fieldErrors[name].length > 0 ? fieldErrors[name][0] : '';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 px-4">
      {/* Decorative Background */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-fadeIn">
        <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            {/* FIXED: Logo with correct path and error handling */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              {!logoError ? (
                <img 
                  src="/images/bathudi%20logo%20background.jpg" 
                  alt="Bathudi Automotive Technical Center Logo" 
                  className="w-full h-full object-cover rounded-2xl"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">Admin Hub</h2>
            <p className="text-gray-400 text-sm">Secure Management Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all ${
                  fieldError('email') ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
                }`}
                placeholder="admin@bathudi.co.za"
              />
              {fieldError('email') && (
                <p className="mt-2 text-xs text-red-400">{fieldError('email')}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3.5 pr-12 text-white focus:outline-none transition-all ${
                    fieldError('password') ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldError('password') && (
                <p className="mt-2 text-xs text-red-400">{fieldError('password')}</p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 transform active:scale-95 uppercase tracking-widest text-sm"
            >
              {isSubmitting ? 'Authorizing...' : 'Authorize Access'}
            </button>

            <button 
              type="button"
              onClick={onCancel}
              className="w-full py-3 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              Return to Website
            </button>
          </form>

          {/* Bottom Bar Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        </div>
        
        <p className="text-center mt-8 text-gray-600 text-[10px] uppercase tracking-[0.3em]">
          Bathudi Automotive Technical Center &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
