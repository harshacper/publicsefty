import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { forgotPasswordApi } from '../services/api';

export const CitizenLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  const redirectPath = (location.state as any)?.from?.pathname || '/citizen/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data.success) {
        if (data.user?.role === 'admin' || data.user?.role === 'police_officer') {
          navigate('/admin/dashboard');
        } else {
          navigate(redirectPath);
        }
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Invalid credentials. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await forgotPasswordApi(forgotEmail);
      setForgotMsg(res.message || 'Reset instructions forwarded.');
    } catch (err) {
      setForgotMsg('Password reset instructions forwarded to your registered email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b2545] p-6 text-white text-center border-b border-[#1e3a5f]">
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-700/80 border border-amber-400 items-center justify-center mb-2 shadow-inner">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Citizen Portal Login</h2>
          <p className="text-xs text-slate-300 mt-1">
            Access your registered complaints, track status, and view officer notes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] text-blue-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0b2545] hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Citizen Portal</span>
            )}
          </button>

          <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-2">
            <div>
              Don't have a registered profile?{' '}
              <Link to="/register" className="text-blue-700 font-bold hover:underline">
                Register as Citizen
              </Link>
            </div>
            <div>
              <Link
                to="/admin/login"
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Go to Administrator / Police Official Login
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Forgot Password</h3>
            <p className="text-xs text-slate-600">
              Enter your registered email address to receive password reset intimation instructions.
            </p>
            {forgotMsg ? (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded space-y-2">
                <p>{forgotMsg}</p>
                <button
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotMsg('');
                  }}
                  className="w-full bg-blue-700 text-white font-bold py-1.5 rounded text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter registered email"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-3 py-1.5 bg-blue-700 text-white font-bold text-xs rounded hover:bg-blue-800"
                  >
                    {forgotLoading ? 'Submitting...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
