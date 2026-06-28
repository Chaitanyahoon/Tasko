import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import TaskCard from '../components/TaskCard';
import { MdFormatListBulleted } from 'react-icons/md';
import toast from 'react-hot-toast';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks/assigned-to-me');
      setTasks(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated!');
      fetchMyTasks();
      // Notify sidebar of count change by triggering storage or global state updates if needed
      // (our sidebar counts from a separate query or context, we can refresh it)
      window.dispatchEvent(new Event('taskStatusChanged'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  // Group tasks by status
  const groupedTasks = {
    Todo: tasks.filter((t) => t.status === 'Todo'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    Done: tasks.filter((t) => t.status === 'Done'),
  };

  // Status colors for column headers
  const headerColors = {
    Todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'In Progress': 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    Done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">My Assigned Tasks</h2>
        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">
          Track and manage tasks assigned to you across all projects.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : tasks.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {Object.keys(groupedTasks).map((statusName) => {
            const list = groupedTasks[statusName];
            return (
              <div
                key={statusName}
                className="flex flex-col rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/40"
              >
                {/* Column Header */}
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-xl px-3.5 py-1 text-xs font-bold ${headerColors[statusName]}`}>
                    {statusName}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {list.length} {list.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {/* Column Items */}
                <div className="flex-1 space-y-4">
                  {list.length > 0 ? (
                    list.map((task) => (
                      <div key={task._id} className="relative pt-6">
                        {/* Project Context Label */}
                        <div className="absolute top-0 left-0 right-0 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-slate-400 dark:text-slate-500">Project:</span>
                          <Link
                            to={`/projects/${task.project?._id}`}
                            className="text-brand-600 hover:text-brand-500 dark:text-brand-400 hover:underline truncate max-w-[150px]"
                          >
                            {task.project?.name || 'Unknown Project'}
                          </Link>
                        </div>
                        <TaskCard
                          task={task}
                          onStatusChange={handleStatusChange}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
                      <p className="text-xs italic font-medium">No tasks in this column</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-700/50 dark:text-slate-500">
            <MdFormatListBulleted className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-slate-700 dark:text-slate-200">
            No tasks assigned to you yet
          </h3>
          <p className="mt-1 max-w-xs text-xs text-slate-500 font-medium dark:text-slate-400">
            Once tasks are assigned to your profile by workspace owners, they will list here grouped by status.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
