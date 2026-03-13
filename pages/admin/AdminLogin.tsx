import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder login logic - ready for Django JWT/Auth integration
    if (email === 'admin@bathudi.co.za' && password === 'admin123') {
      onLogin(true);
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

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
                  src="/images/bathudi logo.png" 
                  alt="Bathudi Automotive Technical Center Logo" 
                  className="w-full h-full object-contain"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="admin@bathudi.co.za"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 transform active:scale-95 uppercase tracking-widest text-sm"
            >
              Authorize Access
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