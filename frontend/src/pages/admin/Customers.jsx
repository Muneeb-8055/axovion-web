import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';
import { RefreshCw, Search, Users, FileSearch, CalendarCheck, Mail, Building2, Phone } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminApi.listCustomers();
      setCustomers(Array.isArray(r.data) ? r.data : []);
    } catch (e) { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalAudits = customers.reduce((s, c) => s + (c.auditCount || 0), 0);

  return (
    <div className="space-y-6" data-testid="admin-customers-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">Portal</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-[#00D4FF]" /> Customers
          </h1>
          <p className="text-[#C0C0C8]/55 text-sm mt-1">Everyone who created an account on the customer portal.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5">
          <p className="text-[#C0C0C8]/55 text-xs mb-2">Total Customers</p>
          <p className="text-white text-2xl font-extrabold">{customers.length}</p>
        </div>
        <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5">
          <p className="text-[#C0C0C8]/55 text-xs mb-2">Total Audits Run</p>
          <p className="text-[#00D4FF] text-2xl font-extrabold">{totalAudits}</p>
        </div>
        <div className="rounded-[16px] bg-[#12121A] border border-white/10 p-5">
          <p className="text-[#C0C0C8]/55 text-xs mb-2">With Audits</p>
          <p className="text-[#10B981] text-2xl font-extrabold">{customers.filter((c) => c.auditCount > 0).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, company…" className="w-full bg-[#12121A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40 focus:outline-none focus:border-[#00D4FF]/60" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-[#C0C0C8]/55 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#12121A] border border-white/10 rounded-[16px]">
          <Users className="h-10 w-10 text-[#2A2A3A] mx-auto mb-3" />
          <p className="text-[#C0C0C8]/55 text-sm">No customers found.</p>
        </div>
      ) : (
        <div className="bg-[#12121A] border border-white/10 rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0F]">
                <tr>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Name</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Email</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Company</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Phone</th>
                  <th className="text-center text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Audits</th>
                  <th className="text-center text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Calls</th>
                  <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white text-sm font-semibold">{c.name || '—'}</td>
                    <td className="px-4 py-3 text-[#C0C0C8] text-sm">{c.email}</td>
                    <td className="px-4 py-3 text-[#C0C0C8]/80 text-sm">{c.company || '—'}</td>
                    <td className="px-4 py-3 text-[#C0C0C8]/80 text-sm">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[#00D4FF] text-xs font-bold"><FileSearch className="h-3 w-3" /> {c.auditCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[#FBBF24] text-xs font-bold"><CalendarCheck className="h-3 w-3" /> {c.bookingCount}</span>
                    </td>
                    <td className="px-4 py-3 text-[#C0C0C8]/55 text-xs">{c.createdAt?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
