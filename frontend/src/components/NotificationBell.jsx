import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { adminApi } from '../lib/api';

const NOTIF_COLORS = {
  leave_applied: 'bg-[#6366F1]/15 text-[#6366F1]',
  leave_approved: 'bg-[#10B981]/15 text-[#10B981]',
  leave_rejected: 'bg-[#EF4444]/15 text-[#EF4444]',
  attendance_pending: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  ot_approved: 'bg-[#F97316]/15 text-[#F97316]',
  correction_requested: 'bg-[#FBBF24]/15 text-[#FBBF24]',
};

const NOTIF_LABELS = {
  leave_applied: 'Leave Applied',
  leave_approved: 'Leave Approved',
  leave_rejected: 'Leave Rejected',
  attendance_pending: 'Attendance Pending',
  ot_approved: 'Overtime Approved',
  correction_requested: 'Correction Requested',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotifications();
      setNotifications(res.data?.slice(0, 10) || []);
    } catch (e) {
      // silently fail — notifications are non-critical
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await adminApi.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (open && notifications.length === 0 && !loading) {
    fetchNotifications();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetchNotifications(); }}
        className="relative h-9 w-9 inline-flex items-center justify-center rounded-[10px] text-[#C0C0C8] hover:text-white hover:bg-[#161622] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#EF4444] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#12121A] border border-white/10 rounded-[16px] shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[#00D4FF] text-xs hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="text-center text-[#C0C0C8]/45 text-xs py-6">Loading...</p>}
            {!loading && notifications.length === 0 && (
              <p className="text-center text-[#C0C0C8]/45 text-xs py-6">No notifications</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-[#161622] ${!n.read ? 'bg-[#161622]/50' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 shrink-0 ${NOTIF_COLORS[n.type] || 'bg-white/10 text-white'}`}>
                    {NOTIF_LABELS[n.type] || n.type}
                  </span>
                </div>
                <p className="text-white text-xs mt-1 leading-snug">{n.message || n.employeeName || NOTIF_LABELS[n.type] || ''}</p>
                {n.date && <p className="text-[#C0C0C8]/45 text-[10px] mt-0.5">{n.date}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;