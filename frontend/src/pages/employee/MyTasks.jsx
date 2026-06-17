import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { empApi } from '../../lib/api';
import { KanbanSquare, Loader, CheckCircle2, Clock, AlertCircle, MessageSquareWarning } from 'lucide-react';
import { toast } from 'sonner';

export default function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | todo | in_progress | done
  const [issueTask, setIssueTask] = useState(null);
  const [issueText, setIssueText] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const submitIssue = async () => {
    if (!issueText.trim()) { toast.error('Please describe the issue'); return; }
    setSubmittingIssue(true);
    try {
      await empApi.submitTaskFeedback(issueTask.id, { message: issueText.trim() });
      toast.success('Issue reported to admin');
      setIssueTask(null);
      setIssueText('');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to report issue');
    } finally {
      setSubmittingIssue(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('ax_emp_token');
    if (!token) { navigate('/employee/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const res = await empApi.listTasks().catch(() => ({ data: { tasks: [] } }));
const allTasks = res.data?.tasks || [];
      const uid = JSON.parse(localStorage.getItem('ax_emp_user') || '{}').id;
      const myTasks = allTasks.filter((t) => t.assignee === uid);
      setTasks(myTasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const columns = [
    { key: 'todo', label: 'To Do', icon: AlertCircle, color: 'text-[#606070]', bg: 'bg-[#1E1E2E]' },
    { key: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { key: 'done', label: 'Done', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-[#A0A0B0] text-sm mt-1">Tasks assigned to you across all projects</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-[#6366F1] text-white' : 'bg-[#1E1E2E] text-[#A0A0B0] hover:text-white'
          }`}
        >
          All ({tasks.length})
        </button>
        {columns.map((col) => {
          const count = tasks.filter((t) => t.status === col.key).length;
          return (
            <button
              key={col.key}
              onClick={() => setFilter(col.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === col.key ? 'bg-[#6366F1] text-white' : 'bg-[#1E1E2E] text-[#A0A0B0] hover:text-white'
              }`}
            >
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div className="ax-card text-center py-12">
          <KanbanSquare className="h-12 w-12 text-[#2A2A3A] mx-auto mb-3" />
          <p className="text-[#606070]">No tasks in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div key={task._id} className="ax-card hover:border-[#6366F1]/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-white text-sm">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-[#606070] mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'done' ? 'bg-green-500/10 text-green-400' :
                      task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-[#1E1E2E] text-[#A0A0B0]'
                    }`}>
                      {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                    </span>
                    {task.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-[#1E1E2E] text-[#606070]'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-[#606070]">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {task.status !== 'done' && (
                  <button
                    onClick={async () => {
                      const next = task.status === 'todo' ? 'in_progress' : 'done';
                      await empApi.updateMyTaskStatus(task.id, next).catch(() => {});
                      load();
                    }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#1E1E2E] text-xs text-[#A0A0B0] hover:text-white hover:bg-[#2A2A3A] transition-colors"
                  >
                    {task.status === 'todo' ? 'Start →' : 'Complete ✓'}
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                {task.hasIssue ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/25 rounded-full px-2 py-0.5">
                    <MessageSquareWarning className="h-3 w-3" /> Issue reported
                  </span>
                ) : <span />}
                <button
                  onClick={() => { setIssueTask(task); setIssueText(''); }}
                  className="inline-flex items-center gap-1 text-[11px] text-[#6366F1] hover:text-[#818CF8]"
                >
                  <MessageSquareWarning className="h-3 w-3" /> Report issue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Issue Modal */}
      {issueTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="ax-card w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2 text-[#FBBF24]">
              <MessageSquareWarning className="h-5 w-5" />
              <h3 className="font-semibold text-white">Report an Issue</h3>
            </div>
            <p className="text-sm text-[#A0A0B0]">
              Explain what's wrong or what's blocking <span className="text-white font-medium">{issueTask.title}</span>. Your admin will be notified.
            </p>
            <textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe the problem..."
              rows={4}
              className="w-full bg-[#12121A] border border-[#2A2A3A] rounded-lg px-4 py-3 text-white text-sm placeholder-[#4A4A5A] focus:outline-none focus:border-[#6366F1] resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setIssueTask(null); setIssueText(''); }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#2A2A3A] text-[#A0A0B0] text-sm hover:bg-[#1E1E2E] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitIssue}
                disabled={submittingIssue}
                className="flex-1 px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#5558E3] disabled:opacity-50 text-white text-sm transition-colors flex items-center justify-center gap-2"
              >
                {submittingIssue ? <Loader className="h-4 w-4 animate-spin" /> : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}