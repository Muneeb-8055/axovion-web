import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import { Trash2, RefreshCw, User, Bot, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/* ---------------------------------------------------------------
   Skeleton items for the chat list
--------------------------------------------------------------- */
const SkeletonListItem = () => (
  <div className="px-4 py-3 border-b border-[var(--ax-border)] animate-pulse" aria-hidden="true">
    <div className="h-3.5 w-2/3 bg-white/8 rounded-sm mb-2" />
    <div className="h-3 w-full bg-white/5 rounded-sm mb-1" />
    <div className="h-3 w-1/2 bg-white/5 rounded-sm" />
  </div>
);

/* ---------------------------------------------------------------
   Main component
--------------------------------------------------------------- */
const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await adminApi.listChats();
      setChats(r.data);
    } catch {
      setError('Could not load chat conversations. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = (id) => setPendingDelete(id);
  const cancelDelete = () => setPendingDelete(null);

  const executeDelete = async () => {
    const id = pendingDelete;
    setPendingDelete(null);
    try {
      await adminApi.deleteChat(id);
      toast.success('Conversation deleted');
      if (selected?.id === id) setSelected(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="py-6 px-4 md:px-8 space-y-4" data-testid="admin-chats-page">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ax-mono-label mb-1">Chats</p>
          <h1 className="text-[var(--ax-heading)] text-xl md:text-2xl font-semibold tracking-tight">
            Chatbot conversations
          </h1>
          {!loading && !error && (
            <p className="text-[var(--ax-muted-2)] text-xs mt-0.5 ax-nums">
              {chats.length} conversation{chats.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--ax-muted)] hover:text-[var(--ax-heading)] min-h-[44px] px-3 rounded-[var(--ax-radius-control)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors"
          aria-label="Refresh conversations"
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

      {/* ---- Split panel layout ---- */}
      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '70vh' }}>
          {/* ---- List panel ---- */}
          <div
            className="lg:col-span-1 rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] overflow-hidden flex flex-col"
            style={{ maxHeight: '75vh' }}
            role="list"
            aria-label="Conversations"
          >
            <div className="overflow-y-auto flex-1">
              {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)}

              {!loading && chats.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full">
                  <MessageSquare
                    className="h-7 w-7 text-[var(--ax-muted-2)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="text-sm text-[var(--ax-muted)]">No conversations yet.</p>
                  <p className="text-xs text-[var(--ax-muted-2)]">
                    Chat sessions from your website will appear here.
                  </p>
                </div>
              )}

              {!loading &&
                chats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    data-testid={`chat-list-item-${c.id}`}
                    role="listitem"
                    aria-pressed={selected?.id === c.id}
                    className={[
                      'w-full text-left px-4 py-3 border-b border-[var(--ax-border)] last:border-0 transition-colors',
                      selected?.id === c.id
                        ? 'bg-[var(--ax-accent)]/8 ring-1 ring-inset ring-[var(--ax-accent)]/25'
                        : 'hover:bg-white/[0.03]',
                    ].join(' ')}
                  >
                    <div className="text-[var(--ax-heading)] text-sm font-medium truncate">
                      {c.contactName || c.contactEmail || c.sessionId.slice(0, 18)}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--ax-muted)] line-clamp-2">
                      {c.messages?.[c.messages.length - 1]?.content || 'No messages'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--ax-muted-2)]">
                      <span className="ax-nums">{c.messages?.length || 0} msgs</span>
                      <span aria-hidden="true">|</span>
                      <span>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : ''}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* ---- Transcript panel ---- */}
          <div
            className="lg:col-span-2 rounded-[var(--ax-radius-panel)] bg-[var(--ax-surface)] border border-[var(--ax-border)] flex flex-col"
            style={{ minHeight: '70vh', maxHeight: '75vh' }}
          >
            {selected ? (
              <>
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-[var(--ax-border)] flex items-center justify-between gap-3 shrink-0">
                  <div className="min-w-0">
                    <div className="text-[var(--ax-heading)] font-medium text-sm truncate">
                      {selected.contactName || 'Anonymous visitor'}
                    </div>
                    <div className="text-xs text-[var(--ax-muted-2)] truncate">
                      {selected.contactEmail || selected.sessionId}
                    </div>
                  </div>
                  <button
                    onClick={() => confirmDelete(selected.id)}
                    data-testid="chat-delete-button"
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--ax-muted)] hover:text-[var(--ax-error)] min-h-[44px] px-3 rounded-[var(--ax-radius-control)] focus-visible:outline-2 focus-visible:outline-[var(--ax-accent)] transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    Delete
                  </button>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-5 space-y-3"
                  data-testid="chat-transcript"
                  aria-label="Conversation transcript"
                  role="log"
                >
                  {(selected.messages || []).length === 0 && (
                    <p className="text-center text-xs text-[var(--ax-muted-2)] mt-8">No messages in this conversation.</p>
                  )}
                  {(selected.messages || []).map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {m.role !== 'user' && (
                        <div
                          className="h-7 w-7 rounded-full bg-[var(--ax-accent)]/12 border border-[var(--ax-accent)]/30 inline-flex items-center justify-center shrink-0 mt-0.5"
                          aria-label="Bot"
                        >
                          <Bot className="h-3.5 w-3.5 text-[var(--ax-accent)]" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                      )}
                      <div
                        className={[
                          'max-w-[78%] rounded-[var(--ax-radius-control)] px-4 py-2.5 text-sm leading-relaxed border',
                          m.role === 'user'
                            ? 'bg-[var(--ax-surface-2)] text-[var(--ax-heading)] border-[var(--ax-border-strong)]'
                            : 'bg-[var(--ax-bg)] text-[var(--ax-text)] border-[var(--ax-border)]',
                        ].join(' ')}
                      >
                        {m.content}
                        {m.timestamp && (
                          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[var(--ax-muted-2)]">
                            {new Date(m.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                      {m.role === 'user' && (
                        <div
                          className="h-7 w-7 rounded-full bg-white/6 border border-[var(--ax-border)] inline-flex items-center justify-center shrink-0 mt-0.5"
                          aria-label="Visitor"
                        >
                          <User className="h-3.5 w-3.5 text-[var(--ax-muted)]" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
                <MessageSquare
                  className="h-7 w-7 text-[var(--ax-muted-2)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <p className="text-sm text-[var(--ax-muted)]">Select a conversation to view the transcript.</p>
              </div>
            )}
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
            <h2 className="text-[var(--ax-heading)] font-semibold text-base">Delete this conversation?</h2>
            <p className="text-sm text-[var(--ax-muted)]">
              All messages in this session will be permanently removed and cannot be recovered.
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

export default AdminChats;
