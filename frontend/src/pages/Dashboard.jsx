import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { MdSearch, MdAdd, MdFolderSpecial, MdFormatListBulleted, MdCheckCircle, MdPendingActions, MdWarning, MdAssignmentTurnedIn } from 'react-icons/md';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { refreshStats, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Assigned Tasks Tab State
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'my-tasks'
  const [myTasks, setMyTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
      refreshStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      setTasksLoading(true);
      const res = await api.get('/tasks/my-tasks');
      setMyTasks(res.data);
    } catch (err) {
      console.error('Failed to load my tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleMyTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated!');
      fetchMyTasks();
      // Refetch projects to keep progress gauges and statistics sync'd
      const res = await api.get('/projects');
      setProjects(res.data);
      refreshStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMyTasks();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({ name: '', description: '', deadline: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (project) => {
    setIsEditMode(true);
    setSelectedId(project._id);
    let dateStr = '';
    if (project.deadline) {
      dateStr = new Date(project.deadline).toISOString().split('T')[0];
    }
    setFormData({
      name: project.name,
      description: project.description || '',
      deadline: dateStr,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      deadline: formData.deadline || null,
    };

    try {
      if (isEditMode) {
        await api.put(`/projects/${selectedId}`, payload);
        toast.success('Project updated!');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created!');
      }
      setIsFormOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitLoading(true);
    try {
      await api.delete(`/projects/${selectedId}`);
      toast.success('Project deleted!');
      setIsDeleteOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute aggregate statistics
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.stats?.total || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.stats?.done || 0), 0);
  const pendingTasks = projects.reduce((acc, p) => acc + (p.stats?.pending || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">Projects Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium dark:text-slate-400">View and organize all active initiatives.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-md shadow-brand-600/10 cursor-pointer"
          >
            <MdAdd className="h-5 w-5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {/* Total Projects */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
            <MdFolderSpecial className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Projects</p>
            <h4 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">{totalProjects}</h4>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
            <MdFormatListBulleted className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Tasks</p>
            <h4 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">{totalTasks}</h4>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <MdCheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Completed</p>
            <h4 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">{completedTasks}</h4>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
            <MdPendingActions className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Pending</p>
            <h4 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">{pendingTasks}</h4>
          </div>
        </div>

        {/* Tasks Assigned to Me */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
            <MdAssignmentTurnedIn className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Assigned to Me</p>
            <h4 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">{myTasks.length}</h4>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
          <MdSearch className="h-5 w-5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects by name..."
          className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Grid List */}
      {loading ? (
        <Spinner />
      ) : filteredProjects.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={user?.role === 'admin' ? openEditModal : null}
              onDelete={user?.role === 'admin' ? openDeleteModal : null}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-700/50 dark:text-slate-500">
            <MdFolderSpecial className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-slate-700 dark:text-slate-200">
            {searchQuery ? 'No matching projects found' : 'No projects yet'}
          </h3>
          <p className="mt-1 max-w-xs text-xs text-slate-500 font-medium dark:text-slate-400">
            {searchQuery
              ? 'Try modifying your search query to look for another project.'
              : 'Create your first project board and list deliverables.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="mt-5 rounded-xl bg-brand-50 px-4.5 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/30 dark:text-brand-400 dark:hover:bg-brand-900/40 transition-all cursor-pointer"
            >
              No projects yet. Create your first project!
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !submitLoading && setIsFormOpen(false)}
        title={isEditMode ? 'Edit Project Settings' : 'Create New Project'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={submitLoading}
              className={`mt-2 block w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                formErrors.name
                  ? 'border-rose-500 focus:border-rose-550 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
              }`}
              placeholder="e.g. Mobile Application Client"
            />
            {formErrors.name && <p className="mt-1 text-xs font-semibold text-rose-500">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={submitLoading}
              rows="3"
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
              placeholder="Outline project objectives..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              disabled={submitLoading}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={submitLoading}
              className="rounded-xl border border-slate-200 px-4.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/30 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-all shadow-md shadow-brand-600/10 cursor-pointer disabled:opacity-50"
            >
              {submitLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !submitLoading && setIsDeleteOpen(false)}
        title="Confirm Project Deletion"
      >
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
            <MdWarning className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Are you absolutely sure?</p>
            <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
              This will permanently delete this project board and <strong className="text-rose-600 dark:text-rose-400 font-bold">all of its tasks</strong>. This cannot be undone.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
            <button
              type="button"
              disabled={submitLoading}
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl border border-slate-200 px-4.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/30 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitLoading}
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-rose-650 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-650 transition-all shadow-md shadow-rose-600/10 cursor-pointer disabled:opacity-50"
            >
              {submitLoading ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
