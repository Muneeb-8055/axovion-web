import React from 'react';
import { Navigate, NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth, clearCustomerAuth } from '../../lib/hooks';
import { LOGO_URL } from '../../lib/content';
import { LayoutDashboard, FileSearch, CalendarCheck, Settings, LogOut } from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/audit', label: 'AI Audit', icon: FileSearch },
  { to: '/dashboard/bookings', label: 'Strategy Calls', icon: CalendarCheck },
  { to: '/dashboard/account', label: 'Account', icon: Settings },
];

export default function CustomerLayout() {
  const { isAuthed, user } = useCustomerAuth();
  const navigate = useNavigate();

  if (!isAuthed) return <Navigate to="/login" replace />;

  const logout = () => {
    clearCustomerAuth();
    navigate('/login');
  };

  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#12121A] border-r border-white/10 shrink-0">
        <Link to="/" className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <img src={LOGO_URL} alt="" className="h-8 w-8 rounded-md" />
          <div className="leading-none">
            <div className="text-white font-extrabold text-base">Axovion<span className="text-[#00D4FF]">.io</span></div>
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#C0C0C8]/55 mt-1">Portal</div>
          </div>
        </Link>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm transition-colors duration-200 ${
                  isActive ? 'bg-[#161622] text-white ring-1 ring-[#00D4FF]/25' : 'text-[#C0C0C8]/80 hover:bg-[#161622] hover:text-white'
                }`
              }
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/35 inline-flex items-center justify-center text-[#00D4FF] font-bold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name || 'Customer'}</div>
              <div className="text-[#C0C0C8]/55 text-[10px] truncate">{user?.email}</div>
            </div>
            <button onClick={logout} aria-label="Logout" className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[#C0C0C8] hover:text-white hover:bg-[#0A0A0F]">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="h-14 bg-[#0A0A0F] border-b border-white/10 flex items-center justify-between px-4 lg:px-8">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md" />
            <span className="text-white font-bold">Axovion</span>
          </Link>
          <div className="hidden lg:block" />
          <button onClick={logout} className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-[#C0C0C8] hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile nav rail */}
        <div className="lg:hidden bg-[#12121A] border-b border-white/10 overflow-x-auto">
          <div className="flex gap-1 px-4 py-2">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs whitespace-nowrap ${isActive ? 'bg-[#161622] text-white ring-1 ring-[#00D4FF]/25' : 'text-[#C0C0C8]/75'}`}>
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
}
