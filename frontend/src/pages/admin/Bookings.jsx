import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import { RefreshCw, Trash2, CalendarCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/* ---------------------------------------------------------------
   Status badge: conveys status via label + color (not color only)
--------------------------------------------------------------- */
const BookingStatusBadge = ({ status }) => {
  const variants = {
    new: {
      cls: 'bg-white/8 text-[var(--ax-heading)] border-white/15',
      label: 'New',
    },
    confirmed: {
      cls: 'bg-[var(--ax-accent)]/10 text-[var(--ax-accent)] border-[var(--ax-accent)]/25',
      label: 'Confirmed',
    },
    completed: {
      cls: 'bg-[var(--ax-success)]/10 text-[var(--ax-success)] border-[var(--ax-success)]/25',
      label: 'Completed',
    },
    cancelled: {
      cls: 'bg-white/4 text-[var(--ax-muted-2)] border-white/8',
      label: 'Cancelled',
    },
  };
  const v = variants[status] || variants.new;
  return (
    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${v.cls}`}>
      {v.label}
    </span>
  );
};

/* ---------------------------------------------------------------
   Skeleton row
--------------------------------------------------------------- */
const SkeletonRow = () => (
  <tr className="border-b border-[var(--ax-border)]" aria-hidden="true">
    {[30, 45, 30, 50, 25, 30, 15].map((w, i) => (
      <td key={i} className="px-4 py-2.5">
        <div
          className="h-3 rounded-sm bg-white/6 animate-pulse"
          style={{ width: `${w}%` }}
        />
      </td>
    ))}
  </tr>
);

/* ---------------------------------------------------------------
   Main component
--------------------------------------------------------------- */
const AdminBookings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await adminApi.listBookings();
      setItems(r.data);
    } catch {
      setError('Could not load bookings. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateBookingStatus(id, status);
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const confirmDelete = (id) => setPendingDelete(id);
  const cancelDelete = () => setPendingDelete(null);

  const executeDelete = async () => {
    const id = pendingDelete;
    setPendingDelete(null);
    try {
      await adminApi.deleteBooking(id);
      toast.success('Booking deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="py-6 px-4 md:px-8 space-y-4" data-testid="admin-bookings-page">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ax-mono-label mb-1">Bookings</p>
          <h1 className="text-[var(--ax-heading)] text-xl md:text-2xl font-semibold tracking-tight">
            Consultation bookings
          </h1>
          {!loading && !error && (
            <p className="text-[var(--ax-muted-2)] text-xs mt-0.5 ax-nums">
              {items.length} booking{items.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--ax-muted)] hover:text-[var(--ax-heading)] min-h-[44px] px-3 rounded-[var(--ax-radius-control)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
          aria-label="Refresh booking list"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* ---- Error state ---- */}
      {error && (
        <div className="flex items-start gap-3 rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-error)]/25 p-4">
          <AlertCircle className="h-4 w-4 text-[var(--ax-error)] shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="text-sm text-[var(--ax-heading)] font-medium">Load failed</p>
            <p className="text-xs text-[var(--ax-muted)] mt-0.5">{error}</p>
            <button
              onClick={load}
              className="mt-2 text-xs text-[var(--ax-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)]"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ---- Table ---- */}
      {!error && (
        <div className="rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-[var(--ax-bg)] border-b border-[var(--ax-border)] text-left">
                  <Th scope="col">Name</Th>
                  <Th scope="col">Email</Th>
                  <Th scope="col">Phone</Th>
                  <Th scope="col">Message</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Date</Th>
                  <Th scope="col"><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <CalendarCheck className="h-7 w-7 text-[var(--ax-muted-2)]" strokeWidth={1.5} aria-hidden="true" />
                        <p className="text-sm text-[var(--ax-muted)]">No consultation bookings yet.</p>
                        <p className="text-xs text-[var(--ax-muted-2)]">
                          Bookings submitted through the website will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && items.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-[var(--ax-border)] hover:bg-white/[0.02] transition-colors"
                    data-testid={`booking-row-${b.id}`}
                  >
                    <Td className="text-[var(--ax-heading)] font-medium">{b.name}</Td>
                    <Td>
                      <a
                        href={`mailto:${b.email}`}
                        className="text-[var(--ax-muted)] hover:text-[var(--ax-accent)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
                      >
                        {b.email}
                      </a>
                    </Td>
                    <Td className="text-[var(--ax-muted)] ax-nums">
                      {b.phone ? (
                        <a
                          href={`tel:${b.phone}`}
                          className="hover:text-[var(--ax-accent)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
                        >
                          {b.phone}
                        </a>
                      ) : (
                        <span className="text-[var(--ax-muted-2)]">n/a</span>
                      )}
                    </Td>
                    <Td className="text-[var(--ax-muted)] max-w-[220px] truncate">
                      {b.message || <span className="text-[var(--ax-muted-2)]">n/a</span>}
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-1.5">
                        <BookingStatusBadge status={b.status} />
                        <label className="sr-only" htmlFor={`booking-status-${b.id}`}>
                          Update status for {b.name}
                        </label>
                        <select
                          id={`booking-status-${b.id}`}
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className="bg-[var(--ax-bg)] border border-[var(--ax-border)] rounded-[8px] px-2 py-1 text-xs text-[var(--ax-heading)] focus:outline-none focus:border-[var(--ax-accent)] cursor-pointer min-h-[36px] transition-colors"
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </Td>
                    <Td className="ax-nums text-xs text-[var(--ax-muted-2)]">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'n/a'}
                    </Td>
                    <Td>
                      <button
                        onClick={() => confirmDelete(b.id)}
                        aria-label={`Delete booking from ${b.name}`}
                        className="h-[44px] w-[44px] inline-flex items-center justify-center rounded-[var(--ax-radius-control)] text-[var(--ax-muted)] hover:text-[var(--ax-error)] hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Confirm delete dialog ---- */}
      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm deletion"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div className="w-full max-w-sm bg-[var(--ax-surface-2)] border border-[var(--ax-border-strong)] rounded-[var(--ax-radius-panel)] p-6 space-y-4">
            <h2 className="text-[var(--ax-heading)] font-semibold text-base">Delete this booking?</h2>
            <p className="text-sm text-[var(--ax-muted)]">
              This booking record will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm text-[var(--ax-muted)] hover:text-[var(--ax-heading)] rounded-[var(--ax-radius-control)] bg-[var(--ax-surface)] border border-[var(--ax-border)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] min-h-[44px] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-semibold text-white rounded-[var(--ax-radius-control)] bg-[var(--ax-error)]/90 hover:bg-[var(--ax-error)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] min-h-[44px] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Th = ({ children, scope }) => (
  <th
    scope={scope}
    className="px-4 py-2.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ax-muted-2)] font-normal"
  >
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-2.5 ${className}`}>{children}</td>
);

export default AdminBookings;
