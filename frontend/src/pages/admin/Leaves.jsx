import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../lib/hooks';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { RefreshCw, Plus, CheckCircle2, XCircle } from 'lucide-react';

const Leaves = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [leaves, setLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [applying, setApplying] = useState(false);
  const [draft, setDraft] = useState({ date: '', type: 'full' });

  const load = async () => {
    setLoading(true);
    try {
      if (isEmployee) {
        const [l, b] = await Promise.all([
          adminApi.getMyLeaves(30),
          adminApi.getMyLeaveBalance(),
        ]);
        setMyLeaves(l.data || []);
        setBalance(b.data);
      } else {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        const l = await adminApi.listLeaves(params);
        setLeaves(l.data || []);
      }
    } catch (e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const apply = async () => {
    if (!draft.date) { toast.error('Date is required'); return; }
    try {
      await adminApi.applyLeave(draft);
      toast.success('Leave applied');
      setApplying(false);
      setDraft({ date: '', type: 'full' });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to apply'); }
  };

  const approve = async (id) => {
    try { await adminApi.approveLeave(id); toast.success('Leave approved'); load(); }
    catch (e) { toast.error('Failed to approve'); }
  };

  const reject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try { await adminApi.rejectLeave(id, reason); toast.success('Leave rejected'); load(); }
    catch (e) { toast.error('Failed to reject'); }
  };

  const STATUS_COLOR = {
    pending: 'text-[#FBBF24] bg-[#FBBF24]/15',
    approved: 'text-[#10B981] bg-[#10B981]/15',
    rejected: 'text-[#EF4444] bg-[#EF4444]/15',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">EMS</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Leaves</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          {isEmployee && (
            <Dialog open={applying} onOpenChange={setApplying}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-1.5 text-sm bg-[#F97316] text-[#0A0A0F] px-3 py-2 rounded-[10px] font-bold hover:bg-[#FBBF24]">
                  <Plus className="h-3.5 w-3.5" /> Apply Leave
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#12121A] border border-white/10 max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-white">Apply for Leave</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-[#C0C0C8]/65 text-xs mb-1 block">Date</label>
                    <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="text-[#C0C0C8]/65 text-xs mb-1 block">Type</label>
                    <div className="flex gap-2">
                      {['full', 'half'].map((t) => (
                        <button key={t} onClick={() => setDraft({ ...draft, type: t })} className={`flex-1 py-2 rounded-[10px] text-sm font-bold transition-colors ${draft.type === t ? 'bg-[#00D4FF] text-[#0A0A0F]' : 'bg-[#0A0A0F] border border-white/10 text-[#C0C0C8]'}`}>
                          {t === 'full' ? 'Full Day (1 leave)' : 'Half Day (0.5 leave)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {balance && <p className="text-[#C0C0C8]/55 text-xs">Balance: {balance.remaining} / 4 remaining this month</p>}
                  <button onClick={apply} className="w-full bg-[#F97316] text-[#0A0A0F] rounded-[10px] px-4 py-2.5 text-sm font-bold hover:bg-[#FBBF24]">Apply</button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Employee: Balance + My leaves */}
      {isEmployee && (
        <>
          {balance && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-5 text-center">
                <p className="text-[#C0C0C8]/55 text-xs mb-2">Used This Month</p>
                <p className="text-white text-3xl font-extrabold">{balance.used}</p>
              </div>
              <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-5 text-center">
                <p className="text-[#C0C0C8]/55 text-xs mb-2">Remaining</p>
                <p className="text-[#10B981] text-3xl font-extrabold">{balance.remaining}</p>
              </div>
            </div>
          )}
          <div className="bg-[#12121A] border border-white/10 rounded-[16px] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0F]">
                <tr>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Date</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Type</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Status</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Applied</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-white text-sm">{l.date}</td>
                    <td className="px-4 py-3 text-[#C0C0C8] text-sm capitalize">{l.type} day</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_COLOR[l.status] || STATUS_COLOR.pending}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#C0C0C8]/55 text-xs">{l.appliedAt?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Admin: All leaves */}
      {isAdmin && (
        <>
          <div className="flex items-center gap-3">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#12121A] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="bg-[#12121A] border border-white/10 rounded-[16px] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0F]">
                <tr>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Employee</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Date</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Type</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Status</th>
                  <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-white text-sm font-semibold">{l.employeeName}</td>
                    <td className="px-4 py-3 text-[#C0C0C8] text-sm">{l.date}</td>
                    <td className="px-4 py-3 text-[#C0C0C8] text-sm capitalize">{l.type} day</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_COLOR[l.status] || ''}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => approve(l.id)} className="text-[#10B981] text-xs font-bold hover:underline flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approve</button>
                          <button onClick={() => reject(l.id)} className="text-[#EF4444] text-xs font-bold hover:underline flex items-center gap-1"><XCircle className="h-3 w-3" /> Reject</button>
                        </div>
                      )}
                    </td>
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

export default Leaves;