import React, { useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container: Full-screen on mobile, rounded box on desktop */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-white p-6 shadow-2xl transition-all duration-300 ease-out scale-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 max-h-screen sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-2xl flex flex-col justify-between sm:justify-start">
        <div>
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
            <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-105 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-350 transition-colors"
            >
              <MdClose className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-slate-600 dark:text-slate-300">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
