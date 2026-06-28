import React from 'react';
import { MdEdit, MdDelete, MdCalendarToday, MdError } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const { _id, title, description, status, priority, dueDate, assignedTo } = task;
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Overdue check (only if task is not Done)
  const isOverdue =
    dueDate && new Date(dueDate) < new Date() && status !== 'Done';

  // Check if assigned to logged in user
  const isAssignedToMe =
    assignedTo &&
    user &&
    ((typeof assignedTo === 'object' && assignedTo._id === user._id) ||
      (typeof assignedTo === 'string' && assignedTo === user._id));

  // Badges styles
  const priorityStyles = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/40',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/40',
    High: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/40',
  };

  const statusStyles = {
    Todo: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/60 dark:text-slate-350 dark:border-slate-650',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/40',
    Done: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/40',
  };

  return (
    <div
      className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-350 hover:shadow-md ${
        isAssignedToMe
          ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/60 shadow-sm shadow-blue-50 dark:shadow-none'
          : isOverdue
          ? 'bg-white dark:bg-slate-800 border-rose-300 dark:border-rose-900/50 shadow-sm shadow-rose-100 dark:shadow-none'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      <div>
        {/* Header: Badges & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                priorityStyles[priority] || priorityStyles.Medium
              }`}
            >
              {priority}
            </span>
            {isOverdue && (
              <span className="flex items-center space-x-0.5 rounded-full bg-rose-100 dark:bg-rose-950/30 px-2 py-0.5 text-[10px] font-bold text-rose-750 dark:text-rose-400">
                <MdError className="h-3 w-3" />
                <span>OVERDUE</span>
              </span>
            )}
            {isAssignedToMe && (
              <span className="rounded-full bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-blue-705 dark:text-blue-400">
                Assigned to you
              </span>
            )}
          </div>

          <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100 dark:group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-50 hover:text-brand-600 dark:text-slate-500 dark:hover:bg-slate-700/50 dark:hover:text-brand-400"
                title="Edit Task"
              >
                <MdEdit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(_id)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-700/50 dark:hover:text-rose-450"
                title="Delete Task"
              >
                <MdDelete className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h5 className="mt-3 font-display text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
          {title}
        </h5>

        {/* Description */}
        {description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Assignee Row */}
        <div className="mt-2.5 flex flex-col text-[11px] leading-tight text-slate-500 dark:text-slate-400">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assignee:</span>
          {assignedTo ? (
            <span className="mt-0.5 font-semibold text-slate-700 dark:text-slate-300">
              {typeof assignedTo === 'object' ? (
                <>
                  {assignedTo.name}{' '}
                  <span className="font-normal text-slate-450 dark:text-slate-500">
                    ({assignedTo.email})
                  </span>
                </>
              ) : (
                assignedTo
              )}
            </span>
          ) : (
            <span className="mt-0.5 italic font-medium text-slate-400 dark:text-slate-500">
              Unassigned
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 dark:border-slate-700/60">
        {/* Due Date */}
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1">
            <MdCalendarToday className={`h-3.5 w-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
            <span className={`font-semibold ${isOverdue ? 'text-rose-500 dark:text-rose-400 font-bold' : ''}`}>
              {formatDate(dueDate)}
            </span>
          </div>
        </div>

        {/* Inline Status */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-2 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          {onStatusChange ? (
            <select
              value={status}
              onChange={(e) => onStatusChange(_id, e.target.value)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer ${
                statusStyles[status] || statusStyles.Todo
              }`}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          ) : (
            <span
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                statusStyles[status] || statusStyles.Todo
              }`}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
