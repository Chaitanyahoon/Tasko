import React from 'react';
import { Link } from 'react-router-dom';
import { MdEdit, MdDelete, MdCalendarToday } from 'react-icons/md';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const { _id, name, description, deadline, stats } = project;

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const total = stats ? stats.total : 0;
  const done = stats ? stats.done : 0;
  const pending = stats ? stats.pending : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-brand-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-800 dark:hover:border-slate-750">
      <div>
        {/* Title and Controls */}
        <div className="flex items-start justify-between">
          <Link to={`/projects/${_id}`} className="block flex-1 pr-4">
            <h4 className="font-display text-lg font-bold text-slate-800 transition-colors group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
              {name}
            </h4>
          </Link>

          {(onEdit || onDelete) && (
            <div className="flex space-x-1.5 opacity-60 transition-opacity group-hover:opacity-100 dark:opacity-40 dark:group-hover:opacity-100">
              {onEdit && (
                <button
                  onClick={() => onEdit(project)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-600 dark:text-slate-500 dark:hover:bg-slate-700/50 dark:hover:text-brand-400"
                  title="Edit Project"
                >
                  <MdEdit className="h-5 w-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(_id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-700/50 dark:hover:text-rose-450"
                  title="Delete Project"
                >
                  <MdDelete className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-500 line-clamp-2 min-h-[2.5rem] dark:text-slate-405">
          {description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Deadline */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-405">
            <MdCalendarToday className="h-4 w-4 text-slate-405 dark:text-slate-500" />
            <span className="font-medium">{formatDate(deadline)}</span>
          </div>

          {/* Stats counts */}
          <div className="text-xs font-semibold text-slate-450 dark:text-slate-400">
            {total} tasks · <span className="text-emerald-600 dark:text-emerald-450">{done} done</span> · <span className="text-indigo-600 dark:text-indigo-400">{pending} pending</span>
          </div>
        </div>

        {/* Details Link */}
        <Link
          to={`/projects/${_id}`}
          className="mt-4 flex items-center justify-center rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-700/30 dark:text-slate-300 dark:hover:bg-brand-950/20 dark:hover:text-brand-400 transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
