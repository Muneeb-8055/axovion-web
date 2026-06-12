import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { empApi } from '../../lib/api';
import { CalendarDays, CheckCircle2, XCircle, Loader, Plus } from 'lucide-react';

export default function MyLeaves() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ date: '', days: '1', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ax_emp_token');
    if (!token) { navigate('/employee/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const [leavesRes, balRes] = await Promise.all([
        empApi.getMyLeaves(50).catch(() => ({ data: { leaves: [] } })),
        empApi.getMyLeaveBalance().catch(() => ({ data: null })),
      ]);
      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : (leavesRes.data?.leaves || []));
      setBalance(balRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitApply = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await empApi.applyLeave({
        date: applyForm.date,
        days: parseFloat(applyForm.days),
        reason: applyForm.reason,
      });
      setSubmitSuccess('Leave application submitted!');
      setShowApply(false);
      setApplyForm({ date: '', days: '1', reason: '' });
      await load();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setSubmitError(err?.response?.data?.detail || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  const remaining = balance?.remaining ?? 0;
  const used = balance?.used ?? 0;
  const total = balance?.total ?? 4;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Leaves</h1>
          <p className="text-[#A0A0B0] text-sm mt-1">Apply for leave and track your applications</p>
        </div>
        <button
          onClick={() => setShowApply(true)}
          className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Apply Leave
        </button>
      </div>

      {/* Leave Balance */}
      <div className="ax-card">
        <h2 className="font-semibold text-white mb-4">Leave Balance — {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{remaining}</div>
            <div className="text-xs text-[#606070] mt-1">Remaining</div>
          </div>
          <div className="flex-1">
            <div className="flex gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < used ? 'bg-[#6366F1]' : 'bg-[#1E1E2E]'}`}
                />
              ))}
            </div>
            <p className="text-xs text-[#606070] mt-2">{used} of {total} leaves used</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#A0A0B0]">{total}</div>
            <div className="text-xs text-[#606070] mt-1">Total</div>
          </div>
        </div>
        <p className="text-xs text-[#606070] mt-3">
          Half-day (0.5) and full-day (1) leaves allowed. Unused leaves lapse at month end.
        </p>
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {submitSuccess}
        </div>
      )}

      {/* Leaves History */}
      <div className="ax-card">
        <h2 className="font-semibold text-white mb-4">Leave History</h2>
        {leaves.length === 0 ? (
          <p className="text-sm text-[#606070]">No leave applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E2E] text-left text-[#606070]">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Days</th>
                  <th className="pb-3 font-medium">Reason</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="border-b border-[#1A1A2A] last:border-0">
                    <td className="py-3 text-white">
                      {leave.date ? new Date(leave.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 text-[#A0A0B0]">
                      {leave.type === 'half' ? 'Half-day' : 'Full day'}
                    </td>
                    <td className="py-3 text-[#A0A0B0]">{leave.type}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        leave.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                        leave.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="ax-card w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2 text-[#6366F1]">
              <CalendarDays className="h-5 w-5" />
              <h3 className="font-semibold text-white">Apply for Leave</h3>
            </div>

            {submitError && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={submitApply} className="space-y-4">
              <div>
                <label className="block text-sm text-[#A0A0B0] mb-1.5">Date</label>
                <input
                  type="date"
                  value={applyForm.date}
                  onChange={(e) => setApplyForm({ ...applyForm, date: e.target.value })}
                  required
                  className="w-full bg-[#12121A] border border-[#2A2A3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#A0A0B0] mb-1.5">Duration</label>
                <div className="flex gap-3">
                  {['0.5', '1'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setApplyForm({ ...applyForm, days: d })}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        applyForm.days === d
                          ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]'
                          : 'border-[#2A2A3A] text-[#A0A0B0] hover:border-[#6366F1]/50'
                      }`}
                    >
                      {d === '0.5' ? 'Half-day' : 'Full day'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#A0A0B0] mb-1.5">Reason (optional)</label>
                <textarea
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="Brief reason for leave..."
                  rows={2}
                  className="w-full bg-[#12121A] border border-[#2A2A3A] rounded-lg px-4 py-3 text-white text-sm placeholder-[#4A4A5A] focus:outline-none focus:border-[#6366F1] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowApply(false); setSubmitError(''); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#2A2A3A] text-[#A0A0B0] text-sm hover:bg-[#1E1E2E] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader className="h-4 w-4 animate-spin" /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}