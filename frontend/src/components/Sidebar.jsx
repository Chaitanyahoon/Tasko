import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdPerson, MdLogout, MdClose, MdAssignmentTurnedIn } from 'react-icons/md';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTasksCount, setActiveTasksCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const fetchActiveCount = async () => {
    if (!token) return;
    try {
      const res = await api.get('/tasks/assigned-to-me');
      const activeTasks = res.data.filter((t) => t.status !== 'Done');
      setActiveTasksCount(activeTasks.length);
    } catch (err) {
      console.error('Failed to fetch active tasks count in sidebar:', err);
    }
  };

  useEffect(() => {
    fetchActiveCount();

    // Listen for task status change events to update count in real-time
    window.addEventListener('taskStatusChanged', fetchActiveCount);
    return () => {
      window.removeEventListener('taskStatusChanged', fetchActiveCount);
    };
  }, [token]);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: MdDashboard,
    },
    {
      name: 'My Tasks',
      path: '/my-tasks',
      icon: MdAssignmentTurnedIn,
      badge: activeTasksCount,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: MdPerson,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300 dark:bg-slate-950">
      {/* Sidebar Header for Mobile */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 lg:hidden">
        <span className="font-display text-lg font-bold text-white">Menu Navigation</span>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <MdClose className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5.5 w-5.5" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-950/20 hover:text-rose-300"
        >
          <MdLogout className="h-5.5 w-5.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg Screens) */}
      <aside className="hidden h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-slate-900 lg:block lg:sticky lg:top-16 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-full flex-col text-slate-350">
          <nav className="flex-1 space-y-1.5 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/35'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5.5 w-5.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-slate-800/80 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-950/20 hover:text-rose-300"
            >
              <MdLogout className="h-5.5 w-5.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Slide-out drawer) */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <aside
          className={`absolute bottom-0 top-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
