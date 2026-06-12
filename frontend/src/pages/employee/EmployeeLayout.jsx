import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEmployeeAuth, clearEmployeeAuth } from '../../lib/hooks';
import { LOGO_URL } from '../../lib/content';
import { LayoutDashboard, Clock, CalendarDays, KanbanSquare, Timer, User, LogOut } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';

const NAV = [
  { to: '/employee', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/employee/attendance', label: 'Attendance', icon: Clock },
  { to: '/employee/tasks', label: 'My Tasks', icon: KanbanSquare },
  { to: '/employee/leaves', label: 'Leaves', icon: CalendarDays },
  { to: '/employee/overtime', label: 'Overtime', icon: Timer },
  { to: '/employee/profile', label: 'Profile', icon: User },
];

export function EmployeeLayout() {
  const { user } = useEmployeeAuth();
  const navigate = useNavigate();

  const logout = () => {
    clearEmployeeAuth();
    navigate('/employee/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#12121A] border-r border-[#1E1E2E] flex flex-col fixed h-full z-10">
        <div className="px-5 py-5 border-b border-[#1E1E2E]">
          <img src={LOGO_URL} alt="Axovion" className="h-7" />
          <p className="text-[#606070] text-xs mt-1">Employee Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#6366F1]/10 text-[#6366F1]'
                    : 'text-[#A0A0B0] hover:text-white hover:bg-[#1E1E2E]'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#1E1E2E]">
          {user?.name && (
            <div className="mb-3 px-1">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-[#606070] truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#A0A0B0] hover:text-white hover:bg-[#1E1E2E] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-56 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-[#12121A] border-b border-[#1E1E2E] flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="text-sm text-[#606070]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell useEmployeeToken />
            <a href="/" target="_blank" rel="noreferrer" className="text-xs text-[#606070] hover:text-white">
              axovion.io ↗
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}