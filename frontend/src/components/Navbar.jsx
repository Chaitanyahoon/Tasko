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
          <img src="/logo.png" alt="Tasko Logo" className="h-8.5 w-auto object-contain dark:invert" />
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
          <div className="flex items-center space-x-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-900">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold dark:text-slate-500">
                {user.organization?.name || 'None'} ({user.role || 'member'})
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
