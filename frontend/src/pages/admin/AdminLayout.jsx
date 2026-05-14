import React from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, clearAuth } from '../../lib/hooks';
import { LOGO_URL } from '../../lib/content';
import { LayoutDashboard, ClipboardList, MessageSquare, CalendarCheck, KanbanSquare, BarChart3, Mail, Phone, Settings, LogOut, Search } from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/audits', label: 'Audits', icon: ClipboardList },
  { to: '/admin/chats', label: 'Chats', icon: MessageSquare },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/tasks', label: 'Tasks', icon: KanbanSquare },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/emails', label: 'Emails', icon: Mail },
  { to: '/admin/calls', label: 'Calls', icon: Phone },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();
  if (!isAuthed) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#12121A] border-r border-white/10 shrink-0" data-testid="admin-sidebar">
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10">
          <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md" />
          <div className="leading-none">
            <div className="text-white font-extrabold text-base">Axovion<span className="text-[#00D4FF]">.io</span></div>
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mt-0.5">Admin</div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`admin-nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#161622] text-white ring-1 ring-[#00D4FF]/25'
                    : 'text-[#C0C0C8]/80 hover:bg-[#161622] hover:text-white'
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/35 inline-flex items-center justify-center text-[#00D4FF] font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</div>
              <div className="text-[#C0C0C8]/55 text-[10px] truncate">{user?.email}</div>
            </div>
            <button onClick={logout} aria-label="Logout" data-testid="admin-logout" className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[#C0C0C8] hover:text-white hover:bg-[#0A0A0F]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 bg-[#0A0A0F] border-b border-white/10 flex items-center justify-between px-4 lg:px-6" data-testid="admin-topbar">
          <div className="lg:hidden flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md" />
            <span className="text-white font-bold">Axovion Admin</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
              <input placeholder="Search audits, chats, bookings…" className="w-full bg-[#12121A] border border-white/10 rounded-[10px] pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/45" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className="text-xs text-[#C0C0C8] hover:text-white">View site ↗</a>
            <button onClick={logout} className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-[#C0C0C8] hover:text-white hover:bg-[#161622]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile nav rail */}
        <div className="lg:hidden bg-[#12121A] border-b border-white/10 overflow-x-auto">
          <div className="flex gap-1 px-4 py-2">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs whitespace-nowrap ${isActive ? 'bg-[#0A0A0F] text-white ring-1 ring-[#00D4FF]/25' : 'text-[#C0C0C8]/75'}`}>
                <n.icon className="h-3.5 w-3.5" /> {n.label}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
