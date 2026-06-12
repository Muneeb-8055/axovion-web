import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#F97316', '#EF4444', '#3B82F6', '#6366F1'];

const Reports = () => {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [summary, setSummary] = useState(null);
  const [attendanceRates, setAttendanceRates] = useState(null);
  const [overtimeTracking, setOvertimeTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, a, o] = await Promise.all([
        adminApi.getMonthlySummary(month),
        adminApi.getAttendanceRates(month),
        adminApi.getOvertimeTracking(month),
      ]);
      setSummary(s.data);
      setAttendanceRates(a.data);
      setOvertimeTracking(o.data);
    } catch (e) { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [month]);

  const chartData = summary?.employees?.map((e) => ({
    name: e.employeeName?.split(' ')[0] || e.employeeName,
    hours: e.completedHours,
    target: e.targetHours,
    overtime: e.overtimeHours,
  })) || [];

  const targetHours = summary?.employees?.[0]?.targetHours || 208;

  const pieData = attendanceRates ? [
    { name: 'Met Target', value: attendanceRates.metCount, color: '#10B981' },
    { name: 'Missed Target', value: attendanceRates.missedCount, color: '#EF4444' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">EMS</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-[#12121A] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white" />
          <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Employees', value: summary.employees?.length || 0, color: '#3B82F6' },
            { label: 'Avg Hours', value: summary.employees?.length ? Math.round(summary.employees.reduce((s, e) => s + e.completedHours, 0) / summary.employees.length) : 0, color: '#10B981' },
            { label: 'Total Overtime', value: `${summary.employees?.reduce((s, e) => s + e.overtimeHours, 0) || 0}h`, color: '#F97316' },
            { label: 'Month', value: month, color: '#6366F1' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#12121A] border border-white/10 rounded-[16px] p-5">
              <p className="text-[#C0C0C8]/55 text-xs mb-2">{stat.label}</p>
              <p className="text-white text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      {summary && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hours bar chart */}
          <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-5">
            <h3 className="text-white font-bold mb-4">Hours vs Target ({targetHours}h)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9198b3', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9198b3', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff' }} />
                <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} name="Hours" />
                <Bar dataKey="target" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Target" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance rates pie */}
          <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-5">
            <h3 className="text-white font-bold mb-4">Attendance Rate</h3>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: entry.color }} />
                      <span className="text-white text-sm">{entry.name}</span>
                      <span className="text-[#C0C0C8] text-sm font-bold ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[#C0C0C8]/45 text-sm text-center py-10">No data</p>
            )}
          </div>
        </div>
      )}

      {/* Target missers */}
      {attendanceRates?.missers?.length > 0 && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-[16px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            <h3 className="text-white font-bold">Employees Who Missed Target ({attendanceRates.missers.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attendanceRates.missers.map((m) => (
              <div key={m.employeeId} className="bg-[#0A0A0F] rounded-[12px] px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-semibold">{m.employeeName}</p>
                  <p className="text-[#C0C0C8]/55 text-xs">{m.hoursCompleted}h completed</p>
                </div>
                <div className="text-right">
                  <p className="text-[#EF4444] text-sm font-bold">-{m.hoursShort}h</p>
                  <p className="text-[#C0C0C8]/45 text-[10px]">shortfall</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overtime by project */}
      {overtimeTracking?.byProject?.length > 0 && (
        <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-5">
          <h3 className="text-white font-bold mb-4">Overtime by Project</h3>
          <div className="space-y-2">
            {overtimeTracking.byProject.map((p) => (
              <div key={p.project} className="flex items-center gap-3">
                <span className="text-[#C0C0C8] text-sm w-32 truncate">{p.project}</span>
                <div className="flex-1 h-3 bg-[#0A0A0F] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${Math.min((p.totalHours / (overtimeTracking.totalOvertimeHours || 1)) * 100, 100)}%` }} />
                </div>
                <span className="text-[#F97316] text-sm font-bold w-16 text-right">{p.totalHours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee table */}
      {summary && (
        <div className="bg-[#12121A] border border-white/10 rounded-[16px] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h3 className="text-white font-bold">Monthly Breakdown</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0F]">
              <tr>
                <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Employee</th>
                <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Completed</th>
                <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Remaining</th>
                <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Overtime</th>
                <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Leaves</th>
                <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.employees?.map((e) => (
                <tr key={e.employeeId} className="border-t border-white/5 hover:bg-[#161622]/50">
                  <td className="px-4 py-3 text-white text-sm font-semibold">{e.employeeName}</td>
                  <td className="px-4 py-3 text-right text-white text-sm font-bold">{e.completedHours}h</td>
                  <td className="px-4 py-3 text-right text-sm">{e.remainingHours > 0 ? <span className="text-[#F97316]">{e.remainingHours}h</span> : <span className="text-[#10B981]">—</span>}</td>
                  <td className="px-4 py-3 text-right">{e.overtimeHours > 0 ? <span className="text-[#F97316]">+{e.overtimeHours}h</span> : <span className="text-[#C0C0C8]/45">—</span>}</td>
                  <td className="px-4 py-3 text-right text-[#C0C0C8] text-xs">{e.leavesUsed} / 4</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${e.metTarget ? 'text-[#10B981] bg-[#10B981]/15' : 'text-[#EF4444] bg-[#EF4444]/15'}`}>
                      {e.metTarget ? '✓ Met' : '✕ Missed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;