import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { RefreshCw, Send, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

const AdminEmails = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState({ to: '', subject: '', html: '' });
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await adminApi.listEmails(); setItems(r.data); }
    catch (e) { toast.error('Failed to load emails'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!draft.to || !draft.subject || !draft.html) { toast.error('All fields required'); return; }
    setSending(true);
    try { const r = await adminApi.sendEmail(draft); r.data.ok ? toast.success('Email sent') : toast.error(r.data.error || 'Send failed'); setOpen(false); setDraft({ to: '', subject: '', html: '' }); load(); }
    catch (e) { toast.error('Send failed'); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6" data-testid="admin-emails-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Emails</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Email logs &amp; automation</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button data-testid="email-send-button" className="inline-flex items-center gap-1.5 text-sm bg-[#F97316] text-[#0A0A0F] px-3 py-2 rounded-[10px] font-bold hover:bg-[#FBBF24]"><Send className="h-3.5 w-3.5" /> Send email</button>
            </DialogTrigger>
            <DialogContent className="bg-[#12121A] border border-white/10 max-w-2xl">
              <DialogHeader><DialogTitle className="text-white">Send manual email</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} placeholder="recipient@example.com" data-testid="email-to-input" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="Subject" data-testid="email-subject-input" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                <textarea value={draft.html} onChange={(e) => setDraft({ ...draft, html: e.target.value })} rows="8" placeholder="HTML body" data-testid="email-html-input" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm font-mono text-white placeholder:text-[#C0C0C8]/40" />
                <button onClick={send} disabled={sending} data-testid="email-form-submit" className="w-full bg-[#F97316] text-[#0A0A0F] rounded-[10px] px-4 py-2.5 text-sm font-bold hover:bg-[#FBBF24] disabled:opacity-60">{sending ? 'Sending…' : 'Send via Resend'}</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0F] border-b border-white/10">
              <tr className="text-left">
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Status</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">To</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Subject</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Template</th>
                <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Sent</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/2" data-testid={`email-row-${e.id}`}>
                  <td className="px-4 py-3">{e.status === 'sent' ? <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> : <XCircle className="h-4 w-4 text-[#EF4444]" />}</td>
                  <td className="px-4 py-3 text-[#C0C0C8]">{e.toEmail}</td>
                  <td className="px-4 py-3 text-white max-w-md truncate">{e.subject}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#C0C0C8]/65">{e.template}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#C0C0C8]/65">{e.sentAt ? new Date(e.sentAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {items.length === 0 && !loading && (<tr><td colSpan="5" className="px-6 py-12 text-center text-[#C0C0C8]/55">No emails yet.</td></tr>)}
              {loading && (<tr><td colSpan="5" className="px-6 py-12 text-center text-[#C0C0C8]/55">Loading…</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEmails;
