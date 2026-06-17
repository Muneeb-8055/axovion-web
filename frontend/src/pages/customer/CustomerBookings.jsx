import React, { useEffect, useState } from 'react';
import { custApi } from '../../lib/api';
import { CalendarCheck, Loader, Send } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR = {
  new: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/25',
  confirmed: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/22',
  completed: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/22',
  cancelled: 'bg-[#EF4444]/12 text-[#EF4444] border-[#EF4444]/22',
};

const inputCls = "w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60 transition-colors duration-200";

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ preferredTime: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await custApi.dashboard(); setBookings(r.data?.bookings || []); }
    catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { toast.error('Please tell us what you’d like to discuss.'); return; }
    setSubmitting(true);
    try {
      await custApi.createBooking(form);
      toast.success('Strategy call requested!');
      setForm({ preferredTime: '', message: '' });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to request call.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Strategy Calls</h1>
        <p className="text-[#C0C0C8]/60 text-sm mt-1">Request a call with our team to discuss your automation roadmap.</p>
      </div>

      {/* Request form */}
      <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-6">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-[#00D4FF]" /> Request a call</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">Preferred time</label>
            <input className={inputCls} placeholder="e.g. Weekday mornings, EST" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-1.5">What would you like to discuss?</label>
            <textarea rows="4" className={inputCls} placeholder="Tell us about your goals or questions…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-5 py-2.5 text-sm font-bold hover:bg-[#FBBF24] transition-colors duration-200 disabled:opacity-60">
            {submitting ? 'Sending…' : <>Request call <Send className="h-4 w-4" /></>}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10"><h2 className="text-white font-bold">Your requests</h2></div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader className="h-5 w-5 text-[#00D4FF] animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center"><p className="text-[#C0C0C8]/55 text-sm">No requests yet.</p></div>
        ) : (
          <div className="divide-y divide-white/5">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-white text-sm">{b.message || 'Strategy call request'}</p>
                  <p className="text-[#C0C0C8]/55 text-xs mt-0.5">{b.preferredTime || 'No time specified'} · {b.createdAt?.split('T')[0]}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${STATUS_COLOR[b.status] || STATUS_COLOR.new}`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
