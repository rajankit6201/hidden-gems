import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, signupUser, verifyOTP, clearAuthError } from '../store/slices/authSlice';
import { X, Mail, Lock, User, KeyRound, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'otp'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });

  const dispatch = useDispatch();
  const { loading, error, pendingEmail } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    dispatch(clearAuthError());
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await dispatch(loginUser({ email: formData.email, password: formData.password }));
      if (!res.error) handleClose();
    } else if (mode === 'signup') {
      const res = await dispatch(signupUser({ name: formData.name, email: formData.email, password: formData.password }));
      if (!res.error) setMode('otp');
    } else if (mode === 'otp') {
      const targetEmail = formData.email || pendingEmail;
      const res = await dispatch(verifyOTP({ email: targetEmail, otp: formData.otp }));
      if (!res.error) handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-stone-100 mb-1">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'otp' && 'Verify OTP'}
        </h2>
        <p className="text-sm text-stone-400 mb-6">
          {mode === 'otp' 
            ? `Enter 6-digit OTP sent to ${formData.email || pendingEmail}` 
            : 'Access Bhopal hidden travel gems'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
          )}

          {mode !== 'otp' && (
            <>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'otp' && (
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">6-Digit Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="123456"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-stone-100 tracking-widest text-center font-mono placeholder-stone-500 focus:outline-none focus:border-emerald-500 text-base"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-950/50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' && 'Sign In'}
            {mode === 'signup' && 'Send OTP'}
            {mode === 'otp' && 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-400 border-t border-stone-800 pt-4">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => { dispatch(clearAuthError()); setMode('signup'); }} className="text-emerald-400 hover:underline font-medium">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => { dispatch(clearAuthError()); setMode('login'); }} className="text-emerald-400 hover:underline font-medium">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}