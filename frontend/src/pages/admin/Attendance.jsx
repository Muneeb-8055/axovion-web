import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../lib/hooks';
import { toast } from 'sonner';
import { RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [records, setRecords] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [mySummary, setMySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [pending, setPending] = useState([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clocking, setClocking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (isEmployee) {
        const [att, summary] = await Promise.all([
          adminApi.getMyAttendance(30),
          adminApi.getMySummary(),
        ]);
        setMyAttendance(att.data || []);
        setMySummary(summary.data);
        // Check if currently clocked in
        const latest = att.data?.[0];
        setIsClockedIn(latest && !latest.clockOut);
      } else {
        const params = {};
        if (filterDate) params.date = filterDate;
        const [r, p] = await Promise.all([
          adminApi.listAttendance(params),
          adminApi.getPendingAttendance(),
        ]);
        setRecords(r.data || []);
        setPending(p.data || []);
      }
    } catch (e) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterDate]);

  const handleClockIn = async () => {
    setClocking(true);
    try {
      await adminApi.clockIn();
      toast.success('Clocked in');
      setIsClockedIn(true);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Clock in failed');
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      await adminApi.clockOut();
      toast.success('Clocked out');
      setIsClockedIn(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Clock out failed');
    } finally {
      setClocking(false);
    }
  };

  const verifyAll = async (date) => {
    try {
      await adminApi.verifyAttendance({ date, employeeId: undefined });
      toast.success('Attendance verified');
      load();
    } catch (e) { toast.error('Verification failed'); }
  };

  const approveCorrection = async (id) => {
    try {
      await adminApi.approveCorrection(id);
      toast.success('Correction approved');
      load();
    } catch (e) { toast.error('Failed to approve'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">EMS</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Attendance</h1>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Employee: Clock In/Out + Summary */}
      {isEmployee && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Clock buttons */}
            <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-6 flex-1 flex flex-col items-center justify-center gap-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isClockedIn ? 'bg-[#10B981]/20' : 'bg-[#F97316]/20'}`}>
                <Clock className={`h-8 w-8 ${isClockedIn ? 'text-[#10B981]' : 'text-[#F97316]'}`} />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}</p>
                <p className="text-[#C0C0C8]/55 text-sm mt-1">Tap the button to {isClockedIn ? 'clock out' : 'clock in'}</p>
              </div>
              {isClockedIn ? (
                <button onClick={handleClockOut} disabled={clocking} className="bg-[#EF4444] text-white px-6 py-3 rounded-[12px] font-bold text-sm hover:bg-[#DC2626] disabled:opacity-50">
                  {clocking ? 'Processing...' : 'Clock Out'}
                </button>
              ) : (
                <button onClick={handleClockIn} disabled={clocking} className="bg-[#10B981] text-white px-6 py-3 rounded-[12px] font-bold text-sm hover:bg-[#059669] disabled:opacity-50">
                  {clocking ? 'Processing...' : 'Clock In'}
                </button>
              )}
            </div>

            {/* Monthly summary */}
            {mySummary && (
              <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-6 flex-1">
                <h3 className="text-white font-bold mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#C0C0C8]/65 text-sm">Completed</span>
                    <span className="text-white font-bold text-sm">{mySummary.completedHours} hrs</span>
                  </div>
                  <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min((mySummary.completedHours / mySummary.targetHours) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C0C0C8]/65 text-sm">Remaining</span>
                    <span className="text-[#F97316] font-bold text-sm">{mySummary.remainingHours} hrs</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-[#C0C0C8]/65 text-sm">Overtime</span>
                    <span className="text-[#00D4FF] font-bold text-sm">+{mySummary.overtimeHours} hrs</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* My attendance log */}
          <div className="bg-[#12121A] border border-white/10 rounded-[16px] p-5">
            <h3 className="text-white font-bold mb-4">My Attendance Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-[#C0C0C8]/55 text-xs pb-2 font-semibold">Date</th>
                    <th className="text-left text-[#C0C0C8]/55 text-xs pb-2 font-semibold">Clock In</th>
                    <th className="text-left text-[#C0C0C8]/55 text-xs pb-2 font-semibold">Clock Out</th>
                    <th className="text-right text-[#C0C0C8]/55 text-xs pb-2 font-semibold">Hours</th>
                    <th className="text-right text-[#C0C0C8]/55 text-xs pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-2.5 text-white text-xs">{r.clockIn?.split('T')[0]}</td>
                      <td className="py-2.5 text-[#C0C0C8] text-xs">{r.clockIn ? r.clockIn.split('T')[1]?.slice(0, 5) : '—'}</td>
                      <td className="py-2.5 text-[#C0C0C8] text-xs">{r.clockOut ? r.clockOut.split('T')[1]?.slice(0, 5) : <span className="text-[#F97316]">In progress</span>}</td>
                      <td className="py-2.5 text-right text-white font-bold text-xs">{r.totalHours}</td>
                      <td className="py-2.5 text-right">
                        {r.isVerified ? (
                          <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit ml-auto"><CheckCircle2 className="h-3 w-3" /> Verified</span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#F97316] bg-[#F97316]/15 px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit ml-auto"><AlertCircle className="h-3 w-3" /> Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Admin: Attendance table */}
      {isAdmin && (
        <>
          {/* Pending verification */}
          {pending.length > 0 && (
            <div className="bg-[#F97316]/10 border border-[#F97316]/25 rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#F97316]" />
                  <h3 className="text-white font-bold text-sm">{pending.length} records pending verification</h3>
                </div>
                <button onClick={() => verifyAll(filterDate || new Date().toISOString().split('T')[0])} className="bg-[#10B981] text-white text-xs font-bold px-3 py-1.5 rounded-[8px] hover:bg-[#059669]">
                  Verify All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {pending.slice(0, 6).map((r) => (
                  <div key={r.id} className="bg-[#0A0A0F] rounded-[10px] px-3 py-2 flex justify-between items-center">
                    <div>
                      <p className="text-white text-xs font-semibold">{r.employeeName}</p>
                      <p className="text-[#C0C0C8]/55 text-[10px]">{r.clockIn?.split('T')[0]} — {r.totalHours}h</p>
                    </div>
                    <button onClick={() => approveCorrection(r.id)} className="text-[#10B981] text-[10px] font-bold hover:underline">Verify</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-3">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-[#12121A] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white" />
            {filterDate && <button onClick={() => setFilterDate('')} className="text-[#C0C0C8]/55 text-xs hover:text-white">Clear</button>}
          </div>

          {/* Table */}
          <div className="bg-[#12121A] border border-white/10 rounded-[16px] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0F]">
                <tr>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Employee</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Date</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Hours</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-[#161622]/50">
                    <td className="px-4 py-3 text-white text-sm font-semibold">{r.employeeName}</td>
                    <td className="px-4 py-3 text-[#C0C0C8] text-xs">{r.clockIn?.split('T')[0]}</td>
                    <td className="px-4 py-3 text-white text-sm font-bold">{r.totalHours}h</td>
                    <td className="px-4 py-3">
                      {r.isVerified ? (
                        <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-lg"><CheckCircle2 className="h-3 w-3 inline mr-1" />Verified</span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#F97316] bg-[#F97316]/15 px-2 py-0.5 rounded-lg"><AlertCircle className="h-3 w-3 inline mr-1" />Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && !loading && (
              <p className="text-center text-[#C0C0C8]/45 text-sm py-10">No records for this date</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;