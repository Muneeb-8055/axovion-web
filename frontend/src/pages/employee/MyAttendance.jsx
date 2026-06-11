import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { Clock, CheckCircle2, XCircle, Loader, AlertCircle } from 'lucide-react';

export default function MyAttendance() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [correctingId, setCorrectingId] = useState(null);
  const [correctReason, setCorrectReason] = useState('');
  const [correctError, setCorrectError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ax_token');
    if (!token) { navigate('/employee/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const [attRes, sumRes] = await Promise.all([
        adminApi.getMyAttendance(50).catch(() => ({ data: { entries: [] } })),
        adminApi.getMySummary().catch(() => ({ data: null })),
      ]);
      setEntries(Array.isArray(attRes.data) ? attRes.data : (attRes.data?.entries || []));
      setSummary(sumRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const requestCorrection = async (entryId) => {
    if (!correctReason.trim()) { setCorrectError('Please provide a reason.'); return; }
    setCorrectError('');
    try {
      await adminApi.requestCorrection({ entry_id: entryId, reason: correctReason });
      setCorrectingId(null);
      setCorrectReason('');
      await load();
    } catch (err) {
      setCorrectError(err?.response?.data?.detail || 'Failed to submit correction.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  const completed = summary?.completed_hours || 0;
  const target = summary?.target_hours || 208;
  const progress = Math.min((completed / target) * 100, 100);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Attendance</h1>
        <p className="text-[#A0A0B0] text-sm mt-1">Track your clock-in/out records and monthly progress</p>
      </div>

      {/* Monthly Progress */}
      <div className="ax-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">This Month</h2>
          <span className="text-sm text-[#A0A0B0]">
            {completed.toFixed(1)}h / {target}h
          </span>
        </div>
        <div className="w-full bg-[#1E1E2E] rounded-full h-3 mb-2">
          <div
            className="bg-[#6366F1] h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#606070]">
          <span>{progress.toFixed(0)}% complete</span>
          <span>{(target - completed).toFixed(1)}h remaining</span>
        </div>
      </div>

      {/* Clock In/Out buttons */}
      <div className="flex gap-4">
        <button
          onClick={async () => { await adminApi.clockIn().catch(() => {}); await load(); }}
          className="flex-1 ax-card flex items-center justify-center gap-2 py-4 hover:border-green-500/30 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <span className="font-medium text-white">Clock In</span>
        </button>
        <button
          onClick={async () => { await adminApi.clockOut().catch(() => {}); await load(); }}
          className="flex-1 ax-card flex items-center justify-center gap-2 py-4 hover:border-red-500/30 transition-colors cursor-pointer"
        >
          <XCircle className="h-5 w-5 text-red-400" />
          <span className="font-medium text-white">Clock Out</span>
        </button>
      </div>

      {/* Entries Table */}
      <div className="ax-card">
        <h2 className="font-semibold text-white mb-4">Clock Records</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-[#606070]">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E2E] text-left text-[#606070]">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Clock In</th>
                  <th className="pb-3 font-medium">Clock Out</th>
                  <th className="pb-3 font-medium">Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const inTime = entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
                  const outTime = entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
                  const hours = entry.totalHours ?? '...';
                  const status = entry.isVerified ? 'verified' : 'pending';
                  return (
                    <tr key={entry._id} className="border-b border-[#1A1A2A] last:border-0">
                      <td className="py-3 text-white">
                        {entry.date ? new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="py-3 text-[#A0A0B0]">{inTime}</td>
                      <td className="py-3 text-[#A0A0B0]">{outTime}</td>
                      <td className="py-3 text-white">{typeof hours === 'number' ? `${hours.toFixed(1)}h` : hours}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'verified' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3">
                        {entry.correction_requested ? (
                          <span className="text-xs text-[#606070]">Correction requested</span>
                        ) : (
                          <button
                            onClick={() => setCorrectingId(entry._id)}
                            className="text-xs text-[#6366F1] hover:underline"
                          >
                            Request correction
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Correction Modal */}
      {correctingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="ax-card w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold text-white">Request Correction</h3>
            </div>
            <p className="text-sm text-[#A0A0B0]">Explain why the record is wrong. An admin will review it.</p>
            {correctError && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
                {correctError}
              </div>
            )}
            <textarea
              value={correctReason}
              onChange={(e) => setCorrectReason(e.target.value)}
              placeholder="Reason for correction..."
              rows={3}
              className="w-full bg-[#12121A] border border-[#2A2A3A] rounded-lg px-4 py-3 text-white text-sm placeholder-[#4A4A5A] focus:outline-none focus:border-[#6366F1] resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setCorrectingId(null); setCorrectReason(''); }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#2A2A3A] text-[#A0A0B0] text-sm hover:bg-[#1E1E2E] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => requestCorrection(correctingId)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#5558E3] text-white text-sm transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}