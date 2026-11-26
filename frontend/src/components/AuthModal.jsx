import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('Attendee');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const resolvedName =
      mode === 'register'
        ? name.trim()
        : email.split('@')[0].replace(/[._]/g, ' ');

    const formattedName = resolvedName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const data = {
      name: formattedName,
      email: email.trim(),
      password,
      role,
    };

    try {
      const response = await axios.post(
        `http://localhost:3000/${mode === 'register' ? 'register' : 'login'}`,
        data
      );

      onAuthSuccess({
        name: response.data.user?.name || formattedName,
        email: email.trim(),
        role: response.data.user?.role || role,
      });

      toast.success(
        mode === 'register'
          ? 'Registered Successfully'
          : 'Login Successful'
      );

      onClose();
      nav('/');
    } catch (e) {
      setError(
        e.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };


  const handleQuickDemo = (demoRole) => {
    const presets = {
      Attendee: {
        name: 'Daniyal Danish',
        email: 'daniyal.danish@example.com',
        role: 'Attendee',
      },
      Organizer: {
        name: 'Bilal Siddiqui',
        email: 'events@kdg.org',
        role: 'Organizer',
      },
      Admin: {
        name: 'Super Admin',
        email: 'admin@eventra.pk',
        role: 'Admin',
      },
    };
    onAuthSuccess(presets[demoRole] || presets.Attendee);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2
            id="auth-modal-title"
            className="font-display text-lg font-bold text-slate-950"
          >
            {mode === 'login' ? 'Sign In to Eventra' : 'Create an Account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${mode === 'login'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${mode === 'register'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
                }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Account Role
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['Attendee', 'Exhibitor'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${role === r
                      ? 'border-blue-800 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {role === 'Admin' && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Admin sign-in opens the platform oversight &amp; digital pass
                  revenue panel.
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daniyal Danish"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === 'Admin' ? 'admin@eventra.pk' : 'you@example.com'
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
            >
              {mode === 'login' ? `Sign In as ${role}` : `Register as ${role}`}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
