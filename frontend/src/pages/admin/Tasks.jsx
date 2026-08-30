import React, { useEffect, useRef, useState, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import {
  Plus, Trash2, RefreshCw, AlertCircle, ClipboardList,
  ChevronRight, X, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog';

// ---- constants ---------------------------------------------------------------

const COLS = [
  { id: 'todo',        label: 'To Do',       accent: 'var(--ax-muted)' },
  { id: 'in-progress', label: 'In Progress',  accent: 'var(--ax-info)' },
  { id: 'review',      label: 'Review',       accent: 'var(--ax-warn)' },
  { id: 'done',        label: 'Done',         accent: 'var(--ax-success)' },
];

const PRIORITY_META = {
  urgent: { label: 'Urgent', color: 'var(--ax-error)' },
  high:   { label: 'High',   color: 'var(--ax-warn)' },
  medium: { label: 'Medium', color: 'var(--ax-warn)' },
  low:    { label: 'Low',    color: 'var(--ax-info)' },
};

const EMPTY_DRAFT = { title: '', description: '', priority: 'medium', status: 'todo' };

// ---- helpers ---------------------------------------------------------------

function priorityStyle(p) {
  const meta = PRIORITY_META[p] || PRIORITY_META.medium;
  return {
    color: meta.color,
    borderColor: meta.color + '44',
    backgroundColor: meta.color + '1a',
  };
}

// ---- Skeleton ---------------------------------------------------------------

function ColumnSkeleton() {
  return (
    <div
      style={{
        background: 'var(--ax-surface)',
        borderRadius: 'var(--ax-radius-panel)',
        border: '1px solid var(--ax-border)',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div className="skel" style={{ width: 72, height: 14, borderRadius: 4 }} />
        <div className="skel" style={{ width: 20, height: 14, borderRadius: 4 }} />
      </div>
      {[1, 2].map((n) => (
        <div key={n} className="skel" style={{ width: '100%', height: 68, borderRadius: 'var(--ax-radius-control)', marginBottom: 10 }} />
      ))}
    </div>
  );
}

// ---- TaskCard ---------------------------------------------------------------

function TaskCard({ task, onMove, onDelete }) {
  const nextCol = COLS[COLS.findIndex((c) => c.id === task.status) + 1];
  const [confirming, setConfirming] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleMove = async () => {
    if (!nextCol) return;
    setMoving(true);
    await onMove(task, nextCol.id);
    setMoving(false);
  };

  return (
    <article
      data-testid={`task-card-${task.id}`}
      style={{
        background: 'var(--ax-bg)',
        border: '1px solid var(--ax-border)',
        borderRadius: 'var(--ax-radius-control)',
        padding: '12px',
        transition: 'border-color var(--ax-duration-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.22)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ax-border)'; }}
    >
      {/* title + delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <h4
          style={{
            flex: 1,
            color: 'var(--ax-heading)',
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {task.title}
        </h4>
        {confirming ? (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => { setConfirming(false); onDelete(task.id); }}
              aria-label="Confirm delete"
              style={{
                minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ax-error)', background: 'none', border: 'none',
                cursor: 'pointer', borderRadius: 'var(--ax-radius-control)',
              }}
            >
              <Trash2 size={13} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setConfirming(false)}
              aria-label="Cancel delete"
              style={{
                minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ax-muted)', background: 'none', border: 'none',
                cursor: 'pointer', borderRadius: 'var(--ax-radius-control)',
              }}
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Delete task"
            style={{
              minWidth: 44, minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ax-muted)', background: 'none', border: 'none',
              cursor: 'pointer', borderRadius: 'var(--ax-radius-control)',
              transition: 'color var(--ax-duration-fast)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ax-error)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ax-muted)'; }}
          >
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {task.description && (
        <p style={{
          marginTop: 6,
          color: 'var(--ax-muted)',
          fontSize: 12,
          lineHeight: 1.5,
        }}>
          {task.description}
        </p>
      )}

      {/* footer: priority + advance button */}
      <div style={{
        marginTop: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <span
          className="ax-nums"
          style={{
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '2px 7px',
            borderRadius: 'var(--ax-radius-pill)',
            border: '1px solid',
            ...priorityStyle(task.priority),
          }}
        >
          {(PRIORITY_META[task.priority] || PRIORITY_META.medium).label}
        </span>

        {nextCol && (
          <button
            onClick={handleMove}
            disabled={moving}
            aria-label={`Move to ${nextCol.label}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              color: 'var(--ax-accent)',
              fontSize: 11,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: moving ? 'wait' : 'pointer',
              padding: '6px 0',
              minHeight: 44,
              transition: 'opacity var(--ax-duration-fast)',
              opacity: moving ? 0.5 : 1,
            }}
          >
            {moving
              ? <Loader2 size={11} strokeWidth={1.5} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <ChevronRight size={11} strokeWidth={1.5} />
            }
            {nextCol.label}
          </button>
        )}
      </div>
    </article>
  );
}

// ---- Column ---------------------------------------------------------------

function Column({ col, tasks, onMove, onDelete }) {
  const revealRef = useRef(null);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('ax-reveal-in');
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={revealRef}
      className="ax-reveal"
      style={{
        background: 'var(--ax-surface)',
        border: '1px solid var(--ax-border)',
        borderRadius: 'var(--ax-radius-panel)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* column header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: col.accent,
              flexShrink: 0,
            }}
          />
          <h3 style={{ color: 'var(--ax-heading)', fontWeight: 600, fontSize: 13, margin: 0 }}>
            {col.label}
          </h3>
        </div>
        <span
          className="ax-nums"
          style={{ fontSize: 11, color: 'var(--ax-muted-2)', fontWeight: 500 }}
        >
          {tasks.length}
        </span>
      </div>

      {/* hairline below header */}
      <div style={{ height: 1, background: 'var(--ax-border)', marginBottom: 12 }} />

      {/* tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 96 }}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onMove={onMove} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <p style={{
            color: 'var(--ax-muted-2)',
            fontSize: 12,
            textAlign: 'center',
            paddingTop: 20,
            paddingBottom: 20,
          }}>
            No items
          </p>
        )}
      </div>
    </div>
  );
}

// ---- CreateDialog ---------------------------------------------------------------

function CreateDialog({ open, onOpenChange, onCreated }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(EMPTY_DRAFT);
      setTimeout(() => titleRef.current?.focus(), 60);
    }
  }, [open]);

  const handle = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const submit = async () => {
    if (!draft.title.trim()) { toast.error('Title is required'); return; }
    setBusy(true);
    try {
      await adminApi.createTask(draft);
      toast.success('Task created');
      onOpenChange(false);
      onCreated();
    } catch {
      toast.error('Could not create task');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--ax-bg)',
    border: '1px solid var(--ax-border)',
    borderRadius: 'var(--ax-radius-control)',
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--ax-heading)',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color var(--ax-duration-fast)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ background: 'var(--ax-surface)', border: '1px solid var(--ax-border-strong)' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--ax-heading)' }}>New task</DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ax-muted)', fontWeight: 500 }}>Title</span>
            <input
              ref={titleRef}
              value={draft.title}
              onChange={handle('title')}
              data-testid="task-form-title"
              placeholder="Short descriptive title"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ax-muted)', fontWeight: 500 }}>Description (optional)</span>
            <textarea
              value={draft.description}
              onChange={handle('description')}
              data-testid="task-form-description"
              rows={3}
              placeholder="Context, links, acceptance criteria..."
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--ax-muted)', fontWeight: 500 }}>Priority</span>
              <select
                value={draft.priority}
                onChange={handle('priority')}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--ax-muted)', fontWeight: 500 }}>Initial column</span>
              <select
                value={draft.status}
                onChange={handle('status')}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.45)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--ax-border)'; }}
              >
                {COLS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
          </div>

          <button
            onClick={submit}
            disabled={busy}
            data-testid="task-form-submit"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--ax-accent)',
              color: 'var(--ax-on-accent)',
              border: 'none',
              borderRadius: 'var(--ax-radius-control)',
              padding: '11px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.65 : 1,
              minHeight: 44,
              transition: 'opacity var(--ax-duration-fast)',
              marginTop: 4,
            }}
          >
            {busy ? <Loader2 size={14} strokeWidth={1.5} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={14} strokeWidth={1.5} />}
            {busy ? 'Creating...' : 'Create task'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main ---------------------------------------------------------------

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | ok
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const r = await adminApi.listTasks();
      setTasks(r.data);
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const moveTask = useCallback(async (task, newStatus) => {
    try {
      await adminApi.updateTask(task.id, { ...task, status: newStatus });
      await load();
    } catch {
      toast.error('Move failed');
    }
  }, [load]);

  const deleteTask = useCallback(async (id) => {
    try {
      await adminApi.deleteTask(id);
      toast.success('Task deleted');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Delete failed');
    }
  }, []);

  const totalDone = tasks.filter((t) => t.status === 'done').length;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        data-testid="admin-tasks-page"
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ax-mono-label" style={{ marginBottom: 6 }}>Tasks</div>
            <h1 style={{ color: 'var(--ax-heading)', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              Kanban board
            </h1>
            {status === 'ok' && tasks.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--ax-muted)', marginTop: 4 }}>
                <span className="ax-nums">{totalDone}</span> of <span className="ax-nums">{tasks.length}</span> done
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={load}
              aria-label="Refresh tasks"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--ax-muted)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 10px', borderRadius: 'var(--ax-radius-control)', minHeight: 44,
                transition: 'color var(--ax-duration-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ax-heading)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ax-muted)'; }}
            >
              <RefreshCw size={13} strokeWidth={1.5} />
              Refresh
            </button>

            <Dialog open={creating} onOpenChange={setCreating}>
              <DialogTrigger asChild>
                <button
                  data-testid="task-create-button"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--ax-accent)', color: 'var(--ax-on-accent)',
                    border: 'none', borderRadius: 'var(--ax-radius-control)',
                    padding: '10px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', minHeight: 44,
                    transition: 'background var(--ax-duration-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ax-accent-dim)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ax-accent)'; }}
                >
                  <Plus size={14} strokeWidth={1.5} />
                  New task
                </button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* skeleton */}
        {status === 'loading' && (
          <>
            <style>{`.skel { background: linear-gradient(90deg, var(--ax-surface) 0%, var(--ax-surface-2) 50%, var(--ax-surface) 100%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; } @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {COLS.map((c) => <ColumnSkeleton key={c.id} />)}
            </div>
          </>
        )}

        {/* error */}
        {status === 'error' && (
          <div style={{
            background: 'var(--ax-surface)',
            border: '1px solid var(--ax-border)',
            borderRadius: 'var(--ax-radius-panel)',
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            <AlertCircle size={28} strokeWidth={1.5} style={{ color: 'var(--ax-error)', marginBottom: 12 }} />
            <p style={{ color: 'var(--ax-heading)', fontWeight: 600, marginBottom: 6 }}>Could not load tasks</p>
            <p style={{ color: 'var(--ax-muted)', fontSize: 13, marginBottom: 20 }}>Check your connection and try again.</p>
            <button
              onClick={load}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--ax-surface-2)', border: '1px solid var(--ax-border-strong)',
                borderRadius: 'var(--ax-radius-control)', color: 'var(--ax-heading)',
                padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 44,
              }}
            >
              <RefreshCw size={13} strokeWidth={1.5} /> Retry
            </button>
          </div>
        )}

        {/* board */}
        {status === 'ok' && (
          <>
            {/* empty */}
            {tasks.length === 0 && (
              <div style={{
                background: 'var(--ax-surface)',
                border: '1px solid var(--ax-border)',
                borderRadius: 'var(--ax-radius-panel)',
                padding: '56px 24px',
                textAlign: 'center',
              }}>
                <ClipboardList size={32} strokeWidth={1.5} style={{ color: 'var(--ax-muted)', marginBottom: 14 }} />
                <p style={{ color: 'var(--ax-heading)', fontWeight: 600, marginBottom: 6 }}>No tasks yet</p>
                <p style={{ color: 'var(--ax-muted)', fontSize: 13, marginBottom: 24 }}>Create the first task to start tracking work.</p>
                <button
                  onClick={() => setCreating(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--ax-accent)', color: 'var(--ax-on-accent)',
                    border: 'none', borderRadius: 'var(--ax-radius-control)',
                    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44,
                  }}
                >
                  <Plus size={14} strokeWidth={1.5} /> Add first task
                </button>
              </div>
            )}

            {/* columns */}
            {tasks.length > 0 && (
              <div
                data-testid="admin-kanban"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                {COLS.map((col) => (
                  <Column
                    key={col.id}
                    col={col}
                    tasks={tasks.filter((t) => t.status === col.id)}
                    onMove={moveTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateDialog open={creating} onOpenChange={setCreating} onCreated={load} />
    </>
  );
}
