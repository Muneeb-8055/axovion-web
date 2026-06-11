import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../lib/hooks';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { RefreshCw, Plus, Search } from 'lucide-react';

const Overtime = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [records, setRecords] = useState([]);
  const [myOt, setMyOt] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [draft, setDraft] = useState({ employeeId: '', date: '', hours: '', reason: '', project: '' });
  const [filterMonth, setFilterMonth] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      if (isEmployee) {
        const r = await adminApi.getMyOvertime(30);
        setMyOt(r.data || []);
      } else {
        const params = {};
        if (filterMonth) params.month = filterMonth;
        const [r, emps] = await Promise.all([
          adminApi.listOvertime(params),
          adminApi.listEmployees(),
        ]);
        setRecords(r.data || []);
        setEmployees(emps.data || []);
      }
    } catch (e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterMonth]);

  const log = async () => {
    if (!draft.employeeId || !draft.date || !draft.hours || !draft.reason || !draft.project) {
      toast.error('All fields required'); return;
    }
    setLogging(true);
    try {
      await adminApi.logOvertime({ ...draft, hours: parseFloat(draft.hours) });
      toast.success('Overtime logged');
      setLogging(false);
      setDraft({ employeeId: '', date: '', hours: '', reason: '', project: '' });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to log'); setLogging(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">EMS</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Overtime</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 text-sm bg-[#F97316] text-[#0A0A0F] px-3 py-2 rounded-[10px] font-bold hover:bg-[#FBBF24]">
                  <Plus className="h-3.5 w-3.5" /> Log Overtime
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#12121A] border border-white/10 max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-white">Log Overtime</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <select value={draft.employeeId} onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })} className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white">
                    <option value="">Select employee</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                  <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white" />
                  <input type="number" value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} placeholder="Hours" min="0.5" step="0.5" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                  <input value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} placeholder="Reason" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                  <input value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} placeholder="Project" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                  <button onClick={log} disabled={logging} className="w-full bg-[#F97316] text-[#0A0A0F] rounded-[10px] px-4 py-2.5 text-sm font-bold hover:bg-[#FBBF24] disabled:opacity-50">
                    {logging ? 'Logging...' : 'Log Overtime'}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isEmployee ? (
        <div className="space-y-3">
          {myOt.map((ot) => (
            <div key={ot.id} className="bg-[#12121A] border border-dashed border-[#F97316]/30 rounded-[16px] p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-bold text-sm">{ot.project}</p>
                  <p className="text-[#C0C0C8]/55 text-xs mt-0.5">{ot.date} — {ot.reason}</p>
                </div>
                <span className="text-[#F97316] font-extrabold text-lg">+{ot.hours}h</span>
              </div>
            </div>
          ))}
          {myOt.length === 0 && <p className="text-center text-[#C0C0C8]/45 text-sm py-12">No overtime records</p>}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-[#12121A] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white" />
            {filterMonth && <button onClick={() => setFilterMonth('')} className="text-[#C0C0C8]/55 text-xs hover:text-white">Clear</button>}
          </div>
          <div className="bg-[#12121A] border border-white/10 rounded-[16px] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0F]">
                <tr>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Employee</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Date</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Project</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Reason</th>
                  <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Hours</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-white text-sm font-semibold">{r.employeeName}</td>
                    <td className="px-4 py-3 text-[#C0C0C8] text-xs">{r.date}</td>
                    <td className="px-4 py-3 text-[#F97316] text-xs font-semibold">{r.project}</td>
                    <td className="px-4 py-3 text-[#C0C0C8] text-xs">{r.reason}</td>
                    <td className="px-4 py-3 text-right"><span className="text-[#F97316] font-bold">+{r.hours}h</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Overtime;