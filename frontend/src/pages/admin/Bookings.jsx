import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminBookings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await adminApi.listBookings(); setItems(r.data); }
    catch (e) { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try { await adminApi.updateBookingStatus(id, status); toast.success('Updated'); load(); }
    catch (e) { toast.error('Update failed'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try { await adminApi.deleteBooking(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6" data-testid="admin-bookings-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Bookings</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Consultation bookings</h1>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      <div className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0F] border-b border-white/10">
              <tr className="text-left">
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Name</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Email</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Phone</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Message</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Status</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/2" data-testid={`booking-row-${b.id}`}>
                  <td className="px-4 py-3 text-white font-semibold">{b.name}</td>
                  <td className="px-4 py-3 text-[#C0C0C8]">{b.email}</td>
                  <td className="px-4 py-3 text-[#C0C0C8]">{b.phone || '—'}</td>
                  <td className="px-4 py-3 text-[#C0C0C8] max-w-xs truncate">{b.message || '—'}</td>
                  <td className="px-4 py-3">
                    <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)} className="bg-[#0A0A0F] border border-white/10 rounded-md px-2 py-1 text-xs text-white">
                      <option value="new">new</option>
                      <option value="confirmed">confirmed</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#C0C0C8]/65">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(b.id)} className="h-7 w-7 inline-flex items-center justify-center rounded text-[#C0C0C8] hover:text-[#EF4444]"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (<tr><td colSpan="7" className="px-6 py-12 text-center text-[#C0C0C8]/55">No bookings yet.</td></tr>)}
              {loading && (<tr><td colSpan="7" className="px-6 py-12 text-center text-[#C0C0C8]/55">Loading…</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
