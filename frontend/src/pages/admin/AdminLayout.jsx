import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, clearAuth } from '../../lib/hooks';
import { LOGO_URL } from '../../lib/content';
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  CalendarCheck,
  KanbanSquare,
  BarChart3,
  Mail,
  Phone,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

const NAV = [
  { to: '/admin',           label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/audits',    label: 'Audits',     icon: ClipboardList },
  { to: '/admin/chats',     label: 'Chats',      icon: MessageSquare },
  { to: '/admin/bookings',  label: 'Bookings',   icon: CalendarCheck },
  { to: '/admin/tasks',     label: 'Tasks',      icon: KanbanSquare },
  { to: '/admin/analytics', label: 'Analytics',  icon: BarChart3 },
  { to: '/admin/emails',    label: 'Emails',     icon: Mail },
  { to: '/admin/calls',     label: 'Calls',      icon: Phone },
  { to: '/admin/settings',  label: 'Settings',   icon: Settings },
];

/* Derive a readable page title from the current path */
function usePageTitle() {
  const { pathname } = useLocation();
  const match = NAV.slice().reverse().find((n) => {
    if (n.end) return pathname === n.to;
    return pathname === n.to || pathname.startsWith(n.to + '/');
  });
  return match ? match.label : 'Admin';
}

/* ---------- Sidebar nav link ---------- */
function SideNavLink({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      data-testid={`admin-nav-${item.label.toLowerCase()}`}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 text-sm transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          isActive
            ? 'text-white font-semibold'
            : 'font-normal hover:text-white',
        ].join(' ')
      }
      style={({ isActive }) => ({
        height: 36,
        borderRadius: 'var(--ax-radius-control)',
        color: isActive ? 'var(--ax-heading)' : 'var(--ax-muted)',
        background: isActive ? 'var(--ax-surface-2)' : 'transparent',
        outline: undefined,
        outlineOffset: undefined,
      })}
    >
      {({ isActive }) => (
        <>
          <item.icon
            strokeWidth={1.5}
            aria-hidden="true"
            style={{
              width: 15,
              height: 15,
              flexShrink: 0,
              color: isActive ? 'var(--ax-accent)' : 'inherit',
            }}
          />
          <span>{item.label}</span>
          {isActive && (
            <span
              aria-hidden="true"
              style={{
                marginLeft: 'auto',
                width: 3,
                height: 14,
                borderRadius: 9999,
                background: 'var(--ax-accent)',
                flexShrink: 0,
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/* ---------- Sidebar content (shared by desktop + drawer) ---------- */
function SidebarContent({ user, onLogout, onNavClick }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--ax-surface)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          borderBottom: '1px solid var(--ax-border)',
          flexShrink: 0,
        }}
      >
        <img
          src={LOGO_URL}
          alt=""
          aria-hidden="true"
          style={{ height: 28, width: 28, borderRadius: 7, flexShrink: 0 }}
        />
        <div style={{ lineHeight: 1 }}>
          <div
            style={{
              color: 'var(--ax-heading)',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '-0.01em',
            }}
          >
            Axovion<span style={{ color: 'var(--ax-accent)' }}>.io</span>
          </div>
          <div
            className="ax-mono-label"
            style={{ marginTop: 3, display: 'block' }}
          >
            Admin
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        aria-label="Admin navigation"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {NAV.map((n) => (
          <SideNavLink key={n.to} item={n} onClick={onNavClick} />
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          borderTop: '1px solid var(--ax-border)',
          padding: '10px 8px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 8px',
            borderRadius: 'var(--ax-radius-control)',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(0,212,255,0.12)',
              border: '1px solid rgba(0,212,255,0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--ax-accent)',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: 'var(--ax-heading)',
                fontSize: 12,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'Admin'}
            </div>
            <div
              style={{
                color: 'var(--ax-muted-2)',
                fontSize: 10,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </div>
          </div>
          <button
            onClick={onLogout}
            aria-label="Sign out"
            data-testid="admin-logout"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              minWidth: 30,
              border: 'none',
              background: 'transparent',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--ax-muted)',
              transition: 'color 160ms ease, background 160ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ax-heading)';
              e.currentTarget.style.background = 'var(--ax-surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ax-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut strokeWidth={1.5} style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile drawer ---------- */
function MobileDrawer({ open, onClose, user, onLogout }) {
  const drawerRef = useRef(null);
  const closeRef = useRef(null);

  /* Trap focus while open */
  useEffect(() => {
    if (!open) return;
    const el = drawerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const prev = document.activeElement;

    if (closeRef.current) closeRef.current.focus();

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const esc = (e) => { if (e.key === 'Escape') onClose(); };

    el.addEventListener('keydown', trap);
    document.addEventListener('keydown', esc);
    return () => {
      el.removeEventListener('keydown', trap);
      document.removeEventListener('keydown', esc);
      if (prev && prev.focus) prev.focus();
    };
  }, [open, onClose]);

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 49,
          backdropFilter: 'blur(2px)',
        }}
      />
      {/* Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 32px rgba(0,0,0,0.7)',
        }}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close navigation menu"
          style={{
            position: 'absolute',
            top: 10,
            right: -44,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ax-surface)',
            border: '1px solid var(--ax-border)',
            borderRadius: 8,
            cursor: 'pointer',
            color: 'var(--ax-muted)',
            zIndex: 1,
          }}
        >
          <X strokeWidth={1.5} style={{ width: 16, height: 16 }} />
        </button>
        <SidebarContent user={user} onLogout={onLogout} onNavClick={onClose} />
      </div>
    </>
  );
}

/* ---------- Main layout ---------- */
const AdminLayout = () => {
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();
  const pageTitle = usePageTitle();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuBtnRef = useRef(null);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/admin/login');
  }, [navigate]);

  if (!isAuthed) return <Navigate to="/admin/login" replace />;

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => {
    setDrawerOpen(false);
    if (menuBtnRef.current) menuBtnRef.current.focus();
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--ax-bg)',
        display: 'flex',
      }}
    >
      {/* Desktop sidebar */}
      <aside
        data-testid="admin-sidebar"
        aria-label="Admin sidebar"
        style={{
          width: 220,
          flexShrink: 0,
          display: 'none',
          borderRight: '1px solid var(--ax-border)',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflowY: 'auto',
        }}
        className="lg:block"
      >
        <SidebarContent user={user} onLogout={logout} onNavClick={undefined} />
      </aside>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        user={user}
        onLogout={logout}
      />

      {/* Right column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header
          data-testid="admin-topbar"
          style={{
            height: 52,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid var(--ax-border)',
            background: 'var(--ax-surface)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              ref={menuBtnRef}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="admin-drawer"
              onClick={openDrawer}
              className="lg:hidden"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                border: 'none',
                background: 'transparent',
                borderRadius: 8,
                cursor: 'pointer',
                color: 'var(--ax-muted)',
                flexShrink: 0,
              }}
            >
              <Menu strokeWidth={1.5} style={{ width: 18, height: 18 }} />
            </button>

            {/* Page title */}
            <span
              style={{
                color: 'var(--ax-heading)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              {pageTitle}
            </span>
          </div>

          {/* Center: search (desktop) */}
          <div
            className="hidden md:flex"
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: 320,
              margin: '0 16px',
            }}
          >
            <Search
              aria-hidden="true"
              strokeWidth={1.5}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 14,
                height: 14,
                color: 'var(--ax-muted-2)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="search"
              placeholder="Search audits, chats, bookings..."
              aria-label="Search"
              style={{
                width: '100%',
                background: 'var(--ax-bg)',
                border: '1px solid var(--ax-border)',
                borderRadius: 'var(--ax-radius-control)',
                padding: '7px 10px 7px 32px',
                fontSize: 12,
                color: 'var(--ax-heading)',
                outline: 'none',
                height: 34,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
            />
          </div>

          {/* Right: view site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--ax-muted)',
              fontSize: 12,
              textDecoration: 'none',
              padding: '6px 8px',
              borderRadius: 8,
              minHeight: 32,
              transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ax-muted)'; }}
          >
            View site
            <ExternalLink strokeWidth={1.5} style={{ width: 11, height: 11 }} />
          </a>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: '20px 16px',
            overflowX: 'hidden',
          }}
          className="md:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
