import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please provide administrative username and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin({ username, password });
      if (data.success) {
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Administrator authentication failed.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Invalid administrator credentials. Access has been denied and logged.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 p-6 text-center border-b border-slate-800 relative">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-900/80 border-2 border-amber-400 items-center justify-center mb-2 shadow-lg">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
          <div className="bg-amber-400 text-slate-950 text-[10px] uppercase font-black px-2 py-0.5 rounded-full inline-block mb-1">
            Restricted Government Access
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Police &amp; Administrator Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Authorized personnel login for case verification, station assignment, and status updates.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-700 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Officer Username / Admin Email <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. harsha or harsha@policeportal.gov.in"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Security Password <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full pl-9 pr-9 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Authenticating Administrator...</span>
              </>
            ) : (
              <span>Sign In to Admin Command</span>
            )}
          </button>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-700">
            Citizen user?{' '}
            <Link to="/login" className="text-amber-400 hover:underline font-semibold">
              Return to Citizen Portal Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
