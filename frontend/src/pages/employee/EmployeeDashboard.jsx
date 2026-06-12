import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../lib/hooks';
import { Clock, CalendarDays, KanbanSquare, Timer, TrendingUp, CheckCircle2, XCircle, Loader } from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="ax-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm text-[#A0A0B0]">{label}</div>
      {sub && <div className="text-xs text-[#606070] mt-1">{sub}</div>}
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [clockStatus, setClockStatus] = useState(null); // { status: 'in'|'out', entry: {...} }
  const [leaveBalance, setLeaveBalance] = useState(4);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [clockError, setClockError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ax_token');
    if (!token) { navigate('/employee/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const [sumRes, leavesRes, balRes, tasksRes, attRes] = await Promise.all([
        adminApi.getMySummary().catch(() => ({ data: null })),
        adminApi.getMyLeaves(5).catch(() => ({ data: [] })),
        adminApi.getMyLeaveBalance().catch(() => ({ data: { remaining: 4 } })),
        adminApi.listTasks().catch(() => ({ data: { tasks: [] } })),
        adminApi.getMyAttendance(30).catch(() => ({ data: [] })),
      ]);
      setSummary(sumRes.data);
      setRecentLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : (leavesRes.data?.leaves || []));
      setLeaveBalance(balRes.data?.remaining ?? 4);
      // Filter tasks assigned to this employee
      const myTasks = (tasksRes.data?.tasks || []).filter(
        (t) => t.assignee === user?.id
      );
      setRecentTasks(myTasks.slice(0, 5));

      // Find active clock-in
      const entries = attRes.data?.entries || [];
      const active = entries.find((e) => !e.clock_out);
      setClockStatus(active ? { status: 'in', entry: active } : { status: 'out', entry: null });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClock = async () => {
    setClockError('');
    setClocking(true);
    try {
      if (clockStatus?.status === 'in') {
        await adminApi.clockOut();
      } else {
        await adminApi.clockIn();
      }
      await load();
    } catch (err) {
      setClockError(err?.response?.data?.detail || 'Failed to clock. Try again.');
    } finally {
      setClocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  const completed = summary?.completedHours || 0;
  const target = summary?.targetHours || 208;
  const remaining = summary?.remainingHours ?? (target - completed);
  const myTasks = recentTasks;
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress').length;
  const doneTasks = myTasks.filter((t) => t.status === 'done').length;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'Employee'}
        </h1>
        <p className="text-[#A0A0B0] text-sm mt-1">Here's your activity for this month</p>
      </div>

      {/* Clock In/Out Banner */}
      <div className={`ax-card flex items-center justify-between ${clockStatus?.status === 'in' ? 'border-green-500/30 bg-green-500/5' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${clockStatus?.status === 'in' ? 'bg-green-500/20' : 'bg-[#1E1E2E]'}`}>
            <Clock className={`h-6 w-6 ${clockStatus?.status === 'in' ? 'text-green-400' : 'text-[#A0A0B0]'}`} />
          </div>
          <div>
            <p className="font-medium text-white">
              {clockStatus?.status === 'in' ? 'You are clocked in' : 'Not clocked in'}
            </p>
            {clockStatus?.status === 'in' && clockStatus?.entry?.clock_in && (
              <p className="text-xs text-[#606070] mt-0.5">
                Since {new Date(clockStatus.entry.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {clockStatus?.status === 'out' && (
              <p className="text-xs text-[#606070] mt-0.5">Tap the button to start your day</p>
            )}
          </div>
        </div>
        <button
          onClick={handleClock}
          disabled={clocking}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${
            clockStatus?.status === 'in'
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              : 'bg-[#6366F1] hover:bg-[#5558E3] text-white'
          }`}
        >
          {clocking ? <Loader className="h-4 w-4 animate-spin" /> : clockStatus?.status === 'in' ? 'Clock Out' : 'Clock In'}
        </button>
      </div>
      {clockError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {clockError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Hours Completed"
          value={`${completed.toFixed(1)}h`}
          sub={`${remaining.toFixed(1)}h remaining`}
          icon={TrendingUp}
          color="bg-[#6366F1]/10 text-[#6366F1]"
        />
        <StatCard
          label="Monthly Target"
          value={`${target}h`}
          sub={`${target - completed >= 0 ? 'on track' : 'over target'}`}
          icon={CheckCircle2}
          color="bg-green-500/10 text-green-400"
        />
        <StatCard
          label="Leaves Left"
          value={leaveBalance}
          sub="of 4 this month"
          icon={CalendarDays}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="My Tasks"
          value={recentTasks.length}
          sub={`${inProgressTasks} in progress, ${doneTasks} done`}
          icon={KanbanSquare}
          color="bg-orange-500/10 text-orange-400"
        />
      </div>

      {/* Bottom: Recent Tasks + Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="ax-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">My Tasks</h2>
            <button onClick={() => navigate('/employee/tasks')} className="text-xs text-[#6366F1] hover:underline">
              View all →
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-[#606070]">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between py-2 border-b border-[#1E1E2E] last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-[#606070] mt-0.5 capitalize">{task.status?.replace('_', ' ')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    task.status === 'done' ? 'bg-green-500/10 text-green-400' :
                    task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-[#1E1E2E] text-[#A0A0B0]'
                  }`}>
                    {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leaves */}
        <div className="ax-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Leaves</h2>
            <button onClick={() => navigate('/employee/leaves')} className="text-xs text-[#6366F1] hover:underline">
              View all →
            </button>
          </div>
          {recentLeaves.length === 0 ? (
            <p className="text-sm text-[#606070]">No leave applications yet.</p>
          ) : (
            <div className="space-y-2">
              {recentLeaves.map((leave) => (
                <div key={leave._id} className="flex items-center justify-between py-2 border-b border-[#1E1E2E] last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white">
                      {leave.type === 'half' ? 'Half-day leave' : 'Full-day leave'}
                    </p>
                    <p className="text-xs text-[#606070] mt-0.5">
                      {new Date(leave.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    leave.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    leave.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}