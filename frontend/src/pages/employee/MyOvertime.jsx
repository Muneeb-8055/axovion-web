import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { Timer, Loader } from 'lucide-react';

export default function MyOvertime() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ax_token');
    if (!token) { navigate('/employee/login'); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const res = await adminApi.getMyOvertime(50).catch(() => ({ data: { records: [] } }));
      setRecords(Array.isArray(res.data) ? res.data : (res.data?.records || []));
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

  const totalHours = records.reduce((sum, r) => sum + (r.hours || 0), 0);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Overtime</h1>
        <p className="text-[#A0A0B0] text-sm mt-1">Track overtime hours approved by your admin</p>
      </div>

      {/* Summary */}
      <div className="ax-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Timer className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalHours.toFixed(1)}h</div>
            <div className="text-sm text-[#606070]">Total overtime this month</div>
          </div>
        </div>
        <p className="text-xs text-[#606070] mt-4">
          Overtime must be approved by an admin. Contact your manager if you have questions about OT hours.
        </p>
      </div>

      {/* Records */}
      <div className="ax-card">
        <h2 className="font-semibold text-white mb-4">Overtime Records</h2>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <Timer className="h-10 w-10 text-[#2A2A3A] mx-auto mb-3" />
            <p className="text-[#606070] text-sm">No overtime records yet.</p>
            <p className="text-xs text-[#4A4A5A] mt-1">Tell your admin before doing overtime — they'll log it for you.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E2E] text-left text-[#606070]">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Hours</th>
                  <th className="pb-3 font-medium">Project / Reason</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id} className="border-b border-[#1A1A2A] last:border-0">
                    <td className="py-3 text-white">
                      {rec.date ? new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 text-[#6366F1] font-medium">{rec.hours}h</td>
                    <td className="py-3 text-[#A0A0B0] max-w-[200px] truncate">{rec.project || rec.reason || '—'}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                        approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}