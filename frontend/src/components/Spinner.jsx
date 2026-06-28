import React from 'react';

const Spinner = ({ fullPage = false }) => {
  const spinnerMarkup = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-dashed border-slate-300 border-b-indigo-400 animate-spin duration-1000"></div>
      </div>
      <p className="text-slate-500 font-medium text-sm tracking-wide animate-pulse">Loading portal...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
        {spinnerMarkup}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-8">
      {spinnerMarkup}
    </div>
  );
};

export default Spinner;
