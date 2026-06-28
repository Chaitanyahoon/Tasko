import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MdPerson, MdMail, MdFolderSpecial, MdFormatListBulleted, MdCheckCircle, MdPendingActions, MdSave, MdAssignmentTurnedIn } from 'react-icons/md';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateName, stats, loading, users } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [myTasksLoading, setMyTasksLoading] = useState(false);

  const fetchAssignedTasks = async () => {
    try {
      setMyTasksLoading(true);
      const res = await api.get('/tasks/assigned-to-me');
      setAssignedTasks(res.data);
    } catch (err) {
      console.error('Failed to load profile assigned tasks:', err);
    } finally {
      setMyTasksLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
    fetchAssignedTasks();
  }, [user]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      toast.error('Name cannot be empty');
      return;
    }

    setSubmitLoading(true);
    const res = await updateName(name);
    setSubmitLoading(false);
  };

  const formatJoinedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!user) {
    return <div className="text-center py-10 text-slate-500 font-semibold dark:text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-805 dark:text-white sm:text-3xl">My Profile</h2>
        <p className="text-sm text-slate-550 font-medium dark:text-slate-400">Manage your portal profile and review your workspace activity metrics.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Profile Card & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 text-3xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : <MdPerson />}
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-slate-800 dark:text-slate-100">{user.name}</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{user.email}</p>

            <div className="mt-6 border-t border-slate-100 pt-4 w-full text-left text-xs font-semibold text-slate-505 dark:border-slate-700/60 dark:text-slate-400 space-y-2">
              <p>Organization: <strong className="text-brand-600 dark:text-brand-405 font-bold">{user.organization?.name || 'N/A'}</strong></p>
              <p>Joined Date: <strong className="text-slate-700 dark:text-slate-350">{formatJoinedDate(user.createdAt)}</strong></p>
              <p>Role: <strong className="text-slate-700 dark:text-slate-350 capitalize">{user.role || 'member'}</strong></p>
            </div>
          </div>

          {/* Team Directory panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <h4 className="font-display text-base font-bold text-slate-805 border-b border-slate-100 pb-3 dark:text-slate-100 dark:border-slate-700/60">
              Team Directory ({users.length})
            </h4>
            <div className="mt-4 max-h-60 overflow-y-auto space-y-3 pr-1">
              {users && users.length > 0 ? (
                users.map((u) => (
                  <div key={u._id} className="flex items-center justify-between rounded-xl bg-slate-50/50 p-3 dark:bg-slate-900/40">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 font-bold text-sm uppercase">
                        {u.name ? u.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{u.name}</p>
                        <p className="text-[10px] font-medium text-slate-450 dark:text-slate-550">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {u.role === 'admin' ? (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400">
                          Admin
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-700/40 dark:border-slate-600 dark:text-slate-400">
                          Member
                        </span>
                      )}
                      {u._id === user._id && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs italic text-slate-400">Loading directory...</p>
              )}
            </div>
          </div>
        </div>

        {/* Update Profile Form and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics summary bar */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                <MdFolderSpecial className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-display text-xl font-bold text-slate-800 mt-2 dark:text-slate-100">{stats.totalProjects || 0}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Total Projects</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                <MdFormatListBulleted className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-display text-xl font-bold text-slate-800 mt-2 dark:text-slate-100">{stats.totalTasks || 0}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Total Tasks</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                <MdCheckCircle className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-display text-xl font-bold text-slate-800 mt-2 dark:text-slate-100">{stats.completedTasks || 0}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Completed</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <MdPendingActions className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-display text-xl font-bold text-slate-800 mt-2 dark:text-slate-100">{stats.pendingTasks || 0}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Pending</p>
            </div>
          </div>

          {/* Assigned & Completed by Me summary */}
          <div className="grid gap-4 grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                <MdAssignmentTurnedIn className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-display text-xl font-bold text-slate-800 mt-2 dark:text-slate-100">
                {assignedTasks.length}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Tasks Assigned to Me</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400">
                <MdCheckCircle className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-display text-xl font-bold text-slate-800 mt-2 dark:text-slate-100">
                {assignedTasks.filter((t) => t.status === 'Done').length}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Tasks Completed by Me</p>
            </div>
          </div>

          {/* Edit settings panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
            <h4 className="font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-3 dark:text-slate-100 dark:border-slate-700/60">
              Account Settings
            </h4>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <MdMail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    value={user.email}
                    disabled={true}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-100/60 py-2.5 pl-10 pr-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-700/30 dark:text-slate-550"
                  />
                </div>
                <span className="mt-1 block text-[10px] text-slate-400 font-semibold">Email address cannot be changed.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MdPerson className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    disabled={submitLoading}
                    className={`block w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                      error
                        ? 'border-rose-500 focus:border-rose-550 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
                    }`}
                    placeholder="Enter full name"
                  />
                </div>
                {error && <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white hover:bg-brand-500 transition-all shadow-md shadow-brand-600/10 cursor-pointer disabled:opacity-50"
                >
                  <MdSave className="h-4 w-4" />
                  <span>{submitLoading ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
