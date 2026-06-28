import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { MdArrowBack, MdAdd, MdCalendarToday, MdEdit, MdWarning } from 'react-icons/md';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const { users, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modals
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDeleteOpen, setIsTaskDeleteOpen] = useState(false);
  
  // Project Edit State
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    deadline: '',
  });
  const [projectErrors, setProjectErrors] = useState({});

  // Task Form State
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Todo',
    assignedTo: '',
  });
  const [taskErrors, setTaskErrors] = useState({});

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      if (res.data.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  // Handle Project Form Inputs
  const handleProjectInputChange = (e) => {
    setProjectFormData({ ...projectFormData, [e.target.name]: e.target.value });
    if (projectErrors[e.target.name]) {
      setProjectErrors({ ...projectErrors, [e.target.name]: '' });
    }
  };

  // Open Edit Project Modal
  const openEditProjectModal = () => {
    let dateStr = '';
    if (project.deadline) {
      dateStr = new Date(project.deadline).toISOString().split('T')[0];
    }
    setProjectFormData({
      name: project.name,
      description: project.description || '',
      deadline: dateStr,
    });
    setProjectErrors({});
    setIsProjectFormOpen(true);
  };

  // Submit Project Edit
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectFormData.name.trim()) {
      setProjectErrors({ name: 'Project name is required' });
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.put(`/projects/${id}`, {
        name: projectFormData.name,
        description: projectFormData.description,
        deadline: projectFormData.deadline || null,
      });
      setProject({ ...project, ...res.data });
      toast.success('Project updated!');
      setIsProjectFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Task Form Inputs
  const handleTaskInputChange = (e) => {
    setTaskFormData({ ...taskFormData, [e.target.name]: e.target.value });
    if (taskErrors[e.target.name]) {
      setTaskErrors({ ...taskErrors, [e.target.name]: '' });
    }
  };

  // Open Create Task Modal
  const openCreateTaskModal = () => {
    setIsEditMode(false);
    setSelectedTaskId(null);
    setTaskFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      status: 'Todo',
      assignedTo: '',
    });
    setTaskErrors({});
    setIsTaskFormOpen(true);
  };

  // Open Edit Task Modal
  const openEditTaskModal = (task) => {
    setIsEditMode(true);
    setSelectedTaskId(task._id);
    let dateStr = '';
    if (task.dueDate) {
      dateStr = new Date(task.dueDate).toISOString().split('T')[0];
    }
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      dueDate: dateStr,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
    });
    setTaskErrors({});
    setIsTaskFormOpen(true);
  };

  const openTaskDeleteModal = (taskId) => {
    setSelectedTaskId(taskId);
    setIsTaskDeleteOpen(true);
  };

  const validateTaskForm = () => {
    const errors = {};
    if (!taskFormData.title.trim()) {
      errors.title = 'Task title is required';
    }
    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Task (Create or Edit)
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    setSubmitLoading(true);
    const payload = {
      ...taskFormData,
      project: id,
      dueDate: taskFormData.dueDate || null,
    };

    try {
      if (isEditMode) {
        await api.put(`/tasks/${selectedTaskId}`, payload);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created!');
      }
      setIsTaskFormOpen(false);
      fetchProjectDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Inline Status change from TaskCard Select dropdown
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated!');
      fetchProjectDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Task Delete Confirm
  const handleTaskDeleteConfirm = async () => {
    setSubmitLoading(true);
    try {
      await api.delete(`/tasks/${selectedTaskId}`);
      toast.success('Task deleted!');
      setIsTaskDeleteOpen(false);
      fetchProjectDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading && !project) {
    return <Spinner />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Project not found</h3>
        <Link to="/" className="text-brand-600 font-semibold hover:underline mt-2 inline-block dark:text-brand-400">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isOwnerOrAdmin = project && user && (project.owner === user._id || project.owner?._id === user._id || user.role === 'admin');

  // Filter tasks into columns for Kanban board view
  const tasksByStatus = {
    Todo: tasks.filter((t) => t.status === 'Todo'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    Done: tasks.filter((t) => t.status === 'Done'),
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-650 transition-colors uppercase tracking-wider mb-3 dark:text-slate-450 dark:hover:text-brand-400"
        >
          <MdArrowBack className="h-4.5 w-4.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Project Header block */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white sm:text-3.5xl tracking-tight">
              {project.name}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold dark:text-slate-400">
              {project.description || 'No project description.'}
            </p>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 pt-1">
              <MdCalendarToday className="h-4 w-4" />
              <span>Deadline: </span>
              <strong className="text-slate-700 dark:text-slate-300">{formatDate(project.deadline)}</strong>
            </div>
          </div>

          <div className="flex space-x-3 self-start">
            {isOwnerOrAdmin && (
              <button
                onClick={openEditProjectModal}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <MdEdit className="h-4 w-4" />
                <span>Edit Project</span>
              </button>
            )}

            {isOwnerOrAdmin && (
              <button
                onClick={openCreateTaskModal}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition-all shadow-md shadow-brand-600/10 cursor-pointer"
              >
                <MdAdd className="h-4 w-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board columns */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {Object.keys(tasksByStatus).map((statusName) => {
          const statusTasks = tasksByStatus[statusName];
          return (
            <div
              key={statusName}
              className="flex flex-col rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/40"
            >
              {/* Column Title */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      statusName === 'Todo'
                        ? 'bg-slate-400'
                        : statusName === 'In Progress'
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <h4 className="font-display text-sm font-bold text-slate-800 dark:text-slate-200">{statusName}</h4>
                </div>
                <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm border border-slate-200/40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                  {statusTasks.length}
                </span>
              </div>

              {/* Tasks mapping inside column */}
              <div className="space-y-4 flex-1">
                {statusTasks.length > 0 ? (
                  statusTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={isOwnerOrAdmin ? openEditTaskModal : null}
                      onDelete={isOwnerOrAdmin ? openTaskDeleteModal : null}
                      onStatusChange={
                        isOwnerOrAdmin || (task.assignedTo && (task.assignedTo === user._id || task.assignedTo?._id === user._id))
                          ? handleStatusChange
                          : null
                      }
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center dark:border-slate-800 dark:bg-slate-800/20">
                    <p className="text-xs text-slate-450 font-semibold dark:text-slate-500">No tasks in {statusName}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Project settings modal */}
      <Modal
        isOpen={isProjectFormOpen}
        onClose={() => !submitLoading && setIsProjectFormOpen(false)}
        title="Edit Project Board"
      >
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project Name *</label>
            <input
              type="text"
              name="name"
              value={projectFormData.name}
              onChange={handleProjectInputChange}
              disabled={submitLoading}
              className={`mt-2 block w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                projectErrors.name
                  ? 'border-rose-500 focus:border-rose-550 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
              }`}
            />
            {projectErrors.name && <p className="mt-1 text-xs font-semibold text-rose-500">{projectErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              value={projectFormData.description}
              onChange={handleProjectInputChange}
              disabled={submitLoading}
              rows="3"
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={projectFormData.deadline}
              onChange={handleProjectInputChange}
              disabled={submitLoading}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsProjectFormOpen(false)}
              disabled={submitLoading}
              className="rounded-xl border border-slate-200 px-4.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/30 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-brand-600/10"
            >
              {submitLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Create/Edit Modal */}
      <Modal
        isOpen={isTaskFormOpen}
        onClose={() => !submitLoading && setIsTaskFormOpen(false)}
        title={isEditMode ? 'Edit Task Details' : 'Create New Task'}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task Title *</label>
            <input
              type="text"
              name="title"
              value={taskFormData.title}
              onChange={handleTaskInputChange}
              disabled={submitLoading}
              className={`mt-2 block w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-white ${
                taskErrors.title
                  ? 'border-rose-500 focus:border-rose-550 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-700'
              }`}
              placeholder="e.g. Implement API routes"
            />
            {taskErrors.title && <p className="mt-1 text-xs font-semibold text-rose-500">{taskErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              value={taskFormData.description}
              onChange={handleTaskInputChange}
              disabled={submitLoading}
              rows="3"
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
              placeholder="Detailed objectives..."
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={taskFormData.dueDate}
                onChange={handleTaskInputChange}
                disabled={submitLoading}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                name="priority"
                value={taskFormData.priority}
                onChange={handleTaskInputChange}
                disabled={submitLoading}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
              <select
                name="status"
                value={taskFormData.status}
                onChange={handleTaskInputChange}
                disabled={submitLoading}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</label>
              <select
                name="assignedTo"
                value={taskFormData.assignedTo || ''}
                onChange={handleTaskInputChange}
                disabled={submitLoading}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Unassigned</option>
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))
                ) : (
                  <option disabled>Loading users...</option>
                )}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsTaskFormOpen(false)}
              disabled={submitLoading}
              className="rounded-xl border border-slate-200 px-4.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/30 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-brand-600/10"
            >
              {submitLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Delete Confirm Modal */}
      <Modal
        isOpen={isTaskDeleteOpen}
        onClose={() => !submitLoading && setIsTaskDeleteOpen(false)}
        title="Confirm Task Deletion"
      >
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450">
            <MdWarning className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Delete task?</p>
            <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
              This task will be permanently removed from this project folder. This cannot be undone.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
            <button
              type="button"
              disabled={submitLoading}
              onClick={() => setIsTaskDeleteOpen(false)}
              className="rounded-xl border border-slate-200 px-4.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/30 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitLoading}
              onClick={handleTaskDeleteConfirm}
              className="rounded-xl bg-rose-650 px-5 py-2.5 text-xs font-semibold text-white hover:bg-rose-600 transition-all shadow-md shadow-rose-600/10 cursor-pointer disabled:opacity-50"
            >
              {submitLoading ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
