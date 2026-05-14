import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

const COLS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

const PRIORITY_COLOR = {
  urgent: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25',
  high: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/25',
  medium: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/25',
  low: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/25',
};

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: '', description: '', priority: 'medium', status: 'todo' });

  const load = async () => {
    setLoading(true);
    try { const r = await adminApi.listTasks(); setTasks(r.data); }
    catch (e) { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.title) { toast.error('Title required'); return; }
    try { await adminApi.createTask(draft); toast.success('Task created'); setCreating(false); setDraft({ title: '', description: '', priority: 'medium', status: 'todo' }); load(); }
    catch (e) { toast.error('Failed to create'); }
  };

  const moveTask = async (task, newStatus) => {
    try { await adminApi.updateTask(task.id, { ...task, status: newStatus }); load(); }
    catch (e) { toast.error('Move failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await adminApi.deleteTask(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6" data-testid="admin-tasks-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Tasks</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Kanban board</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <button data-testid="task-create-button" className="inline-flex items-center gap-1.5 text-sm bg-[#F97316] text-[#0A0A0F] px-3 py-2 rounded-[10px] font-bold hover:bg-[#FBBF24]"><Plus className="h-3.5 w-3.5" /> New task</button>
            </DialogTrigger>
            <DialogContent className="bg-[#12121A] border border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create task</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" data-testid="task-form-title" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows="3" placeholder="Description" data-testid="task-form-description" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                <div className="flex gap-3">
                  <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white">
                    <option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="urgent">urgent</option>
                  </select>
                  <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white">
                    {COLS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <button onClick={create} data-testid="task-form-submit" className="w-full bg-[#F97316] text-[#0A0A0F] rounded-[10px] px-4 py-2.5 text-sm font-bold hover:bg-[#FBBF24]">Create</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-kanban">
        {COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="rounded-[16px] bg-[#12121A] border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">{col.label}</h3>
                <span className="font-mono text-xs text-[#C0C0C8]/55">{colTasks.length}</span>
              </div>
              <div className="space-y-3 min-h-[120px]">
                {colTasks.map((t) => (
                  <div key={t.id} className="rounded-[12px] bg-[#0A0A0F] border border-white/10 p-3 hover:border-[#00D4FF]/25" data-testid={`task-card-${t.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-white font-semibold text-sm leading-snug flex-1">{t.title}</h4>
                      <button onClick={() => remove(t.id)} className="text-[#C0C0C8] hover:text-[#EF4444]"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    {t.description && <p className="text-[#C0C0C8]/65 text-xs mt-1">{t.description}</p>}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${PRIORITY_COLOR[t.priority] || PRIORITY_COLOR.medium}`}>{t.priority}</span>
                      <select value={t.status} onChange={(e) => moveTask(t, e.target.value)} className="bg-[#161622] border border-white/10 rounded text-[10px] text-white px-1.5 py-0.5">
                        {COLS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <p className="text-center text-xs text-[#C0C0C8]/45 py-6">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTasks;
