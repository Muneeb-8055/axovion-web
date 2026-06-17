import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';
import { RefreshCw, RotateCcw, Trash2, Archive } from 'lucide-react';

const TYPE_COLOR = {
  Task: 'bg-[#3B82F6]/15 text-[#3B82F6]',
  Employee: 'bg-[#6366F1]/15 text-[#6366F1]',
  Leave: 'bg-[#FBBF24]/15 text-[#FBBF24]',
  Audit: 'bg-[#10B981]/15 text-[#10B981]',
  Booking: 'bg-[#F97316]/15 text-[#F97316]',
};

const RecycleBin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminApi.getRecycleBin();
      setItems(r.data || []);
    } catch (e) { toast.error('Failed to load recycle bin'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const restore = async (id) => {
    try { await adminApi.restoreRecycleItem(id); toast.success('Item restored'); load(); }
    catch (e) { toast.error('Restore failed'); }
  };

  const purge = async (id) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone.')) return;
    try { await adminApi.purgeRecycleItem(id); toast.success('Permanently deleted'); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  const types = Array.from(new Set(items.map((i) => i.typeLabel)));
  const filtered = filter ? items.filter((i) => i.typeLabel === filter) : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">System</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-[#00D4FF]" /> Recycle Bin
          </h1>
          <p className="text-[#C0C0C8]/55 text-sm mt-1">Restore accidentally deleted items or remove them permanently.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-[10px] text-xs font-bold ${filter === '' ? 'bg-[#00D4FF] text-[#0A0A0F]' : 'bg-[#12121A] border border-white/10 text-[#C0C0C8]'}`}>
          All ({items.length})
        </button>
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-[10px] text-xs font-bold ${filter === t ? 'bg-[#00D4FF] text-[#0A0A0F]' : 'bg-[#12121A] border border-white/10 text-[#C0C0C8]'}`}>
            {t} ({items.filter((i) => i.typeLabel === t).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#C0C0C8]/55 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#12121A] border border-white/10 rounded-[16px]">
          <Archive className="h-10 w-10 text-[#2A2A3A] mx-auto mb-3" />
          <p className="text-[#C0C0C8]/55 text-sm">Recycle bin is empty.</p>
        </div>
      ) : (
        <div className="bg-[#12121A] border border-white/10 rounded-[16px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0F]">
              <tr>
                <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Type</th>
                <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Item</th>
                <th className="text-left text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Deleted</th>
                <th className="text-right text-[#C0C0C8]/55 text-xs px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${TYPE_COLOR[item.typeLabel] || 'bg-white/10 text-white'}`}>
                      {item.typeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{item.itemLabel}</td>
                  <td className="px-4 py-3 text-[#C0C0C8]/55 text-xs">{item.deletedAt?.split('T')[0]}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => restore(item.id)} className="text-[#10B981] text-xs font-bold hover:underline flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" /> Restore
                      </button>
                      <button onClick={() => purge(item.id)} className="text-[#EF4444] text-xs font-bold hover:underline flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> Delete forever
                      </button>
                    </div>
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

export default RecycleBin;
