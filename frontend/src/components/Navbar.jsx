import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdMenu, MdDarkMode, MdLightMode, MdAssignmentTurnedIn } from 'react-icons/md';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user } = useAuth();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/80">
      {/* Left side: Hamburger + Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-700 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <MdMenu className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Tasko Logo" className="h-11.5 w-auto object-contain dark:invert" />
        </Link>
      </div>

      {/* Right side: Dark Mode + User Profile */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-500 transition-all hover:bg-slate-50 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-700/40 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand-400"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <MdLightMode className="h-5 w-5 text-amber-400" /> : <MdDarkMode className="h-5 w-5" />}
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center space-x-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs uppercase shadow-sm shadow-brand-500/10">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 leading-none mb-0.5">{user.name}</p>
              <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                {user.organization?.name || 'None'} • <span className="text-brand-600 dark:text-brand-400">{user.role || 'member'}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
