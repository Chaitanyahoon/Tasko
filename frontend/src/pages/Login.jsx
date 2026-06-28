import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdAssignmentTurnedIn, MdMail, MdLock } from 'react-icons/md';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please resolve validation errors');
      return;
    }

    const { email, password } = formData;
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200/60 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-800 shadow-slate-100 dark:shadow-none">
        {/* Header */}
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Tasko Logo" className="h-14 w-auto object-contain dark:invert mb-2" />
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-550 dark:text-slate-400">
            Or{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
              register a new team member profile
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MdMail className="h-5 w-5" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                  errors.email
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MdLock className="h-5 w-5" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                  errors.password
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:shadow-lg transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
