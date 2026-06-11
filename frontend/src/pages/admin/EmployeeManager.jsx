import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../lib/hooks';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Search, RefreshCw, UserX, UserCheck, Settings, Eye } from 'lucide-react';
import EmployeeCard from '../../components/EmployeeCard';

const EmployeeManager = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editingPerms, setEditingPerms] = useState(null);
  const [permDraft, setPermDraft] = useState({
    create_employee: false, approve_attendance: false, approve_leaves: false,
    assign_tasks: false, manage_tasks: false, edit_attendance: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminApi.listEmployees();
      setEmployees(Array.isArray(r.data) ? r.data : (r.data?.employees || []));
    } catch (e) { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.name || !draft.email || !draft.password) { toast.error('All fields required'); return; }
    try {
      await adminApi.createEmployee(draft);
      toast.success('Employee created');
      setCreating(false);
      setDraft({ name: '', email: '', password: '', role: 'employee' });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to create'); }
  };

  const toggleActive = async (emp) => {
    try {
      if (emp.isActive) {
        await adminApi.deactivateEmployee(emp.id);
        toast.success('Employee deactivated');
      } else {
        await adminApi.reactivateEmployee(emp.id);
        toast.success('Employee reactivated');
      }
      load();
    } catch (e) { toast.error('Action failed'); }
  };

  const viewProfile = async (emp) => {
    setSelectedEmp(emp);
    setShowProfile(true);
    try {
      const r = await adminApi.getEmployeeProfileSummary(emp.id);
      const data = r.data || {};
      const tasks = data.tasks || {};
      data.taskBadges = {
        todo: (tasks.todo || []).length,
        inProgress: ((tasks['in-progress'] || []) + (tasks.in_progress || [])).length,
        done: (tasks.done || []).length,
      };
      setProfileData(data);
    } catch (e) { setProfileData(null); }
  };

  const editPermissions = (emp) => {
    setEditingPerms(emp);
    setPermDraft(emp.adminPermissions || {
      create_employee: false, approve_attendance: false, approve_leaves: false,
      assign_tasks: false, manage_tasks: false, edit_attendance: false,
    });
  };

  const savePermissions = async () => {
    try {
      await adminApi.updateAdminPermissions(editingPerms.id, permDraft);
      toast.success('Permissions updated');
      setEditingPerms(null);
      load();
    } catch (e) { toast.error('Failed to update permissions'); }
  };

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const isSuperAdmin = user?.role === 'super_admin';

  const permFields = [
    { key: 'create_employee', label: 'Create Employee' },
    { key: 'approve_attendance', label: 'Approve Attendance' },
    { key: 'approve_leaves', label: 'Approve Leaves' },
    { key: 'assign_tasks', label: 'Assign Tasks' },
    { key: 'manage_tasks', label: 'Manage Tasks' },
    { key: 'edit_attendance', label: 'Edit Attendance' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-2">EMS</div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">Employees</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="inline-flex items-center gap-1.5 text-sm text-[#C0C0C8] hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 text-sm bg-[#F97316] text-[#0A0A0F] px-3 py-2 rounded-[10px] font-bold hover:bg-[#FBBF24]">
                <Plus className="h-3.5 w-3.5" /> Add Employee
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#12121A] border border-white/10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Create Employee Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email address" type="email" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                <input value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder="Initial password" type="password" className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
                <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="w-full bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={create} className="w-full bg-[#F97316] text-[#0A0A0F] rounded-[10px] px-4 py-2.5 text-sm font-bold hover:bg-[#FBBF24]">Create Account</button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="h-4 w-4 text-[#C0C0C8]/55 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full bg-[#12121A] border border-white/10 rounded-[10px] pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/40" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-[#C0C0C8]/55 text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp) => (
            <div key={emp.id} className="relative group">
              <EmployeeCard
                employee={{
                  profile: { name: emp.name, email: emp.email, photoUrl: emp.photoUrl },
                  stats: emp.stats || {},
                  taskBadges: emp.taskBadges || { todo: 0, inProgress: 0, done: 0 },
                }}
                onClick={() => viewProfile(emp)}
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => viewProfile(emp)} className="h-7 w-7 bg-[#0A0A0F]/90 border border-white/10 rounded-lg flex items-center justify-center text-[#C0C0C8] hover:text-white" title="View profile">
                  <Eye className="h-3 w-3" />
                </button>
                {emp.role === 'admin' && isSuperAdmin && (
                  <button onClick={() => editPermissions(emp)} className="h-7 w-7 bg-[#0A0A0F]/90 border border-white/10 rounded-lg flex items-center justify-center text-[#C0C0C8] hover:text-[#F97316]" title="Permissions">
                    <Settings className="h-3 w-3" />
                  </button>
                )}
                <button onClick={() => toggleActive(emp)} className="h-7 w-7 bg-[#0A0A0F]/90 border border-white/10 rounded-lg flex items-center justify-center hover:text-[#EF4444]" title={emp.isActive ? 'Deactivate' : 'Reactivate'}>
                  {emp.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                </button>
              </div>
              {!emp.isActive && (
                <div className="absolute inset-0 bg-[#0A0A0F]/60 rounded-[16px] flex items-center justify-center pointer-events-none">
                  <span className="text-[#EF4444] text-xs font-bold px-2 py-1 bg-[#EF4444]/15 rounded-lg border border-[#EF4444]/25">Deactivated</span>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-[#C0C0C8]/45 text-sm py-12">No employees found</p>}
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-[#12121A] border border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Employee Profile</DialogTitle>
          </DialogHeader>
          {profileData ? (
            <div className="space-y-4">
              <EmployeeCard employee={profileData} />
              <div>
                <p className="text-[#C0C0C8]/45 text-xs uppercase tracking-widest mb-2">Assigned Tasks</p>
                <div className="space-y-1.5">
                  {Object.entries(profileData.tasks || {}).map(([status, tasks]) =>
                    tasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between bg-[#0A0A0F] rounded-[10px] px-3 py-2">
                        <p className="text-white text-xs">{t.title}</p>
                        <span className="text-[10px] text-[#C0C0C8]/55 capitalize">{status.replace('-', ' ')}</span>
                      </div>
                    ))
                  )}
                  {Object.values(profileData.tasks || {}).every((t) => t.length === 0) && (
                    <p className="text-[#C0C0C8]/45 text-xs">No tasks assigned</p>
                  )}
                </div>
              </div>
              {profileData.overtime?.length > 0 && (
                <div>
                  <p className="text-[#C0C0C8]/45 text-xs uppercase tracking-widest mb-2">Overtime</p>
                  <div className="space-y-1">
                    {profileData.overtime.map((ot) => (
                      <div key={ot.id} className="flex justify-between bg-[#F97316]/10 border border-dashed border-[#F97316]/25 rounded-[10px] px-3 py-2">
                        <div>
                          <p className="text-white text-xs font-semibold">{ot.project}</p>
                          <p className="text-[#C0C0C8]/55 text-[10px]">{ot.date} — {ot.reason}</p>
                        </div>
                        <span className="text-[#F97316] text-xs font-bold">+{ot.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-[#C0C0C8]/45 text-sm py-6">Loading profile...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog open={!!editingPerms} onOpenChange={(v) => !v && setEditingPerms(null)}>
        <DialogContent className="bg-[#12121A] border border-white/10 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Admin Permissions — {editingPerms?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {permFields.map((f) => (
              <label key={f.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-white text-sm">{f.label}</span>
                <input
                  type="checkbox"
                  checked={permDraft[f.key]}
                  onChange={(e) => setPermDraft({ ...permDraft, [f.key]: e.target.checked })}
                  className="accent-[#00D4FF] h-4 w-4"
                />
              </label>
            ))}
            <button onClick={savePermissions} className="w-full bg-[#F97316] text-[#0A0A0F] rounded-[10px] px-4 py-2.5 text-sm font-bold hover:bg-[#FBBF24] mt-2">
              Save Permissions
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManager;