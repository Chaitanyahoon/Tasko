import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MdAssignmentTurnedIn, MdMail, MdLock, MdPerson, MdBusiness } from 'react-icons/md';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [orgMode, setOrgMode] = useState('create');
  const [orgName, setOrgName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);

  const fetchOrganizations = async () => {
    try {
      setOrgsLoading(true);
      const res = await api.get('/auth/organizations');
      setOrganizations(res.data);
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

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

    if (!formData.name.trim()) {
      tempErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (orgMode === 'create' && !orgName.trim()) {
      tempErrors.orgName = 'Organization name is required';
    }

    if (orgMode === 'join' && !orgId) {
      tempErrors.orgId = 'Please select an organization to join';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please correct the validation errors');
      return;
    }

    const { name, email, password } = formData;
    const res = await register(name, email, password, orgMode, orgName, orgId);
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
            Create account
          </h2>
          <p className="mt-2 text-sm text-slate-550 dark:text-slate-400">
            Or{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
              sign in to your portal
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MdPerson className="h-5 w-5" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                  errors.name
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.name}</p>}
          </div>

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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MdLock className="h-5 w-5" />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                  errors.confirmPassword
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-semibold text-rose-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Organization Setup */}
          <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-700/60">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization Setup</label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => { setOrgMode('create'); setErrors({ ...errors, orgName: '', orgId: '' }); }}
                  className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                    orgMode === 'create'
                      ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Create New Org
                </button>
                <button
                  type="button"
                  onClick={() => { setOrgMode('join'); setErrors({ ...errors, orgName: '', orgId: '' }); }}
                  className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                    orgMode === 'join'
                      ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-555 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Join Existing Org
                </button>
              </div>
            </div>

            {orgMode === 'create' ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization Name</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MdBusiness className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => { setOrgName(e.target.value); if(errors.orgName) setErrors({...errors, orgName: ''}); }}
                    className={`block w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                      errors.orgName
                        ? 'border-rose-500 focus:border-rose-550 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
                    }`}
                    placeholder="e.g. Stark Industries"
                  />
                </div>
                {errors.orgName && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.orgName}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Organization</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MdBusiness className="h-5 w-5" />
                  </span>
                  <select
                    value={orgId}
                    onChange={(e) => { setOrgId(e.target.value); if(errors.orgId) setErrors({...errors, orgId: ''}); }}
                    className={`block w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm placeholder-slate-450 transition-all focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                      errors.orgId
                        ? 'border-rose-500 focus:border-rose-550 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
                    }`}
                  >
                    <option value="">-- Choose an Organization --</option>
                    {organizations && organizations.length > 0 ? (
                      organizations.map((org) => (
                        <option key={org._id} value={org._id}>
                          {org.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No organizations found. Please create one.</option>
                    )}
                  </select>
                </div>
                {errors.orgId && <p className="mt-1 text-xs font-semibold text-rose-505">{errors.orgId}</p>}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:shadow-lg transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
