import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Trash2, RefreshCw, User, Bot } from 'lucide-react';
import { toast } from 'sonner';

const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await adminApi.listChats(); setChats(r.data); }
    catch (e) { toast.error('Failed to load chats'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this chat?')) return;
    try { await adminApi.deleteChat(id); toast.success('Deleted'); if (selected?.id === id) setSelected(null); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6" data-testid="admin-chats-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Chats</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Chatbot conversations</h1>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 rounded-[16px] bg-[#12121A] border border-white/10 overflow-hidden max-h-[70vh] overflow-y-auto">
          {loading && <p className="p-6 text-[#C0C0C8]/55 text-sm">Loading…</p>}
          {!loading && chats.length === 0 && <p className="p-6 text-[#C0C0C8]/55 text-sm">No conversations yet.</p>}
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              data-testid={`chat-list-item-${c.id}`}
              className={`w-full text-left px-4 py-3 border-b border-white/5 last:border-0 transition-colors ${selected?.id === c.id ? 'bg-[#00D4FF]/8 ring-1 ring-inset ring-[#00D4FF]/25' : 'hover:bg-white/3'}`}
            >
              <div className="text-white text-sm font-semibold truncate">{c.contactName || c.contactEmail || c.sessionId.slice(0, 18)}</div>
              <div className="mt-1 text-xs text-[#C0C0C8]/60 line-clamp-2">{c.messages?.[c.messages.length - 1]?.content || '—'}</div>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#C0C0C8]/55">
                <span>{c.messages?.length || 0} msgs</span>
                <span>·</span>
                <span>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : ''}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 rounded-[16px] bg-[#12121A] border border-white/10 flex flex-col min-h-[70vh]">
          {selected ? (
            <>
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{selected.contactName || 'Anonymous visitor'}</div>
                  <div className="text-xs text-[#C0C0C8]/60">{selected.contactEmail || selected.sessionId}</div>
                </div>
                <button onClick={() => remove(selected.id)} data-testid="chat-delete-button" className="text-xs text-[#C0C0C8] hover:text-[#EF4444] inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4" data-testid="chat-transcript">
                {(selected.messages || []).map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role !== 'user' && <div className="h-7 w-7 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/35 inline-flex items-center justify-center shrink-0"><Bot className="h-3.5 w-3.5 text-[#00D4FF]" /></div>}
                    <div className={`max-w-[75%] rounded-[12px] px-4 py-2.5 text-sm leading-relaxed border ${m.role === 'user' ? 'bg-[#161622] text-white border-white/10' : 'bg-[#0A0A0F] text-[#C0C0C8] border-white/8'}`}>
                      {m.content}
                      {m.timestamp && <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[#C0C0C8]/40">{new Date(m.timestamp).toLocaleTimeString()}</div>}
                    </div>
                    {m.role === 'user' && <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 inline-flex items-center justify-center shrink-0"><User className="h-3.5 w-3.5 text-[#C0C0C8]" /></div>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#C0C0C8]/55 text-sm">Select a conversation to view the transcript.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
